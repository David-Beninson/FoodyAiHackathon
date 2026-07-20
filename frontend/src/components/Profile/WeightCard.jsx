export default function WeightCard({ weight, goalWeight, onChange, isEditing }) {
    return (
        <div className="card">
            <h2 className="card-title">Weight & Goals</h2>
            
            <div className="form-group">
                <label htmlFor="weight">Current Weight (kg)</label>
                <input
                    id="weight"
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={weight}
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
                    value={goalWeight}
                    onChange={(e) => onChange('goalWeight', e.target.value)}
                    disabled={!isEditing}
                    required
                />
            </div>
        </div>
    );
}
