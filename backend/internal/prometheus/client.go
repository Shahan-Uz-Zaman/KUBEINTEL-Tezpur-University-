package prometheus

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"
)

// BaseURL can be overridden with PROMETHEUS_URL env var
var BaseURL = func() string {
	if v := os.Getenv("PROMETHEUS_URL"); v != "" {
		return v
	}
	return "http://localhost:9090"
}()

type QueryResponse struct {
	Status string `json:"status"`
	Data   struct {
		Result []struct {
			Metric map[string]string `json:"metric"`
			Value  []interface{}     `json:"value"`
		} `json:"result"`
	} `json:"data"`
}

type NetworkMetric struct {
	Receive  float64 `json:"receive"`
	Transmit float64 `json:"transmit"`
}

type StorageMetric struct {
	AvailableGB float64 `json:"availableGB"`
}

var httpClient = &http.Client{
	Timeout: 3 * time.Second,
}

func Query(query string) (*QueryResponse, error) {
	queryURL := fmt.Sprintf(
		"%s/api/v1/query?query=%s",
		BaseURL,
		url.QueryEscape(query),
	)

	resp, err := httpClient.Get(queryURL)
	if err != nil {
		return nil, fmt.Errorf("prometheus unreachable at %s: %w", BaseURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("prometheus returned status %d", resp.StatusCode)
	}

	var result QueryResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if result.Status != "success" {
		return nil, fmt.Errorf("prometheus query status: %s", result.Status)
	}

	return &result, nil
}

// ParseMetricValue extracts the numeric value from the first Prometheus result.
func ParseMetricValue(result *QueryResponse) (float64, error) {
	if result == nil || len(result.Data.Result) == 0 {
		return 0, fmt.Errorf("no metrics returned from Prometheus")
	}

	if len(result.Data.Result[0].Value) < 2 {
		return 0, fmt.Errorf("invalid Prometheus response")
	}

	valueStr, ok := result.Data.Result[0].Value[1].(string)
	if !ok {
		return 0, fmt.Errorf("metric value is not a string")
	}

	value, err := strconv.ParseFloat(valueStr, 64)
	if err != nil {
		return 0, err
	}

	return value, nil
}
