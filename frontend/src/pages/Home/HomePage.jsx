import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setViewMode, setCurrentDate } from '../../store/calendarSlice';
import './HomePage.css';

export default function HomePage() {
  const dispatch = useDispatch();
  
  // Connect to Redux global state
  const viewMode = useSelector((state) => state.calendar.viewMode);
  const currentDateString = useSelector((state) => state.calendar.currentDate);
  
  // Parse string date to Date object for calculation logic
  const currentDate = new Date(currentDateString);
  const today = new Date();

  // Structural arrays for English calendar layout
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealSections = ['Breakfast', 'Lunch', 'Dinner'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Global toolbar navigation handlers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() - 1);
    else if (viewMode === 'week') newDate.setDate(currentDate.getDate() - 7);
    else if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() - 1);
    else if (viewMode === 'year') newDate.setFullYear(currentDate.getFullYear() - 1);
    
    dispatch(setCurrentDate(newDate.toISOString()));
  };
  
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() + 1);
    else if (viewMode === 'week') newDate.setDate(currentDate.getDate() + 7);
    else if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() + 1);
    else if (viewMode === 'year') newDate.setFullYear(currentDate.getFullYear() + 1);
    
    dispatch(setCurrentDate(newDate.toISOString()));
  };
  
  const handleToday = () => {
    dispatch(setCurrentDate(new Date().toISOString()));
  };

  const handleViewModeChange = (mode) => {
    dispatch(setViewMode(mode));
  };

  // Triggers when clicking any calendar cell to shift focus into a single day
  const handleDayClick = (targetDate) => {
    dispatch(setCurrentDate(targetDate.toISOString()));
    dispatch(setViewMode('day'));
  };

  // --- Layout Renderers ---

  // 1. Week View Component
  const renderWeekView = () => {
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
  };

  // 2. Month View Component
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth();
    
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();

    const blanks = Array.from({ length: firstDayOfWeek }).map((_, i) => (
      <div key={`blank-${i}`} className="month-cell empty"></div>
    ));

    const days = Array.from({ length: daysInMonth }).map((_, i) => {
      const dayNum = i + 1;
      const dayDate = new Date(year, monthIndex, dayNum);
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
          {blanks}
          {days}
        </div>
      </div>
    );
  };

  // 3. Year View Component
  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const miniDaysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <div className="apple-year-view">
        {months.map((monthName, monthIndex) => {
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
          const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();

          const blanks = Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`blank-${i}`} className="mini-day empty"></div>
          ));

          const days = Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayDate = new Date(year, monthIndex, dayNum);
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
                {blanks}
                {days}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 4. Day View Component (Focused day grid layout)
  const renderDayView = () => (
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

  return (
    <div className="apple-calendar-container">
      {/* Top Header Control Toolbar */}
      <header className="calendar-toolbar">
        <div className="toolbar-left">
          <button onClick={handleToday} className="today-btn">Today</button>
        </div>
        
        <div className="toolbar-center">
          <button onClick={handlePrev} className="arrow-btn">‹</button>
          
          <h2 className="current-date-title">
            {/* Dynamic string formatting with required comma injection for single day layout */}
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

      {/* Main Container Dynamic Target Area */}
      <main className="calendar-content">
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'year' && renderYearView()}
        {viewMode === 'day' && renderDayView()}
      </main>
    </div>
  );
}