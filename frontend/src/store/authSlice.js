import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser, getUserProfile } from '../api/apiClient';

export const loginUserThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('foodyai_token', data.access_token);
      localStorage.setItem('foodyai_user_id', data.user_id);

      // Fetch full profile
      const profile = await getUserProfile(data.user_id);
      return { token: data.access_token, user: profile };
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Login failed. Please try again.';
      return rejectWithValue(errMsg);
    }
  }
);

export const registerUserThunk = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }, { dispatch, rejectWithValue }) => {
    try {
      await registerUser(username, email, password);
      // Automatically log in after registration
      const result = await dispatch(loginUserThunk({ email, password })).unwrap();
      return result;
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Registration failed. Please try again.';
      return rejectWithValue(errMsg);
    }
  }
);

export const restoreSessionThunk = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('foodyai_token');
    const userId = localStorage.getItem('foodyai_user_id');
    if (!token || !userId) {
      return rejectWithValue('No session found');
    }
    try {
      const profile = await getUserProfile(userId);
      return { token, user: profile };
    } catch (err) {
      console.error(err);
      localStorage.removeItem('foodyai_token');
      localStorage.removeItem('foodyai_user_id');
      localStorage.removeItem('foodyai_profile');
      return rejectWithValue('Session expired');
    }
  }
);

export const refreshProfileThunk = createAsyncThunk(
  'auth/refreshProfile',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const userId = auth.user?.id || auth.user?._id;
    if (!userId) return rejectWithValue('User not logged in');
    try {
      const profile = await getUserProfile(userId);
      localStorage.setItem('foodyai_profile', JSON.stringify(profile));
      return profile;
    } catch (err) {
      console.error(err);
      return rejectWithValue('Failed to refresh profile');
    }
  }
);

const initialState = {
  token: localStorage.getItem('foodyai_token'),
  user: null,
  isLoading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('foodyai_token');
      localStorage.removeItem('foodyai_user_id');
      localStorage.removeItem('foodyai_profile');
      state.token = null;
      state.user = null;
      state.error = null;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Restore Session
      .addCase(restoreSessionThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSessionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(restoreSessionThunk.rejected, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
      })
      // Refresh Profile
      .addCase(refreshProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
