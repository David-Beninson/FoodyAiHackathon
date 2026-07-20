export default function ProfileHeader({ isEditing, onStartEdit, onSave, onCancel, onViewFavorites, userName, onLogout }) {
    return (
        <header className="profile-header">
            <h1 className="profile-title">{userName}</h1>
            {!isEditing ? (
                <div className="profile-header-actions">
                    <button
                        type="button"
                        onClick={onViewFavorites}
                        className="btn btn-primary"
                    >
                        Favorites
                    </button>
                    <button
                        type="button"
                        onClick={onStartEdit}
                        className="btn btn-primary"
                        aria-label="Edit Profile"
                    >
                        Edit Profile
                    </button>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="btn btn-logout"
                        aria-label="Logout"
                    >
                        Logout
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
