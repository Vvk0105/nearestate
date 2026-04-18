import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { publicApiClient } from '../context/AuthContext';
import EventsHomePage from '../components/EventsHomePage';

export default function PublicHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Redirect logged-in users to their role-based home
        if (user) {
            if (user.role === 'VISITOR') navigate('/visitor/home', { replace: true });
            else if (user.role === 'EXHIBITOR') navigate('/exhibitor/home', { replace: true });
            return;
        }

        // Use publicApiClient — no auth token needed for public listing
        const fetchEvents = async () => {
            try {
                const res = await publicApiClient.get('/exhibitions/public/exhibitions/');
                const eventsData = res.data.data || res.data;
                setEvents(eventsData.filter(e => e.is_active));
            } catch (error) {
                console.error('Fetch events failed', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // While redirecting, show nothing
    if (user) return null;

    return (
        <EventsHomePage
            events={events}
            loading={loading}
            role="public"
        />
    );
}
