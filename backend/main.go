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

	// 🌐 CORS - konfigurasi untuk menerima credentials dari origin frontend
	r.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
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