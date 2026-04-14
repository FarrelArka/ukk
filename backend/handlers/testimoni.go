package handlers

import (
	"go-backend-basic/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

type TestimonialRequest struct {
	BookingID int     `json:"booking_id"`
	Rating    float64 `json:"rating"`
	Comment   string  `json:"comment"`
}

func autoMigrateTestimonial() {
	// Memastikan kolom tambahan ada di table testimonial secara otomatis
	// MySQL compatibility: ADD COLUMN doesn't always support IF NOT EXISTS depending on version
	config.DB.Exec(`ALTER TABLE testimonial ADD COLUMN status VARCHAR(50) DEFAULT 'pending'`)
	config.DB.Exec(`ALTER TABLE testimonial ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`)
}

func CreateTestimonial(c *gin.Context) {
	autoMigrateTestimonial()
	var req TestimonialRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	userID := c.GetInt("user_id")

	var status string
	queryCheck := `
	SELECT status
	FROM booking
	WHERE id_booking=? AND user_id=?
	`
	err := config.DB.QueryRow(queryCheck, req.BookingID, userID).Scan(&status)
	if err != nil {
		c.JSON(404, gin.H{"error": "booking tidak ditemukan"})
		return
	}

	if status != "completed" {
		c.JSON(403, gin.H{"error": "testimoni hanya bisa setelah checkout"})
		return
	}

	var exists bool
	checkReview := `SELECT EXISTS(SELECT 1 FROM testimonial WHERE booking_id=?)`
	config.DB.QueryRow(checkReview, req.BookingID).Scan(&exists)

	if exists {
		c.JSON(400, gin.H{"error": "booking ini sudah memiliki testimonial"})
		return
	}

	queryInsert := `
	INSERT INTO testimonial
	(booking_id,rating,comment,status)
	VALUES (?,?,?,'active')
	`
	_, err = config.DB.Exec(queryInsert, req.BookingID, req.Rating, req.Comment)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed create testimonial"})
		return
	}

	c.JSON(201, gin.H{"message": "testimonial berhasil dibuat"})
}

func GetTestimonials(c *gin.Context) {
	autoMigrateTestimonial()
	rows, err := config.DB.Query(`
	SELECT
		t.id_testimonial,
		COALESCE(t.rating, 0),
		COALESCE(t.comment, ''),
		COALESCE(CAST(t.created_at AS CHAR), ''),
		COALESCE(u.name, 'Unknown')
	FROM testimonial t
	JOIN booking b ON b.id_booking = t.booking_id
	JOIN users u ON u.id = b.user_id
	WHERE t.status='active' OR t.status='approved'
	ORDER BY t.created_at DESC
	`)

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var testimonials []gin.H
	for rows.Next() {
		var id int
		var rating float64
		var comment, created, name string

		rows.Scan(&id, &rating, &comment, &created, &name)
		if len(created) > 10 {
			created = created[:10]
		}
		testimonials = append(testimonials, gin.H{
			"id":         id,
			"name":       name,
			"rating":     rating,
			"comment":    comment,
			"created_at": created,
		})
	}

	if testimonials == nil {
		testimonials = []gin.H{}
	}
	c.JSON(200, testimonials)
}

// ==========================
// GET ALL TESTIMONIALS (ADMIN)
// ==========================
func GetAllTestimonialsAdmin(c *gin.Context) {
	autoMigrateTestimonial()
	rows, err := config.DB.Query(`
		SELECT 
			t.id_testimonial, 
			COALESCE(b.user_id, 0), 
			COALESCE(t.rating, 0), 
			COALESCE(t.comment, ''), 
			COALESCE(t.status, 'pending'), 
			COALESCE(CAST(t.created_at AS CHAR), ''),
			COALESCE(u.name, 'Unknown User') AS user_name,
			COALESCE(d.name, 'Unknown Unit') AS unit_name
		FROM testimonial t
		LEFT JOIN booking b ON b.id_booking = t.booking_id
		LEFT JOIN users u ON u.id = b.user_id
		LEFT JOIN unit_detail d ON d.unit_id = b.unit_id
		ORDER BY t.created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var testimonials []gin.H
	for rows.Next() {
		var id, userID, rating int
		var comment, status, createdAt, userName, unitName string

		if err := rows.Scan(&id, &userID, &rating, &comment, &status, &createdAt, &userName, &unitName); err != nil {
			continue
		}

		if len(createdAt) >= 10 {
			createdAt = createdAt[:10]
		}

		testimonials = append(testimonials, gin.H{
			"id":         id,
			"user_id":    userID,
			"user_name":  userName,
			"unit_name":  unitName,
			"rating":     rating,
			"comment":    comment,
			"status":     status,
			"created_at": createdAt,
		})
	}

	if testimonials == nil {
		testimonials = []gin.H{}
	}
	c.JSON(http.StatusOK, testimonials)
}

// ==========================
// GET TESTIMONIAL BY ID
// ==========================
func GetTestimonialByID(c *gin.Context) {
	autoMigrateTestimonial()
	id := c.Param("id")

	row := config.DB.QueryRow(`
		SELECT t.id_testimonial, COALESCE(b.user_id, 0), COALESCE(t.rating, 0), COALESCE(t.comment, ''), COALESCE(t.status, 'pending'), COALESCE(CAST(t.created_at AS CHAR), '')
		FROM testimonial t
		LEFT JOIN booking b ON b.id_booking = t.booking_id
		WHERE t.id_testimonial = ?
	`, id)

	var tid, userID, rating int
	var comment, status, createdAt string

	err := row.Scan(&tid, &userID, &rating, &comment, &status, &createdAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "testimonial not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         tid,
		"user_id":    userID,
		"rating":     rating,
		"comment":    comment,
		"status":     status,
		"created_at": createdAt,
	})
}

func UpdateTestimonial(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Rating  float64 `json:"rating"`
		Comment string  `json:"comment"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	query := `UPDATE testimonial SET rating=?, comment=? WHERE id_testimonial=?`
	result, err := config.DB.Exec(query, req.Rating, req.Comment, id)

	if err != nil {
		c.JSON(500, gin.H{"error": "failed update testimonial"})
		return
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		c.JSON(404, gin.H{"error": "testimonial tidak ditemukan"})
		return
	}
	c.JSON(200, gin.H{"message": "testimonial berhasil diupdate"})
}

func UpdateTestimonialStatus(c *gin.Context) {
	autoMigrateTestimonial()
	id := c.Param("id")

	var req struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	query := `UPDATE testimonial SET status=? WHERE id_testimonial=?`
	result, err := config.DB.Exec(query, req.Status, id)

	if err != nil {
		c.JSON(500, gin.H{"error": "failed update status"})
		return
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		c.JSON(404, gin.H{"error": "testimonial tidak ditemukan"})
		return
	}
	c.JSON(200, gin.H{"message": "status testimonial berhasil diubah"})
}

func DeleteTestimonial(c *gin.Context) {
	id := c.Param("id")

	query := `DELETE FROM testimonial WHERE id_testimonial=?`
	result, err := config.DB.Exec(query, id)

	if err != nil {
		c.JSON(500, gin.H{"error": "failed delete testimonial"})
		return
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		c.JSON(404, gin.H{"error": "testimonial tidak ditemukan"})
		return
	}
	c.JSON(200, gin.H{"message": "testimonial berhasil dihapus"})
}
