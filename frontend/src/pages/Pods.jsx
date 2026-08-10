import { useEffect, useState } from "react";
import { getPods } from "../services/api";
import { getRefreshIntervalMs } from "../services/settings";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";
import "./TablePages.css";

function Pods() {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadPods = async () => {
    try {
      setLoading(true);
      const res = await getPods();
      setPods(res.data.pods || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to fetch pods from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPods();
    const timer = setInterval(loadPods, getRefreshIntervalMs());
    return () => clearInterval(timer);
  }, []);

  const filtered = pods.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.namespace.toLowerCase().includes(search.toLowerCase()) ||
      (p.node || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || p.status.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading && pods.length === 0) {
    return <Loading message="Loading Pods..." />;
  }

  if (error && pods.length === 0) {
    return (
      <ErrorState message="Pods unavailable" detail={error} onRetry={loadPods} />
    );
  }

  return (
    <div className="table-page">
      <div className="page-header">
        <h1>Pod Monitoring</h1>
        <div className="page-actions">
          <input
            type="text"
            placeholder="Search pods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="succeeded">Succeeded</option>
          </select>
          <button onClick={loadPods} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-chip">Total: {pods.length}</div>
        <div className="stat-chip green">
          Running: {pods.filter((p) => p.status === "Running").length}
        </div>
        <div className="stat-chip yellow">
          Pending: {pods.filter((p) => p.status === "Pending").length}
        </div>
        <div className="stat-chip red">
          Failed: {pods.filter((p) => p.status === "Failed").length}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Namespace</th>
              <th>Node</th>
              <th>Status</th>
              <th>Restarts</th>
              <th>Pod IP</th>
              <th>Host IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  No pods found
                </td>
              </tr>
            ) : (
              filtered.map((pod) => (
                <tr key={`${pod.namespace}-${pod.name}`}>
                  <td className="name-cell">{pod.name}</td>
                  <td>{pod.namespace}</td>
                  <td>{pod.node || "—"}</td>
                  <td>
                    <span
                      className={
                        pod.status === "Running"
                          ? "badge badge-green"
                          : pod.status === "Pending"
                          ? "badge badge-yellow"
                          : pod.status === "Failed"
                          ? "badge badge-red"
                          : "badge badge-gray"
                      }
                    >
                      {pod.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        pod.restarts > 5
                          ? "badge badge-red"
                          : pod.restarts > 0
                          ? "badge badge-yellow"
                          : ""
                      }
                    >
                      {pod.restarts}
                    </span>
                  </td>
                  <td className="mono">{pod.podIP || "—"}</td>
                  <td className="mono">{pod.hostIP || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Pods;
