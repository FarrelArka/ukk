package handlers

import (
	"fmt"
	"net/http"

	"go-backend-basic/config"

	"github.com/gin-gonic/gin"
)

func AdminDashboard(c *gin.Context) {
	var totalBookings int
	err := config.DB.QueryRow("SELECT COUNT(*) FROM booking").Scan(&totalBookings)
	if err != nil {
		fmt.Println("Error counting bookings:", err)
	}

	var activeUnits int
	err = config.DB.QueryRow("SELECT COUNT(*) FROM unit_detail").Scan(&activeUnits)
	if err != nil {
		fmt.Println("Error counting units:", err)
	}

	var totalUsers int
	err = config.DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&totalUsers)
	if err != nil {
		fmt.Println("Error counting users:", err)
	}

	rows, err := config.DB.Query(`
		SELECT 
			COALESCE(d.name, 'Unknown Unit'),
			COALESCE(CAST(b.check_in AS CHAR), ''),
			COALESCE(CAST(b.check_out AS CHAR), ''),
			COALESCE(b.status_booking, 'pending')
		FROM booking b
		LEFT JOIN unit_detail d ON d.unit_id = b.unit_id
		WHERE b.status_booking IN ('confirmed', 'pending', 'paid', 'sukses', 'completed')
	`)

	var calendarBookings []gin.H

	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var unitName, checkIn, checkOut, status string
			if err := rows.Scan(&unitName, &checkIn, &checkOut, &status); err == nil {
				if len(checkIn) >= 10 {
					checkIn = checkIn[:10]
				}
				if len(checkOut) >= 10 {
					checkOut = checkOut[:10]
				}
				calendarBookings = append(calendarBookings, gin.H{
					"unit":     unitName,
					"checkIn":  checkIn,
					"checkOut": checkOut,
					"status":   status,
				})
			}
		}
	} else {
		fmt.Println("Error fetching calendar bookings:", err)
	}

	if calendarBookings == nil {
		calendarBookings = []gin.H{}
	}

	rowsUnits, err := config.DB.Query("SELECT name FROM unit_detail")
	var unitNames []string
	if err == nil {
		defer rowsUnits.Close()
		for rowsUnits.Next() {
			var name string
			if err := rowsUnits.Scan(&name); err == nil {
				unitNames = append(unitNames, name)
			}
		}
	} else {
		fmt.Println("Error fetching unit names:", err)
	}

	if unitNames == nil {
		unitNames = []string{}
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"total_bookings": totalBookings,
			"active_units":   activeUnits,
			"total_users":    totalUsers,
		},
		"calendar_bookings": calendarBookings,
		"units":             unitNames,
	})
}
