package main

import (
	"go-backend-basic/config"
	"go-backend-basic/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 🔥 CONNECT DATABASE
	config.ConnectDB()

	// 🔐 INIT GOOGLE CONFIG
	config.InitGoogleOAuth()

	r := gin.Default()

	// =========================
	// 🌐 CORS (FIX TOTAL)
	// =========================
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:5173",
			"http://localhost:5500",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:5173",
		},

		AllowMethods: []string{
			"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
			"Accept",
			"X-Requested-With",
		},
		ExposeHeaders: []string{
			"Content-Length",
		},
		AllowCredentials: true,
		MaxAge:           12 * 3600,
	}))

	// =========================
	// 🚀 ROUTES
	// =========================
	routes.SetupRoutes(r)

	// =========================
	// 🚀 RUN SERVER
	// =========================
	r.Run(":5050")
}