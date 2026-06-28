import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventsHomePage from '../components/EventsHomePage';

export default function PublicHome() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect logged-in users to their role-based home
        if (user) {
            if (user.role === 'VISITOR' || user.active_role === 'VISITOR') {
                navigate('/visitor/home', { replace: true });
            } else if (user.role === 'EXHIBITOR' || user.active_role === 'EXHIBITOR') {
                // Send directly to profile if not complete — avoids the /exhibitor/home → /exhibitor/profile bounce loop
                if (user.profile_completed) {
                    navigate('/exhibitor/home', { replace: true });
                } else {
                    navigate('/exhibitor/profile', { replace: true });
                }
            } else if (user.role === 'ADMIN' || user.active_role === 'ADMIN') {
                navigate('/admin/dashboard', { replace: true });
            } else if (!user.active_role && !user.role) {
                // Logged-in but no role selected yet → must pick a role
                navigate('/auth/select-role', { replace: true });
            }
            return;
        }
    }, [user, navigate]);

    // While redirecting, show nothing
    if (user) return null;

    return (
        <EventsHomePage
            role="public"
        />
    );
}
