import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "🏠" },
  { name: "Nodes", path: "/nodes", icon: "🖥️" },
  { name: "Pods", path: "/pods", icon: "📦" },
  { name: "Deployments", path: "/deployments", icon: "🚀" },
  { name: "Monitoring", path: "/monitoring", icon: "📊" },
  { name: "Logs", path: "/logs", icon: "📜" },
  { name: "Events", path: "/events", icon: "📅" },
  { name: "Health", path: "/health", icon: "❤️" },
  { name: "Recommendations", path: "/recommendations", icon: "💡" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">☸️</div>
        <div>
          <h2>KubeIntel</h2>
          <span className="sidebar-tag">v1.0</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-section-label">Overview</div>
        {menuItems.slice(0, 3).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span className="icon">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}

        <div className="menu-section-label">Operations</div>
        {menuItems.slice(3, 7).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span className="icon">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}

        <div className="menu-section-label">Intelligence</div>
        {menuItems.slice(7).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span className="icon">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        Internship Project 2026
      </div>
    </aside>
  );
}

export default Sidebar;
