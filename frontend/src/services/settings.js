const STORAGE_KEY = "kubeintel_settings";

const DEFAULTS = {
  apiUrl: "http://localhost:8080",
  refreshInterval: 10,
  theme: "light",
  fontSize: "medium", // small | medium | large
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings) {
  const next = { ...DEFAULTS, ...settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  applySettings(next);
  window.dispatchEvent(new CustomEvent("kubeintel-settings", { detail: next }));
  return next;
}

export function applySettings(settings) {
  const s = { ...DEFAULTS, ...(settings || loadSettings()) };
  const root = document.documentElement;

  // Theme
  root.setAttribute("data-theme", s.theme === "dark" ? "dark" : "light");
  document.body.classList.toggle("theme-dark", s.theme === "dark");
  document.body.classList.toggle("theme-light", s.theme !== "dark");

  // Font size scale
  const sizeMap = { small: "14px", medium: "16px", large: "18px" };
  root.style.setProperty("--base-font-size", sizeMap[s.fontSize] || sizeMap.medium);
  root.setAttribute("data-font", s.fontSize || "medium");

  return s;
}

export function getApiBaseUrl() {
  const s = loadSettings();
  const base = (s.apiUrl || DEFAULTS.apiUrl).replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

export function getRefreshIntervalMs() {
  const s = loadSettings();
  const sec = Number(s.refreshInterval) || 10;
  return Math.max(5, Math.min(120, sec)) * 1000;
}

if (typeof window !== "undefined") {
  applySettings(loadSettings());
}
