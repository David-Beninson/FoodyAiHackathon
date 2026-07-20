export default function CalendarToolbar({
  viewMode,
  currentDate,
  daysOfWeek,
  months,
  handleToday,
  handlePrev,
  handleNext,
  handleViewModeChange
}) {
  return (
    <header className="calendar-toolbar">
      <div className="toolbar-left">
        <button onClick={handleToday} className="today-btn">Today</button>
      </div>

      <div className="toolbar-center">
        <button onClick={handlePrev} className="arrow-btn">‹</button>

        <h2 className="current-date-title">
          {viewMode === 'day' && `${daysOfWeek[currentDate.getDay()]}, ${currentDate.getDate()} ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          {(viewMode === 'week' || viewMode === 'month') && `${currentDate.getDate()} ${months[currentDate.getMonth()]}`}
          {viewMode === 'year' && currentDate.getFullYear()}
        </h2>

        <button onClick={handleNext} className="arrow-btn">›</button>
      </div>

      <div className="toolbar-right">
        <div className="segment-control">
          <button className={viewMode === 'day' ? 'active' : ''} onClick={() => handleViewModeChange('day')}>Day</button>
          <button className={viewMode === 'week' ? 'active' : ''} onClick={() => handleViewModeChange('week')}>Week</button>
          <button className={viewMode === 'month' ? 'active' : ''} onClick={() => handleViewModeChange('month')}>Month</button>
          <button className={viewMode === 'year' ? 'active' : ''} onClick={() => handleViewModeChange('year')}>Year</button>
        </div>
      </div>
    </header>
  );
}
