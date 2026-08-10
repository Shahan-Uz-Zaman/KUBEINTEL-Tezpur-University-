import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Nodes from "./pages/Nodes";
import Pods from "./pages/Pods";
import Monitoring from "./pages/Monitoring";
import DeploymentManager from "./pages/DeploymentManager";
import Logs from "./pages/Logs";
import Events from "./pages/Events";
import Health from "./Health";
import Recommendations from "./pages/Recommendations";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { applySettings, loadSettings } from "./services/settings";

import "./App.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth > 768 : true
  );

  useEffect(() => {
    applySettings(loadSettings());

    const onResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`app-container ${sidebarOpen ? "sidebar-is-open" : ""}`}>
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden />
      )}

      <div className="main-content">
        <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/nodes" element={<Nodes />} />
            <Route path="/pods" element={<Pods />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/deployments" element={<DeploymentManager />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/events" element={<Events />} />
            <Route path="/health" element={<Health />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
