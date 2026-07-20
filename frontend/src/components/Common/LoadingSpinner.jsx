import './LoadingSpinner.css';

export default function LoadingSpinner({ message = "Loading...", fullPage = false }) {
  return (
    <div className={`loading-spinner-container ${fullPage ? 'full-page' : ''}`}>
      <div className="spinner-wrapper">
        <div className="spinner-ring"></div>
        <div className="spinner-core"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}
