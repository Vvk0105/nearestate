import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EventCard from '../../components/EventCard';
import { Loader } from 'lucide-react';

export default function VisitorHome() {
    const { apiClient } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await apiClient.get('/exhibitions/public/exhibitions/');
                setEvents(res.data);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [apiClient]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    const now = new Date();
    
    const upcoming = events.filter(e => new Date(e.start_date) > now);
    const ongoing = events.filter(e => new Date(e.start_date) <= now && new Date(e.end_date) >= now);

    return (
        <div className="space-y-12 pb-12">

            {/* Hero / Banner? Optional */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-12 text-white shadow-xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
                    Discover Premier Real Estate Exhibitions
                </h1>
                <p className="text-slate-300 text-lg max-w-2xl">
                    Join Upcoming and Ongoing events to connect with top developers, brokers, and loan providers. Register now to secure your spot.
                </p>
            </div>

            {ongoing.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                        Ongoing Events
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ongoing.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </section>
            )}

            {upcoming.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                        Upcoming Events
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcoming.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </section>
            )}

            {ongoing.length === 0 && upcoming.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No events found at the moment.
                </div>
            )}

        </div>
    );
}
