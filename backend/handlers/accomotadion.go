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
		Images      []string `form:"-" json:"images"`
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
	res, err := tx.Exec(`
		INSERT INTO unit (category, status_unit, description, capacity, created_at)
		VALUES (?,?,?,?,NOW())
	`, input.Category, input.StatusUnit, input.Description, input.Capacity)

	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	id, _ := res.LastInsertId()
	unitID := int(id)

	// ===================
	// 2️⃣ INSERT DETAIL
	// ===================
	res, err = tx.Exec(`
		INSERT INTO unit_detail
		(unit_id, name, price, alamat, jumlah_kamar)
		VALUES (?,?,?,?,?)
	`, unitID, input.Name, input.Price, input.Alamat, input.JumlahKamar)

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
        INSERT INTO gallery (unit_id, image_url)
        VALUES (?,?)
    `, unitID, img)
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
			INSERT INTO fasilitas (nama_fasilitas, unit_id)
			VALUES (?,?)
		`, fas, unitID)

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
		Kapasitas   int      `json:"kapasitas"` // 🔥 TAMBAHAN
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
		imgRows, _ := config.DB.Query(`SELECT image_url FROM gallery WHERE unit_id=?`, u.UnitID)
		gallery := make([]string, 0)
		for imgRows.Next() {
			var img string
			imgRows.Scan(&img)
			gallery = append(gallery, img)
		}
		imgRows.Close()
		u.Gallery = gallery

		// Ambil fasilitas
		fasRows, _ := config.DB.Query(`SELECT nama_fasilitas FROM fasilitas WHERE unit_id=?`, u.UnitID)
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

		Images    []string `json:"images"`
		Fasilitas []string `json:"fasilitas"`
	}

	err := config.DB.QueryRow(`
		SELECT 
			u.unit_id, 
			u.category, 
			u.status_unit, 
			u.description,
			u.capacity,
			d.detail_id, 
			d.name, 
			d.price, 
			d.alamat, 
			d.jumlah_kamar
		FROM unit u
		LEFT JOIN unit_detail d ON d.unit_id = u.unit_id
		WHERE u.unit_id = ?
	`, id).Scan(
		&u.UnitID, 
		&u.Category, 
		&u.StatusUnit, 
		&u.Description,
		&u.Capacity,
		&u.DetailID, 
		&u.Name, 
		&u.Price, 
		&u.Alamat, 
		&u.JumlahKamar,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Unit tidak ditemukan"})
		return
	}

	// ===================
	// GALLERY
	// ===================
	imgRows, err := config.DB.Query(`SELECT image_url FROM gallery WHERE unit_id=?`, u.UnitID)
	if err != nil {
		c.JSON(500, gin.H{"message": "Gagal ambil gambar"})
		return
	}
	defer imgRows.Close()

	u.Images = []string{}

	for imgRows.Next() {
		var img string
		if err := imgRows.Scan(&img); err == nil {
			u.Images = append(u.Images, img)
		}
	}

	// ===================
	// FASILITAS
	// ===================
	fasRows, err := config.DB.Query(`SELECT nama_fasilitas FROM fasilitas WHERE unit_id=?`, u.UnitID)
	if err != nil {
		c.JSON(500, gin.H{"message": "Gagal ambil fasilitas"})
		return
	}
	defer fasRows.Close()

	u.Fasilitas = []string{}

	for fasRows.Next() {
		var f string
		if err := fasRows.Scan(&f); err == nil {
			u.Fasilitas = append(u.Fasilitas, f)
		}
	}

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
		Capacity int `form:"capacity" json:"capacity"`
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

	// UPDATE DETAIL (INI YANG BENAR)
	_, err = tx.Exec(`

		UPDATE unit
		SET category=?, status_unit=?, description=?, capacity=?
		WHERE unit_id=?
	`, input.Category, input.StatusUnit, input.Description, input.Capacity, id)


	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	_, err = tx.Exec(`
		UPDATE unit_detail
		SET name=?, price=?, alamat=?, jumlah_kamar=?
		WHERE unit_id=?
	`, input.Name, input.Price, input.Alamat, input.JumlahKamar, id)

	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// ===================
	// UPDATE GALLERY & FASILITAS
	// ===================

	// 1. UPDATE GALLERY if images are uploaded
	form, _ := c.MultipartForm()
	if form != nil {
		files := form.File["images"]
		if len(files) > 0 {
			// Delete old gallery entries
			tx.Exec(`DELETE FROM gallery WHERE unit_id=?`, id)

			// Insert new images
			for _, file := range files {
				f, err := file.Open()
				if err == nil {
					bytes, _ := io.ReadAll(f)
					f.Close()
					base64Img := base64.StdEncoding.EncodeToString(bytes)
					tx.Exec(`INSERT INTO gallery (unit_id, image_url) VALUES (?,?)`, id, base64Img)
				}
			}
		}
	}

	// 2. UPDATE FASILITAS
	if len(input.Fasilitas) > 0 {
		// Delete old amenities
		tx.Exec(`DELETE FROM fasilitas WHERE unit_id=?`, id)

		// Insert new amenities
		for _, fas := range input.Fasilitas {
			_, err := tx.Exec(`
					INSERT INTO fasilitas (nama_fasilitas, unit_id)
					VALUES (?,?)
				`, fas, id)
			if err != nil {
				tx.Rollback()
				c.JSON(500, gin.H{"error": "Gagal update fasilitas: " + err.Error()})
				return
			}
		}
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Gagal commit: " + err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Unit berhasil diupdate"})
}

// =======================
// DELETE UNIT
// =======================
func DeleteUnit(c *gin.Context) {
	id := c.Param("id")

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// DELETE CHILD FIRST
	tx.Exec(`DELETE FROM gallery WHERE unit_id=?`, id)
	tx.Exec(`DELETE FROM fasilitas WHERE unit_id=?`, id)
	tx.Exec(`DELETE FROM unit_detail WHERE unit_id=?`, id)

	_, err = tx.Exec(`DELETE FROM unit WHERE unit_id=?`, id)
	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	tx.Commit()

	c.JSON(200, gin.H{"message": "Unit berhasil dihapus"})
}
