import { configureStore } from '@reduxjs/toolkit';
import calendarReducer from './calendarSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
    auth: authReducer,
  },
});