package handlers

import (
	"encoding/base64"
	"go-backend-basic/config"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// =======================
// CREATE UNIT (accommodations + unit_details + galleries)
// =======================
func CreateUnit(c *gin.Context) {
	var input struct {
		Category    string   `form:"category" json:"category"`
		StatusUnit  string   `form:"status_unit" json:"status_unit"`
		Description string   `form:"description" json:"description"`
		Capacity    int      `form:"capacity" json:"capacity"`
		Name        string   `form:"name" json:"name"`
		Price       float64  `form:"price" json:"price"`
		Alamat      string   `form:"alamat" json:"alamat"`
		JumlahKamar int      `form:"jumlah_kamar" json:"jumlah_kamar"`
		Images      []string `form:"images" json:"images"`
		Fasilitas   []string `form:"fasilitas" json:"fasilitas"`
	}

	contentType := c.GetHeader("Content-Type")
	if strings.Contains(contentType, "multipart/form-data") {
		if err := c.ShouldBind(&input); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
	} else {
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
	}

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// ===================
	// 1️⃣ INSERT UNIT
	// ===================
	var unitID int
	err = tx.QueryRow(`
		INSERT INTO unit (category, status_unit, description, capacity, created_at)
		VALUES ($1,$2,$3,$4,NOW())
		RETURNING unit_id
	`, input.Category, input.StatusUnit, input.Description, input.Capacity).Scan(&unitID)

	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// ===================
	// 2️⃣ INSERT DETAIL
	// ===================
	var detailID int
	err = tx.QueryRow(`
		INSERT INTO unit_detail
		(unit_id, name, price, alamat, jumlah_kamar)
		VALUES ($1,$2,$3,$4,$5)
		RETURNING detail_id
	`, unitID, input.Name, input.Price, input.Alamat, input.JumlahKamar).
		Scan(&detailID)

	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// ===================
	// 3️⃣ INSERT GALLERY
	// ===================
	var images []string
	if strings.Contains(contentType, "multipart/form-data") {

		form, _ := c.MultipartForm()
		if form != nil {
			files := form.File["images"]

			for _, file := range files {

				f, err := file.Open()
				if err != nil {
					continue
				}

				bytes, _ := io.ReadAll(f)
				f.Close()

				base64Img := base64.StdEncoding.EncodeToString(bytes)
				images = append(images, base64Img)
			}
		}
	} else {
		// JSON MODE
		images = input.Images
	}
	for _, img := range images {
		_, err := tx.Exec(`
        INSERT INTO gallery (detail_id, images)
        VALUES ($1,$2)
    `, detailID, img)
		if err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	}

	// ===================
	// 4️⃣ INSERT FASILITAS
	// ===================
	for _, fas := range input.Fasilitas {
		_, err := tx.Exec(`
			INSERT INTO fasilitas (name, detail_id)
			VALUES ($1,$2)
		`, fas, detailID)

		if err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	}

	tx.Commit()

	c.JSON(201, gin.H{
		"message": "Unit berhasil dibuat",
	})
}

// =======================
// READ ALL UNITS
// =======================
// =======================
// READ ALL UNITS
// =======================
func GetUnits(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT u.unit_id, u.category, COALESCE(u.status_unit, ''), COALESCE(u.description, ''), COALESCE(u.capacity, 0),
		       COALESCE(d.detail_id, 0), COALESCE(d.name, ''), COALESCE(d.price, 0.0), COALESCE(d.alamat, ''), COALESCE(d.jumlah_kamar, 0)
		FROM unit u
		LEFT JOIN unit_detail d ON d.unit_id = u.unit_id
		ORDER BY u.unit_id DESC
	`)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	type Unit struct {
		UnitID      int      `json:"unit_id"`
		Category    string   `json:"category"`
		StatusUnit  string   `json:"status_unit"`
		Description string   `json:"description"`
		Capacity    int      `json:"capacity"`
		DetailID    int      `json:"detail_id"`
		Name        string   `json:"name"`
		Price       float64  `json:"price"`
		Alamat      string   `json:"alamat"`
		JumlahKamar int      `json:"jumlah_kamar"`
		Gallery     []string `json:"images"`
		Fasilitas   []string `json:"fasilitas"`
	}

	data := make([]Unit, 0)

	for rows.Next() {
		var u Unit
		err := rows.Scan(&u.UnitID, &u.Category, &u.StatusUnit, &u.Description, &u.Capacity,
			&u.DetailID, &u.Name, &u.Price, &u.Alamat, &u.JumlahKamar)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		// Ambil gallery
		imgRows, _ := config.DB.Query(`SELECT images FROM gallery WHERE detail_id=$1`, u.DetailID)
		gallery := make([]string, 0)
		for imgRows.Next() {
			var img string
			imgRows.Scan(&img)
			gallery = append(gallery, img)
		}
		imgRows.Close()
		u.Gallery = gallery

		// Ambil fasilitas
		fasRows, _ := config.DB.Query(`SELECT name FROM fasilitas WHERE detail_id=$1`, u.DetailID)
		fasilitas := make([]string, 0)
		for fasRows.Next() {
			var f string
			fasRows.Scan(&f)
			fasilitas = append(fasilitas, f)
		}
		fasRows.Close()
		u.Fasilitas = fasilitas

		data = append(data, u)
	}

	c.JSON(http.StatusOK, data)
}

// =======================
// READ UNIT BY ID
// =======================
func GetUnitByID(c *gin.Context) {
	id := c.Param("id")

	var u struct {
		UnitID      int      `json:"unit_id"`
		Category    string   `json:"category"`
		StatusUnit  string   `json:"status_unit"`
		Description string   `json:"description"`
		Capacity    int      `json:"capacity"`
		DetailID    int      `json:"detail_id"`
		Name        string   `json:"name"`
		Price       float64  `json:"price"`
		Alamat      string   `json:"alamat"`
		JumlahKamar int      `json:"jumlah_kamar"`
		Gallery     []string `json:"images"`
		Fasilitas   []string `json:"fasilitas"`
	}

	err := config.DB.QueryRow(`
		SELECT u.unit_id, u.category, COALESCE(u.status_unit, ''), COALESCE(u.description, ''), COALESCE(u.capacity, 0),
		       COALESCE(d.detail_id, 0), COALESCE(d.name, ''), COALESCE(d.price, 0.0), COALESCE(d.alamat, ''), COALESCE(d.jumlah_kamar, 0)
		FROM unit u
		LEFT JOIN unit_detail d ON d.unit_id = u.unit_id
		WHERE u.unit_id = $1
	`, id).Scan(&u.UnitID, &u.Category, &u.StatusUnit, &u.Description, &u.Capacity,
		&u.DetailID, &u.Name, &u.Price, &u.Alamat, &u.JumlahKamar)
	if err != nil {
		c.JSON(404, gin.H{"message": "Unit tidak ditemukan"})
		return
	}

	// Ambil gallery
	imgRows, _ := config.DB.Query(`SELECT images FROM gallery WHERE detail_id=$1`, u.DetailID)
	u.Gallery = []string{}
	for imgRows.Next() {
		var img string
		imgRows.Scan(&img)
		u.Gallery = append(u.Gallery, img)
	}
	imgRows.Close()

	// Ambil fasilitas
	fasRows, _ := config.DB.Query(`SELECT name FROM fasilitas WHERE detail_id=$1`, u.DetailID)
	u.Fasilitas = []string{}
	for fasRows.Next() {
		var f string
		fasRows.Scan(&f)
		u.Fasilitas = append(u.Fasilitas, f)
	}
	fasRows.Close()

	c.JSON(http.StatusOK, u)
}

// =======================
// UPDATE UNIT
// =======================
func UpdateAccommodation(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Category    string   `form:"category" json:"category"`
		StatusUnit  string   `form:"status_unit" json:"status_unit"`
		Description string   `form:"description" json:"description"`
		Capacity    int      `form:"capacity" json:"capacity"`
		Name        string   `form:"name" json:"name"`
		Price       float64  `form:"price" json:"price"`
		Alamat      string   `form:"alamat" json:"alamat"`
		JumlahKamar int      `form:"jumlah_kamar" json:"jumlah_kamar"`
		Fasilitas   []string `form:"fasilitas" json:"fasilitas"`
	}

	contentType := c.GetHeader("Content-Type")
	if strings.Contains(contentType, "multipart/form-data") {
		if err := c.ShouldBind(&input); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
	} else {
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
	}

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	_, err = tx.Exec(`
		UPDATE unit
		SET category=$1, status_unit=$2, description=$3, capacity=$4
		WHERE unit_id=$5
	`, input.Category, input.StatusUnit, input.Description, input.Capacity, id)

	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	_, err = tx.Exec(`
		UPDATE unit_detail
		SET name=$1, price=$2, alamat=$3, jumlah_kamar=$4
		WHERE unit_id=$5
	`, input.Name, input.Price, input.Alamat, input.JumlahKamar, id)

	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// ===================
	// UPDATE GALLERY & FASILITAS
	// ===================
	// Get detail_id first
	var detailID int
	err = tx.QueryRow(`SELECT detail_id FROM unit_detail WHERE unit_id=$1`, id).Scan(&detailID)
	if err == nil {
		// 1. UPDATE GALLERY if images are uploaded
		form, _ := c.MultipartForm()
		if form != nil {
			files := form.File["images"]
			if len(files) > 0 {
				// Delete old gallery entries
				tx.Exec(`DELETE FROM gallery WHERE detail_id=$1`, detailID)

				// Insert new images
				for _, file := range files {
					f, err := file.Open()
					if err == nil {
						bytes, _ := io.ReadAll(f)
						f.Close()
						base64Img := base64.StdEncoding.EncodeToString(bytes)
						tx.Exec(`INSERT INTO gallery (detail_id, images) VALUES ($1,$2)`, detailID, base64Img)
					}
				}
			}
		}

		// 2. UPDATE FASILITAS
		if len(input.Fasilitas) > 0 {
			// Delete old amenities
			tx.Exec(`DELETE FROM fasilitas WHERE detail_id=$1`, detailID)

			// Insert new amenities
			for _, fas := range input.Fasilitas {
				_, err := tx.Exec(`
					INSERT INTO fasilitas (name, detail_id)
					VALUES ($1,$2)
				`, fas, detailID)
				if err != nil {
					tx.Rollback()
					c.JSON(500, gin.H{"error": "Gagal update fasilitas: " + err.Error()})
					return
				}
			}
		}
	}

	tx.Commit()
	c.JSON(200, gin.H{"message": "Unit berhasil diupdate"})
}

// =======================
// DELETE UNIT
// =======================
func DeleteAccommodation(c *gin.Context) {
	id := c.Param("id")

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Let's rely on postgres ON DELETE CASCADE for detail tables if present.
	// To be safe we try to delete detail first.
	tx.Exec(`DELETE FROM unit_detail WHERE unit_id=$1`, id)

	_, err = tx.Exec(`DELETE FROM unit WHERE unit_id=$1`, id)
	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	tx.Commit()
	c.JSON(200, gin.H{"message": "Unit berhasil dihapus"})
}
