import "./ErrorState.css";

function ErrorState({
  message = "Something went wrong",
  detail = "Unable to connect to the backend server.",
  onRetry,
}) {
  return (
    <div className="error-state">
      <div className="error-icon">⚠</div>
      <h3 className="error-title">{message}</h3>
      <p className="error-detail">{detail}</p>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
