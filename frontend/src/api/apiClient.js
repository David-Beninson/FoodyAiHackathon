import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject the JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodyai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const loginUser = async (email, password) => {
  const response = await apiClient.post('/users/login', { email, password });
  return response.data;
};

export const registerUser = async (username, email, password) => {
  const response = await apiClient.post('/users/register', { username, email, password });
  return response.data;
};

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

export const getPlannerChatSession = async (userId) => {
  const response = await apiClient.get(`/ai/planner/chat/${userId}`);
  return response.data;
};

export const sendPlannerChatMessage = async (userId, message) => {
  const response = await apiClient.post('/ai/planner/chat', { user_id: userId, message });
  return response.data;
};

export const resetPlannerChatSession = async (userId) => {
  const response = await apiClient.delete(`/ai/planner/chat/${userId}`);
  return response.data;
};

export const generateAutoPlanDraft = async (userId, weekStartDate) => {
  const response = await apiClient.post('/ai/planner/generate-auto', { user_id: userId, week_start_date: weekStartDate });
  return response.data;
};

export const saveDraftWeeklyPlan = async (userId, weekStartDate, days) => {
  const response = await apiClient.post('/plans/save-draft', { user_id: userId, week_start_date: weekStartDate, days });
  return response.data;
};

export default apiClient;
