import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setViewMode, setCurrentDate } from '../../store/calendarSlice';
import './HomePage.css';

export default function HomePage() {
  const dispatch = useDispatch();
  
  // Fetch state from Redux store
  const viewMode = useSelector((state) => state.calendar.viewMode);
  const currentDateString = useSelector((state) => state.calendar.currentDate);
  
  // Convert ISO string back to a Date object for local calculations
  const currentDate = new Date(currentDateString);
  const today = new Date();

  // Arrays for views (English UI)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mealSections = ['Breakfast', 'Lunch', 'Dinner'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Basic navigation functions
  const handlePrev = () => {
    // Example: dispatch(setCurrentDate(newDate.toISOString()))
  };
  
  const handleNext = () => {
    // Example: dispatch(setCurrentDate(newDate.toISOString()))
  };
  
  const handleToday = () => {
    dispatch(setCurrentDate(new Date().toISOString()));
  };

  const handleViewModeChange = (mode) => {
    dispatch(setViewMode(mode));
  };

  // --- Internal View Components ---

  // 1. Week View (7 days, 3 meals per day)
  const renderWeekView = () => (
    <div className="apple-week-view">
      <div className="week-header">
        <div className="time-axis-spacer"></div>
        {daysOfWeek.map((day, idx) => (
          <div key={idx} className="day-header-cell">
            <span className="day-name">{day}</span>
            <span className={`day-number ${idx === currentDate.getDay() ? 'active-day' : ''}`}>
              {/* Mock dates for the current week */}
              {currentDate.getDate() - currentDate.getDay() + idx}
            </span>
          </div>
        ))}
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
                <div key={secIdx} className="meal-cell">
                  {/* Meal card component will be injected here */}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 2. Month View (Skeleton grid for 35 days)
  const renderMonthView = () => (
    <div className="apple-month-view">
      <div className="month-header">
        {daysOfWeek.map((day) => (
          <div key={day} className="month-day-name">{day}</div>
        ))}
      </div>
      <div className="month-grid">
        {/* Creating 35 cells to simulate a 5-week calendar month */}
        {Array.from({ length: 35 }).map((_, idx) => (
          <div key={idx} className="month-cell">
            <span className="month-date-number">{(idx % 31) + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // 3. Year View (Apple-style 12 months with calculated days)
  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const miniDaysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <div className="apple-year-view">
        {months.map((monthName, monthIndex) => {
          // Calculate the number of days in the month and the starting day of the week
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
          const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();

          // Create empty blanks to align the first day correctly
          const blanks = Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`blank-${i}`} className="mini-day empty"></div>
          ));

          // Create the actual day numbers
          const days = Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday =
              today.getFullYear() === year &&
              today.getMonth() === monthIndex &&
              today.getDate() === dayNum;

            return (
              <div key={`day-${dayNum}`} className="mini-day">
                <span className={isToday ? 'mini-active-day' : ''}>{dayNum}</span>
              </div>
            );
          });

          return (
            <div key={monthIndex} className="year-month-card">
              <h3 className="year-month-title">{monthName}</h3>
              
              {/* Weekday letters header */}
              <div className="mini-month-days-header">
                {miniDaysOfWeek.map((d, i) => (
                  <span key={i} className="mini-day-name">{d}</span>
                ))}
              </div>
              
              {/* Mini grid combining blanks and days */}
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

  // 4. Day View (Single day with 3 meals)
  const renderDayView = () => (
    <div className="apple-day-view">
       <div className="day-header-single">
          <span className="day-name">{daysOfWeek[currentDate.getDay()]}</span>
          <span className="active-day day-number">{currentDate.getDate()}</span>
       </div>
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
      {/* Internal Calendar Toolbar */}
      <header className="calendar-toolbar">
        <div className="toolbar-left">
          <div className="nav-arrows">
            <button onClick={handlePrev} className="icon-btn">‹</button>
            <button onClick={handleToday} className="today-btn">Today</button>
            <button onClick={handleNext} className="icon-btn">›</button>
          </div>
        </div>
        
        <div className="toolbar-center">
          <h2 className="current-date-title">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        <div className="toolbar-right">
          <div className="segment-control">
            <button 
              className={viewMode === 'day' ? 'active' : ''} 
              onClick={() => handleViewModeChange('day')}
            >
              Day
            </button>
            <button 
              className={viewMode === 'week' ? 'active' : ''} 
              onClick={() => handleViewModeChange('week')}
            >
              Week
            </button>
            <button 
              className={viewMode === 'month' ? 'active' : ''} 
              onClick={() => handleViewModeChange('month')}
            >
              Month
            </button>
            <button 
              className={viewMode === 'year' ? 'active' : ''} 
              onClick={() => handleViewModeChange('year')}
            >
              Year
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Content Area */}
      <main className="calendar-content">
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'year' && renderYearView()}
        {viewMode === 'day' && renderDayView()}
      </main>
    </div>
  );
}