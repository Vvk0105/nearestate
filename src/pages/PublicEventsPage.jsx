import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader, CalendarDays, Zap, Clock, LayoutGrid } from 'lucide-react';
import { publicApiClient } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';

const FILTERS = [
    { key: 'all',      label: 'All Events',  icon: LayoutGrid,  color: 'text-slate-600',  activeBg: 'bg-slate-900 text-white',      dot: 'bg-slate-400' },
    { key: 'ongoing',  label: 'Ongoing',     icon: Zap,         color: 'text-green-600',  activeBg: 'bg-green-600 text-white',      dot: 'bg-green-500' },
    { key: 'upcoming', label: 'Upcoming',    icon: CalendarDays,color: 'text-blue-600',   activeBg: 'bg-blue-600 text-white',       dot: 'bg-blue-500'  },
    { key: 'past',     label: 'Past',        icon: Clock,       color: 'text-slate-400',  activeBg: 'bg-slate-500 text-white',      dot: 'bg-slate-400' },
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

export default function PublicEventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

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

    // Classify every event
    const classified = events.map(e => ({ ...e, _status: classifyEvent(e) }));

    const ongoing  = classified.filter(e => e._status === 'ongoing');
    const upcoming = classified.filter(e => e._status === 'upcoming');
    const past     = classified.filter(e => e._status === 'past');

    // Counts for badge display
    const counts = { all: classified.length, ongoing: ongoing.length, upcoming: upcoming.length, past: past.length };

    // Filtered set to display
    const filtered = activeFilter === 'all' ? classified : classified.filter(e => e._status === activeFilter);

    // Section headings when "all" filter selected
    const sections = [
        { key: 'ongoing',  label: 'Ongoing Events',  dot: 'bg-green-500',  events: ongoing  },
        { key: 'upcoming', label: 'Upcoming Events',  dot: 'bg-blue-500',   events: upcoming },
        { key: 'past',     label: 'Past Events',      dot: 'bg-slate-400',  events: past     },
    ];

    return (
        <div className="space-y-10 pb-14">

            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-12 text-white shadow-xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
                    Discover Real Estate Exhibitions
                </h1>
                <p className="text-slate-300 text-lg max-w-2xl">
                    Browse all events — ongoing, upcoming, and past. Connect with top developers,
                    brokers, and loan providers.{' '}
                    {!user && (
                        <Link to="/auth/login" className="underline text-blue-300 hover:text-blue-200 font-semibold">
                            Sign in to register.
                        </Link>
                    )}
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
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

            {/* Content */}
            {activeFilter === 'all' ? (
                /* Grouped view — Ongoing → Upcoming → Past */
                <div className="space-y-12">
                    {sections.map(({ key, label, dot, events: sectionEvents }) =>
                        sectionEvents.length > 0 ? (
                            <section key={key}>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className={`w-2 h-8 ${dot} rounded-full`} />
                                    {label}
                                    <span className="ml-2 text-sm font-normal text-slate-400">({sectionEvents.length})</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {sectionEvents.map(event => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            linkOverride={`/events/${event.id}`}
                                        />
                                    ))}
                                </div>
                            </section>
                        ) : null
                    )}
                    {classified.length === 0 && (
                        <div className="text-center py-16 text-slate-500">
                            No events found. Check back soon!
                        </div>
                    )}
                </div>
            ) : (
                /* Flat filtered view */
                <div>
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map(event => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    linkOverride={`/events/${event.id}`}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500 font-medium">No {activeFilter} events at the moment.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
