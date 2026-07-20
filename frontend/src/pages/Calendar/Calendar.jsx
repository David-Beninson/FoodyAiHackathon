import { useSelector, useDispatch } from 'react-redux';
import { setViewMode, setCurrentDate } from '../../store/calendarSlice';
import CalendarToolbar from '../../components/Calendar/CalendarToolbar';
import WeekView from '../../components/Calendar/WeekView';
import MonthView from '../../components/Calendar/MonthView';
import YearView from '../../components/Calendar/YearView';
import DayView from '../../components/Calendar/DayView';
import './Calendar.css';

export default function Calendar() {
  const dispatch = useDispatch();

  // Connect to Redux global state
  const viewMode = useSelector((state) => state.calendar.viewMode);
  const currentDateString = useSelector((state) => state.calendar.currentDate);

  // Parse string date to Date object for calculation logic
  const currentDate = new Date(currentDateString);
  const today = new Date();

  const currentMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isFutureDay = currentMidnight > todayMidnight;

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

  const handleDayClick = (targetDate) => {
    dispatch(setCurrentDate(targetDate.toISOString()));
    dispatch(setViewMode('day'));
  };

  return (
    <div className="apple-calendar-container">
      <CalendarToolbar
        viewMode={viewMode}
        currentDate={currentDate}
        daysOfWeek={daysOfWeek}
        months={months}
        handleToday={handleToday}
        handlePrev={handlePrev}
        handleNext={handleNext}
        handleViewModeChange={handleViewModeChange}
      />

      <main className="calendar-content">
        {viewMode === 'week' && (
          <WeekView
            currentDate={currentDate}
            daysOfWeek={daysOfWeek}
            mealSections={mealSections}
            handleDayClick={handleDayClick}
          />
        )}
        {viewMode === 'month' && (
          <MonthView
            currentDate={currentDate}
            daysOfWeek={daysOfWeek}
            handleDayClick={handleDayClick}
          />
        )}
        {viewMode === 'year' && (
          <YearView
            currentDate={currentDate}
            months={months}
            today={today}
            handleDayClick={handleDayClick}
          />
        )}
        {viewMode === 'day' && (
          <DayView
            mealSections={mealSections}
            isFutureDay={isFutureDay}
          />
        )}
      </main>
    </div>
  );
}