import { useEffect, useState } from "react";
import { getNodes } from "../services/api";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";
import "./TablePages.css";

function Nodes() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadNodes = async () => {
    try {
      setLoading(true);
      const res = await getNodes();
      setNodes(res.data.nodes || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to fetch nodes from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNodes();
    const timer = setInterval(loadNodes, 15000);
    return () => clearInterval(timer);
  }, []);

  const filtered = nodes.filter(
    (n) =>
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.status.toLowerCase().includes(search.toLowerCase()) ||
      (n.roles || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading && nodes.length === 0) {
    return <Loading message="Loading Nodes..." />;
  }

  if (error && nodes.length === 0) {
    return (
      <ErrorState message="Nodes unavailable" detail={error} onRetry={loadNodes} />
    );
  }

  return (
    <div className="table-page">
      <div className="page-header">
        <h1>Node Monitoring</h1>
        <div className="page-actions">
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button onClick={loadNodes} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-chip">Total: {nodes.length}</div>
        <div className="stat-chip green">
          Ready: {nodes.filter((n) => n.status === "Ready").length}
        </div>
        <div className="stat-chip red">
          NotReady: {nodes.filter((n) => n.status !== "Ready").length}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Role</th>
              <th>Version</th>
              <th>OS</th>
              <th>Arch</th>
              <th>Internal IP</th>
              <th>Runtime</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-row">
                  No nodes found
                </td>
              </tr>
            ) : (
              filtered.map((node) => (
                <tr key={node.name}>
                  <td className="name-cell">{node.name}</td>
                  <td>
                    <span
                      className={
                        node.status === "Ready"
                          ? "badge badge-green"
                          : "badge badge-red"
                      }
                    >
                      {node.status}
                    </span>
                  </td>
                  <td>{node.roles}</td>
                  <td>{node.kubernetesVersion}</td>
                  <td>{node.os}</td>
                  <td>{node.architecture}</td>
                  <td>{node.internalIP || "—"}</td>
                  <td className="mono">{node.containerRuntime}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Nodes;
