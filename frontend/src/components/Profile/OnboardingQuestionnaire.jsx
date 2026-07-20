import '../../pages/Profile/Profile.css';

export default function OnboardingQuestionnaire({
    tempProfile,
    error,
    newAllergy,
    setNewAllergy,
    newPref,
    setNewPref,
    handleChange,
    addTag,
    removeTag,
    onSubmit
}) {
    return (
        <div className="profile-container" style={{ padding: '40px 20px' }}>
            <div className="profile-content-area" style={{ maxWidth: '640px' }}>
                <header className="profile-header" style={{ marginBottom: '32px', padding: '0 0 16px 0', background: 'transparent' }}>
                    <h1 className="profile-title" style={{ fontSize: '28px' }}>Welcome to FoodyAI</h1>
                </header>
                
                <p style={{ color: 'var(--text)', marginBottom: '32px', fontSize: '15px' }}>
                    Please fill out this quick questionnaire to personalize your nutrition targets. Your progress is saved automatically.
                </p>

                {error && (
                    <div className="auth-error-banner" style={{ marginBottom: '24px' }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Section 1: Basic Biometrics */}
                    <div className="card">
                        <h2 className="card-title">Biometric Information</h2>
                        
                        <div className="profile-grid">
                            <div className="form-group">
                                <label htmlFor="age">Age (years)</label>
                                <input
                                    type="number"
                                    id="age"
                                    className="form-control"
                                    value={tempProfile.age || ''}
                                    onChange={(e) => handleChange('age', e.target.value)}
                                    min="1"
                                    max="120"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="height">Height (cm)</label>
                                <input
                                    type="number"
                                    id="height"
                                    className="form-control"
                                    value={tempProfile.height || ''}
                                    onChange={(e) => handleChange('height', e.target.value)}
                                    min="50"
                                    max="250"
                                    required
                                />
                            </div>
                        </div>

                        <div className="profile-grid">
                            <div className="form-group">
                                <label htmlFor="weight">Current Weight (kg)</label>
                                <input
                                    type="number"
                                    id="weight"
                                    className="form-control"
                                    value={tempProfile.weight || ''}
                                    onChange={(e) => handleChange('weight', e.target.value)}
                                    min="20"
                                    max="300"
                                    step="0.1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="gender">Gender</label>
                                <select
                                    id="gender"
                                    className="form-control"
                                    value={tempProfile.gender || ''}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    required
                                >
                                    <option value="">Select gender...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Lifestyle & Goals */}
                    <div className="card">
                        <h2 className="card-title">Lifestyle & Goals</h2>

                        <div className="form-group">
                            <label htmlFor="activity_level">Activity Level</label>
                            <select
                                id="activity_level"
                                className="form-control"
                                value={tempProfile.activity_level || ''}
                                onChange={(e) => handleChange('activity_level', e.target.value)}
                                required
                            >
                                <option value="sedentary">Sedentary (Little or no exercise)</option>
                                <option value="lightly_active">Lightly Active (Light exercise 1-3 days/week)</option>
                                <option value="moderately_active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                                <option value="very_active">Very Active (Hard exercise 6-7 days/week)</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginTop: '8px' }}>
                            <label>Your Goals (Select at least one)</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                                {[
                                    { id: 'lose weight', label: 'Lose Weight' },
                                    { id: 'gain muscle', label: 'Gain Muscle' },
                                    { id: 'eat healthier', label: 'Eat Healthier' }
                                ].map((goal) => {
                                    const isChecked = (tempProfile.goals || []).includes(goal.id);
                                    return (
                                        <label key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-h)' }}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const currentGoals = tempProfile.goals || [];
                                                    if (e.target.checked) {
                                                        handleChange('goals', [...currentGoals, goal.id]);
                                                    } else {
                                                        handleChange('goals', currentGoals.filter(g => g !== goal.id));
                                                    }
                                                }}
                                                style={{ width: '16px', height: '16px', accentColor: 'var(--text-h)', cursor: 'pointer' }}
                                            />
                                            {goal.label}
                                        </label>
                                    );
                                })}
                            </div>
                            {(!tempProfile.goals || tempProfile.goals.length === 0) && (
                                <span style={{ color: '#ff3b30', fontSize: '12px', marginTop: '6px' }}>
                                    * At least one goal is required.
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Dietary Constraints & Preferences */}
                    <div className="card">
                        <h2 className="card-title">Dietary Constraints & Preferences</h2>

                        <div className="form-group">
                            <label>Allergies & Restrictions</label>
                            <div className="tag-input-wrapper">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Add allergy (e.g. peanuts)"
                                    value={newAllergy}
                                    onChange={(e) => setNewAllergy(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag('allergies', newAllergy, setNewAllergy);
                                        }
                                    }}
                                />
                                <button type="button" className="btn btn-secondary" onClick={() => addTag('allergies', newAllergy, setNewAllergy)}>
                                    Add
                                </button>
                            </div>
                            <div className="tags-container">
                                {(!tempProfile.allergies || tempProfile.allergies.length === 0) ? (
                                    <span style={{ color: 'var(--text)', fontSize: '13px' }}>No allergies recorded</span>
                                ) : (
                                    tempProfile.allergies.map(allergy => (
                                        <span key={allergy} className="tag">
                                            {allergy}
                                            <button type="button" className="tag-remove" onClick={() => removeTag('allergies', allergy)}>×</button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '12px' }}>
                            <label>Dietary Preferences</label>
                            <div className="tag-input-wrapper">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Add preference (e.g. vegetarian)"
                                    value={newPref}
                                    onChange={(e) => setNewPref(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag('preferences', newPref, setNewPref);
                                        }
                                    }}
                                />
                                <button type="button" className="btn btn-secondary" onClick={() => addTag('preferences', newPref, setNewPref)}>
                                    Add
                                </button>
                            </div>
                            <div className="tags-container">
                                {(!tempProfile.preferences || tempProfile.preferences.length === 0) ? (
                                    <span style={{ color: 'var(--text)', fontSize: '13px' }}>No preferences recorded</span>
                                ) : (
                                    tempProfile.preferences.map(pref => (
                                        <span key={pref} className="tag">
                                            {pref}
                                            <button type="button" className="tag-remove" onClick={() => removeTag('preferences', pref)}>×</button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '15px', width: '100%' }}>
                            Save and Complete Questionnaire
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}