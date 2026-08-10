import { useEffect, useState } from "react";
import {
  getClusterMetrics,
  getStorage,
  getNetwork,
  getHealth,
} from "../services/monitoringService";
import MetricCard from "../components/MetricCard";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";

function formatGB(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A";
  }
  return `${Number(value).toFixed(2)} GB`;
}

function formatMBps(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A";
  }
  return `${Number(value).toFixed(2)} MB/s`;
}

function Monitoring() {
  const [cluster, setCluster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [storage, setStorage] = useState(null);
  const [network, setNetwork] = useState(null);
  const [health, setHealth] = useState(null);

  const loadMetrics = async () => {
    try {
      // Core metrics – required
      const response = await getClusterMetrics();
      setCluster(response.data || { nodes: [], pods: [] });

      // Storage / Network – optional; never fail the whole page
      try {
        const storageRes = await getStorage();
        setStorage(storageRes.data);
      } catch (e) {
        console.warn("Storage metrics unavailable:", e);
        setStorage({ availableGB: 0 });
      }

      try {
        const networkRes = await getNetwork();
        setNetwork(networkRes.data);
      } catch (e) {
        console.warn("Network metrics unavailable:", e);
        setNetwork({ receive: 0, transmit: 0 });
      }

      try {
        const healthRes = await getHealth();
        setHealth(healthRes.data);
      } catch (e) {
        console.warn("Health metrics unavailable:", e);
      }

      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const timer = setInterval(loadMetrics, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !cluster) {
    return <Loading message="Loading Cluster Metrics..." />;
  }

  if (error && !cluster) {
    return (
      <ErrorState
        message="Monitoring unavailable"
        detail={error}
        onRetry={loadMetrics}
      />
    );
  }

  const nodes = cluster?.nodes || [];
  const pods = cluster?.pods || [];

  if (nodes.length === 0 && pods.length === 0) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4>No Monitoring Data Available</h4>
          <p>
            Metrics Server may not be installed, or no metrics are available yet.
            Storage and network will still show if the API is reachable.
          </p>
          <p className="mb-0">
            <strong>Storage:</strong> {formatGB(storage?.availableGB)} &nbsp;|&nbsp;
            <strong>Receive:</strong> {formatMBps(network?.receive)} &nbsp;|&nbsp;
            <strong>Transmit:</strong> {formatMBps(network?.transmit)}
          </p>
        </div>
      </div>
    );
  }

  const storageValue = formatGB(storage?.availableGB);
  const receiveValue = formatMBps(network?.receive);
  const transmitValue = formatMBps(network?.transmit);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Resource Monitoring</h2>
        <button className="btn btn-primary btn-sm" onClick={loadMetrics}>
          Refresh
        </button>
      </div>

      <hr />

      {error && <div className="alert alert-danger">{error}</div>}

      {health && (
        <div className="alert alert-info py-2">
          Health Score: <strong>{health.healthScore}%</strong>
          {health.warningCount > 0 && (
            <span> — {health.warningCount} warning(s)</span>
          )}
        </div>
      )}

      <h3>Cluster Summary</h3>
      <div className="row mb-4">
        <MetricCard title="Nodes" value={nodes.length} color="#0d6efd" />
        <MetricCard title="Pods" value={pods.length} color="#198754" />
        <MetricCard
          title="CPU"
          value={nodes[0]?.cpu || "N/A"}
          color="#dc3545"
        />
        <MetricCard
          title="Memory"
          value={nodes[0]?.memory || "N/A"}
          color="#ffc107"
        />
        <MetricCard title="Storage" value={storageValue} color="#6610f2" />
        <MetricCard title="Receive" value={receiveValue} color="#20c997" />
        <MetricCard title="Transmit" value={transmitValue} color="#fd7e14" />
      </div>

      <h3>Storage</h3>
      <table className="table table-bordered mb-4" style={{ maxWidth: 420 }}>
        <tbody>
          <tr>
            <td>Available Space</td>
            <td>
              <strong>{storageValue}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Network</h3>
      <table className="table table-bordered mb-4" style={{ maxWidth: 420 }}>
        <tbody>
          <tr>
            <td>Receive</td>
            <td>
              <strong>{receiveValue}</strong>
            </td>
          </tr>
          <tr>
            <td>Transmit</td>
            <td>
              <strong>{transmitValue}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Node Metrics</h3>
      <div className="table-responsive mb-4">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>CPU</th>
              <th>Memory</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node.name}>
                <td>{node.name}</td>
                <td>
                  <div className="progress" style={{ minWidth: 100 }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${Math.min((node.cpuUsage || 0) / 10, 100)}%`,
                      }}
                    >
                      {node.cpu}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="progress" style={{ minWidth: 100 }}>
                    <div
                      className="progress-bar bg-success"
                      style={{
                        width: `${Math.min((node.memUsage || 0) / 40, 100)}%`,
                      }}
                    >
                      {node.memory}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="mb-0">Pod Metrics</h3>
        <input
          className="form-control"
          style={{ maxWidth: 240 }}
          placeholder="Search pods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Namespace</th>
              <th>Pod</th>
              <th>CPU</th>
              <th>Memory</th>
            </tr>
          </thead>
          <tbody>
            {pods
              .filter((p) =>
                (p.name || "").toLowerCase().includes(search.toLowerCase())
              )
              .map((pod) => (
                <tr key={`${pod.namespace}-${pod.name}`}>
                  <td>{pod.namespace}</td>
                  <td>{pod.name}</td>
                  <td>{pod.cpu}</td>
                  <td>{pod.memory}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Monitoring;
