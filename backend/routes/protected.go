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
		auth.GET("/testimonial", handlers.GetTestimonials)
		auth.GET("/testimonial/:id", handlers.GetTestimonialByID)
		auth.PUT("/testimonial/:id", handlers.UpdateTestimonial)

		AdminRoutes(auth)
	}
}
