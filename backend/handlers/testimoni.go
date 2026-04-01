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

func CreateTestimonial(c *gin.Context) {

	var req TestimonialRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	userID := c.GetInt("user_id")

	// cek booking milik user dan sudah checkout
	var status string

	queryCheck := `
	SELECT status
	FROM booking
	WHERE id=$1 AND id_user=$2
	`

	err := config.DB.QueryRow(queryCheck, req.BookingID, userID).Scan(&status)

	if err != nil {
		c.JSON(404, gin.H{"error": "booking tidak ditemukan"})
		return
	}

	if status != "completed" {
		c.JSON(403, gin.H{
			"error": "testimoni hanya bisa setelah checkout",
		})
		return
	}

	// cek apakah sudah pernah review
	var exists bool

	checkReview := `
	SELECT EXISTS(
		SELECT 1 FROM testimonials
		WHERE booking_id=$1
	)
	`

	config.DB.QueryRow(checkReview, req.BookingID).Scan(&exists)

	if exists {
		c.JSON(400, gin.H{
			"error": "booking ini sudah memiliki testimonial",
		})
		return
	}

	// insert testimonial langsung active
	queryInsert := `
	INSERT INTO testimonials
	(booking_id,id_user,rating,comment,status)
	VALUES ($1,$2,$3,$4,'active')
	`

	_, err = config.DB.Exec(queryInsert,
		req.BookingID,
		userID,
		req.Rating,
		req.Comment,
	)

	if err != nil {
		c.JSON(500, gin.H{"error": "failed create testimonial"})
		return
	}

	c.JSON(201, gin.H{
		"message": "testimonial berhasil dibuat",
	})
}
func GetTestimonials(c *gin.Context) {

	rows, err := config.DB.Query(`
	SELECT
	t.id_testimonial,
	t.rating,
	t.comment,
	t.created_at,
	u.name
	FROM testimonials t
	JOIN users u ON u.id_user = t.id_user
	WHERE t.status='active'
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
		var comment string
		var created string
		var name string

		rows.Scan(&id, &rating, &comment, &created, &name)

		testimonials = append(testimonials, gin.H{
			"id":         id,
			"name":       name,
			"rating":     rating,
			"comment":    comment,
			"created_at": created,
		})
	}

	c.JSON(200, testimonials)
}

// ==========================
// GET ALL TESTIMONIALS (ADMIN)
// ==========================
func GetAllTestimonialsAdmin(c *gin.Context) {

	rows, err := config.DB.Query(`
		SELECT id, user_id, rating, comment, status, created_at
		FROM testimonials
		ORDER BY created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var testimonials []gin.H

	for rows.Next() {

		var id int
		var userID int
		var rating int
		var comment string
		var status string
		var createdAt string

		err := rows.Scan(&id, &userID, &rating, &comment, &status, &createdAt)
		if err != nil {
			continue
		}

		testimonials = append(testimonials, gin.H{
			"id":         id,
			"user_id":    userID,
			"rating":     rating,
			"comment":    comment,
			"status":     status,
			"created_at": createdAt,
		})
	}

	c.JSON(http.StatusOK, testimonials)
}

// ==========================
// GET TESTIMONIAL BY ID
// ==========================
func GetTestimonialByID(c *gin.Context) {

	id := c.Param("id")

	row := config.DB.QueryRow(`
		SELECT id, user_id, rating, comment, status, created_at
		FROM testimonials
		WHERE id = $1
	`, id)

	var tid int
	var userID int
	var rating int
	var comment string
	var status string
	var createdAt string

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
func GetTestimonialByID(c *gin.Context) {

	id := c.Param("id")

	var testimonial gin.H

	query := `
	SELECT
	t.id_testimonial,
	t.rating,
	t.comment,
	t.created_at,
	u.name
	FROM testimonials t
	JOIN users u ON u.id_user = t.id_user
	WHERE t.id_testimonial=$1
	`

	row := config.DB.QueryRow(query, id)

	var tid int
	var rating float64
	var comment string
	var created string
	var name string

	err := row.Scan(&tid, &rating, &comment, &created, &name)

	if err != nil {
		c.JSON(404, gin.H{
			"error": "testimonial tidak ditemukan",
		})
		return
	}

	testimonial = gin.H{
		"id":         tid,
		"name":       name,
		"rating":     rating,
		"comment":    comment,
		"created_at": created,
	}

	c.JSON(200, testimonial)
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

	query := `
	UPDATE testimonials
	SET rating=$1, comment=$2
	WHERE id_testimonial=$3
	`

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

	c.JSON(200, gin.H{
		"message": "testimonial berhasil diupdate",
	})
}
func UpdateTestimonialStatus(c *gin.Context) {

	id := c.Param("id")

	var req struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	query := `
	UPDATE testimonials
	SET status=$1
	WHERE id_testimonial=$2
	`

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

	c.JSON(200, gin.H{
		"message": "status testimonial berhasil diubah",
	})
}
func DeleteTestimonial(c *gin.Context) {

	id := c.Param("id")

	query := `
	DELETE FROM testimonials
	WHERE id_testimonial=$1
	`

	result, err := config.DB.Exec(query, id)

	if err != nil {
		c.JSON(500, gin.H{"error": "failed delete testimonial"})
		return
	}

	rows, _ := result.RowsAffected()

	if rows == 0 {
		c.JSON(404, gin.H{
			"error": "testimonial tidak ditemukan",
		})
		return
	}

	c.JSON(200, gin.H{
		"message": "testimonial berhasil dihapus",
	})
}
