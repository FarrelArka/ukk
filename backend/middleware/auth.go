package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		jwtKey := []byte(os.Getenv("JWT_SECRET"))

		var tokenString string

		// 🔥 PRIORITAS: HEADER BEARER
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			// fallback ke cookie
			cookie, err := c.Cookie("cookie")
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "token tidak ada"})
				c.Abort()
				return
			}
			tokenString = cookie
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token tidak valid"})
			c.Abort()
			return
		}

		claims := token.Claims.(jwt.MapClaims)

		// 🔥 FIX TYPE
		userID := int(claims["user_id"].(float64))

		fmt.Println("AuthMiddleware: user_id =", userID)

		c.Set("user_id", userID)
		c.Set("email", claims["email"])
		c.Set("role", claims["role"])

		c.Next()
	}
}
