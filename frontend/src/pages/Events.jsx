import { useEffect, useState } from "react";
import { getEvents } from "../api/events";
import { getRefreshIntervalMs } from "../services/settings";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";
import "./TablePages.css";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents("default");
      setEvents(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    const timer = setInterval(loadEvents, getRefreshIntervalMs());
    return () => clearInterval(timer);
  }, []);

  const filtered = events.filter((event) => {
    const q = search.toLowerCase();
    return (
      (event.reason || "").toLowerCase().includes(q) ||
      (event.object || "").toLowerCase().includes(q) ||
      (event.message || "").toLowerCase().includes(q) ||
      (event.type || "").toLowerCase().includes(q)
    );
  });

  if (loading && events.length === 0) {
    return <Loading message="Loading Events..." />;
  }

  if (error && events.length === 0) {
    return (
      <ErrorState message="Events unavailable" detail={error} onRetry={loadEvents} />
    );
  }

  return (
    <div className="table-page">
      <div className="page-header">
        <h1>Kubernetes Events</h1>
        <div className="page-actions">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button onClick={loadEvents} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-chip">Total: {events.length}</div>
        <div className="stat-chip red">
          Warnings: {events.filter((e) => e.type === "Warning").length}
        </div>
        <div className="stat-chip green">
          Normal: {events.filter((e) => e.type !== "Warning").length}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Reason</th>
              <th>Object</th>
              <th>Message</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row">
                  No events found
                </td>
              </tr>
            ) : (
              filtered.map((event, index) => (
                <tr key={index}>
                  <td>
                    <span
                      className={
                        event.type === "Warning"
                          ? "badge badge-red"
                          : "badge badge-green"
                      }
                    >
                      {event.type || "Normal"}
                    </span>
                  </td>
                  <td className="name-cell">{event.reason}</td>
                  <td>{event.object}</td>
                  <td>{event.message}</td>
                  <td className="mono">
                    {event.time
                      ? new Date(event.time).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Events;
