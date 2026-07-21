import LoadingSpinner from '../Common/LoadingSpinner';

export default function AutoPlannerTab({
  weekStartDate,
  setWeekStartDate,
  currentProfile,
  loading,
  onGenerate,
  hasExistingPlan
}) {
  return (
    <div className="auto-planner-card">
      <h2>Profile-Based Auto Planner</h2>

      {hasExistingPlan && (
        <div className="planner-warning-banner">
          ⚠ This week already has a plan in your calendar. Cannot generate a new menu.
        </div>
      )}

      <p>
        Generate a comprehensive 7-day meal plan tailored to your goals, preferences,
        and allergies stored in your profile.
      </p>

      <div className="form-group">
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-h)' }}>
          Target Week Start (Sunday)
        </label>
        <input
          type="date"
          className="form-control"
          value={weekStartDate}
          onChange={(e) => setWeekStartDate(e.target.value)}
        />
      </div>

      <div className="info-box">
        <strong>Profile settings used</strong>
        <ul className="info-list">
          <li>Goals: {currentProfile?.goals?.join(', ') || 'None'}</li>
          <li>Allergies: {currentProfile?.allergies?.join(', ') || 'None'}</li>
          <li>Preferences: {currentProfile?.preferences?.join(', ') || 'None'}</li>
          <li>Daily Calories: {currentProfile?.targetMacros?.calories ?? '—'} kcal</li>
        </ul>
      </div>

      <button
        className="btn btn-primary"
        onClick={onGenerate}
        disabled={loading || hasExistingPlan}
        style={{ width: '100%', padding: '12px', fontSize: '14px' }}
      >
        {loading ? <LoadingSpinner message="Generating..." /> : 'Generate Weekly Menu Draft'}
      </button>
    </div>
  );
}
