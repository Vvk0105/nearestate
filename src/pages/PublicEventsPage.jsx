import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { publicApiClient } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';

export default function PublicEventsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await publicApiClient.get('/exhibitions/public/exhibitions/');
                setEvents(res.data.data || res.data);
            } catch (error) {
                console.error('Failed to fetch events', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = events.filter(e => {
        const startDate = new Date(e.start_date);
        startDate.setHours(0, 0, 0, 0);
        return startDate > today;
    });

    const ongoing = events.filter(e => {
        const startDate = new Date(e.start_date);
        const endDate = new Date(e.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        return startDate <= today && endDate >= today;
    });

    // Determine the correct detail route prefix based on user role
    const detailBasePath = user?.role === 'EXHIBITOR' ? '/exhibitor' : '/events';

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-12 text-white shadow-xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
                    Discover Premier Real Estate Exhibitions
                </h1>
                <p className="text-slate-300 text-lg max-w-2xl">
                    Browse upcoming and ongoing events. Connect with top developers, brokers, and
                    loan providers.{' '}
                    {!user && (
                        <Link to="/auth/login" className="underline text-blue-300 hover:text-blue-200">
                            Sign in to register.
                        </Link>
                    )}
                </p>
            </div>

            {/* Ongoing Events */}
            {ongoing.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-green-500 rounded-full" />
                        Ongoing Events
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ongoing.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                linkOverride={`/events/${event.id}`}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Upcoming Events */}
            {upcoming.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full" />
                        Upcoming Events
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcoming.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                linkOverride={`/events/${event.id}`}
                            />
                        ))}
                    </div>
                </section>
            )}

            {ongoing.length === 0 && upcoming.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No events found at the moment. Check back soon!
                </div>
            )}
        </div>
    );
}
