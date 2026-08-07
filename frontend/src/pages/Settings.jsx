import { useState } from "react";
import "./Settings.css";

function Settings() {
  const [apiUrl, setApiUrl] = useState("http://localhost:8080");
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [theme, setTheme] = useState("light");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // Persist to localStorage for now
    localStorage.setItem(
      "kubeintel_settings",
      JSON.stringify({ apiUrl, refreshInterval, theme })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <p className="settings-subtitle">
        Configure platform preferences. Changes are saved locally in the browser.
      </p>

      <form className="settings-form" onSubmit={handleSave}>
        <div className="settings-card">
          <h3>API Connection</h3>
          <label>
            Backend API URL
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8080"
            />
          </label>
          <p className="hint">
            Default is http://localhost:8080. Restart frontend after changing.
          </p>
        </div>

        <div className="settings-card">
          <h3>Refresh Interval</h3>
          <label>
            Auto-refresh interval (seconds)
            <input
              type="number"
              min="5"
              max="120"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            />
          </label>
          <p className="hint">Used by monitoring and health pages for polling.</p>
        </div>

        <div className="settings-card">
          <h3>Appearance</h3>
          <label>
            Theme
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>

        <div className="settings-card">
          <h3>About</h3>
          <div className="about-grid">
            <div>
              <strong>Product</strong>
              <p>KubeIntel – Kubernetes Intelligent Resource & Network Management Platform</p>
            </div>
            <div>
              <strong>Version</strong>
              <p>1.0.0 (Internship Release)</p>
            </div>
            <div>
              <strong>Stack</strong>
              <p>Go + React + Kubernetes Client-Go</p>
            </div>
          </div>
        </div>

        <button type="submit" className="save-btn">
          Save Settings
        </button>
        {saved && <span className="saved-msg">Settings saved!</span>}
      </form>
    </div>
  );
}

export default Settings;
