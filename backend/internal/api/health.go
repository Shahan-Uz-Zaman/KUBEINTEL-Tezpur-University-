package api

import (
	"context"
	"net/http"

	"kubeintel/backend/internal/kubernetes"

	"github.com/gin-gonic/gin"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type HealthWarning struct {
	Type      string `json:"type"`
	Severity  string `json:"severity"`
	Resource  string `json:"resource"`
	Namespace string `json:"namespace,omitempty"`
	Message   string `json:"message"`
}

func GetHealth(c *gin.Context) {

	client := kubernetes.Clientset

	if client == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Kubernetes client not initialized",
		})
		return
	}

	pods, err := client.CoreV1().
		Pods("").
		List(context.Background(), metav1.ListOptions{})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	nodes, err := client.CoreV1().
		Nodes().
		List(context.Background(), metav1.ListOptions{})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var runningPods int
	var pendingPods int
	var failedPods int
	var restartingPods int
	var warnings []HealthWarning

	for _, pod := range pods.Items {
		switch pod.Status.Phase {
		case corev1.PodRunning:
			runningPods++
		case corev1.PodPending:
			pendingPods++
			warnings = append(warnings, HealthWarning{
				Type:      "pod",
				Severity:  "warning",
				Resource:  pod.Name,
				Namespace: pod.Namespace,
				Message:   "Pod is Pending",
			})
		case corev1.PodFailed:
			failedPods++
			warnings = append(warnings, HealthWarning{
				Type:      "pod",
				Severity:  "critical",
				Resource:  pod.Name,
				Namespace: pod.Namespace,
				Message:   "Pod is Failed",
			})
		}

		var restarts int32
		for _, cs := range pod.Status.ContainerStatuses {
			restarts += cs.RestartCount

			if cs.State.Waiting != nil {
				reason := cs.State.Waiting.Reason
				if reason == "CrashLoopBackOff" || reason == "ImagePullBackOff" || reason == "ErrImagePull" {
					warnings = append(warnings, HealthWarning{
						Type:      "pod",
						Severity:  "critical",
						Resource:  pod.Name,
						Namespace: pod.Namespace,
						Message:   "Pod waiting: " + reason,
					})
				}
			}
		}

		if restarts > 0 {
			restartingPods++
		}
		if restarts > 5 {
			warnings = append(warnings, HealthWarning{
				Type:      "pod",
				Severity:  "warning",
				Resource:  pod.Name,
				Namespace: pod.Namespace,
				Message:   "High restart count",
			})
		}
	}

	var healthyNodes int
	var unhealthyNodes int

	for _, node := range nodes.Items {
		ready := false
		for _, condition := range node.Status.Conditions {
			if condition.Type == corev1.NodeReady {
				if condition.Status == corev1.ConditionTrue {
					ready = true
				}
				break
			}
		}

		if ready {
			healthyNodes++
		} else {
			unhealthyNodes++
			warnings = append(warnings, HealthWarning{
				Type:     "node",
				Severity: "critical",
				Resource: node.Name,
				Message:  "Node is NotReady",
			})
		}

		for _, condition := range node.Status.Conditions {
			if condition.Status == corev1.ConditionTrue {
				switch condition.Type {
				case corev1.NodeMemoryPressure:
					warnings = append(warnings, HealthWarning{
						Type:     "node",
						Severity: "warning",
						Resource: node.Name,
						Message:  "Memory Pressure",
					})
				case corev1.NodeDiskPressure:
					warnings = append(warnings, HealthWarning{
						Type:     "node",
						Severity: "warning",
						Resource: node.Name,
						Message:  "Disk Pressure",
					})
				case corev1.NodePIDPressure:
					warnings = append(warnings, HealthWarning{
						Type:     "node",
						Severity: "warning",
						Resource: node.Name,
						Message:  "PID Pressure",
					})
				}
			}
		}
	}

	score := 100
	score -= failedPods * 15
	score -= pendingPods * 5
	score -= unhealthyNodes * 20
	score -= restartingPods * 2
	if score < 0 {
		score = 0
	}

	if warnings == nil {
		warnings = []HealthWarning{}
	}

	c.JSON(http.StatusOK, gin.H{
		"totalPods":      len(pods.Items),
		"runningPods":    runningPods,
		"pendingPods":    pendingPods,
		"failedPods":     failedPods,
		"restartingPods": restartingPods,
		"totalNodes":     len(nodes.Items),
		"healthyNodes":   healthyNodes,
		"unhealthyNodes": unhealthyNodes,
		"healthScore":    score,
		"warnings":       warnings,
		"warningCount":   len(warnings),
	})
}
