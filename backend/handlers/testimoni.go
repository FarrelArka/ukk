package handlers

import (
	"go-backend-basic/config"

	"github.com/gin-gonic/gin"
)

type Testimonial struct {
	IDTestimonial int    `json:"id_testimonial"`
	BookingID     int    `json:"booking_id"`
	IDUser        int    `json:"id_user"`
	Rating        int    `json:"rating"`
	Comment       string `json:"comment"`
	CreatedAt     string `json:"created_at"`
}

func CreateTestimonial(c *gin.Context) {

	var req Testimonial

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	userID := c.GetInt("user_id")

	var status string

	query := `
	SELECT status FROM booking
	WHERE id = $1 AND id_user = $2
	`

	err := config.DB.QueryRow(query, req.BookingID, userID).Scan(&status)

	if err != nil {
		c.JSON(404, gin.H{"error": "booking tidak ditemukan"})
		return
	}

	if status != "completed" {
		c.JSON(403, gin.H{"error": "testimoni hanya bisa setelah checkout"})
		return
	}

	insert := `
	INSERT INTO testimonials (booking_id,id_user,rating,comment)
	VALUES ($1,$2,$3,$4)
	`

	_, err = config.DB.Exec(insert,
		req.BookingID,
		userID,
		req.Rating,
		req.Comment,
	)

	if err != nil {
		c.JSON(500, gin.H{"error": "gagal membuat testimoni"})
		return
	}

	c.JSON(200, gin.H{
		"message": "testimoni berhasil dibuat",
	})
}
func GetTestimonials(c *gin.Context) {

	rows, err := config.DB.Query(`
	SELECT id_testimonial,booking_id,id_user,rating,comment,created_at
	FROM testimonials
	ORDER BY created_at DESC
	`)

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	defer rows.Close()

	var testimonials []Testimonial

	for rows.Next() {

		var t Testimonial

		rows.Scan(
			&t.IDTestimonial,
			&t.BookingID,
			&t.IDUser,
			&t.Rating,
			&t.Comment,
			&t.CreatedAt,
		)

		testimonials = append(testimonials, t)
	}

	c.JSON(200, testimonials)
}
func GetTestimonialByID(c *gin.Context) {

	id := c.Param("id")

	var t Testimonial

	query := `
	SELECT id_testimonial,booking_id,id_user,rating,comment,created_at
	FROM testimonials
	WHERE id_testimonial = $1
	`

	err := config.DB.QueryRow(query, id).Scan(
		&t.IDTestimonial,
		&t.BookingID,
		&t.IDUser,
		&t.Rating,
		&t.Comment,
		&t.CreatedAt,
	)

	if err != nil {
		c.JSON(404, gin.H{"error": "testimonial tidak ditemukan"})
		return
	}

	c.JSON(200, t)
}
func UpdateTestimonial(c *gin.Context) {

	id := c.Param("id")

	var req Testimonial

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	userID := c.GetInt("user_id")

	query := `
	UPDATE testimonials
	SET rating=$1, comment=$2
	WHERE id_testimonial=$3 AND id_user=$4
	`

	result, err := config.DB.Exec(query,
		req.Rating,
		req.Comment,
		id,
		userID,
	)

	if err != nil {
		c.JSON(500, gin.H{"error": "gagal update"})
		return
	}

	rows, _ := result.RowsAffected()

	if rows == 0 {
		c.JSON(403, gin.H{"error": "bukan testimonial milik anda"})
		return
	}

	c.JSON(200, gin.H{"message": "testimonial berhasil diupdate"})
}
func DeleteTestimonial(c *gin.Context) {

	id := c.Param("id")

	userID := c.GetInt("user_id")

	query := `
	DELETE FROM testimonials
	WHERE id_testimonial=$1 AND id_user=$2
	`

	result, err := config.DB.Exec(query, id, userID)

	if err != nil {
		c.JSON(500, gin.H{"error": "gagal delete"})
		return
	}

	rows, _ := result.RowsAffected()

	if rows == 0 {
		c.JSON(403, gin.H{"error": "bukan testimonial milik anda"})
		return
	}

	c.JSON(200, gin.H{
		"message": "testimonial berhasil dihapus",
	})
}
