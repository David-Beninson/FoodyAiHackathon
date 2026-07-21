import MacroVisualizer from './MacroVisualizer';

export default function MacrosCard({
    targetMacros,
    proteinPct,
    carbsPct,
    fatsPct,
    isLoading,
    isFamilyMode
}) {
    return (
        <div className={`card ${isLoading ? 'loading-card' : ''}`}>
            <h2 className="card-title">
                {isFamilyMode ? 'Combined Family Goals (Macros)' : 'Daily Goals (Macros)'}
            </h2>
            <p className="card-subtitle">
                {isFamilyMode 
                    ? 'These goals represent the combined nutritional needs for your entire family.' 
                    : 'These goals are calculated automatically based on your physical metrics and goals.'}
            </p>
            
            <div className="form-group">
                <label htmlFor="calories">Calories (kcal)</label>
                <input
                    id="calories"
                    type="number"
                    className="form-control"
                    value={targetMacros?.calories || 0}
                    readOnly={true}
                    required
                />
            </div>

            <div className="macros-list">
                <div className="info-row macros-row">
                    <div className="form-group macro-field">
                        <label htmlFor="protein">Protein (g)</label>
                        <input
                            id="protein"
                            type="number"
                            className="form-control"
                            value={targetMacros?.protein || 0}
                            readOnly={true}
                            required
                        />
                    </div>
                    <div className="form-group macro-field">
                        <label htmlFor="carbs">Carbs (g)</label>
                        <input
                            id="carbs"
                            type="number"
                            className="form-control"
                            value={targetMacros?.carbs || 0}
                            readOnly={true}
                            required
                        />
                    </div>
                    <div className="form-group macro-field last-macro-field">
                        <label htmlFor="fats">Fats (g)</label>
                        <input
                            id="fats"
                            type="number"
                            className="form-control"
                            value={targetMacros?.fats || 0}
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
