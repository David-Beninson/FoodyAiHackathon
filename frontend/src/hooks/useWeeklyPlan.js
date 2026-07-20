import { useState, useEffect } from 'react';
import { getWeeklyPlan, updateMealStatus as apiUpdateMealStatus } from '../api/apiClient';

const DEFAULT_USER_ID = import.meta.env.VITE_DEFAULT_USER_ID;

// Formatting helper to get YYYY-MM-DD in local time
const getLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get start of the week (Sunday) in local time as YYYY-MM-DD
const getWeekStartLocalDate = (date) => {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday, etc.
  d.setDate(d.getDate() - dayOfWeek);
  return getLocalDateString(d);
};

export function useWeeklyPlan(currentDateString) {
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const weekStartDate = getWeekStartLocalDate(new Date(currentDateString));

  // Fetch the weekly plan from database
  useEffect(() => {
    let isCurrent = true;

    const fetchPlan = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryDate = getLocalDateString(new Date(currentDateString));
        const planData = await getWeeklyPlan(DEFAULT_USER_ID, queryDate);

        if (isCurrent) {
          setWeeklyPlan(planData);
        }
      } catch (err) {
        if (isCurrent) {
          if (err.response && err.response.status === 404) {
            // Plan does not exist for this week - clear the plan so UI can show generation view
            setWeeklyPlan(null);
          } else if (!err.response) {
            setError('Connection error: Cannot connect to the server. Make sure the Backend is running.');
            setWeeklyPlan(null);
          } else {
            setError(err.response?.data?.detail || 'Error fetching weekly plan.');
            setWeeklyPlan(null);
          }
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    fetchPlan();

    return () => {
      isCurrent = false;
    };
  }, [weekStartDate]);

  // Update meal status with optimistic updates
  const handleUpdateMealStatus = async (dayName, mealType, status, replacedWithMealName = null) => {
    if (!weeklyPlan) return;

    // Save previous state for rollback if server request fails
    const previousPlan = { ...weeklyPlan };

    // Apply Optimistic Update
    setWeeklyPlan(prevPlan => {
      if (!prevPlan) return prevPlan;
      const updatedDays = { ...prevPlan.days };
      const updatedDayPlan = { ...updatedDays[dayName] };
      const updatedMeals = { ...updatedDayPlan.meals };
      const updatedMeal = { ...updatedMeals[mealType.toLowerCase()] };

      updatedMeal.status = status;
      updatedMeal.replaced_with_meal_name = replacedWithMealName;

      // Re-calculate actual eaten macros optimistically
      if (status === 'eaten') {
        updatedMeal.actual_macros = { ...updatedMeal.planned_macros };
      } else if (status === 'skipped') {
        updatedMeal.actual_macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      } else if (status === 'replaced' || status === 'planned') {
        updatedMeal.actual_macros = { ...updatedMeal.planned_macros };
        if (status === 'replaced' && replacedWithMealName) {
          updatedMeal.name = replacedWithMealName;
        }
      }

      updatedMeals[mealType.toLowerCase()] = updatedMeal;
      updatedDayPlan.meals = updatedMeals;
      updatedDays[dayName] = updatedDayPlan;

      return {
        ...prevPlan,
        days: updatedDays
      };
    });

    try {
      const updatedPlanFromServer = await apiUpdateMealStatus(
        weeklyPlan._id,
        dayName,
        mealType,
        status,
        replacedWithMealName
      );
      setWeeklyPlan(updatedPlanFromServer);
    } catch (err) {
      console.error('Failed to update meal status:', err);
      // Rollback to previous state
      setWeeklyPlan(previousPlan);
      setError(err.response?.data?.detail || 'Failed to update meal status.');
    }
  };

  return {
    weeklyPlan,
    isLoading,
    error,
    updateMealStatus: handleUpdateMealStatus,
    weekStartDate
  };
}

