export default function ProfileHeader({ isEditing, onStartEdit, onSave, onCancel }) {
    return (
        <header className="profile-header">
            <h1 className="profile-title">User Profile</h1>
            {!isEditing ? (
                <button
                    type="button"
                    onClick={onStartEdit}
                    className="btn btn-primary"
                    aria-label="Edit Profile"
                >
                    Edit Profile
                </button>
            ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        type="button"
                        onClick={onSave}
                        className="btn btn-primary"
                        aria-label="Save Changes"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-secondary"
                        aria-label="Cancel Edit"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </header>
    );
}
