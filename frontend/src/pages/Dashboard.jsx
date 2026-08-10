import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";
import { getDashboard } from "../services/api";
import { getRefreshIntervalMs } from "../services/settings";
import "./Dashboard.css";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      setDashboard(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const timer = setInterval(loadDashboard, getRefreshIntervalMs());
    return () => clearInterval(timer);
  }, []);

  if (loading && !dashboard) {
    return <Loading message="Loading Dashboard..." />;
  }

  if (error && !dashboard) {
    return (
      <ErrorState
        message="Dashboard unavailable"
        detail={error}
        onRetry={loadDashboard}
      />
    );
  }

  const d = dashboard || {};

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Cluster Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your Kubernetes cluster</p>
        </div>
        <button onClick={loadDashboard} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="dashboard-grid">
        <DashboardCard
          title="Total Nodes"
          value={d.nodeCount ?? 0}
          icon="🖥️"
          color="#2563eb"
        />
        <DashboardCard
          title="Namespaces"
          value={d.namespaceCount ?? 0}
          icon="📂"
          color="#7c3aed"
        />
        <DashboardCard
          title="Running Pods"
          value={d.runningPods ?? 0}
          icon="📦"
          color="#22c55e"
        />
        <DashboardCard
          title="Failed Pods"
          value={d.failedPods ?? 0}
          icon="❌"
          color="#ef4444"
        />
        <DashboardCard
          title="Cluster Status"
          value={d.clusterStatus || "Unknown"}
          icon="☸️"
          color={
            d.clusterStatus === "Healthy" ? "#22c55e" : "#f59e0b"
          }
        />
      </div>
    </div>
  );
}

export default Dashboard;
