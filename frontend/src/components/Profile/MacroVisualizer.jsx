export default function MacroVisualizer({ proteinPct, carbsPct, fatsPct }) {
    return (
        <div className="macro-visualizer-container">
            <span className="info-label macro-visualizer-title">Estimated Energy Distribution:</span>
            <div className="macro-visualizer" aria-hidden="true">
                <div className="vis-protein" style={{ '--width': `${proteinPct}%` }} title={`Protein: ${proteinPct.toFixed(0)}%`} />
                <div className="vis-carbs" style={{ '--width': `${carbsPct}%` }} title={`Carbs: ${carbsPct.toFixed(0)}%`} />
                <div className="vis-fats" style={{ '--width': `${fatsPct}%` }} title={`Fats: ${fatsPct.toFixed(0)}%`} />
            </div>
            <div className="vis-legend">
                <span className="legend-item"><span className="dot dot-protein" /> Protein: {proteinPct.toFixed(0)}%</span>
                <span className="legend-item"><span className="dot dot-carbs" /> Carbs: {carbsPct.toFixed(0)}%</span>
                <span className="legend-item"><span className="dot dot-fats" /> Fats: {fatsPct.toFixed(0)}%</span>
            </div>
        </div>
    );
}
