import { useSelector, useDispatch } from 'react-redux';
import { setViewMode, setCurrentDate } from '../../store/calendarSlice';
import CalendarToolbar from '../../components/Calendar/CalendarToolbar';
import WeekView from '../../components/Calendar/WeekView';
import MonthView from '../../components/Calendar/MonthView';
import YearView from '../../components/Calendar/YearView';
import DayView from '../../components/Calendar/DayView';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useWeeklyPlan } from '../../hooks/useWeeklyPlan';
import './Calendar.css';

export default function Calendar() {
  const dispatch = useDispatch();

  // Connect to Redux global state
  const viewMode = useSelector((state) => state.calendar.viewMode);
  const currentDateString = useSelector((state) => state.calendar.currentDate);

  // Hook to fetch and manage weekly plan from DB
  const {
    weeklyPlan,
    isLoading,
    error,
    updateMealStatus,
  } = useWeeklyPlan(currentDateString);

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

      {error && error.includes('Connection error') && (
        <div className="calendar-error-banner">
          Connection error: Cannot connect to the server. Meals will not load.
        </div>
      )}

      <main className="calendar-content">
        {isLoading ? (
          <div className="calendar-loading-container">
            <LoadingSpinner message="Loading meals..." />
          </div>
        ) : (
          <>
            {viewMode === 'week' && (
              <WeekView
                currentDate={currentDate}
                daysOfWeek={daysOfWeek}
                mealSections={mealSections}
                handleDayClick={handleDayClick}
                weeklyPlan={weeklyPlan}
              />
            )}
            {viewMode === 'month' && (
              <MonthView
                currentDate={currentDate}
                daysOfWeek={daysOfWeek}
                handleDayClick={handleDayClick}
                weeklyPlan={weeklyPlan}
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
                dayName={daysOfWeek[currentDate.getDay()]}
                dayPlan={weeklyPlan?.days?.[daysOfWeek[currentDate.getDay()]]}
                onUpdateStatus={(mealType, status, replacedWithMealName) =>
                  updateMealStatus(daysOfWeek[currentDate.getDay()], mealType, status, replacedWithMealName)
                }
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}