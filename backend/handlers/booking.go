package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"go-backend-basic/config"

	"github.com/gin-gonic/gin"
)

// ========================
// STRUCTS
// ========================

type CreateBookingRequest struct {
	UnitID      int    `json:"unit_id" binding:"required"`
	CheckIn     string `json:"check_in" binding:"required"`
	CheckOut    string `json:"check_out" binding:"required"`
	JumlahOrang int    `json:"jumlah_orang"`
}

// ========================
// HELPERS
// ========================

func GenerateInvoiceNumber() string {
	return "INV-" + time.Now().Format("20060102-150405")
}

// ========================
// CREATE BOOKING
// ========================

func CreateBooking(c *gin.Context) {
	var req CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ========================
	// VALIDASI USER
	// ========================
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// ========================
	// PARSE TANGGAL
	// ========================
	checkIn, err := time.Parse("2006-01-02", req.CheckIn)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid check_in format (YYYY-MM-DD)"})
		return
	}

	checkOut, err := time.Parse("2006-01-02", req.CheckOut)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid check_out format (YYYY-MM-DD)"})
		return
	}

	durasi := int(checkOut.Sub(checkIn).Hours() / 24)
	if durasi <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date range"})
		return
	}

	// ========================
	// AMBIL HARGA
	// ========================
	var hargaPerMalam float64
	var kapasitas int
	err = config.DB.QueryRow(
		`SELECT d.price, u.capacity FROM unit_detail d JOIN unit u ON u.unit_id = d.unit_id WHERE d.unit_id = ?`,
		req.UnitID,
	).Scan(&hargaPerMalam, &kapasitas)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unit price not found"})
		return
	}

	totalHarga := hargaPerMalam * float64(durasi)

	extra := req.JumlahOrang - kapasitas
	if extra > 0 {
		totalHarga += float64(extra * 50000 * durasi)
	}

	invoice := GenerateInvoiceNumber()

	// ========================
	// INSERT BOOKING
	// ========================
	res, err := config.DB.Exec(`
		INSERT INTO booking 
		(user_id, unit_id, check_in, check_out, jumlah_orang, status_booking, invoice_number, total_price)
		VALUES (?,?,?,?,?, 'pending', ?, ?)
	`,
		userID,
		req.UnitID,
		checkIn,
		checkOut,
		req.JumlahOrang,
		invoice,
		totalHarga,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := res.LastInsertId()
	bookingID := int(id)

	// ========================
	// RESPONSE
	// ========================
	c.JSON(http.StatusCreated, gin.H{
		"message":     "booking created",
		"id_booking":  bookingID,
		"invoice":     invoice,
		"status":      "pending",
		"total_price": totalHarga,
	})
}

// ========================
// GET USER BOOKINGS
// ========================

func GetMyBookings(c *gin.Context) {
	userID, _ := c.Get("user_id")

	rows, err := config.DB.Query(`
		SELECT 
			b.id_booking, COALESCE(b.unit_id, 0), 
			COALESCE(CAST(b.check_in AS CHAR), ''), COALESCE(CAST(b.check_out AS CHAR), ''), 
			COALESCE(b.jumlah_orang, 0), COALESCE(b.status_booking, ''), COALESCE(b.invoice_number, ''),
			COALESCE(p.status_payment, 'unpaid'), COALESCE(p.amount, 0)
		FROM booking b
		LEFT JOIN payment p ON p.booking_id = b.id_booking
		WHERE b.user_id = ?
		ORDER BY b.id_booking DESC
	`, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	type BookingResponse struct {
		IDBooking   int     `json:"id_booking"`
		UnitID      int     `json:"unit_id"`
		CheckIn     string  `json:"check_in"`
		CheckOut    string  `json:"check_out"`
		JumlahOrang int     `json:"jumlah_orang"`
		Status      string  `json:"status_booking"`
		Invoice     string  `json:"invoice"`
		Payment     string  `json:"payment_status"`
		Amount      float64 `json:"amount"`
	}

	bookings := []BookingResponse{}

	for rows.Next() {
		var b BookingResponse
		err := rows.Scan(
			&b.IDBooking,
			&b.UnitID,
			&b.CheckIn,
			&b.CheckOut,
			&b.JumlahOrang,
			&b.Status,
			&b.Invoice,
			&b.Payment,
			&b.Amount,
		)
		if err != nil {
			fmt.Println("Scan Error Get My Bookings:", err)
			continue
		}
		if len(b.CheckIn) >= 10 {
			b.CheckIn = b.CheckIn[:10]
		}
		if len(b.CheckOut) >= 10 {
			b.CheckOut = b.CheckOut[:10]
		}
		bookings = append(bookings, b)
	}

	c.JSON(http.StatusOK, bookings)
}

// ========================
// GET ALL BOOKINGS (ADMIN)
// ========================

func GetAllBookings(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT 
			b.id_booking, COALESCE(b.user_id, 0), COALESCE(b.unit_id, 0), 
			COALESCE(CAST(b.check_in AS CHAR), ''), COALESCE(CAST(b.check_out AS CHAR), ''),
			COALESCE(b.jumlah_orang, 0), COALESCE(b.status_booking, ''), COALESCE(b.invoice_number, ''),
			COALESCE(p.status_payment, 'unpaid'), COALESCE(p.amount, 0),
			COALESCE(u.name, 'Unknown User'),
			COALESCE(u.email, ''),
			COALESCE(d.name, 'Unknown Unit')
		FROM booking b
		LEFT JOIN payment p ON p.booking_id = b.id_booking
		LEFT JOIN users u ON u.id = b.user_id
		LEFT JOIN unit_detail d ON d.unit_id = b.unit_id
		ORDER BY b.id_booking DESC
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	bookings := []gin.H{}

	for rows.Next() {
		var id, userID, unitID, jumlahOrang int
		var amount float64
		var checkIn, checkOut string
		var status, invoice, payment, userName, email, unitName string

		err := rows.Scan(
			&id, &userID, &unitID, &checkIn, &checkOut,
			&jumlahOrang, &status, &invoice, &payment, &amount,
			&userName, &email, &unitName,
		)
		if err != nil {
			fmt.Println("Scan Error Get All Bookings:", err)
			continue
		}

		if len(checkIn) >= 10 {
			checkIn = checkIn[:10]
		}
		if len(checkOut) >= 10 {
			checkOut = checkOut[:10]
		}

		bookings = append(bookings, gin.H{
			"id_booking":     id,
			"user_id":        userID,
			"user_name":      userName,
			"email":          email,
			"unit_id":        unitID,
			"unit_name":      unitName,
			"check_in":       checkIn,
			"check_out":      checkOut,
			"jumlah_orang":   jumlahOrang,
			"status_booking": status,
			"invoice":        invoice,
			"payment_status": payment,
			"amount":         amount,
		})
	}

	c.JSON(http.StatusOK, bookings)
}

// ========================
// UPDATE BOOKING STATUS (ADMIN)
// ========================

func UpdateBookingStatus(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Status string `json:"status_booking"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	bookingID, _ := strconv.Atoi(id)

	_, err := config.DB.Exec(`
		UPDATE booking
		SET status_booking = ?
		WHERE id_booking = ?
	`, body.Status, bookingID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "booking status updated"})
}

// ========================
// CANCEL BOOKING (H-7 RULE)
// ========================

func CancelBooking(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	bookingID, _ := strconv.Atoi(id)

	var checkIn time.Time
	var status string
	var paymentStatus string

	err := config.DB.QueryRow(`
		SELECT b.check_in, COALESCE(b.status_booking, ''), COALESCE(p.status_payment, 'unpaid')
		FROM booking b
		LEFT JOIN payment p ON p.booking_id = b.id_booking
		WHERE b.id_booking = ? AND b.user_id = ?
	`, bookingID, userID).Scan(&checkIn, &status, &paymentStatus)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found"})
		return
	}

	if status == "cancelled" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "booking already cancelled"})
		return
	}

	now := time.Now()
	diff := checkIn.Sub(now).Hours() / 24

	// RULE H-7
	if diff < 7 {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "refund only allowed before H-7 check-in",
		})
		return
	}

	// update booking
	_, err = config.DB.Exec(`
		UPDATE booking
		SET status_booking = 'cancelled'
		WHERE id_booking = ?
	`, bookingID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// update payment
	_, err = config.DB.Exec(`
		UPDATE payment
		SET status_payment = 'refunded'
		WHERE booking_id = ?
	`, bookingID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "booking cancelled",
		"refund":  "eligible",
		"payment": "refunded",
	})
} // ========================
// GET BOOKING BY ID (ADMIN)
// ========================

func GetBookingByID(c *gin.Context) {
	id := c.Param("id")
	bookingID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var data struct {
		IDBooking     int     `json:"id_booking"`
		UserID        int     `json:"user_id"`
		UnitID        int     `json:"unit_id"`
		CheckIn       string  `json:"check_in"`
		CheckOut      string  `json:"check_out"`
		JumlahOrang   int     `json:"jumlah_orang"`
		Status        string  `json:"status_booking"`
		Invoice       string  `json:"invoice_number"`
		PaymentStatus string  `json:"payment_status"`
		Amount        float64 `json:"amount"`
	}

	err = config.DB.QueryRow(`
		SELECT 
			b.id_booking, COALESCE(b.user_id, 0), COALESCE(b.unit_id, 0),
			COALESCE(CAST(b.check_in AS CHAR), ''), COALESCE(CAST(b.check_out AS CHAR), ''),
			COALESCE(b.jumlah_orang, 0), COALESCE(b.status_booking, ''),
			COALESCE(b.invoice_number, ''),
			COALESCE(p.status_payment, 'unpaid'), COALESCE(p.amount, 0)
		FROM booking b
		LEFT JOIN payment p ON p.booking_id = b.id_booking
		WHERE b.id_booking = ?
	`, bookingID).Scan(
		&data.IDBooking,
		&data.UserID,
		&data.UnitID,
		&data.CheckIn,
		&data.CheckOut,
		&data.JumlahOrang,
		&data.Status,
		&data.Invoice,
		&data.PaymentStatus,
		&data.Amount,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found"})
		return
	}

	if len(data.CheckIn) >= 10 {
		data.CheckIn = data.CheckIn[:10]
	}
	if len(data.CheckOut) >= 10 {
		data.CheckOut = data.CheckOut[:10]
	}

	c.JSON(http.StatusOK, data)
}

// ========================
// FORCE DELETE BOOKING (ADMIN)
// ========================

func ForceDeleteBooking(c *gin.Context) {
	id := c.Param("id")
	bookingID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	// hapus payment dulu (karena FK)
	_, err = config.DB.Exec(`
		DELETE FROM payment WHERE booking_id = ?
	`, bookingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// hapus booking
	_, err = config.DB.Exec(`
		DELETE FROM booking WHERE id_booking = ?
	`, bookingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "booking permanently deleted",
	})
}

// ========================
// GET BOOKED DATES BY UNIT (PUBLIC)
// ========================

func GetBookedDatesByUnit(c *gin.Context) {
	unitID := c.Param("unit_id")

	rows, err := config.DB.Query(`
		SELECT 
			CAST(check_in AS CHAR), CAST(check_out AS CHAR)
		FROM booking
		WHERE unit_id = ? AND status_booking != 'cancelled'
	`, unitID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	type BookedRange struct {
		CheckIn  string `json:"check_in"`
		CheckOut string `json:"check_out"`
	}

	ranges := []BookedRange{}

	for rows.Next() {
		var r BookedRange
		if err := rows.Scan(&r.CheckIn, &r.CheckOut); err != nil {
			fmt.Println("Scan Error GetBookedDatesByUnit:", err)
			continue
		}
		if len(r.CheckIn) >= 10 {
			r.CheckIn = r.CheckIn[:10]
		}
		if len(r.CheckOut) >= 10 {
			r.CheckOut = r.CheckOut[:10]
		}
		ranges = append(ranges, r)
	}

	c.JSON(http.StatusOK, ranges)
}
