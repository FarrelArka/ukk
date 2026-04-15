package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"time"
	"fmt"
	"go-backend-basic/config"

	"github.com/gin-gonic/gin"
)

type CreatePaymentRequest struct {
	BookingID   int     `json:"booking_id"`
	Amount      float64 `json:"amount"`
	PaymentType string  `json:"payment_type"` // "qris" or "bank_transfer"
}

type PaymentResponse struct {
	PaymentID     int    `json:"payment_id"`
	BookingID     int    `json:"booking_id"`
	VANumber      string `json:"va_number,omitempty"`
	PaymentType   string `json:"payment_type"`
	Status        string `json:"status"`
	DeeplinkUrl   string `json:"deeplink_url,omitempty"`
	TransactionID string `json:"transaction_id,omitempty"`
	OrderID       string `json:"order_id,omitempty"`
	QRString      string `json:"qr_string,omitempty"`
}

func autoMigratePayment() {
	// Memastikan kolom tambahan ada di table payment secara otomatis
	config.DB.Exec(`ALTER TABLE payment ADD COLUMN transaction_id VARCHAR(255)`)
}

// ========================
// CREATE PAYMENT (CORE API)
// ========================
func CreatePayment(c *gin.Context) {
	autoMigratePayment()

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

	// 🔥 IMPORTANT FIX: order_id = booking_id (biar webhook gampang match)
	orderID := strconv.Itoa(req.BookingID)

	// insert payment
	res, err := config.DB.Exec(`
		INSERT INTO payment (booking_id, amount, status_payment, order_id)
		VALUES (?, ?, 'pending', ?)
	`, req.BookingID, req.Amount, orderID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	paymentID, _ := res.LastInsertId()

	// ========================
	// MIDTRANS CORE API
	// ========================
	serverKey := os.Getenv("SERVER_KEY")

	var payload map[string]interface{}

	if req.PaymentType == "qris" {
		payload = map[string]interface{}{
			"payment_type": "qris",
			"transaction_details": map[string]interface{}{
				"order_id":     orderID,
				"gross_amount": req.Amount,
			},
		}
	} else {
		payload = map[string]interface{}{
			"payment_type": "bank_transfer",
			"transaction_details": map[string]interface{}{
				"order_id":     orderID,
				"gross_amount": req.Amount,
			},
			"bank_transfer": map[string]interface{}{
				"bank": "bca",
			},
		}
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

	// ambil VA / QR / transaction id
	vaNumber := ""
	if vaArr, ok := result["va_numbers"].([]interface{}); ok {
		if len(vaArr) > 0 {
			if va, ok := vaArr[0].(map[string]interface{}); ok {
				vaNumber, _ = va["va_number"].(string)
			}
		}
	}

	transactionID := ""
	if tid, ok := result["transaction_id"].(string); ok {
		transactionID = tid
	}

	qrString := ""
	if qs, ok := result["qr_string"].(string); ok {
		qrString = qs
	}

	deeplinkUrl := ""
	if actions, ok := result["actions"].([]interface{}); ok {
		for _, a := range actions {
			if m, ok := a.(map[string]interface{}); ok {
				if m["name"] == "deeplink-redirect" {
					deeplinkUrl, _ = m["url"].(string)
				}
			}
		}
	}

	// QRIS validation
	if req.PaymentType == "qris" && qrString == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":             "gagal mendapatkan transaksi dari Midtrans",
			"midtrans_response": result,
		})
		return
	}

	// update payment (WAJIB pakai order_id + status pending)
	_, _ = config.DB.Exec(`
		UPDATE payment 
		SET order_id=?, va_number=?, transaction_id=?, status_payment='pending'
		WHERE payment_id=?
	`, orderID, vaNumber, transactionID, paymentID)

	// ❌ JANGAN set PAID di sini (INI YANG BIKIN BUG SEBELUMNYA)
	_, _ = config.DB.Exec(`
		UPDATE booking 
		SET status_booking='pending'
		WHERE id_booking=?
	`, req.BookingID)

	c.JSON(http.StatusCreated, PaymentResponse{
		PaymentID:     int(paymentID),
		BookingID:     req.BookingID,
		VANumber:      vaNumber,
		PaymentType:   req.PaymentType,
		Status:        "pending",
		DeeplinkUrl:   deeplinkUrl,
		TransactionID: transactionID,
		OrderID:       orderID,
		QRString:      qrString,
	})
}

// ========================
// WEBHOOK MIDTRANS
// ========================
func MidtransWebhook(c *gin.Context) {
	fmt.Println("🔥 WEBHOOK HIT")

	var notif map[string]interface{}
	_ = c.ShouldBindJSON(&notif)

	orderID, _ := notif["order_id"].(string)
	status, _ := notif["transaction_status"].(string)

	bookingID, err := strconv.Atoi(orderID)
	if err != nil {
		c.JSON(200, gin.H{"ok": true})
		return
	}

	var paymentStatus string

	switch status {
	case "settlement", "capture":
		paymentStatus = "paid"
	case "pending":
		paymentStatus = "pending"
	case "expire":
		paymentStatus = "expired"
	case "cancel", "deny":
		paymentStatus = "cancelled"
	default:
		paymentStatus = "pending"
	}

	// update payment
	_, _ = config.DB.Exec(`
		UPDATE payment 
		SET status_payment=?
		WHERE booking_id=?
	`, paymentStatus, bookingID)

	// update booking
	if paymentStatus == "paid" {
		_, _ = config.DB.Exec(`
			UPDATE booking 
			SET status_booking='paid'
			WHERE id_booking=?
		`, bookingID)
	}

	c.JSON(200, gin.H{"ok": true})
}

// ========================
// GET PAYMENT BY BOOKING (with live Midtrans status check)
// ========================
func GetPaymentByBooking(c *gin.Context) {
	bookingID := c.Param("booking_id")

	row := config.DB.QueryRow(`
		SELECT payment_id, booking_id, amount, status_payment, COALESCE(va_number,''), COALESCE(order_id,'')
		FROM payment
		WHERE booking_id=?
		ORDER BY payment_id DESC
		LIMIT 1
	`, bookingID)

	var pID, bID int
	var amount float64
	var status, va, orderID string

	err := row.Scan(&pID, &bID, &amount, &status, &va, &orderID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}

	// If status is still pending AND we have an order_id, check Midtrans directly
	if status == "pending" && orderID != "" {
		serverKey := os.Getenv("SERVER_KEY")
		midtransURL := "https://api.sandbox.midtrans.com/v2/" + orderID + "/status"

		req, _ := http.NewRequest("GET", midtransURL, nil)
		req.SetBasicAuth(serverKey, "")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err == nil {
			defer resp.Body.Close()
			var result map[string]interface{}
			json.NewDecoder(resp.Body).Decode(&result)

			if txStatus, ok := result["transaction_status"].(string); ok {
				if txStatus == "settlement" || txStatus == "capture" {
					status = "paid"
					// Update local DB
					config.DB.Exec(`UPDATE payment SET status_payment='paid' WHERE payment_id=?`, pID)
					config.DB.Exec(`UPDATE booking SET status_booking='paid' WHERE id_booking=?`, bID)
				} else if txStatus == "expire" {
					status = "expired"
					config.DB.Exec(`UPDATE payment SET status_payment='expired' WHERE payment_id=?`, pID)
				} else if txStatus == "cancel" || txStatus == "deny" {
					status = "cancelled"
					config.DB.Exec(`UPDATE payment SET status_payment='cancelled' WHERE payment_id=?`, pID)
				}
			}
		}
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
			SET status_booking = 'paid'
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
