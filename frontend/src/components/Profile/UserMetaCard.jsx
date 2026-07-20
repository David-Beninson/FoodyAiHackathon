export default function UserMetaCard({ userName, weekId }) {
    return (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="info-row">
                <span className="info-label">User name:</span>
                <span className="info-value">{userName?.toUpperCase() || "guest"}</span>
            </div>
            <div className="info-row">
                <span className="info-label">Active Week:</span>
                <span className="info-value">{weekId}</span>
            </div>
        </div>
    );
}
