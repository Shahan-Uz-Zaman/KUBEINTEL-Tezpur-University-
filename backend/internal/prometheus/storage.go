package prometheus

import (
	"context"
	"fmt"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"kubeintel/backend/internal/kubernetes"
)

// GetStorage returns available storage in GB.
// Tries Prometheus first; falls back to Kubernetes node capacity.
func GetStorage() (*StorageMetric, error) {

	// 1) Try Prometheus (node_exporter)
	result, err := Query(`sum(node_filesystem_avail_bytes{fstype!~"tmpfs|overlay"})`)
	if err == nil {
		value, parseErr := ParseMetricValue(result)
		if parseErr == nil {
			return &StorageMetric{
				AvailableGB: value / 1024 / 1024 / 1024,
			}, nil
		}
	}

	// 2) Fallback: sum ephemeral-storage capacity from nodes via Kubernetes API
	gb, fallbackErr := storageFromKubernetes()
	if fallbackErr != nil {
		// Return zero instead of hard failure so UI can still render
		return &StorageMetric{AvailableGB: 0}, nil
	}

	return &StorageMetric{AvailableGB: gb}, nil
}

func storageFromKubernetes() (float64, error) {
	client := kubernetes.Clientset
	if client == nil {
		return 0, fmt.Errorf("kubernetes client not initialized")
	}

	nodes, err := client.CoreV1().Nodes().List(context.Background(), metav1.ListOptions{})
	if err != nil {
		return 0, err
	}

	var totalBytes int64
	for _, node := range nodes.Items {
		// Prefer allocatable ephemeral-storage, then capacity
		if q, ok := node.Status.Allocatable[corev1.ResourceEphemeralStorage]; ok {
			totalBytes += q.Value()
			continue
		}
		if q, ok := node.Status.Capacity[corev1.ResourceEphemeralStorage]; ok {
			totalBytes += q.Value()
		}
	}

	if totalBytes == 0 {
		return 0, fmt.Errorf("no storage capacity reported by nodes")
	}

	return float64(totalBytes) / 1024 / 1024 / 1024, nil
}
