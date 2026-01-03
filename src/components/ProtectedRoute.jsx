import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) return null; // Or loading spinner

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Unauthorized role - maybe redirect to their home?
        if (user.role === 'VISITOR') return <Navigate to="/visitor/home" replace />;
        if (user.role === 'EXHIBITOR') return <Navigate to="/exhibitor/home" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
