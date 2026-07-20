import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUserProfile = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

export const onboardUser = async (userId, profileData) => {
  const response = await apiClient.post(`/users/${userId}/onboard`, profileData);
  return response.data;
};

export const getWeeklyPlan = async (userId, dateStr) => {
  const response = await apiClient.get('/plans', {
    params: {
      user_id: userId,
      date: dateStr,
    },
  });
  return response.data;
};

export const updateMealStatus = async (planId, day, mealType, status, replacedWithMealName = null) => {
  const response = await apiClient.patch(`/plans/${planId}/meals/${day}/${mealType.toLowerCase()}/status`, {
    status,
    replaced_with_meal_name: replacedWithMealName,
  });
  return response.data;
};

export default apiClient;


