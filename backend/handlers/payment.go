package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"time"

	"go-backend-basic/config"

	"github.com/gin-gonic/gin"
)

type CreatePaymentRequest struct {
	BookingID int     `json:"booking_id"`
	Amount    float64 `json:"amount"`
}

type PaymentResponse struct {
	PaymentID   int    `json:"payment_id"`
	BookingID   int    `json:"booking_id"`
	VANumber    string `json:"va_number"`
	PaymentType string `json:"payment_type"`
	Status      string `json:"status"`
}

// ========================
// CREATE PAYMENT (CORE API)
// ========================
func CreatePayment(c *gin.Context) {
	var req CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// cek booking
	var status string
	err := config.DB.QueryRow(`
		SELECT status_booking FROM booking WHERE id_booking=?
	`, req.BookingID).Scan(&status)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found"})
		return
	}

	if status == "cancelled" || status == "refunded" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "booking not valid"})
		return
	}

	// insert payment
	res, err := config.DB.Exec(`
		INSERT INTO payment (booking_id, amount, status_payment)
		VALUES (?,?,'pending')
	`, req.BookingID, req.Amount)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := res.LastInsertId()
	paymentID := int(id)

	// 🔥 order_id unik
	orderID := "ORDER-" + strconv.Itoa(paymentID) + "-" + strconv.FormatInt(time.Now().Unix(), 10)

	// ========================
	// MIDTRANS CORE API
	// ========================
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")

	payload := map[string]interface{}{
		"payment_type": "bank_transfer",
		"transaction_details": map[string]interface{}{
			"order_id":     orderID,
			"gross_amount": req.Amount,
		},
		"bank_transfer": map[string]interface{}{
			"bank": "bca",
		},
	}

	jsonData, _ := json.Marshal(payload)

	reqMid, _ := http.NewRequest(
		"POST",
		"https://api.sandbox.midtrans.com/v2/charge",
		bytes.NewBuffer(jsonData),
	)

	reqMid.Header.Set("Content-Type", "application/json")
	reqMid.SetBasicAuth(serverKey, "")

	client := &http.Client{}
	resp, err := client.Do(reqMid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "midtrans error"})
		return
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	// ambil VA
	vaNumber := ""
	if vaArr, ok := result["va_numbers"].([]interface{}); ok {
		va := vaArr[0].(map[string]interface{})
		vaNumber = va["va_number"].(string)
	}

	// update payment simpan order_id & VA
	_, _ = config.DB.Exec(`
		UPDATE payment 
		SET order_id=?, va_number=? 
		WHERE payment_id=?
	`, orderID, vaNumber, paymentID)

	// update booking
	_, _ = config.DB.Exec(`
		UPDATE booking 
		SET status_booking='dp_pending' 
		WHERE id_booking=?
	`, req.BookingID)

	c.JSON(http.StatusCreated, PaymentResponse{
		PaymentID:   paymentID,
		BookingID:   req.BookingID,
		VANumber:    vaNumber,
		PaymentType: "bank_transfer",
		Status:      "pending",
	})
}

// ========================
// WEBHOOK MIDTRANS
// ========================
func MidtransWebhook(c *gin.Context) {
	var notif map[string]interface{}
	if err := c.ShouldBindJSON(&notif); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	orderID := notif["order_id"].(string)
	status := notif["transaction_status"].(string)

	// mapping status
	var paymentStatus string
	switch status {
	case "settlement":
		paymentStatus = "paid"
	case "pending":
		paymentStatus = "pending"
	case "expire":
		paymentStatus = "expired"
	case "cancel":
		paymentStatus = "cancelled"
	default:
		paymentStatus = status
	}

	// update payment
	_, err := config.DB.Exec(`
		UPDATE payment 
		SET status_payment=? 
		WHERE order_id=?
	`, paymentStatus, orderID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// update booking kalau paid
	if paymentStatus == "paid" {
		_, _ = config.DB.Exec(`
			UPDATE booking 
			SET status_booking='dp_paid'
			WHERE id_booking = (
				SELECT booking_id FROM payment WHERE order_id=?
			)
		`, orderID)
	}

	c.JSON(http.StatusOK, gin.H{"message": "webhook received"})
}

// ========================
// GET PAYMENT BY BOOKING
// ========================
func GetPaymentByBooking(c *gin.Context) {
	bookingID := c.Param("booking_id")

	row := config.DB.QueryRow(`
		SELECT payment_id, booking_id, amount, status_payment, va_number
		FROM payment
		WHERE booking_id=?
		ORDER BY payment_id DESC
		LIMIT 1
	`, bookingID)

	var pID, bID int
	var amount float64
	var status, va string

	err := row.Scan(&pID, &bID, &amount, &status, &va)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"payment_id": pID,
		"booking_id": bID,
		"amount":     amount,
		"status":     status,
		"va_number":  va,
	})
}

// ========================
// UPDATE PAYMENT STATUS (WEBHOOK SIMULATION)
// ========================
func UpdatePaymentStatus(c *gin.Context) {
	var body struct {
		PaymentID int    `json:"payment_id"`
		Status    string `json:"status_payment"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := config.DB.Exec(`
		UPDATE payment 
		SET status_payment = ? 
		WHERE payment_id = ?
	`, body.Status, body.PaymentID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// kalau settlement → update booking
	if body.Status == "settlement" {
		_, _ = config.DB.Exec(`
			UPDATE booking 
			SET status_booking = 'dp_paid'
			WHERE id_booking = (
				SELECT booking_id FROM payment WHERE payment_id = ?
			)
		`, body.PaymentID)
	}

	c.JSON(http.StatusOK, gin.H{"message": "payment status updated"})
}

// ========================
// REFUND PAYMENT (H-7 RULE)
// ========================
func RefundPayment(c *gin.Context) {
	var body struct {
		BookingID int `json:"booking_id"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// get booking
	var checkIn time.Time
	err := config.DB.QueryRow(`
		SELECT check_in 
		FROM booking 
		WHERE id_booking = ?
	`, body.BookingID).Scan(&checkIn)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found"})
		return
	}

	diff := time.Until(checkIn).Hours() / 24
	if diff < 7 {
		c.JSON(http.StatusForbidden, gin.H{"error": "refund only allowed before H-7"})
		return
	}

	// update payment
	_, err = config.DB.Exec(`
		UPDATE payment 
		SET status_payment = 'refund' 
		WHERE booking_id = ?
	`, body.BookingID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// update booking
	_, _ = config.DB.Exec(`
		UPDATE booking 
		SET status_booking = 'refunded' 
		WHERE id_booking = ?
	`, body.BookingID)

	c.JSON(http.StatusOK, gin.H{
		"message": "refund processed",
		"status":  "refunded",
	})
}
