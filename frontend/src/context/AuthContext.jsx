import { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUserThunk,
  registerUserThunk,
  restoreSessionThunk,
  refreshProfileThunk,
  logout as logoutAction
} from '../store/authSlice';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { token, user, isLoading, error } = useSelector((state) => state.auth);

  // Restore session on mount
  useEffect(() => {
    dispatch(restoreSessionThunk());
  }, [dispatch]);

  const login = async (email, password) => {
    // Unwraps the thunk's promise result to catch rejected action errors in components
    return await dispatch(loginUserThunk({ email, password })).unwrap();
  };

  const register = async (username, email, password) => {
    return await dispatch(registerUserThunk({ username, email, password })).unwrap();
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const refreshProfile = async () => {
    return await dispatch(refreshProfileThunk()).unwrap();
  };

  // Onboarded check: True if age, height, weight, gender are filled
  const isOnboarded = !!(user && user.age && user.weight && user.height && user.gender);

  return (
    <AuthContext.Provider value={{ token, user, isLoading, error, login, register, logout, refreshProfile, isOnboarded }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

