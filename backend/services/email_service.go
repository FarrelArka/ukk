package services

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
)

// ========================
// SEND EMAIL
// ========================

func SendEmail(to, subject, body string) error {
	from := os.Getenv("EMAIL_SENDER")
	password := os.Getenv("EMAIL_PASSWORD")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")

	if from == "" || password == "" {
		return fmt.Errorf("email credentials not set in .env")
	}

	// Proper CRLF header format
	message := "From: " + from + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n\r\n" +
		body

	auth := smtp.PlainAuth("", from, password, smtpHost)

	err := smtp.SendMail(
		smtpHost+":"+smtpPort,
		auth,
		from,
		[]string{to},
		[]byte(message),
	)

	if err != nil {
		log.Println("❌ Email send failed:", err)
		return err
	}

	log.Println("✅ Email sent to:", to)
	return nil
}

// ========================
// BUILD INVOICE EMAIL
// ========================

func BuildInvoiceEmail(invoice, unit, checkIn, checkOut string) string {
	return fmt.Sprintf(`
	<h2>Invoice Booking</h2>
	<hr>
	<p><b>Invoice:</b> %s</p>
	<p><b>Unit:</b> %s</p>
	<p><b>Check-in:</b> %s</p>
	<p><b>Check-out:</b> %s</p>
	<p><b>Status:</b> UNPAID</p>
	<br>
	<p>Silakan selesaikan pembayaran sebelum H-7 agar booking tidak dibatalkan.</p>
	`, invoice, unit, checkIn, checkOut)
}

// ========================
// BUILD REMINDER EMAIL
// ========================

func BuildReminderEmail(invoice, checkIn string) string {
	return fmt.Sprintf(`
	<h2>Reminder Pembayaran Booking</h2>
	<hr>
	<p><b>Invoice:</b> %s</p>
	<p><b>Check-in:</b> %s</p>
	<br>
	<p>Booking Anda belum dibayar.</p>
	<p>Jika tidak dibayar sebelum H-7, booking akan dibatalkan otomatis.</p>
	`, invoice, checkIn)
}

// ========================
// BUILD REFUND EMAIL
// ========================

func BuildRefundEmail(invoice string) string {
	return fmt.Sprintf(`
	<h2>Refund Booking</h2>
	<hr>
	<p><b>Invoice:</b> %s</p>
	<br>
	<p>Booking Anda telah dibatalkan.</p>
	<p>Dana akan dikembalikan sesuai kebijakan refund.</p>
	`, invoice)
}
