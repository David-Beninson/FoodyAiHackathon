import { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import UserMetaCard from '../../components/Profile/UserMetaCard';
import WeightCard from '../../components/Profile/WeightCard';
import MacrosCard from '../../components/Profile/MacrosCard';
import TagManagerCard from '../../components/Profile/TagManagerCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import OnboardingQuestionnaire from '../../components/Profile/OnboardingQuestionnaire';
import FamilySettingsCard from '../../components/Profile/FamilySettingsCard';
import './Profile.css';

export default function Profile() {
    const { isOnboarded } = useAuth();
    const {
        currentProfile,
        tempProfile,
        isEditing,
        showSuccessToast,
        newAllergy,
        setNewAllergy,
        newPref,
        setNewPref,
        newGoal,
        setNewGoal,
        proteinPct,
        carbsPct,
        fatsPct,
        handleStartEdit,
        handleCancelEdit,
        handleSave,
        handleChange,
        addTag,
        removeTag,
        isLoading,
        error,
        handleToggleFamilyMode,
        handleAddFamilyMember,
        handleRemoveFamilyMember,
        handleUpdateFamilyMember,
        displayMacros
    } = useProfile();

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSave();
    };

    if (isLoading) {
        return (
            <div className="profile-container">
                <LoadingSpinner message="Loading profile..." />
            </div>
        );
    }

    if (!isOnboarded) {
        return (
            <OnboardingQuestionnaire
                tempProfile={tempProfile}
                error={error}
                newAllergy={newAllergy}
                setNewAllergy={setNewAllergy}
                newPref={newPref}
                setNewPref={setNewPref}
                handleChange={handleChange}
                addTag={addTag}
                removeTag={removeTag}
                onSubmit={handleFormSubmit}
            />
        );
    }

    return (
        <div className="profile-container">
            {showSuccessToast && (
                <div className="toast" role="alert">
                    <span>✔️ Changes saved successfully!</span>
                </div>
            )}

            {error && (
                <div className="error-banner">
                    ⚠️ {error}
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
                    userName={currentProfile.username || 'User'}
                    email={currentProfile.email || 'No email registered'}
                />

                <form onSubmit={(e) => e.preventDefault()}>
                    {/* הפריסה המקבילה - רשת של כרטיסיות */}
                    <div className="profile-dashboard-grid">
                        <WeightCard
                            weight={currentProfile.weight}
                            goalWeight={currentProfile.goalWeight}
                            height={currentProfile.height}
                            age={currentProfile.age}
                            gender={currentProfile.gender}
                            activityLevel={currentProfile.activity_level}
                            onChange={handleChange}
                            isEditing={isEditing}
                        />

                        <MacrosCard
                            targetMacros={displayMacros}
                            onChange={handleChange}
                            isEditing={isEditing}
                            proteinPct={proteinPct}
                            carbsPct={carbsPct}
                            fatsPct={fatsPct}
                            isLoading={isLoading}
                            isFamilyMode={currentProfile.is_family_mode}
                        />

                        <div className="card">
                            <h2 className="card-title">Goals, Preferences & Dietary Constraints</h2>

                            <TagManagerCard
                                title="Personal Goals"
                                placeholder="Select a goal..."
                                tags={currentProfile.goals || []}
                                inputValue={newGoal}
                                setInputValue={setNewGoal}
                                onAddTag={(val) => addTag('goals', val, setNewGoal)}
                                onRemoveTag={(tag) => removeTag('goals', tag)}
                                isEditing={isEditing}
                                emptyMessage="No goals recorded"
                                options={['lose weight', 'gain muscle', 'eat healthier']}
                            />

                            <TagManagerCard
                                title="Allergies & Restrictions"
                                placeholder="Add allergy (e.g. peanuts)..."
                                tags={currentProfile.allergies || []}
                                inputValue={newAllergy}
                                setInputValue={setNewAllergy}
                                onAddTag={(val) => addTag('allergies', val, setNewAllergy)}
                                onRemoveTag={(tag) => removeTag('allergies', tag)}
                                isEditing={isEditing}
                                emptyMessage="No allergies recorded"
                            />

                            <TagManagerCard
                                title="Dietary Preferences (e.g. vegetarian)"
                                placeholder="Add preference..."
                                tags={currentProfile.preferences || []}
                                inputValue={newPref}
                                setInputValue={setNewPref}
                                onAddTag={(val) => addTag('preferences', val, setNewPref)}
                                onRemoveTag={(tag) => removeTag('preferences', tag)}
                                isEditing={isEditing}
                                emptyMessage="No preferences recorded"
                            />
                        </div>

                        <FamilySettingsCard
                            currentProfile={currentProfile}
                            isEditing={isEditing}
                            handleToggleFamilyMode={handleToggleFamilyMode}
                            handleAddFamilyMember={handleAddFamilyMember}
                            handleRemoveFamilyMember={handleRemoveFamilyMember}
                            handleUpdateFamilyMember={handleUpdateFamilyMember}
                            handleStartEdit={handleStartEdit}
                        />
                    </div>

                    {isEditing && (
                        <div className="profile-form-actions">
                            <button type="button" className="btn btn-primary btn-large" onClick={handleSave}>
                                Save Changes
                            </button>
                            <button type="button" className="btn btn-secondary btn-large" onClick={handleCancelEdit}>
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}