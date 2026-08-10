import { useEffect, useState } from "react";
import { loadSettings, saveSettings, applySettings } from "../services/settings";
import { testConnection } from "../services/api";
import Toast from "../components/Toast";
import "./Settings.css";

function Settings() {
  const [apiUrl, setApiUrl] = useState("http://localhost:8080");
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const s = loadSettings();
    setApiUrl(s.apiUrl || "http://localhost:8080");
    setRefreshInterval(s.refreshInterval || 10);
    setTheme(s.theme || "light");
    setFontSize(s.fontSize || "medium");
  }, []);

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const previewTheme = (value) => {
    setTheme(value);
    applySettings({
      ...loadSettings(),
      theme: value,
      fontSize,
    });
  };

  const previewFont = (value) => {
    setFontSize(value);
    applySettings({
      ...loadSettings(),
      theme,
      fontSize: value,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const cleaned = {
      apiUrl: (apiUrl || "http://localhost:8080").trim().replace(/\/$/, ""),
      refreshInterval: Math.min(120, Math.max(5, Number(refreshInterval) || 10)),
      theme: theme === "dark" ? "dark" : "light",
      fontSize: ["small", "medium", "large"].includes(fontSize) ? fontSize : "medium",
    };
    setApiUrl(cleaned.apiUrl);
    setRefreshInterval(cleaned.refreshInterval);
    setTheme(cleaned.theme);
    setFontSize(cleaned.fontSize);
    saveSettings(cleaned);
    showToast("Settings saved and applied", "success");
  };

  const handleReset = () => {
    const defaults = {
      apiUrl: "http://localhost:8080",
      refreshInterval: 10,
      theme: "light",
      fontSize: "medium",
    };
    setApiUrl(defaults.apiUrl);
    setRefreshInterval(defaults.refreshInterval);
    setTheme(defaults.theme);
    setFontSize(defaults.fontSize);
    saveSettings(defaults);
    setTestResult(null);
    showToast("Settings reset to defaults", "info");
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection(apiUrl);
      const score = res?.data?.healthScore;
      setTestResult({
        ok: true,
        message:
          score !== undefined
            ? `Connected — health score ${score}%`
            : "Connected successfully",
      });
      showToast("Backend connection successful", "success");
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Cannot reach backend";
      setTestResult({ ok: false, message: msg });
      showToast("Connection failed", "error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">
            Theme, font size, API connection and refresh preferences
          </p>
        </div>
      </div>

      <form className="settings-form" onSubmit={handleSave}>
        <div className="settings-card">
          <h3>Appearance</h3>

          <label>
            Theme
            <div className="theme-toggle-row">
              <button
                type="button"
                className={`theme-option ${theme === "light" ? "active" : ""}`}
                onClick={() => previewTheme("light")}
              >
                ☀️ Light
              </button>
              <button
                type="button"
                className={`theme-option ${theme === "dark" ? "active" : ""}`}
                onClick={() => previewTheme("dark")}
              >
                🌙 Dark
              </button>
            </div>
          </label>
          <p className="hint">Applies instantly across the whole app.</p>

          <label className="mt-label">
            Font size
            <div className="theme-toggle-row">
              <button
                type="button"
                className={`theme-option ${fontSize === "small" ? "active" : ""}`}
                onClick={() => previewFont("small")}
              >
                Small
              </button>
              <button
                type="button"
                className={`theme-option ${fontSize === "medium" ? "active" : ""}`}
                onClick={() => previewFont("medium")}
              >
                Medium
              </button>
              <button
                type="button"
                className={`theme-option ${fontSize === "large" ? "active" : ""}`}
                onClick={() => previewFont("large")}
              >
                Large
              </button>
            </div>
          </label>
          <p className="hint">Scales text across dashboard, tables and forms.</p>
        </div>

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
          <div className="settings-row-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? "Testing..." : "Test Connection"}
            </button>
            {testResult && (
              <span className={testResult.ok ? "test-ok" : "test-fail"}>
                {testResult.ok ? "✓" : "✕"} {testResult.message}
              </span>
            )}
          </div>
        </div>

        <div className="settings-card">
          <h3>Refresh Interval</h3>
          <label>
            Auto-refresh (seconds)
            <input
              type="number"
              min="5"
              max="120"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            />
          </label>
          <p className="hint">Used by Dashboard, Health, Nodes, Pods and Monitoring (5–120).</p>
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

        <div className="settings-actions">
          <button type="submit" className="save-btn">
            Save Settings
          </button>
          <button type="button" className="secondary-btn" onClick={handleReset}>
            Reset Defaults
          </button>
        </div>
      </form>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
}

export default Settings;
