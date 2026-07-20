import { mockUserPlan } from '../../data/mockData';
import { useProfile } from '../../hooks/useProfile';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import UserMetaCard from '../../components/Profile/UserMetaCard';
import WeightCard from '../../components/Profile/WeightCard';
import MacrosCard from '../../components/Profile/MacrosCard';
import TagManagerCard from '../../components/Profile/TagManagerCard';
import './Profile.css';

export default function Profile() {
    const {
        currentProfile,
        isEditing,
        showSuccessToast,
        newAllergy,
        setNewAllergy,
        newPref,
        setNewPref,
        proteinPct,
        carbsPct,
        fatsPct,
        handleStartEdit,
        handleCancelEdit,
        handleSave,
        handleChange,
        addTag,
        removeTag
    } = useProfile(mockUserPlan);

    return (
        <div className="profile-container">
            {showSuccessToast && (
                <div className="toast" role="alert">
                    <span>✔️ Changes saved successfully!</span>
                </div>
            )}

            <ProfileHeader
                isEditing={isEditing}
                onStartEdit={handleStartEdit}
                onSave={handleSave}
                onCancel={handleCancelEdit}
            />

            <div className="profile-content-area">
                <UserMetaCard
                    userName={mockUserPlan.userName}
                    weekId={mockUserPlan.weekId}
                />

                <form onSubmit={handleSave}>
                    <div className="profile-grid">
                        <WeightCard
                            weight={currentProfile.weight}
                            goalWeight={currentProfile.goalWeight}
                            onChange={handleChange}
                            isEditing={isEditing}
                        />

                        <MacrosCard
                            targetMacros={currentProfile.targetMacros}
                            onChange={handleChange}
                            isEditing={isEditing}
                            proteinPct={proteinPct}
                            carbsPct={carbsPct}
                            fatsPct={fatsPct}
                        />
                    </div>

                    <div className="card">
                        <h2 className="card-title">Preferences & Dietary Constraints</h2>

                        <TagManagerCard
                            title="Allergies & Restrictions"
                            placeholder="Add allergy (e.g. peanuts)..."
                            tags={currentProfile.allergies}
                            inputValue={newAllergy}
                            setInputValue={setNewAllergy}
                            onAddTag={() => addTag('allergies', newAllergy, setNewAllergy)}
                            onRemoveTag={(tag) => removeTag('allergies', tag)}
                            isEditing={isEditing}
                            emptyMessage="No allergies recorded"
                        />

                        <TagManagerCard
                            title="Dietary Preferences (e.g. vegetarian, gluten-free)"
                            placeholder="Add preference..."
                            tags={currentProfile.preferences}
                            inputValue={newPref}
                            setInputValue={setNewPref}
                            onAddTag={() => addTag('preferences', newPref, setNewPref)}
                            onRemoveTag={(tag) => removeTag('preferences', tag)}
                            isEditing={isEditing}
                            emptyMessage="No preferences recorded"
                        />
                    </div>

                    {isEditing && (
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                                Save Changes
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} style={{ padding: '0.8rem 2rem' }}>
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}