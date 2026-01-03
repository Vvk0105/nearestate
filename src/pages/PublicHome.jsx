import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { Loader, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function PublicHome() {
    const { apiClient, user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // If user is logged in, redirect to their respective home
        if (user) {
            if (user.role === 'VISITOR') navigate('/visitor/home');
            if (user.role === 'EXHIBITOR') navigate('/exhibitor/home');
        }

        const fetchEvents = async () => {
            try {
                const res = await apiClient.get('/exhibitions/public/exhibitions/');
                // Show all active events
                const active = res.data.filter(e => e.is_active && new Date(e.end_date) >= new Date());
                setEvents(active);
            } catch (error) {
                console.error("Fetch events failed", error);
            } finally {
                setLoading(false);
            }
        };

        if (!user) { // Only fetch if not redirecting (though effect runs technically, this check saves a split second or logic flow)
            fetchEvents();
        }
    }, [user, navigate, apiClient]);

    if (user) return null; // Redirecting...

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center py-16 px-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('banner.avif')] bg-cover bg-center"></div>
                <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Discover Premium Real Estate Events</h1>
                    <p className="text-lg md:text-xl text-slate-300">Join thousands of visitors and exhibitors connecting in world-class exhibitions near you.</p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Link to="/auth/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30">
                            Get Started
                        </Link>
                        <Link to="/auth/login" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all backdrop-blur-sm">
                            Exhibitor Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">Upcoming Exhibitions</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => (
                        <div key={event.id} className="relative group">
                            {/* We use EventCard but override action to redirect to login */}
                            <EventCard
                                event={event}
                                action={
                                    <Link
                                        to="/auth/login"
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800"
                                    >
                                        Log in to View Details <ArrowRight size={16} />
                                    </Link>
                                }
                            />
                        </div>
                    ))}
                </div>
                {events.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        No active exhibitions found at the moment. Check back soon!
                    </div>
                )}
            </section>
        </div>
    );
}
