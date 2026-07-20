export default function MacroVisualizer({ proteinPct, carbsPct, fatsPct }) {
    return (
        <div style={{ marginTop: '1.5rem' }}>
            <span className="info-label" style={{ fontSize: '0.9rem' }}>Estimated Energy Distribution:</span>
            <div className="macro-visualizer" aria-hidden="true">
                <div className="vis-protein" style={{ width: `${proteinPct}%` }} title={`Protein: ${proteinPct.toFixed(0)}%`} />
                <div className="vis-carbs" style={{ width: `${carbsPct}%` }} title={`Carbs: ${carbsPct.toFixed(0)}%`} />
                <div className="vis-fats" style={{ width: `${fatsPct}%` }} title={`Fats: ${fatsPct.toFixed(0)}%`} />
            </div>
            <div className="vis-legend">
                <span className="legend-item"><span className="dot" style={{ backgroundColor: '#4bc0c0' }} /> Protein: {proteinPct.toFixed(0)}%</span>
                <span className="legend-item"><span className="dot" style={{ backgroundColor: '#36a2eb' }} /> Carbs: {carbsPct.toFixed(0)}%</span>
                <span className="legend-item"><span className="dot" style={{ backgroundColor: '#ff6384' }} /> Fats: {fatsPct.toFixed(0)}%</span>
            </div>
        </div>
    );
}
