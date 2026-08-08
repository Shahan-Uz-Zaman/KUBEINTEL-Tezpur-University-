import { useEffect, useState } from "react";
import { getRecommendations } from "../services/api";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";
import "./Recommendations.css";

function Recommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      setLoading(true);
      const res = await getRecommendations();
      setData(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !data) {
    return <Loading message="Loading Recommendations..." />;
  }

  if (error && !data) {
    return (
      <ErrorState message="Recommendations unavailable" detail={error} onRetry={load} />
    );
  }

  const list = data?.recommendations || [];
  const filtered =
    filter === "all"
      ? list
      : list.filter((r) => r.severity === filter || r.type === filter);

  return (
    <div className="rec-page">
      <div className="page-header">
        <h1>Recommendation Engine</h1>
        <button onClick={load} className="refresh-btn">
          Refresh
        </button>
      </div>

      <p className="rec-subtitle">
        Intelligent operational recommendations based on cluster state
      </p>

      <div className="rec-stats">
        <div className="rec-stat critical">
          <span className="rec-stat-num">{data?.critical || 0}</span>
          <span className="rec-stat-label">Critical</span>
        </div>
        <div className="rec-stat warning">
          <span className="rec-stat-num">{data?.warning || 0}</span>
          <span className="rec-stat-label">Warning</span>
        </div>
        <div className="rec-stat info">
          <span className="rec-stat-num">{data?.info || 0}</span>
          <span className="rec-stat-label">Info</span>
        </div>
        <div className="rec-stat total">
          <span className="rec-stat-num">{data?.count || 0}</span>
          <span className="rec-stat-label">Total</span>
        </div>
      </div>

      <div className="rec-filters">
        {["all", "critical", "warning", "info", "cpu", "memory", "pod", "node"].map(
          (f) => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          )
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">✓</div>
          <h3>No recommendations</h3>
          <p>Cluster looks healthy. No action items right now.</p>
        </div>
      ) : (
        <div className="rec-list">
          {filtered.map((rec) => (
            <div key={rec.id} className={`rec-card severity-${rec.severity}`}>
              <div className="rec-card-header">
                <span className={`severity-badge ${rec.severity}`}>
                  {rec.severity}
                </span>
                <span className="rec-type">{rec.type}</span>
                <span className="rec-id">{rec.id}</span>
              </div>
              <h3 className="rec-title">{rec.title}</h3>
              <p className="rec-desc">{rec.description}</p>
              <div className="rec-meta">
                <span>
                  <strong>Resource:</strong> {rec.resource}
                  {rec.namespace ? ` (${rec.namespace})` : ""}
                </span>
              </div>
              <div className="rec-action">
                <strong>Suggested Action:</strong> {rec.action}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Recommendations;
