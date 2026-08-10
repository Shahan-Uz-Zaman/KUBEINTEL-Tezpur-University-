import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "🏠", section: "Overview" },
  { name: "Nodes", path: "/nodes", icon: "🖥️", section: "Overview" },
  { name: "Pods", path: "/pods", icon: "📦", section: "Overview" },
  { name: "Deployments", path: "/deployments", icon: "🚀", section: "Operations" },
  { name: "Monitoring", path: "/monitoring", icon: "📊", section: "Operations" },
  { name: "Logs", path: "/logs", icon: "📜", section: "Operations" },
  { name: "Events", path: "/events", icon: "📅", section: "Operations" },
  { name: "Health", path: "/health", icon: "❤️", section: "Intelligence" },
  { name: "Recommendations", path: "/recommendations", icon: "💡", section: "Intelligence" },
  { name: "Settings", path: "/settings", icon: "⚙️", section: "Intelligence" },
];

const sections = ["Overview", "Operations", "Intelligence"];

function Sidebar({ open, onClose }) {
  return (
    <aside className={`sidebar ${open ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">☸️</div>
          <div className="sidebar-brand-text">
            <h2>KubeIntel</h2>
            <span className="sidebar-tag">v1.0</span>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      <nav className="sidebar-menu">
        {sections.map((section) => (
          <div key={section}>
            <div className="menu-section-label">{section}</div>
            {menuItems
              .filter((i) => i.section === section)
              .map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? "menu-item active" : "menu-item"
                  }
                  onClick={() => {
                    if (window.innerWidth <= 768 && onClose) onClose();
                  }}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="menu-label">{item.name}</span>
                </NavLink>
              ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">Internship Project 2026</div>
    </aside>
  );
}

export default Sidebar;
