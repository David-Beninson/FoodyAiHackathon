import React from 'react';

export default function WeekView({
  currentDate,
  daysOfWeek,
  mealSections,
  handleDayClick
}) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  return (
    <div className="apple-week-view">
      <div className="week-header">
        <div className="time-axis-spacer"></div>
        {daysOfWeek.map((day, idx) => {
          const dayDate = new Date(startOfWeek);
          dayDate.setDate(startOfWeek.getDate() + idx);
          const isSelectedDay = dayDate.getDate() === currentDate.getDate() && dayDate.getMonth() === currentDate.getMonth();

          return (
            <div
              key={idx}
              className="day-header-cell clickable"
              onClick={() => handleDayClick(dayDate)}
            >
              <span className="day-name">{day.substring(0, 3)}</span>
              <span className={`day-number ${isSelectedDay ? 'active-day' : ''}`}>
                {dayDate.getDate()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="week-grid">
        <div className="time-axis">
          {mealSections.map((section, idx) => (
            <div key={idx} className="time-label">{section}</div>
          ))}
        </div>
        <div className="days-columns">
          {daysOfWeek.map((_, dayIdx) => (
            <div key={dayIdx} className="day-column">
              {mealSections.map((_, secIdx) => (
                <div key={secIdx} className="meal-cell"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
