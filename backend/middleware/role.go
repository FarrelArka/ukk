package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")

		// DEBUG LOG
		fmt.Printf("RequireRole check: expected [%s], found [%v]\n", role, userRole)

		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "akses ditolak (role tidak ditemukan)"})
			c.Abort()
			return
		}

		userRoleStr, ok := userRole.(string)
		if !ok || !strings.EqualFold(userRoleStr, role) {
			c.JSON(http.StatusForbidden, gin.H{
				"error": fmt.Sprintf("akses ditolak (Role: %s, User: %v)", role, userRole),
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
