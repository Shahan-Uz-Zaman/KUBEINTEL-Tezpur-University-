import { useEffect, useState } from "react";
import { getCluster } from "../services/api";
import "./Navbar.css";

function Navbar() {
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

  const version =
    cluster?.clusterVersion || "";

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2>KubeIntel</h2>
        <span className="navbar-subtitle">Cluster Management Platform</span>
      </div>

      <div className="navbar-right">
        {version && (
          <span className="cluster-version" title="Kubernetes version">
            K8s {version}
          </span>
        )}
        <span className={`cluster-status ${connected ? "online" : "offline"}`}>
          <span className="status-dot" />
          {connected ? "Cluster Connected" : "Disconnected"}
        </span>
      </div>
    </header>
  );
}

export default Navbar;
