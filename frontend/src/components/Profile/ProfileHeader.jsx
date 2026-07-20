export default function ProfileHeader({ isEditing, onStartEdit, onSave, onCancel, onViewFavorites }) {
    return (
        <header className="profile-header">
            <h1 className="profile-title">User Profile</h1>
            {!isEditing ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        type="button"
                        onClick={onViewFavorites}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        ❤️ Favorites
                    </button>
                    <button
                        type="button"
                        onClick={onStartEdit}
                        className="btn btn-primary"
                        aria-label="Edit Profile"
                    >
                        Edit Profile
                    </button>
                </div>
            ) : (
                <div className="profile-header-actions">
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
