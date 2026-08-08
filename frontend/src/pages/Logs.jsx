import { useEffect, useState } from "react";
import { getLogs, getPods, getNamespaces } from "../api/logs";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";
import "./Logs.css";

function Logs() {
  const [namespaces, setNamespaces] = useState([]);
  const [pods, setPods] = useState([]);
  const [namespace, setNamespace] = useState("default");
  const [pod, setPod] = useState("");
  const [logs, setLogs] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const ns = await getNamespaces();
        setNamespaces(Array.isArray(ns) ? ns : ns?.namespaces || []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to load namespaces");
      } finally {
        setInitLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadPods() {
      try {
        const p = await getPods(namespace);
        const list = Array.isArray(p) ? p : p?.pods || [];
        setPods(list);
        setPod("");
        setLogs("");
      } catch (err) {
        console.error(err);
        setPods([]);
      }
    }
    loadPods();
  }, [namespace]);

  const loadLogs = async () => {
    if (!pod) return;
    try {
      setLoading(true);
      const data = await getLogs(namespace, pod);
      setLogs(typeof data === "string" ? data : data?.logs || String(data || ""));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to fetch logs");
      setLogs("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pod) return;
    loadLogs();
    const t = setInterval(loadLogs, 10000);
    return () => clearInterval(t);
  }, [pod, namespace]);

  const filteredLogs = search
    ? logs
        .split("\n")
        .filter((line) => line.toLowerCase().includes(search.toLowerCase()))
        .join("\n")
    : logs;

  const copyLogs = () => {
    navigator.clipboard.writeText(filteredLogs || "");
  };

  const downloadLogs = () => {
    const blob = new Blob([filteredLogs || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pod || "pod"}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (initLoading) {
    return <Loading message="Loading Logs Viewer..." />;
  }

  if (error && namespaces.length === 0) {
    return (
      <ErrorState message="Logs unavailable" detail={error} onRetry={() => window.location.reload()} />
    );
  }

  const nsList = Array.isArray(namespaces)
    ? namespaces.map((n) => (typeof n === "string" ? n : n.name || n.Name))
    : [];

  return (
    <div className="logs-page">
      <div className="page-header">
        <div>
          <h1>Pod Logs</h1>
          <p className="page-subtitle">View and search container logs</p>
        </div>
      </div>

      <div className="logs-controls">
        <div className="control-group">
          <label>Namespace</label>
          <select
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            className="control-select"
          >
            {nsList.map((ns) => (
              <option key={ns} value={ns}>
                {ns}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Pod</label>
          <select
            value={pod}
            onChange={(e) => setPod(e.target.value)}
            className="control-select"
          >
            <option value="">Select a pod...</option>
            {pods.map((p) => {
              const name = typeof p === "string" ? p : p.name;
              return (
                <option key={name} value={name}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>

        <div className="control-actions">
          <button onClick={loadLogs} className="refresh-btn" disabled={!pod || loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button onClick={copyLogs} className="secondary-btn" disabled={!logs}>
            Copy
          </button>
          <button onClick={downloadLogs} className="secondary-btn" disabled={!logs}>
            Download
          </button>
        </div>
      </div>

      <input
        className="search-input logs-search"
        placeholder="Filter log lines..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <pre className="logs-viewer">
        {!pod
          ? "Select a pod to view logs."
          : loading && !logs
          ? "Fetching logs..."
          : filteredLogs || "No log output."}
      </pre>
    </div>
  );
}

export default Logs;
