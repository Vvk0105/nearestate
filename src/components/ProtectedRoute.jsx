import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, requireProfile = false }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Not logged in, redirect to login
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // If route requires profile completion (for exhibitor routes)
    if (requireProfile && user.active_role === 'EXHIBITOR') {
        if (!user.profile_completed) {
            // Profile not completed, redirect to profile form
            return <Navigate to="/exhibitor/profile" replace />;
        }
    }

    // Check role-specific access
    if (allowedRoles && !allowedRoles.includes(user.active_role)) {
        // User doesn't have required role
        if (user.active_role === 'VISITOR') {
            return <Navigate to="/visitor/home" replace />;
        } else if (user.active_role === 'EXHIBITOR') {
            if (user.profile_completed) {
                return <Navigate to="/exhibitor/home" replace />;
            } else {
                return <Navigate to="/exhibitor/profile" replace />;
            }
        }
        return <Navigate to="/auth/select-role" replace />;
    }

    // All checks passed, render children
    return <Outlet />;
}
