import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { Loader, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function PublicHome() {
    const { apiClient, user } = useAuth();
    const [ongoing, setOngoing] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect logged-in users
        if (user) {
            if (user.role === 'VISITOR') navigate('/visitor/home');
            if (user.role === 'EXHIBITOR') navigate('/exhibitor/home');
            return;
        }

        const fetchEvents = async () => {
            try {
                const res = await apiClient.get('/exhibitions/public/exhibitions/');
                const events = res.data.filter(e => e.is_active);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const ongoingEvents = events.filter(e => {
                    const start = new Date(e.start_date);
                    const end = new Date(e.end_date);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);
                    return start <= today && end >= today;
                });

                const upcomingEvents = events.filter(e => {
                    const start = new Date(e.start_date);
                    start.setHours(0, 0, 0, 0);
                    return start > today;
                });

                setOngoing(ongoingEvents);
                setUpcoming(upcomingEvents);
            } catch (error) {
                console.error('Fetch events failed', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate]);

    if (user) return null;

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-16">

            {/* HERO SECTION */}
            <section className="text-center py-16 px-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('banner.avif')] bg-cover bg-center"></div>
                <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Discover Premium Real Estate Events
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300">
                        Join thousands of visitors and exhibitors connecting in world-class exhibitions near you.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Link
                            to="/auth/login"
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/auth/login"
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all backdrop-blur-sm"
                        >
                            Exhibitor Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* ONGOING EVENTS */}
            {ongoing.length > 0 && (
                <section className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                        <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                        Ongoing Exhibitions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ongoing.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                action={
                                    <Link
                                        to="/auth/login"
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800"
                                    >
                                        Log in to View Details <ArrowRight size={16} />
                                    </Link>
                                }
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* UPCOMING EVENTS */}
            {upcoming.length > 0 && (
                <section className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                        Upcoming Exhibitions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcoming.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                action={
                                    <Link
                                        to="/auth/login"
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800"
                                    >
                                        Log in to View Details <ArrowRight size={16} />
                                    </Link>
                                }
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* EMPTY STATE */}
            {ongoing.length === 0 && upcoming.length === 0 && (
                <div className="text-center py-16 text-slate-500">
                    No active exhibitions found at the moment. Check back soon!
                </div>
            )}

        </div>
    );
}
