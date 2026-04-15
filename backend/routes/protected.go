package routes

import (
	"go-backend-basic/handlers"
	"go-backend-basic/middleware"

	"github.com/gin-gonic/gin"
)

func ProtectedRoutes(r *gin.Engine) {
	auth := r.Group("/api")
	auth.Use(middleware.AuthMiddleware())
	{
		auth.GET("/profile", handlers.Profile)
		auth.POST("/logout", handlers.Logout)

		// ========================
		// BOOKING (USER)
		// ========================
		auth.POST("/booking", handlers.CreateBooking)
		auth.GET("/booking/me", handlers.GetMyBookings)
		auth.PUT("/booking/:id/cancel", handlers.CancelBooking)

		// ========================
		// TESTIMONIAL (USER)
		// ========================
		auth.POST("/testimonial", handlers.CreateTestimonial)
		auth.GET("/testimonial/:id", handlers.GetTestimonialByID)
		auth.GET("/testimonial/booking/:booking_id", handlers.GetTestimonialByBooking)
		auth.PUT("/testimonial/:id", handlers.UpdateTestimonial)

		// ========================
		// PAYMENT (USER)
		// ========================
		auth.POST("/payment", handlers.CreatePayment)
		auth.GET("/payment/:booking_id", handlers.GetPaymentByBooking)
		AdminRoutes(auth)
	}
}
