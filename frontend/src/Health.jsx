import { useEffect, useState } from "react";
import { getHealth } from "./services/api";
import { getRefreshIntervalMs } from "./services/settings";
import Loading from "./components/Loading";
import ErrorState from "./components/ErrorState";
import "./Health.css";

function Health() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHealth = async () => {
    try {
      const res = await getHealth();
      setHealth(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to fetch health data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const timer = setInterval(fetchHealth, getRefreshIntervalMs());
    return () => clearInterval(timer);
  }, []);

  if (loading && !health) {
    return <Loading message="Loading Health Dashboard..." />;
  }

  if ((error || !health) && !health) {
    return (
      <ErrorState
        message="Health unavailable"
        detail={error || "No data"}
        onRetry={fetchHealth}
      />
    );
  }

  const scoreColor =
    health.healthScore >= 90
      ? "#22c55e"
      : health.healthScore >= 70
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="health-page">
      <div className="health-header">
        <h1>Health Monitoring</h1>
        <button onClick={fetchHealth} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="health-grid">
        <div className="health-card score-card">
          <h3>Health Score</h3>
          <h1 style={{ color: scoreColor }}>{health.healthScore}%</h1>
          <h2 style={{ color: scoreColor }}>
            {health.healthScore >= 90
              ? "Healthy"
              : health.healthScore >= 70
              ? "Degraded"
              : "Unhealthy"}
          </h2>
        </div>

        <div className="health-card">
          <h3>Total Nodes</h3>
          <h1>{health.totalNodes}</h1>
        </div>
        <div className="health-card">
          <h3>Healthy Nodes</h3>
          <h1 style={{ color: "#22c55e" }}>{health.healthyNodes}</h1>
        </div>
        <div className="health-card">
          <h3>Unhealthy Nodes</h3>
          <h1 style={{ color: health.unhealthyNodes > 0 ? "#ef4444" : "#22c55e" }}>
            {health.unhealthyNodes}
          </h1>
        </div>

        <div className="health-card">
          <h3>Total Pods</h3>
          <h1>{health.totalPods}</h1>
        </div>
        <div className="health-card">
          <h3>Running Pods</h3>
          <h1 style={{ color: "#22c55e" }}>{health.runningPods}</h1>
        </div>
        <div className="health-card">
          <h3>Pending Pods</h3>
          <h1 style={{ color: health.pendingPods > 0 ? "#f59e0b" : "#22c55e" }}>
            {health.pendingPods}
          </h1>
        </div>
        <div className="health-card">
          <h3>Failed Pods</h3>
          <h1 style={{ color: health.failedPods > 0 ? "#ef4444" : "#22c55e" }}>
            {health.failedPods}
          </h1>
        </div>
        <div className="health-card">
          <h3>Restarting Pods</h3>
          <h1 style={{ color: health.restartingPods > 0 ? "#f59e0b" : "#22c55e" }}>
            {health.restartingPods || 0}
          </h1>
        </div>
      </div>

      <div className="warnings-section">
        <h2>
          Health Warnings{" "}
          <span className="warning-count">({health.warningCount || 0})</span>
        </h2>

        {!health.warnings || health.warnings.length === 0 ? (
          <div className="no-warnings">No active warnings — cluster looks good.</div>
        ) : (
          <div className="warnings-list">
            {health.warnings.map((w, i) => (
              <div key={i} className={`warning-item severity-${w.severity}`}>
                <span className={`w-badge ${w.severity}`}>{w.severity}</span>
                <span className="w-type">{w.type}</span>
                <span className="w-resource">
                  {w.resource}
                  {w.namespace ? ` / ${w.namespace}` : ""}
                </span>
                <span className="w-message">{w.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Health;
