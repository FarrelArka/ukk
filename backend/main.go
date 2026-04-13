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

	// 🔐 INIT GOOGLE CONFIG (ambil dari config/google.go)
	config.InitGoogleOAuth() // <- sesuaikan nama func lu

	r := gin.Default()

	// 🌐 CORS - izinkan semua origin (termasuk file://, XAMPP, Next.js)
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
		},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	// 🚀 ROUTES
	routes.SetupRoutes(r)

	r.Run(":5050")
}
