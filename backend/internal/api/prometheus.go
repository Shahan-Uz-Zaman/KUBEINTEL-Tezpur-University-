package api

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"kubeintel/backend/internal/prometheus"
)

func GetStorage(c *gin.Context) {

	data, err := prometheus.GetStorage()
	if err != nil {
		// Soft-fail: still return a usable payload
		c.JSON(http.StatusOK, gin.H{
			"availableGB": 0,
			"source":      "unavailable",
			"error":       err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"availableGB": data.AvailableGB,
		"source":      "prometheus_or_kubernetes",
	})
}

func GetNetwork(c *gin.Context) {

	data, err := prometheus.GetNetwork()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"receive":  0,
			"transmit": 0,
			"source":   "unavailable",
			"error":    err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"receive":  data.Receive,
		"transmit": data.Transmit,
		"source":   "prometheus_or_fallback",
	})
}
