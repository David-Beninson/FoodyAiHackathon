import { getMonthGridData } from '../../utils/calendarUtils';

export default function YearView({
  currentDate,
  months,
  today,
  handleDayClick
}) {
  const year = currentDate.getFullYear();
  const miniDaysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="apple-year-view">
      {months.map((monthName, monthIndex) => {
        const { blanks, days } = getMonthGridData(year, monthIndex);

        const renderedBlanks = blanks.map((i) => (
          <div key={`blank-${i}`} className="mini-day empty"></div>
        ));

        const renderedDays = days.map(({ dayNum, dayDate }) => {
          const isCurrentToday =
            today.getFullYear() === year &&
            today.getMonth() === monthIndex &&
            today.getDate() === dayNum;

          return (
            <div
              key={`year-day-${dayNum}`}
              className="mini-day clickable"
              onClick={() => handleDayClick(dayDate)}
            >
              <span className={isCurrentToday ? 'mini-active-day' : ''}>{dayNum}</span>
            </div>
          );
        });

        return (
          <div key={monthIndex} className="year-month-card">
            <h3 className="year-month-title">{monthName}</h3>
            <div className="mini-month-days-header">
              {miniDaysOfWeek.map((d, i) => (
                <span key={i} className="mini-day-name">{d}</span>
              ))}
            </div>
            <div className="mini-month-grid">
              {renderedBlanks}
              {renderedDays}
            </div>
          </div>
        );
      })}
    </div>
  );
}
