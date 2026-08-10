package prometheus

import "fmt"

// GetNetwork returns cluster network receive/transmit in MB/s.
// Tries Prometheus first; falls back to zeros so the UI never breaks.
func GetNetwork() (*NetworkMetric, error) {

	// 1) Try Prometheus node_exporter metrics
	rxResult, err := Query(`sum(rate(node_network_receive_bytes_total{device!~"lo|veth.*|docker.*|br.*|cni.*"}[5m]))`)
	if err == nil {
		txResult, txErr := Query(`sum(rate(node_network_transmit_bytes_total{device!~"lo|veth.*|docker.*|br.*|cni.*"}[5m]))`)
		if txErr == nil {
			rx, rxErr := ParseMetricValue(rxResult)
			tx, parseTxErr := ParseMetricValue(txResult)
			if rxErr == nil && parseTxErr == nil {
				return &NetworkMetric{
					Receive:  rx / 1024 / 1024, // bytes/s → MB/s
					Transmit: tx / 1024 / 1024,
				}, nil
			}
		}
	}

	// 2) Fallback: no live network throughput without Prometheus/node_exporter.
	// Return zeros (not an error) so the Monitoring page still loads.
	_ = fmt.Errorf("prometheus unavailable; network metrics defaulted to 0")
	return &NetworkMetric{
		Receive:  0,
		Transmit: 0,
	}, nil
}
