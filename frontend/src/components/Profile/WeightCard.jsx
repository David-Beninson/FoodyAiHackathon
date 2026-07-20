export default function WeightCard({
    weight,
    goalWeight,
    height,
    age,
    gender,
    activityLevel,
    onChange,
    isEditing
}) {
    const activityLevels = {
        sedentary: 'Sedentary',
        lightly_active: 'Lightly Active',
        moderately_active: 'Moderately Active',
        very_active: 'Very Active',
        extra_active: 'Extra Active'
    };

    const genders = {
        male: 'Male',
        female: 'Female',
        other: 'Other'
    };

    return (
        <div className="card">
            <h2 className="card-title">Personal Metrics & Bio</h2>
            
            <div className="metrics-grid">
                <div className="form-group">
                    <label htmlFor="weight">Current Weight (kg)</label>
                    <input
                        id="weight"
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={weight || ''}
                        onChange={(e) => onChange('weight', e.target.value)}
                        disabled={!isEditing}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="goalWeight">Goal Weight (kg)</label>
                    <input
                        id="goalWeight"
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={goalWeight || ''}
                        onChange={(e) => onChange('goalWeight', e.target.value)}
                        disabled={!isEditing}
                        required
                    />
                </div>
            </div>

            <div className="metrics-grid">
                <div className="form-group">
                    <label htmlFor="height">Height (cm)</label>
                    <input
                        id="height"
                        type="number"
                        step="1"
                        className="form-control"
                        value={height || ''}
                        onChange={(e) => onChange('height', e.target.value)}
                        disabled={!isEditing}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="age">Age</label>
                    <input
                        id="age"
                        type="number"
                        step="1"
                        className="form-control"
                        value={age || ''}
                        onChange={(e) => onChange('age', e.target.value)}
                        disabled={!isEditing}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                    id="gender"
                    className="form-control"
                    value={gender || 'male'}
                    onChange={(e) => onChange('gender', e.target.value)}
                    disabled={!isEditing}
                    required
                >
                    {Object.entries(genders).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="activityLevel">Activity Level</label>
                <select
                    id="activityLevel"
                    className="form-control"
                    value={activityLevel || 'moderately_active'}
                    onChange={(e) => onChange('activity_level', e.target.value)}
                    disabled={!isEditing}
                    required
                >
                    {Object.entries(activityLevels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
