import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EventCard from '../../components/EventCard';
import { Loader, LayoutGrid, Zap, CalendarDays, Clock } from 'lucide-react';

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

export default function VisitorHome() {
    const { apiClient } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
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
        { key: 'ongoing',  label: 'Ongoing Events',  dot: 'bg-green-500' },
        { key: 'upcoming', label: 'Upcoming Events',  dot: 'bg-blue-500'  },
        { key: 'past',     label: 'Past Events',      dot: 'bg-slate-400' },
    ];

    return (
        <div className="space-y-10 pb-12">

            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-12 text-white shadow-xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
                    Discover Premier Real Estate Exhibitions
                </h1>
                <p className="text-slate-300 text-lg max-w-2xl">
                    Browse all events — register for upcoming ones and relive past exhibitions.
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
                <div className="space-y-12">
                    {sections.map(({ key, label, dot }) => {
                        const sectionEvents = classified.filter(e => e._status === key);
                        return sectionEvents.length > 0 ? (
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
                                            linkOverride={`/visitor/events/${event.id}`}
                                        />
                                    ))}
                                </div>
                            </section>
                        ) : null;
                    })}
                    {classified.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No events found at the moment.
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map(event => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    linkOverride={`/visitor/events/${event.id}`}
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
