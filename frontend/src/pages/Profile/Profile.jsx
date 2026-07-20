import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import UserMetaCard from '../../components/Profile/UserMetaCard';
import WeightCard from '../../components/Profile/WeightCard';
import MacrosCard from '../../components/Profile/MacrosCard';
import TagManagerCard from '../../components/Profile/TagManagerCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
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
        error
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

    // 1. Render raw HTML Questionnaire if user is NOT onboarded yet
    if (!isOnboarded) {
        return (
            <div>
                <h1>User Onboarding Questionnaire</h1>
                <p>Please fill out this form to personalize your experience. You can leave and return to the form at any time; your progress is automatically saved locally.</p>

                {error && (
                    <div style={{ color: 'red', border: '1px solid red', padding: '10px', marginBottom: '20px' }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <form onSubmit={handleFormSubmit}>
                    {/* Section 1: Basic Biometrics */}
                    <fieldset>
                        <legend>Biometric Information</legend>
                        
                        <p>
                            <label htmlFor="age">Age (years): </label>
                            <input
                                type="number"
                                id="age"
                                value={tempProfile.age || ''}
                                onChange={(e) => handleChange('age', e.target.value)}
                                min="1"
                                max="120"
                                required
                            />
                        </p>

                        <p>
                            <label htmlFor="height">Height (cm): </label>
                            <input
                                type="number"
                                id="height"
                                value={tempProfile.height || ''}
                                onChange={(e) => handleChange('height', e.target.value)}
                                min="50"
                                max="250"
                                required
                            />
                        </p>

                        <p>
                            <label htmlFor="weight">Current Weight (kg): </label>
                            <input
                                type="number"
                                id="weight"
                                value={tempProfile.weight || ''}
                                onChange={(e) => handleChange('weight', e.target.value)}
                                min="20"
                                max="300"
                                required
                            />
                        </p>

                        <p>
                            <label htmlFor="gender">Gender: </label>
                            <select
                                id="gender"
                                value={tempProfile.gender || ''}
                                onChange={(e) => handleChange('gender', e.target.value)}
                                required
                            >
                                <option value="">Select...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </p>
                    </fieldset>

                    {/* Section 2: Activity Level & Goals */}
                    <fieldset>
                        <legend>Lifestyle & Goals</legend>

                        <p>
                            <label htmlFor="activity_level">Activity Level: </label>
                            <select
                                id="activity_level"
                                value={tempProfile.activity_level || ''}
                                onChange={(e) => handleChange('activity_level', e.target.value)}
                                required
                            >
                                <option value="sedentary">Sedentary (Little or no exercise)</option>
                                <option value="lightly_active">Lightly Active (Light exercise 1-3 days/week)</option>
                                <option value="moderately_active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                                <option value="very_active">Very Active (Hard exercise 6-7 days/week)</option>
                            </select>
                        </p>

                        <div>
                            <label>Your Goals (Select at least one):</label>
                            <br />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={(tempProfile.goals || []).includes('lose weight')}
                                    onChange={(e) => {
                                        const currentGoals = tempProfile.goals || [];
                                        if (e.target.checked) {
                                            handleChange('goals', [...currentGoals, 'lose weight']);
                                        } else {
                                            handleChange('goals', currentGoals.filter(g => g !== 'lose weight'));
                                        }
                                    }}
                                />
                                Lose Weight
                            </label>
                            <br />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={(tempProfile.goals || []).includes('gain muscle')}
                                    onChange={(e) => {
                                        const currentGoals = tempProfile.goals || [];
                                        if (e.target.checked) {
                                            handleChange('goals', [...currentGoals, 'gain muscle']);
                                        } else {
                                            handleChange('goals', currentGoals.filter(g => g !== 'gain muscle'));
                                        }
                                    }}
                                />
                                Gain Muscle
                            </label>
                            <br />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={(tempProfile.goals || []).includes('eat healthier')}
                                    onChange={(e) => {
                                        const currentGoals = tempProfile.goals || [];
                                        if (e.target.checked) {
                                            handleChange('goals', [...currentGoals, 'eat healthier']);
                                        } else {
                                            handleChange('goals', currentGoals.filter(g => g !== 'eat healthier'));
                                        }
                                    }}
                                />
                                Eat Healthier
                            </label>
                            {(!tempProfile.goals || tempProfile.goals.length === 0) && (
                                <div style={{ color: 'red', fontSize: '13px', marginTop: '5px' }}>
                                    * At least one goal is required.
                                </div>
                            )}
                        </div>
                    </fieldset>

                    {/* Section 3: Dietary Preferences & Allergies */}
                    <fieldset>
                        <legend>Dietary Constraints & Preferences</legend>

                        <div>
                            <label>Allergies & Restrictions:</label>
                            <ul>
                                {(tempProfile.allergies || []).map((allergy, idx) => (
                                    <li key={idx}>
                                        {allergy}{' '}
                                        <button type="button" onClick={() => removeTag('allergies', allergy)}>
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <input
                                type="text"
                                placeholder="Add allergy (e.g. peanuts)"
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                            />
                            <button type="button" onClick={() => addTag('allergies', newAllergy, setNewAllergy)}>
                                Add Allergy
                            </button>
                        </div>

                        <br />

                        <div>
                            <label>Dietary Preferences:</label>
                            <ul>
                                {(tempProfile.preferences || []).map((pref, idx) => (
                                    <li key={idx}>
                                        {pref}{' '}
                                        <button type="button" onClick={() => removeTag('preferences', pref)}>
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <input
                                type="text"
                                placeholder="Add preference (e.g. vegetarian)"
                                value={newPref}
                                onChange={(e) => setNewPref(e.target.value)}
                            />
                            <button type="button" onClick={() => addTag('preferences', newPref, setNewPref)}>
                                Add Preference
                            </button>
                        </div>
                    </fieldset>

                    <br />

                    <div>
                        <button type="submit">Save and Complete Questionnaire</button>
                    </div>
                </form>
            </div>
        );
    }

    // 2. Render standard beautiful Profile view if user is already onboarded
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

                <form onSubmit={handleSave}>
                    <div className="profile-grid">
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
                            targetMacros={currentProfile.targetMacros}
                            onChange={handleChange}
                            isEditing={isEditing}
                            proteinPct={proteinPct}
                            carbsPct={carbsPct}
                            fatsPct={fatsPct}
                            isLoading={isLoading}
                        />
                    </div>

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
                            title="Dietary Preferences (e.g. vegetarian, gluten-free)"
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

                    {isEditing && (
                        <div className="profile-form-actions">
                            <button type="submit" className="btn btn-primary btn-large">
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