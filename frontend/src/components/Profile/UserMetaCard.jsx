export default function UserMetaCard({ userName, email }) {
    return (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="info-row">
                <span className="info-label">User name:</span>
                <span className="info-value">{userName?.toUpperCase() || "guest"}</span>
            </div>
            {email && (
                <div className="info-row">
                    <span className="info-label">Email Address:</span>
                    <span className="info-value">{email}</span>
                </div>
            )}
        </div>
    );
}

