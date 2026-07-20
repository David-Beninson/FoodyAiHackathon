export default function WeekView({
  currentDate,
  daysOfWeek,
  mealSections,
  handleDayClick,
  weeklyPlan
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
          {daysOfWeek.map((dayName, dayIdx) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + dayIdx);
            const dayPlan = weeklyPlan?.days?.[dayName];

            return (
              <div key={dayIdx} className="day-column">
                {mealSections.map((section, secIdx) => {
                  const mealKey = section.toLowerCase();
                  const meal = dayPlan?.meals?.[mealKey];

                  return (
                    <div
                      key={secIdx}
                      className={`meal-cell clickable ${meal ? meal.status : ''}`}
                      onClick={() => handleDayClick(dayDate)}
                    >
                      {meal && (
                        <div className="week-meal-info">
                          <span className="week-meal-name" title={meal.status === 'replaced' ? meal.replaced_with_meal_name : meal.name}>
                            {meal.status === 'replaced' && meal.replaced_with_meal_name
                              ? meal.replaced_with_meal_name
                              : meal.name}
                          </span>
                          <span className="week-meal-calories">
                            {meal.planned_macros?.calories} kcal
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

