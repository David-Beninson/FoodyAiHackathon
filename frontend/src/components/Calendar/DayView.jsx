export default function DayView({ mealSections }) {
  return (
    <div className="apple-day-view">
      <div className="day-sections">
        {mealSections.map((section, idx) => (
          <div key={idx} className="day-meal-row">
            <div className="time-label">{section}</div>
            <div className="meal-cell flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
