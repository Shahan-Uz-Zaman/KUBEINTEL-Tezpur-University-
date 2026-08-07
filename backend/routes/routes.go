package routes

import (
	"github.com/gin-gonic/gin"

	"kubeintel/backend/internal/api"
)

func SetupRoutes(router *gin.Engine) {

	// Health probe
	router.GET("/health", api.GetHealth)

	// Assignment 2 – Kubernetes API Integration
	router.GET("/api/cluster", api.GetCluster)
	router.GET("/api/nodes", api.GetNodes)
	router.GET("/api/pods", api.GetPods)
	router.GET("/api/namespaces", api.GetNamespaces)

	// Assignment 3 – Dashboard
	router.GET("/api/dashboard", api.GetDashboard)

	// Assignment 4 – Resource Monitoring
	monitoring := router.Group("/api/monitoring")
	{
		monitoring.GET("/nodes", api.GetNodeMetrics)
		monitoring.GET("/pods", api.GetPodMetrics)
		monitoring.GET("/cluster", api.GetClusterMetrics)
		monitoring.GET("/network", api.GetNetwork)
		monitoring.GET("/storage", api.GetStorage)
	}

	// Assignment 5 – Deployment Manager
	router.GET("/api/deployments", api.GetDeployments)
	router.POST("/api/deployments", api.CreateDeployment)
	router.DELETE("/api/deployments/:name", api.DeleteDeployment)
	router.PUT("/api/deployments/:name/scale", api.ScaleDeployment)
	router.POST("/api/deployments/:name/restart", api.RestartDeployment)

	// Assignment 6 – Logs and Events
	router.GET("/api/logs", api.GetPodLogs)
	router.GET("/api/events", api.GetEvents)
	router.GET("/api/logs/namespaces", api.GetNamespaces)
	router.GET("/api/logs/pods", api.GetPods)

	// Assignment 7 – Health Monitoring
	router.GET("/api/health", api.GetHealth)

	// Assignment 8 – Recommendation Engine
	router.GET("/api/recommendations", api.GetRecommendations)
}
