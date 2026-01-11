import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return null; // Or loading spinner

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (!allowedRoles) {
        return <Outlet />;
    }

    if (!allowedRoles.includes(user.active_role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ All good
  return <Outlet />;
}

