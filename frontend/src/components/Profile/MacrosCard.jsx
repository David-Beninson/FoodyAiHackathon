import MacroVisualizer from './MacroVisualizer';

export default function MacrosCard({
    targetMacros,
    onChange,
    isEditing,
    proteinPct,
    carbsPct,
    fatsPct
}) {
    return (
        <div className="card">
            <h2 className="card-title">Daily Goals (Macros)</h2>
            
            <div className="form-group">
                <label htmlFor="calories">Calories (kcal)</label>
                <input
                    id="calories"
                    type="number"
                    className="form-control"
                    value={targetMacros.calories}
                    onChange={(e) => onChange('calories', e.target.value, true)}
                    disabled={!isEditing}
                    required
                />
            </div>

            <div className="macros-list">
                <div className="info-row" style={{ marginTop: '0.5rem' }}>
                    <div className="form-group" style={{ flex: 1, marginInlineEnd: '0.5rem', marginBottom: 0 }}>
                        <label htmlFor="protein">Protein (g)</label>
                        <input
                            id="protein"
                            type="number"
                            className="form-control"
                            value={targetMacros.protein}
                            onChange={(e) => onChange('protein', e.target.value, true)}
                            disabled={!isEditing}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginInlineEnd: '0.5rem', marginBottom: 0 }}>
                        <label htmlFor="carbs">Carbs (g)</label>
                        <input
                            id="carbs"
                            type="number"
                            className="form-control"
                            value={targetMacros.carbs}
                            onChange={(e) => onChange('carbs', e.target.value, true)}
                            disabled={!isEditing}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label htmlFor="fats">Fats (g)</label>
                        <input
                            id="fats"
                            type="number"
                            className="form-control"
                            value={targetMacros.fats}
                            onChange={(e) => onChange('fats', e.target.value, true)}
                            disabled={!isEditing}
                            required
                        />
                    </div>
                </div>
            </div>

            <MacroVisualizer 
                proteinPct={proteinPct} 
                carbsPct={carbsPct} 
                fatsPct={fatsPct} 
            />
        </div>
    );
}
