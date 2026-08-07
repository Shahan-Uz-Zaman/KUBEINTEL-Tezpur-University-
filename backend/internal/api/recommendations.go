package api

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"kubeintel/backend/internal/kubernetes"
	"kubeintel/backend/internal/monitoring"
)

type Recommendation struct {
	ID          string `json:"id"`
	Type        string `json:"type"`        // cpu | memory | pod | node
	Severity    string `json:"severity"`    // critical | warning | info
	Title       string `json:"title"`
	Description string `json:"description"`
	Resource    string `json:"resource"`    // node name / pod name
	Namespace   string `json:"namespace,omitempty"`
	Action      string `json:"action"`
}

func GetRecommendations(c *gin.Context) {
	client := kubernetes.Clientset
	if client == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kubernetes client not initialized"})
		return
	}

	var recommendations []Recommendation
	id := 0

	// --- Node conditions (memory pressure, disk pressure, not ready) ---
	nodes, err := client.CoreV1().Nodes().List(context.Background(), metav1.ListOptions{})
	if err == nil {
		for _, node := range nodes.Items {
			for _, cond := range node.Status.Conditions {
				switch cond.Type {
				case corev1.NodeReady:
					if cond.Status != corev1.ConditionTrue {
						id++
						recommendations = append(recommendations, Recommendation{
							ID:          formatID(id),
							Type:        "node",
							Severity:    "critical",
							Title:       "Unhealthy Node",
							Description: "Node is not in Ready state.",
							Resource:    node.Name,
							Action:      "Investigate node conditions and kubelet logs. Consider draining and replacing the node.",
						})
					}
				case corev1.NodeMemoryPressure:
					if cond.Status == corev1.ConditionTrue {
						id++
						recommendations = append(recommendations, Recommendation{
							ID:          formatID(id),
							Type:        "memory",
							Severity:    "warning",
							Title:       "Memory Pressure",
							Description: "Node is experiencing memory pressure.",
							Resource:    node.Name,
							Action:      "Reduce memory requests/limits on pods, scale out, or add more memory capacity.",
						})
					}
				case corev1.NodeDiskPressure:
					if cond.Status == corev1.ConditionTrue {
						id++
						recommendations = append(recommendations, Recommendation{
							ID:          formatID(id),
							Type:        "node",
							Severity:    "warning",
							Title:       "Disk Pressure",
							Description: "Node is experiencing disk pressure.",
							Resource:    node.Name,
							Action:      "Free disk space, clean unused images, or expand node storage.",
						})
					}
				case corev1.NodePIDPressure:
					if cond.Status == corev1.ConditionTrue {
						id++
						recommendations = append(recommendations, Recommendation{
							ID:          formatID(id),
							Type:        "node",
							Severity:    "warning",
							Title:       "PID Pressure",
							Description: "Node is running low on process IDs.",
							Resource:    node.Name,
							Action:      "Reduce number of processes/pods on this node or increase PID limits.",
						})
					}
				}
			}
		}
	}

	// --- Unhealthy / restarting pods ---
	pods, err := client.CoreV1().Pods("").List(context.Background(), metav1.ListOptions{})
	if err == nil {
		for _, pod := range pods.Items {
			var restarts int32
			for _, cs := range pod.Status.ContainerStatuses {
				restarts += cs.RestartCount

				if cs.State.Waiting != nil {
					reason := cs.State.Waiting.Reason
					if reason == "CrashLoopBackOff" || reason == "ImagePullBackOff" || reason == "ErrImagePull" {
						id++
						recommendations = append(recommendations, Recommendation{
							ID:          formatID(id),
							Type:        "pod",
							Severity:    "critical",
							Title:       "Unhealthy Pod: " + reason,
							Description: "Pod is stuck in " + reason + " state.",
							Resource:    pod.Name,
							Namespace:   pod.Namespace,
							Action:      "Check pod logs and events. Fix image/config issues or resource limits.",
						})
					}
				}

				if cs.LastTerminationState.Terminated != nil &&
					cs.LastTerminationState.Terminated.Reason == "OOMKilled" {
					id++
					recommendations = append(recommendations, Recommendation{
						ID:          formatID(id),
						Type:        "memory",
						Severity:    "critical",
						Title:       "Pod OOMKilled",
						Description: "Container was killed due to out-of-memory.",
						Resource:    pod.Name,
						Namespace:   pod.Namespace,
						Action:      "Increase memory limits for this pod or optimize application memory usage.",
					})
				}
			}

			if restarts > 5 {
				id++
				recommendations = append(recommendations, Recommendation{
					ID:          formatID(id),
					Type:        "pod",
					Severity:    "warning",
					Title:       "High Restart Count",
					Description: "Pod has restarted multiple times.",
					Resource:    pod.Name,
					Namespace:   pod.Namespace,
					Action:      "Investigate application crashes. Check logs and liveness/readiness probes.",
				})
			}

			if pod.Status.Phase == corev1.PodFailed {
				id++
				recommendations = append(recommendations, Recommendation{
					ID:          formatID(id),
					Type:        "pod",
					Severity:    "critical",
					Title:       "Failed Pod",
					Description: "Pod is in Failed phase.",
					Resource:    pod.Name,
					Namespace:   pod.Namespace,
					Action:      "Inspect pod events and logs. Fix the root cause and redeploy.",
				})
			}
		}
	}

	// --- Resource metrics based recommendations (if metrics-server available) ---
	nodeMetrics, err := monitoring.GetNodeMetrics()
	if err == nil {
		for _, nm := range nodeMetrics {
			// CPUUsage is in millicores; treat > 1500m as high for a typical small node
			if nm.CPUUsage > 1500 {
				id++
				recommendations = append(recommendations, Recommendation{
					ID:          formatID(id),
					Type:        "cpu",
					Severity:    "warning",
					Title:       "Overloaded CPU",
					Description: "Node CPU usage is high (" + nm.CPU + ").",
					Resource:    nm.Name,
					Action:      "Scale deployments horizontally or add CPU capacity / new nodes.",
				})
			}
			// MemUsage in MB; treat > 3500 MB as high on small nodes
			if nm.MemUsage > 3500 {
				id++
				recommendations = append(recommendations, Recommendation{
					ID:          formatID(id),
					Type:        "memory",
					Severity:    "warning",
					Title:       "High Memory Usage",
					Description: "Node memory usage is high.",
					Resource:    nm.Name,
					Action:      "Review memory-heavy pods, set proper limits, or scale the cluster.",
				})
			}
			// Underutilized: very low CPU and memory
			if nm.CPUUsage < 50 && nm.MemUsage < 200 {
				id++
				recommendations = append(recommendations, Recommendation{
					ID:          formatID(id),
					Type:        "node",
					Severity:    "info",
					Title:       "Underutilized Node",
					Description: "Node has very low CPU and memory usage.",
					Resource:    nm.Name,
					Action:      "Consider consolidating workloads onto fewer nodes to save cost.",
				})
			}
		}
	}

	if recommendations == nil {
		recommendations = []Recommendation{}
	}

	// Sort-like ordering: critical first, then warning, then info
	critical, warning, info := []Recommendation{}, []Recommendation{}, []Recommendation{}
	for _, r := range recommendations {
		switch strings.ToLower(r.Severity) {
		case "critical":
			critical = append(critical, r)
		case "warning":
			warning = append(warning, r)
		default:
			info = append(info, r)
		}
	}
	ordered := append(append(critical, warning...), info...)

	c.JSON(http.StatusOK, gin.H{
		"count":           len(ordered),
		"critical":        len(critical),
		"warning":         len(warning),
		"info":            len(info),
		"recommendations": ordered,
	})
}

func formatID(n int) string {
	return "REC-" + itoa(n)
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var b [12]byte
	i := len(b)
	for n > 0 {
		i--
		b[i] = byte('0' + n%10)
		n /= 10
	}
	return string(b[i:])
}
