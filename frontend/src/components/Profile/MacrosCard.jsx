import MacroVisualizer from './MacroVisualizer';

export default function MacrosCard({
    targetMacros,
    proteinPct,
    carbsPct,
    fatsPct,
    isLoading
}) {
    return (
        <div className="card" style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.25s ease-in-out' }}>
            <h2 className="card-title">Daily Goals (Macros)</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text)', margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>
                These goals are calculated automatically based on your physical metrics and goals.
            </p>
            
            <div className="form-group">
                <label htmlFor="calories">Calories (kcal)</label>
                <input
                    id="calories"
                    type="number"
                    className="form-control"
                    value={targetMacros.calories}
                    readOnly={true}
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
                            readOnly={true}
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
                            readOnly={true}
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
                            readOnly={true}
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
