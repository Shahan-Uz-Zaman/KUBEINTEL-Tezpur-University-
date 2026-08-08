import { useEffect } from "react";
import "./Toast.css";

function Toast({ message, severity = "success", open, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className={`toast-container toast-${severity}`}>
      <span className="toast-icon">
        {severity === "success" ? "✓" : severity === "error" ? "✕" : "ℹ"}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}

export default Toast;
