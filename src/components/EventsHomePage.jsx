import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import { EventGridSkeleton } from './Skeleton';
import { useAuth, publicApiClient } from '../context/AuthContext';
import {
    Loader, LayoutGrid, Zap, CalendarDays, Clock,
    MapPin, Calendar, ChevronLeft, ChevronRight,
    ArrowRight, CheckCircle
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const FILTERS = [
    { key: 'all',      label: 'All',      icon: LayoutGrid,   activeBg: 'bg-slate-900 text-white',  dot: 'bg-slate-400' },
    { key: 'ongoing',  label: 'Ongoing',  icon: Zap,          activeBg: 'bg-green-600 text-white',  dot: 'bg-green-500' },
    { key: 'upcoming', label: 'Upcoming', icon: CalendarDays, activeBg: 'bg-blue-600 text-white',   dot: 'bg-blue-500'  },
    { key: 'past',     label: 'Past',     icon: Clock,        activeBg: 'bg-slate-500 text-white',  dot: 'bg-slate-400' },
];

const SECTIONS = [
    { key: 'ongoing',  label: 'Ongoing Exhibitions',  dot: 'bg-green-500',  bar: 'bg-green-600' },
    { key: 'upcoming', label: 'Upcoming Exhibitions', dot: 'bg-blue-500',   bar: 'bg-blue-600'  },
    { key: 'past',     label: 'Past Exhibitions',     dot: 'bg-slate-400',  bar: 'bg-slate-500' },
];

function classifyEvent(event) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(event.start_date);
    const end   = new Date(event.end_date);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (end < today)                          return 'past';
    if (start <= today && end >= today)       return 'ongoing';
    return 'upcoming';
}

// ─── Sliding Hero Banner ──────────────────────────────────────────────────────
function HeroBanner({ upcomingEvents, role, MEDIA_BASE }) {
    const [idx, setIdx]           = useState(0);
    const [fading, setFading]     = useState(false);
    const timerRef                = useRef(null);

    const go = (next) => {
        setFading(true);
        setTimeout(() => {
            setIdx(next);
            setFading(false);
        }, 350);
    };

    useEffect(() => {
        if (upcomingEvents.length <= 1) return;
        timerRef.current = setInterval(() => {
            go((prev) => (prev + 1) % upcomingEvents.length);
        }, 3000);
        return () => clearInterval(timerRef.current);
    }, [upcomingEvents.length]);

    const prev = () => { clearInterval(timerRef.current); go((idx - 1 + upcomingEvents.length) % upcomingEvents.length); };
    const next = () => { clearInterval(timerRef.current); go((idx + 1) % upcomingEvents.length); };

    // Fallback banner when no upcoming events
    if (!upcomingEvents.length) {
        return (
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
                <div className="text-center text-white px-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Discover Real Estate Exhibitions</h1>
                    <p className="text-slate-300 text-lg max-w-xl mx-auto">Browse ongoing and past exhibitions below.</p>
                </div>
            </div>
        );
    }

    const event = upcomingEvents[idx];
    const heroImg = event.images?.[0]?.image
        ? (event.images[0].image.startsWith('http') ? event.images[0].image : `${MEDIA_BASE}${event.images[0].image}`)
        : null;

    const detailLink =
        role === 'exhibitor' ? `/exhibitor/events/${event.id}`
        : role === 'visitor' ? `/visitor/events/${event.id}`
        : `/events/${event.id}`;

    const ctaLabel =
        role === 'public' ? 'Login to Register'
        : role === 'exhibitor' ? 'Apply for Booth'
        : 'View & Register';

    const ctaTo =
        role === 'public' ? `/auth/login?next=/events/${event.id}` : detailLink;

    return (
        <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl group">
            {/* Background */}
            <div
                className={`absolute inset-0 transition-opacity duration-350 ${fading ? 'opacity-0' : 'opacity-100'}`}
                style={{ transition: 'opacity 350ms ease' }}
            >
                {heroImg ? (
                    <img src={heroImg} alt={event.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div
                className={`absolute inset-0 flex flex-col justify-end p-6 md:p-10 transition-opacity duration-350 ${fading ? 'opacity-0' : 'opacity-100'}`}
                style={{ transition: 'opacity 350ms ease' }}
            >
                <div className="max-w-3xl">
                    <span className="inline-block mb-3 px-3 py-1 bg-blue-500/80 text-white text-xs font-bold rounded-full uppercase tracking-wider backdrop-blur-sm">
                        Upcoming
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 tracking-tight leading-tight line-clamp-2">
                        {event.name}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-200 mb-5">
                        <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                            <Calendar size={15} className="text-blue-400" />
                            {new Date(event.start_date).toLocaleDateString()} – {new Date(event.end_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                            <MapPin size={15} className="text-red-400" />
                            {event.venue}, {event.city}
                        </span>
                    </div>
                    <Link
                        to={ctaTo}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-blue-500/30 text-sm"
                    >
                        {ctaLabel} <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Prev / Next arrows */}
            {upcomingEvents.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100">
                        <ChevronRight size={20} />
                    </button>
                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {upcomingEvents.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { clearInterval(timerRef.current); go(i); }}
                                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}


// ─── Main Exported Component ──────────────────────────────────────────────────
/**
 * props:
 *   events          – array of events
 *   loading         – boolean
 *   role            – 'public' | 'visitor' | 'exhibitor'
 *   myApplications  – array (exhibitor only)
 *   profile         – object (exhibitor only) { company_name, … }
 *   apiClient       – axios instance (exhibitor only, for profile PATCH)
 *   onProfileSaved  – callback(updatedProfile) after successful PATCH
 */
export default function EventsHomePage({
    events: initialEventsProp = [],
    loading: initialLoadingProp = false,
    role = 'public',
    myApplications = [],
    profile = null,
    apiClient: propApiClient = null,
    onProfileSaved,
    showHero = true,
}) {
    const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL;
    const [activeFilter, setActiveFilter] = useState('all');

    const { apiClient: contextApiClient } = useAuth();
    const activeApiClient = role === 'public' ? publicApiClient : (propApiClient || contextApiClient || publicApiClient);

    const [events, setEvents] = useState([]);
    const [counts, setCounts] = useState({ all: 0, ongoing: 0, upcoming: 0, past: 0 });
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadMoreRef = useRef(null);

    // Initial/Filter load
    useEffect(() => {
        let isMounted = true;
        const fetchInitial = async () => {
            try {
                setLoadingEvents(true);
                const res = await activeApiClient.get('/exhibitions/public/exhibitions/', {
                    params: { page: 1, limit: 10, status: activeFilter }
                });
                if (isMounted) {
                    const data = res.data.data || [];
                    const total = res.data.total || data.length;
                    setEvents(data);
                    setHasMore(data.length < total);
                    setPage(1);
                    if (res.data.counts) {
                        setCounts(res.data.counts);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch homepage exhibitions", error);
            } finally {
                if (isMounted) {
                    setLoadingEvents(false);
                }
            }
        };
        fetchInitial();
        return () => { isMounted = false; };
    }, [activeApiClient, activeFilter]);

    // Next page fetch
    const fetchNextPage = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const res = await activeApiClient.get('/exhibitions/public/exhibitions/', {
                params: { page: nextPage, limit: 10, status: activeFilter }
            });
            const data = res.data.data || [];
            const total = res.data.total || (events.length + data.length);
            
            setEvents(prev => {
                const combined = [...prev, ...data];
                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                setHasMore(unique.length < total);
                return unique;
            });
            setPage(nextPage);
            if (res.data.counts) {
                setCounts(res.data.counts);
            }
        } catch (error) {
            console.error("Failed to fetch homepage exhibitions page", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Intersection observer
    useEffect(() => {
        if (loadingEvents || !hasMore || initialLoadingProp) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            { rootMargin: '150px' }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current);
            }
        };
    }, [hasMore, page, loadingEvents, loadingMore, initialLoadingProp]);

    if (loadingEvents || initialLoadingProp) return <EventGridSkeleton count={6} />;

    const classified = events.map(e => ({ ...e, _status: classifyEvent(e) }));
    const filtered = activeFilter === 'all' ? classified : classified.filter(e => e._status === activeFilter);
    const upcomingForBanner = classified.filter(e => e._status === 'upcoming');

    // ── per-role helpers ──────────────────────────────────────────────────────
    const getEventLink = (eventId) =>
        role === 'exhibitor' ? `/exhibitor/events/${eventId}`
        : role === 'visitor' ? `/visitor/events/${eventId}`
        : `/events/${eventId}`;

    const getApplicationStatus = (eventId) => {
        const app = myApplications.find(a => a.exhibition?.id === eventId || a.exhibition === eventId);
        return app ? app.status : null;
    };

    const renderAction = (event) => {

        if (event._status === 'past') {
            return (
                <Link
                    to={getEventLink(event.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-slate-500 hover:bg-slate-600 transition-colors"
                >
                    Event Highlights <ArrowRight size={15} />
                </Link>
            );
        }
        if (role !== 'exhibitor') {
            return (
                <Link
                    to={getEventLink(event.id)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl shadow-sm text-sm font-bold text-white transition-colors ${
                        event._status === 'past' ? 'bg-slate-500 hover:bg-slate-600' : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                >
                    View Details <ArrowRight size={15} />
                </Link>
            );
        }
        const status = getApplicationStatus(event.id);
        if (status === 'APPROVED') return (
            <Link to="/exhibitor/properties" className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200 text-sm">
                Application Approved <CheckCircle size={16} />
            </Link>
        );
        if (status === 'PENDING') return (
            <div className="w-full py-2.5 bg-yellow-50 text-yellow-700 font-bold rounded-xl border border-yellow-200 text-center flex items-center justify-center gap-2 text-sm">
                <Loader size={14} className="animate-spin" /> Pending Approval
            </div>
        );
        if (status === 'REJECTED') return (
            <div className="w-full py-2.5 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200 text-center text-sm">
                Application Rejected
            </div>
        );
        return (
            <Link to={getEventLink(event.id)} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors">
                View Details & Apply <ArrowRight size={15} />
            </Link>
        );
    };

    return (
        <div className="space-y-10 pb-16 animate-fade-in">

            {/* ── Sliding Hero Banner ── */}
            {showHero && <HeroBanner upcomingEvents={upcomingForBanner} role={role} MEDIA_BASE={MEDIA_BASE} />}

            {/* ── Filter Pills ── */}
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

            {/* ── Event Grid ── */}
            {activeFilter === 'all' ? (
                <div className="space-y-14">
                    {SECTIONS.map(({ key, label, bar }) => {
                        const sectionEvents = classified.filter(e => e._status === key);
                        if (!sectionEvents.length) return null;
                        return (
                            <section key={key}>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <span className={`w-1.5 h-8 ${bar} rounded-full`} />
                                    {label}
                                    <span className="text-sm font-normal text-slate-400">({counts[key]})</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {sectionEvents.map(event => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            linkOverride={getEventLink(event.id)}
                                            // action={role === 'exhibitor' ? renderAction(event) : undefined}
                                            action={renderAction(event)}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                    {classified.length === 0 && (
                        <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            No exhibitions found at the moment.
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
                                    linkOverride={getEventLink(event.id)}
                                    action={role === 'exhibitor' ? renderAction(event) : undefined}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500 font-medium">No {activeFilter} exhibitions at the moment.</p>
                        </div>
                    )}
                </div>
            )}
            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="py-6 flex justify-center">
                {loadingMore && (
                    <div className="flex items-center gap-2 text-slate-600">
                        <Loader className="animate-spin text-blue-600" size={20} />
                        <span className="text-sm font-semibold">Loading more exhibitions...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
