import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  viewMode: 'week', // 'day', 'week', 'month', 'year'
  currentDate: new Date().toISOString(), 
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setCurrentDate: (state, action) => {
      state.currentDate = action.payload;
    },
  },
});

export const { setViewMode, setCurrentDate } = calendarSlice.actions;
export default calendarSlice.reducer;