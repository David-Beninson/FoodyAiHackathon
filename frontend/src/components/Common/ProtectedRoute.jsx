import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { token, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." fullPage />;
  }

  if (!token || !user) {
    // Redirect to login, saving the original location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }



  return children;
}
