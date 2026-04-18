import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { publicApiClient } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { Loader, LayoutGrid, Zap, CalendarDays, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const FILTERS = [
    { key: 'all',      label: 'All',      icon: LayoutGrid,   activeBg: 'bg-slate-900 text-white',  dot: 'bg-slate-400' },
    { key: 'ongoing',  label: 'Ongoing',  icon: Zap,          activeBg: 'bg-green-600 text-white',  dot: 'bg-green-500' },
    { key: 'upcoming', label: 'Upcoming', icon: CalendarDays, activeBg: 'bg-blue-600 text-white',   dot: 'bg-blue-500'  },
    { key: 'past',     label: 'Past',     icon: Clock,        activeBg: 'bg-slate-500 text-white',  dot: 'bg-slate-400' },
];

function classifyEvent(event) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (end < today) return 'past';
    if (start <= today && end >= today) return 'ongoing';
    return 'upcoming';
}

export default function PublicHome() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect logged-in users to their role-based home
        if (user) {
            if (user.role === 'VISITOR') navigate('/visitor/home');
            else if (user.role === 'EXHIBITOR') navigate('/exhibitor/home');
            return;
        }

        // ✅ Use publicApiClient — no token needed for listing events on the home page
        const fetchEvents = async () => {
            try {
                const res = await publicApiClient.get('/exhibitions/public/exhibitions/');
                const eventsData = res.data.data || res.data;
                // Only active events for public home
                setEvents(eventsData.filter(e => e.is_active));
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

    const classified = events.map(e => ({ ...e, _status: classifyEvent(e) }));
    const counts = {
        all: classified.length,
        ongoing:  classified.filter(e => e._status === 'ongoing').length,
        upcoming: classified.filter(e => e._status === 'upcoming').length,
        past:     classified.filter(e => e._status === 'past').length,
    };

    const filtered = activeFilter === 'all' ? classified : classified.filter(e => e._status === activeFilter);

    const sections = [
        { key: 'ongoing',  label: 'Ongoing Exhibitions',  dot: 'bg-green-500' },
        { key: 'upcoming', label: 'Upcoming Exhibitions',  dot: 'bg-blue-500'  },
        { key: 'past',     label: 'Past Exhibitions',      dot: 'bg-slate-400' },
    ];

    return (
        <div className="space-y-16 pb-12">

            {/* HERO SECTION */}
            <section className="text-center py-16 px-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('banner.avif')] bg-cover bg-center" />
                <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Discover Premium Real Estate Events
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300">
                        Join thousands of visitors and exhibitors at world-class exhibitions near you.
                        Browse freely — sign in only when you&apos;re ready to register.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Link
                            to="/events"
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30"
                        >
                            Browse All Events
                        </Link>
                        <Link
                            to="/auth/login"
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all backdrop-blur-sm"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* FILTER TABS */}
            <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-2">
                {FILTERS.map(({ key, label, icon: Icon, activeBg, dot }) => {
                    const isActive = activeFilter === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveFilter(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 shadow-sm ${
                                isActive
                                    ? `${activeBg} border-transparent shadow-md`
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow'
                            }`}
                        >
                            {!isActive && <span className={`w-2 h-2 rounded-full ${dot}`} />}
                            <Icon size={14} />
                            {label}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {counts[key]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* CONTENT */}
            <div className="max-w-7xl mx-auto px-4">
                {activeFilter === 'all' ? (
                    <div className="space-y-16">
                        {sections.map(({ key, label, dot }) => {
                            const sectionEvents = classified.filter(e => e._status === key);
                            return sectionEvents.length > 0 ? (
                                <section key={key}>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                                        <span className={`w-2 h-8 ${dot} rounded-full`} />
                                        {label}
                                        <span className="ml-2 text-sm font-normal text-slate-400">({sectionEvents.length})</span>
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {sectionEvents.map(event => (
                                            <EventCard
                                                key={event.id}
                                                event={event}
                                                linkOverride={`/events/${event.id}`}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ) : null;
                        })}
                        {classified.length === 0 && (
                            <div className="text-center py-16 text-slate-500">
                                No active exhibitions found at the moment. Check back soon!
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {filtered.length > 0 ? (
                            <section>
                                <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                                    <span className={`w-2 h-8 ${FILTERS.find(f => f.key === activeFilter).dot} rounded-full`} />
                                    {FILTERS.find(f => f.key === activeFilter).label} Exhibitions
                                    <span className="ml-2 text-sm font-normal text-slate-400">({filtered.length})</span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filtered.map(event => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            linkOverride={`/events/${event.id}`}
                                        />
                                    ))}
                                </div>
                            </section>
                        ) : (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                <p className="text-slate-500 font-medium">No {activeFilter} exhibitions at the moment.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
