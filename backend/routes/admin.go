package routes

import (
	"go-backend-basic/handlers"
	"go-backend-basic/middleware"

	"github.com/gin-gonic/gin"
)

func AdminRoutes(auth *gin.RouterGroup) {
	admin := auth.Group("/admin")
	admin.Use(middleware.RequireRole("admin"))
	{
		// DASHBOARD
		admin.GET("/dashboard", handlers.AdminDashboard)

		// =========================
		// ACCOMMODATIONS CRUD
		// =========================
		admin.GET("/accommodations", handlers.GetUnits)
		admin.GET("/accommodations/:id", handlers.GetUnitByID)
		admin.POST("/accommodations", handlers.CreateUnit)
		admin.PUT("/accommodations/:id", handlers.UpdateAccommodation)
		admin.DELETE("/accommodations/:id", handlers.DeleteAccommodation)

		// =========================
		// USERS
		// =========================
		users := admin.Group("/users")
		{
			users.GET("", handlers.GetAllUsers)
			users.GET("/:id", handlers.GetUserByID)
			users.POST("", handlers.CreateUser) // ✅ FIXED
			users.PUT("/:id", handlers.UpdateUser)
			users.DELETE("/:id", handlers.DeleteUser)
		}

		// =========================
		// BOOKING MANAGEMENT
		// =========================
		admin.GET("/bookings", handlers.GetAllBookings)
		admin.GET("/bookings/:id", handlers.GetBookingByID)
		admin.PUT("/bookings/:id/status", handlers.UpdateBookingStatus)
		admin.DELETE("/bookings/:id", handlers.ForceDeleteBooking)

		// =========================
		// TESTIMONIAL MANAGEMENT
		// =========================
		admin.GET("/testimonials", handlers.GetAllTestimonialsAdmin)
		admin.GET("/testimonials/:id", handlers.GetTestimonialByID)
		admin.PATCH("/testimonials/:id/status", handlers.UpdateTestimonialStatus)
		admin.DELETE("/testimonials/:id", handlers.DeleteTestimonial)
	}
}
