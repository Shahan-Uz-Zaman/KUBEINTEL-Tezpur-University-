import { useEffect, useState } from "react";
import { getCluster } from "../services/api";
import "./Navbar.css";

function Navbar({ sidebarOpen, onToggleSidebar }) {
  const [cluster, setCluster] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCluster();
        setCluster(res.data);
        setConnected(true);
      } catch {
        setConnected(false);
        setCluster(null);
      }
    };
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  const version = cluster?.clusterVersion || "";

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? (
            <span className="menu-icon cross">✕</span>
          ) : (
            <span className="menu-icon hamburger">
              <span />
              <span />
              <span />
            </span>
          )}
        </button>
        <div className="navbar-titles">
          <h2>KubeIntel</h2>
          <span className="navbar-subtitle">Cluster Management Platform</span>
        </div>
      </div>

      <div className="navbar-right">
        {version && (
          <span className="cluster-version" title="Kubernetes version">
            K8s {version}
          </span>
        )}
        <span className={`cluster-status ${connected ? "online" : "offline"}`}>
          <span className="status-dot" />
          <span className="status-text">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </span>
      </div>
    </header>
  );
}

export default Navbar;
