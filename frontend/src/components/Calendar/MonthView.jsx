import { getMonthGridData } from '../../utils/calendarUtils';

export default function MonthView({
  currentDate,
  daysOfWeek,
  handleDayClick
}) {
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const { blanks, days } = getMonthGridData(year, monthIndex);

  const renderedBlanks = blanks.map((i) => (
    <div key={`blank-${i}`} className="month-cell empty"></div>
  ));

  const renderedDays = days.map(({ dayNum, dayDate }) => {
    const isSelectedDay = dayNum === currentDate.getDate();

    return (
      <div
        key={`month-day-${dayNum}`}
        className="month-cell clickable"
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
