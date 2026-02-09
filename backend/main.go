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

	// 🌐 CORS BEBAS SEMUA DOMAIN & PORT
	r.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins: []string{
			"http://localhost:3000",
		},
		AllowMethods: []string{
			"GET", "POST", "PUT", "DELETE", "OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},
	}))

	// 🚀 ROUTES
	routes.SetupRoutes(r)

	r.Run(":5050")
}
