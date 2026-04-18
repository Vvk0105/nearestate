import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EventsHomePage from '../../components/EventsHomePage';

export default function VisitorHome() {
    const { apiClient } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await apiClient.get('/exhibitions/public/exhibitions/');
                setEvents(res.data.data || res.data);
            } catch (error) {
                console.error('Failed to fetch events', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <EventsHomePage
            events={events}
            loading={loading}
            role="visitor"
        />
    );
}
