import { getMonthGridData } from '../../utils/calendarUtils';

const getDayPlanForDate = (targetDate, plans) => {
  if (!plans || plans.length === 0) return null;
  const target = new Date(targetDate);
  const offset = target.getDay();
  const sundayDate = new Date(target);
  sundayDate.setDate(target.getDate() - offset);
  
  const yyyy = sundayDate.getFullYear();
  const mm = String(sundayDate.getMonth() + 1).padStart(2, '0');
  const dd = String(sundayDate.getDate()).padStart(2, '0');
  const sundayStr = `${yyyy}-${mm}-${dd}`;
  
  const matchingPlan = plans.find(p => p.week_start_date === sundayStr);
  if (!matchingPlan) return null;
  
  const daysOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeekNames[target.getDay()];
  
  return matchingPlan.days?.[dayName] || null;
};

const getStatusClass = (dayDate, plans) => {
  const dayPlan = getDayPlanForDate(dayDate, plans);
  if (!dayPlan || !dayPlan.meals) return '';
  
  const meals = Object.values(dayPlan.meals);
  if (meals.length === 0) return '';
  
  let eatenCount = 0;
  let skippedCount = 0;
  let totalMeals = 0;
  
  meals.forEach(m => {
    if (m && m.status) {
      totalMeals++;
      if (m.status === 'eaten') eatenCount++;
      else if (m.status === 'skipped') skippedCount++;
    }
  });
  
  if (totalMeals === 0) return '';
  
  if (eatenCount > 0) {
    const ratio = eatenCount / totalMeals;
    if (ratio >= 0.99) return 'bg-green-3';
    if (ratio >= 0.5) return 'bg-green-2';
    return 'bg-green-1';
  } else if (skippedCount > 0) {
    const ratio = skippedCount / totalMeals;
    if (ratio >= 0.99) return 'bg-red-3';
    if (ratio >= 0.5) return 'bg-red-2';
    return 'bg-red-1';
  }
  
  return '';
};

export default function MonthView({
  currentDate,
  daysOfWeek,
  handleDayClick,
  allPlans = []
}) {
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const { blanks, days } = getMonthGridData(year, monthIndex);

  const renderedBlanks = blanks.map((i) => (
    <div key={`blank-${i}`} className="month-cell empty"></div>
  ));

  const renderedDays = days.map(({ dayNum, dayDate }) => {
    const isSelectedDay = dayNum === currentDate.getDate();
    const statusClass = getStatusClass(dayDate, allPlans);

    return (
      <div
        key={`month-day-${dayNum}`}
        className={`month-cell clickable ${statusClass}`}
        onClick={() => handleDayClick(dayDate)}
      >
        <span className={`month-date-number ${isSelectedDay ? 'active-day-inline' : ''}`}>
          {dayNum}
        </span>
      </div>
    );
  });

  return (
    <div className="apple-month-view">
      <div className="month-header">
        {daysOfWeek.map((day) => (
          <div key={day} className="month-day-name">{day.substring(0, 3)}</div>
        ))}
      </div>
      <div className="month-grid">
        {renderedBlanks}
        {renderedDays}
      </div>
    </div>
  );
}
