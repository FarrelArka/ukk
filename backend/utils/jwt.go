package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"os"
)

func GenerateToken(userID int, email string, role string) (string, error) {
	jwtKey := []byte(os.Getenv("JWT_SECRET"))
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}
