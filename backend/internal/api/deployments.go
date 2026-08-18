package api

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strings"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	intstr "k8s.io/apimachinery/pkg/util/intstr"

	"kubeintel/backend/internal/kubernetes"
)

type ScaleRequest struct {
	Namespace string `json:"namespace"`
	Replicas  int32  `json:"replicas"`
}

type CreateDeploymentRequest struct {
	Namespace string `json:"namespace"`
	Name      string `json:"name"`
	Image     string `json:"image"`
	Replicas  int32  `json:"replicas"`
	Port      int32  `json:"port"`
}

func GetDeployments(c *gin.Context) {

	namespace := c.DefaultQuery("namespace", "default")

	deployments, err := kubernetes.ListDeployments(namespace)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	type DeploymentResponse struct {
		Name              string    `json:"name"`
		Namespace         string    `json:"namespace"`
		Image             string    `json:"image"`
		Replicas          int32     `json:"replicas"`
		ReadyReplicas     int32     `json:"readyReplicas"`
		AvailableReplicas int32     `json:"availableReplicas"`
		CreationTime      time.Time `json:"creationTime"`
	}

	var response []DeploymentResponse

	for _, d := range deployments {

		image := ""

		if len(d.Spec.Template.Spec.Containers) > 0 {
			image = d.Spec.Template.Spec.Containers[0].Image
		}

		replicas := int32(0)

		if d.Spec.Replicas != nil {
			replicas = *d.Spec.Replicas
		}

		response = append(response, DeploymentResponse{

			Name:              d.Name,
			Namespace:         d.Namespace,
			Image:             image,
			Replicas:          replicas,
			ReadyReplicas:     d.Status.ReadyReplicas,
			AvailableReplicas: d.Status.AvailableReplicas,
			CreationTime:      d.CreationTimestamp.Time,
		})
	}

	c.JSON(http.StatusOK, response)
}

func DeleteDeployment(c *gin.Context) {

	name := c.Param("name")
	namespace := c.DefaultQuery("namespace", "default")

	err := kubernetes.DeleteDeployment(namespace, name)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Deployment deleted successfully",
	})
}

func ScaleDeployment(c *gin.Context) {

	name := c.Param("name")

	var req ScaleRequest

	if err := c.ShouldBindJSON(&req); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	err := kubernetes.ScaleDeployment(
		req.Namespace,
		name,
		req.Replicas,
	)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Deployment scaled successfully",
	})
}

func RestartDeployment(c *gin.Context) {

	name := c.Param("name")

	namespace := c.DefaultQuery("namespace", "default")

	err := kubernetes.RestartDeployment(namespace, name)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Deployment restarted successfully",
	})
}

func CreateDeployment(c *gin.Context) {

	var req CreateDeploymentRequest

	// Parse JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request: " + err.Error(),
		})
		return
	}

	// Default values
	if req.Namespace == "" {
		req.Namespace = "default"
	}

	if req.Replicas <= 0 {
		req.Replicas = 1
	}

	// Validate required fields
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Deployment name is required",
		})
		return
	}

	if req.Image == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Container image is required",
		})
		return
	}

	// Automatically select container port and probe type
	port := req.Port
	probeType := "none"

	switch {
	case strings.HasPrefix(req.Image, "nginx"):
		if port <= 0 {
			port = 80
		}
		probeType = "http"

	case strings.HasPrefix(req.Image, "httpd"):
		if port <= 0 {
			port = 80
		}
		probeType = "http"

	case strings.HasPrefix(req.Image, "redis"):
		if port <= 0 {
			port = 6379
		}
		probeType = "tcp"

	case strings.HasPrefix(req.Image, "mysql"):
		if port <= 0 {
			port = 3306
		}
		probeType = "tcp"

	case strings.HasPrefix(req.Image, "postgres"):
		if port <= 0 {
			port = 5432
		}
		probeType = "tcp"

	default:
		// Unknown image:
		// use the supplied port but don't assume HTTP
		if port <= 0 {
			port = 80
		}
		probeType = "none"
	}

	// Create container
	container := corev1.Container{
		Name:  req.Name,
		Image: req.Image,

		Ports: []corev1.ContainerPort{
			{
				ContainerPort: port,
			},
		},
	}

	// Configure readiness probe
	switch probeType {

	case "http":

		container.ReadinessProbe = &corev1.Probe{
			ProbeHandler: corev1.ProbeHandler{
				HTTPGet: &corev1.HTTPGetAction{
					Path: "/",
					Port: intstr.FromInt(int(port)),
				},
			},
			InitialDelaySeconds: 5,
			PeriodSeconds:       10,
			TimeoutSeconds:      2,
			FailureThreshold:    3,
		}

	case "tcp":

		container.ReadinessProbe = &corev1.Probe{
			ProbeHandler: corev1.ProbeHandler{
				TCPSocket: &corev1.TCPSocketAction{
					Port: intstr.FromInt(int(port)),
				},
			},
			InitialDelaySeconds: 5,
			PeriodSeconds:       10,
			TimeoutSeconds:      2,
			FailureThreshold:    3,
		}

	// Unknown image:
	// no readiness probe
	case "none":
		container.ReadinessProbe = nil
	}

	// Create Deployment
	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name: req.Name,
		},

		Spec: appsv1.DeploymentSpec{
			Replicas: &req.Replicas,

			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": req.Name,
				},
			},

			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": req.Name,
					},
				},

				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						container,
					},
				},
			},
		},
	}

	// Send deployment to Kubernetes
	err := kubernetes.CreateDeployment(req.Namespace, deployment)

	if err != nil {

		log.Printf("CreateDeployment Error: %v", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Deployment created successfully",
		"name":    req.Name,
		"image":   req.Image,
		"port":    port,
		"probe":   probeType,
	})
}
