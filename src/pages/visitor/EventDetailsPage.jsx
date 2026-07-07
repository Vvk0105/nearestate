import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { publicApiClient } from '../../context/AuthContext';
import { MapPin, Calendar, Store, CheckCircle, Upload, X, Info, Map as MapIcon, Users, LogIn, CreditCard, ExternalLink, Image as ImageIcon, PlayCircle, Share2, Link as LinkIcon, Tag, Clock, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import ImageCarousel from '../../components/ImageCarousel';
import { EventDetailSkeleton } from '../../components/Skeleton';

export default function EventDetailsPage() {
    const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL;
    const { id } = useParams();
    const location = useLocation();
    const { apiClient, user } = useAuth();
    const [event, setEvent] = useState(null);
    const [exhibitors, setExhibitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    // ── URL-persisted tab state ───────────────────────────────────────────────
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'details';
    const setActiveTab = (tab) => setSearchParams(prev => { prev.set('tab', tab); return prev; }, { replace: true });

    // Recap sub-tab (local state is fine — it's nested inside the Recaps tab)
    const [recapTab, setRecapTab] = useState('images');

    // Exhibitor Apply State
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyFile, setApplyFile] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [submittingApp, setSubmittingApp] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState(null);

    // Prefer active_role (set after switchRole/selectRole) over legacy role field
    const activeRole = user?.active_role || user?.role;
    const isExhibitor = activeRole === 'EXHIBITOR';
    const isVisitor = activeRole === 'VISITOR';

    // Resolve base path for exhibitor tab links
    // Public guests & visitors use /events/:id/exhibitors/:exhibitorId
    // Exhibitors use /exhibitor/events/:id/exhibitors/:exhibitorId
    const exhibitorLinkBase =
        activeRole === 'EXHIBITOR' ? '/exhibitor/events' : '/events';

    const fetchData = useCallback(async () => {
        try {
            // ✅ Use publicApiClient for event data — no auth token needed.
            // This allows guests to view event details without logging in (Apple 5.1.1v).
            const [eventRes, exhibitorRes] = await Promise.all([
                publicApiClient.get(`/exhibitions/public/exhibitions/${id}/`),
                publicApiClient.get(`/exhibitions/public/exhibitions/${id}/exhibitors/`),
            ]);
            setEvent(eventRes.data);
            setExhibitors(exhibitorRes.data);

            // Fetch user-specific status only when logged in
            if (user) {
                const currentRole = user.active_role || user.role;
                if (currentRole === 'VISITOR') {
                    const statusRes = await apiClient.get(
                        `/exhibitions/visitor/register/${id}/`
                    );
                    setIsRegistered(statusRes.data.is_registered);
                } else if (currentRole === 'EXHIBITOR') {
                    const appsRes = await apiClient.get('/exhibitions/exhibitor/my-applications/');
                    const myApp = appsRes.data.find(a => a.exhibition_id === parseInt(id));
                    if (myApp) {
                        setApplicationStatus(myApp.status);
                        setIsRegistered(true);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch event details', error);
            toast.error('Failed to load event details.');
        } finally {
            setLoading(false);
        }
    }, [id, apiClient, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Guard: if event becomes available and current tab is 'recaps' but event is not past,
    // fall back to 'details' so users can't be stuck on an invalid tab.
    useEffect(() => {
        if (!event) return;
        const isPast = event.end_date && new Date(event.end_date) < new Date();
        if (!isPast && activeTab === 'recaps') {
            setActiveTab('details');
        }
    }, [event]);

    const handleRegister = async () => {
        if (!user) {
            // Guest — redirect to login, preserving intended destination
            toast('Please log in to register for this event.', { icon: '🔐' });
            return;
        }
        if (isExhibitor) {
            setShowApplyModal(true);
            return;
        }

        setRegistering(true);
        try {
            await apiClient.post(`/exhibitions/visitor/register/${id}/`);
            toast.success('Successfully registered! Check My Events for QR Code.');
            setIsRegistered(true);
            fetchData();
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message === 'Already registered') {
                toast('You are already registered.', { icon: 'ℹ️' });
                setIsRegistered(true);
            } else {
                toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
            }
        } finally {
            setRegistering(false);
        }
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        if (!applyFile) {
            toast.error('Please upload payment screenshot.');
            return;
        }
        setSubmittingApp(true);

        const formData = new FormData();
        formData.append('payment_screenshot', applyFile);
        formData.append('transaction_id', transactionId);

        try {
            await apiClient.post(`/exhibitions/exhibitor/apply/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Application submitted successfully!');
            setApplicationStatus('PENDING');
            setIsRegistered(true);
            setShowApplyModal(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Application failed.');
        } finally {
            setSubmittingApp(false);
        }
    };

    if (loading) return <EventDetailSkeleton />;
    if (!event) return <div className="text-center p-12 font-medium text-slate-500">Event not found.</div>;

    const isPastEvent = event.end_date && new Date(event.end_date) < new Date();

    const formattedMapImage = event.map_image
        ? (event.map_image.startsWith('http') ? event.map_image : `${MEDIA_BASE}${event.map_image}`)
        : null;

    // Helper: extract YouTube video ID from any YouTube URL
    const getYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(
            /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([-\w]+)/
        );
        return match ? match[1] : null;
    };

    const recap = event.recap || null;
    const priceTiers = event.price_tiers || [];

    // ── Tab definitions (Recaps tab only for past events) ────────────────────
    const tabs = [
        { key: 'details', label: 'Details & Guide', icon: <Info size={16} /> },
        { key: 'exhibitors', label: 'Exhibitors', icon: <Store size={16} />, badge: exhibitors.length },
        ...(isPastEvent ? [{ key: 'recaps', label: 'Recaps', icon: <PlayCircle size={16} /> }] : []),
    ];

    return (
        <>
            <div className="space-y-8 relative animate-fade-in-up pb-12">
                {/* Header/Banner Section with Carousel */}
                <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl bg-slate-900 group animate-fade-in">
                    {event.images ? (
                        <ImageCarousel
                            images={event.images.map((img) => ({
                                id: img.id,
                                image: img.image.startsWith('http') ? img.image : `${MEDIA_BASE}${img.image}`,
                            }))}
                            height="h-full"
                            rounded="rounded-none"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-800">
                            <Calendar size={64} className="mb-4 opacity-50" />
                            <span className="text-2xl font-bold opacity-50">No Event Images</span>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                        <div className="max-w-4xl">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight shadow-sm">
                                {event.name}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm md:text-base text-slate-200 font-medium">
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                    <Calendar size={18} className="text-blue-400" /> {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                    <MapPin size={18} className="text-red-400" /> {event.venue}, {event.city}
                                </span>
                                {isPastEvent && (
                                    <span className="flex items-center gap-2 bg-slate-600/70 px-3 py-1 rounded-full backdrop-blur-sm text-slate-300">
                                        <Clock size={16} className="text-slate-400" /> Event Ended
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => window.history.back()}
                        className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-sm font-medium z-10"
                    >
                        &larr; Back
                    </button>
                </div>

                {/* ── Main Content Grid ──────────────────────────────────────────────── */}
                {/* For past events: full width (no right sidebar).
                    For active events: 2/3 + 1/3 grid.                                  */}
                <div className={isPastEvent ? '' : 'grid grid-cols-1 lg:grid-cols-3 gap-8'}>

                    {/* Left / Full Column: Tabs & Content */}
                    <div className={`${isPastEvent ? '' : 'lg:col-span-2'} space-y-6 animate-fade-in-up stagger-2`}>

                        {/* Tab Bar */}
                        <div className="flex space-x-2 border-b border-slate-200">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        {tab.icon}
                                        {tab.label}
                                        {tab.badge !== undefined && (
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{tab.badge}</span>
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Panels */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">

                            {/* ── Details & Guide tab ──────────────────────────────────── */}
                            {activeTab === 'details' && (
                                <div className="space-y-8">

                                    {/* Event Concluded notice — past events only */}
                                    {isPastEvent && (
                                        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                                            <span className="text-3xl leading-none select-none">🎉</span>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base mb-1">Event Concluded</h3>
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    This event has already ended.{' '}
                                                    {recap ? (
                                                        <>
                                                            Visit the{' '}
                                                            <button
                                                                onClick={() => setActiveTab('recaps')}
                                                                className="text-blue-600 font-semibold hover:underline"
                                                            >
                                                                Recaps
                                                            </button>
                                                            {' '}section to explore the event highlights, photos, and videos.
                                                        </>
                                                    ) : (
                                                        'Check back later for event highlights and recap content.'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col w-full justify-between items-start gap-5 rounded-2xl text-slate-900 prose prose-slate max-w-none">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-3">About the Event</h3>
                                            <p className="leading-relaxed text-slate-600 whitespace-pre-line">{event.description}</p>
                                        </div>
                                        <div>
                                            {/* ✅ Null-safe: only access user.role when user is defined */}
                                            {isExhibitor && !isPastEvent ? (
                                                <>
                                                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                                                        {priceTiers.length > 0 ? 'Booth Pricing' : 'Application Fee'}
                                                    </h3>
                                                    {priceTiers.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {priceTiers.map(tier => (
                                                                <div key={tier.id} className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <Tag size={14} className="text-indigo-500" />
                                                                        <span className="font-bold text-indigo-800 text-sm">{tier.name}</span>
                                                                    </div>
                                                                    {tier.description && <p className="text-xs text-indigo-600 mb-2">{tier.description}</p>}
                                                                    <p className="text-2xl font-extrabold text-indigo-900">{event.currency_symbol || '₹'}{tier.fee}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-600 font-semibold">{event.currency_symbol || '₹'}{event.registration_fee}</p>
                                                    )}
                                                </>
                                            ) : !isExhibitor && !isPastEvent ? (
                                                <h3 className="text-xl font-bold text-slate-900 mb-3">Free Register</h3>
                                            ) : null}

                                            {/* Payment Details — only shown to exhibitors for active events */}
                                            {isExhibitor && !isPastEvent && event.payment_details && (
                                                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-5">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <CreditCard size={18} className="text-blue-600 flex-shrink-0" />
                                                        <h4 className="font-bold text-blue-800 text-base">Payment Instructions</h4>
                                                    </div>
                                                    <pre className="text-sm text-blue-900 whitespace-pre-wrap font-sans leading-relaxed">
                                                        {event.payment_details}
                                                    </pre>
                                                    <p className="text-xs text-blue-500 mt-3 font-medium">
                                                        💡 Complete the payment, then upload your screenshot when applying.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timing Details Section */}
                                    {event.schedules && event.schedules.length > 0 && (
                                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                <Clock className="text-indigo-500" size={18} /> Timing Details
                                            </h3>
                                            <div className="divide-y divide-slate-200/80">
                                                {event.schedules.map((sched, idx) => (
                                                    <div key={sched.id || idx} className="py-3 flex justify-between items-center text-sm md:text-base">
                                                        <span className="font-semibold text-slate-700">
                                                            {dayjs(sched.date).format('DD-MM-YYYY')}
                                                        </span>
                                                        <span className="text-slate-600 font-medium bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm text-xs md:text-sm">
                                                            {dayjs(`2000-01-01T${sched.start_time}`).format('hh:mm A')} — {dayjs(`2000-01-01T${sched.end_time}`).format('hh:mm A')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Links Section */}
                                    {(event.venue_link || event.location_link) && (
                                        <div className="flex flex-wrap gap-3">
                                            {event.venue_link && (
                                                <a
                                                    href={event.venue_link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-100 hover:border-blue-400 transition-all shadow-sm"
                                                >
                                                    <ExternalLink size={15} />
                                                    Venue Website
                                                </a>
                                            )}
                                            {event.location_link && (
                                                <a
                                                    href={event.location_link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 hover:border-emerald-400 transition-all shadow-sm"
                                                >
                                                    <MapPin size={15} />
                                                    View on Map
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Map Section */}
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <MapIcon className="text-blue-500" size={20} /> Event Map
                                        </h3>
                                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                            {formattedMapImage ? (
                                                <div className="relative group cursor-zoom-in" onClick={() => window.open(formattedMapImage, '_blank')}>
                                                    <img
                                                        src={formattedMapImage}
                                                        alt="Event Map"
                                                        className="w-full h-auto max-h-[500px] object-contain mx-auto"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-sm font-medium shadow-sm pointer-events-none">Click to View Full Map</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                                                    <MapIcon size={48} className="mb-2 opacity-50" />
                                                    <p>Map not available for this event.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Exhibitors tab ───────────────────────────────────────── */}
                            {activeTab === 'exhibitors' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {exhibitors.map(exhibitor => (
                                        <Link
                                            key={exhibitor.id}
                                            to={`${exhibitorLinkBase}/${id}/exhibitors/${exhibitor.id}`}
                                            className="group block"
                                        >
                                            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-500 hover:shadow-lg transition-all duration-300 h-full">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <Store size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{exhibitor.company_name}</h4>
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">{exhibitor.business_type}</p>
                                                        <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                                                            <MapPin size={14} /> {exhibitor.council_area}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {exhibitors.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                            <Store className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                                            <p>No exhibitors have joined yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Recaps tab (past events only) ────────────────────────── */}
                            {activeTab === 'recaps' && isPastEvent && (
                                <div>
                                    {recap ? (
                                        <div>
                                            {/* Recap sub-tab bar */}
                                            <div className="flex gap-1 border-b border-slate-200 mb-6 -mx-6 md:-mx-8 px-6 md:px-8 bg-slate-50 -mt-6 md:-mt-8 pt-2 rounded-t-2xl">
                                                {[
                                                    { key: 'images', label: 'Photos', icon: <ImageIcon size={15} /> },
                                                    { key: 'videos', label: 'Videos', icon: <PlayCircle size={15} /> },
                                                    { key: 'social', label: 'Social Links', icon: <Share2 size={15} /> },
                                                ].map(tab => (
                                                    <button
                                                        key={tab.key}
                                                        onClick={() => setRecapTab(tab.key)}
                                                        className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${recapTab === tab.key
                                                            ? 'border-blue-600 text-blue-600 bg-white'
                                                            : 'border-transparent text-slate-500 hover:text-slate-800'
                                                        }`}
                                                    >
                                                        {tab.icon} {tab.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* ── Photos ── */}
                                            {recapTab === 'images' && (
                                                <div>
                                                    {recap.images && recap.images.length > 0 ? (
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                            {recap.images.map(img => (
                                                                <div
                                                                    key={img.id}
                                                                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow"
                                                                    onClick={() => window.open(img.image, '_blank')}
                                                                >
                                                                    <img
                                                                        src={img.image}
                                                                        alt="Event recap"
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                                        <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={22} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-12 text-center text-slate-400">
                                                            <ImageIcon className="mx-auto mb-2 opacity-50" size={40} />
                                                            <p>No photos available yet.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* ── Videos ── */}
                                            {recapTab === 'videos' && (
                                                <div>
                                                    {recap.videos && recap.videos.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {recap.videos.map(v => {
                                                                const ytId = getYouTubeId(v.youtube_url);
                                                                return (
                                                                    <div key={v.id} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                                                                        {ytId ? (
                                                                            <div className="relative" style={{ paddingTop: '56.25%' }}>
                                                                                <iframe
                                                                                    className="absolute inset-0 w-full h-full"
                                                                                    src={`https://www.youtube.com/embed/${ytId}`}
                                                                                    title={v.title || 'Recap Video'}
                                                                                    frameBorder="0"
                                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                    allowFullScreen
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <a
                                                                                href={v.youtube_url}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="flex items-center gap-3 p-4 text-white hover:bg-slate-800 transition-colors"
                                                                            >
                                                                                <PlayCircle size={24} className="text-red-500 shrink-0" />
                                                                                <span className="truncate text-sm">{v.title || v.youtube_url}</span>
                                                                            </a>
                                                                        )}
                                                                        {v.title && ytId && (
                                                                            <p className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800">{v.title}</p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="py-12 text-center text-slate-400">
                                                            <PlayCircle className="mx-auto mb-2 opacity-50" size={40} />
                                                            <p>No videos available yet.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* ── Social Links ── */}
                                            {recapTab === 'social' && (
                                                <div>
                                                    {recap.social_links && recap.social_links.length > 0 ? (
                                                        <div className="flex flex-wrap gap-3">
                                                            {recap.social_links.map(s => (
                                                                <a
                                                                    key={s.id}
                                                                    href={s.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm group"
                                                                >
                                                                    <LinkIcon size={16} className="text-blue-500 group-hover:text-blue-600" />
                                                                    {s.title}
                                                                    <ExternalLink size={13} className="text-slate-400 group-hover:text-blue-500" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-12 text-center text-slate-400">
                                                            <Share2 className="mx-auto mb-2 opacity-50" size={40} />
                                                            <p>No social links available yet.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* No recap data at all */
                                        <div className="py-16 text-center text-slate-400">
                                            <ImageIcon className="mx-auto mb-3 opacity-40" size={48} />
                                            <p className="font-semibold text-slate-500">No recap content available yet.</p>
                                            <p className="text-sm mt-1">Check back later for highlights and photos from this event.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Right Column: Status & Action Card — hidden for past events */}
                    {!isPastEvent && (
                        <div className="lg:col-span-1 animate-fade-in-up stagger-3">
                            <div className="sticky top-24 space-y-6">
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Users size={20} className="text-indigo-500" /> Availability
                                    </h3>

                                    <div className="space-y-4 mb-8">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-slate-600">Available Booths</span>
                                                <span className="text-sm font-bold text-slate-900">{event.available_booths} / {event.booth_capacity}</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(event.available_booths / event.booth_capacity) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-slate-600">Visitor Passes</span>
                                                <span className="text-sm font-bold text-slate-900">{event.available_visitors} left</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(event.available_visitors / event.visitor_capacity) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ✅ APPLE COMPLIANCE:
                                    - Guest: show "Login to Register" link — no data collected, no account forced
                                    - Logged-in: show full registration/apply button
                                    This satisfies Guideline 5.1.1(v): browsing is unrestricted,
                                    login is only required at the point of registration. */}
                                    {/* Role context message — shown above button when user is logged in */}
                                    {user && activeRole && (
                                        <div className={`mb-4 px-4 py-3 rounded-xl text-xs leading-relaxed border ${isExhibitor
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                : 'bg-teal-50 border-teal-200 text-teal-700'
                                            }`}>
                                            <span className="font-semibold">
                                                {isExhibitor ? '🏢' : '🎟️'} You are logged in as a{' '}
                                                <span className="capitalize font-bold">{activeRole.toLowerCase()}</span>.
                                            </span>
                                            {' '}Want to {isExhibitor ? 'attend as a Visitor' : 'exhibit as an Exhibitor'}?{' '}
                                            <Link
                                                to="/profile"
                                                className="underline font-semibold hover:opacity-80 transition-opacity"
                                            >
                                                Go to Profile to switch role.
                                            </Link>
                                        </div>
                                    )}

                                    {!user ? (
                                        <Link
                                            to={`/auth/login?next=/events/${id}`}
                                            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all transform hover:-translate-y-0.5"
                                        >
                                            <LogIn size={20} />
                                            Login to Register
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={handleRegister}
                                            disabled={registering || (isExhibitor && Boolean(applicationStatus)) || (isVisitor && isRegistered)}
                                            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${(isRegistered || applicationStatus) && applicationStatus !== 'REJECTED'
                                                    ? 'bg-green-600 text-white cursor-default hover:shadow-md'
                                                    : applicationStatus === 'REJECTED'
                                                        ? 'bg-red-600 text-white cursor-default'
                                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                                                }`}
                                        >
                                            {isExhibitor ? (
                                                applicationStatus ? (
                                                    <><CheckCircle size={20} /> Application {applicationStatus}</>
                                                ) : (
                                                    'Apply for Booth'
                                                )
                                            ) : (
                                                isRegistered ? (
                                                    <><CheckCircle size={20} /> You&apos;re Going!</>
                                                ) : (
                                                    <>{registering ? 'Processing...' : 'Register for Event'}</>
                                                )
                                            )}
                                        </button>
                                    )}
                                    {isRegistered && isVisitor && (
                                        <div className="text-center mt-4 p-3 bg-green-50/60 border border-green-200 rounded-xl space-y-2">
                                            <p className="text-xs text-green-700 font-semibold flex items-center justify-center gap-1.5">
                                                <CheckCircle size={14} className="text-green-500" /> Registered successfully!
                                            </p>
                                            <Link
                                                to="/visitor/my-events"
                                                className="inline-flex items-center justify-center gap-2 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                            >
                                                <QrCode size={14} /> View Entry Pass (QR Code)
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Apply Modal — Exhibitors only */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">Exhibitor Application</h3>
                            <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 hover:bg-slate-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {event.payment_details && (
                                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard size={16} className="text-blue-600 flex-shrink-0" />
                                        <h4 className="font-bold text-blue-800 text-sm">Payment Instructions</h4>
                                    </div>
                                    <pre className="text-xs text-blue-900 whitespace-pre-wrap font-sans leading-relaxed">
                                        {event.payment_details}
                                    </pre>
                                </div>
                            )}
                            <form onSubmit={handleApplySubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Screenshot</label>
                                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative group">
                                        <div className="space-y-1 text-center">
                                            {applyFile ? (
                                                <div className="text-sm text-slate-600">
                                                    <p className="font-bold text-green-600 truncate max-w-[200px] mx-auto flex items-center justify-center gap-1">
                                                        <CheckCircle size={14} /> {applyFile.name}
                                                    </p>
                                                    <button type="button" onClick={() => setApplyFile(null)} className="text-red-500 text-xs mt-2 hover:underline font-medium">Change File</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto h-12 w-12 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                    <div className="text-sm text-slate-600">
                                                        <span className="font-medium text-blue-600 hover:text-blue-500">Upload a file</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setApplyFile(e.target.files[0])} accept="image/*" />
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Transaction ID</label>
                                    <input
                                        type="text"
                                        className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="Enter UPI/Bank Transaction ID"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowApplyModal(false)} className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submittingApp} className="flex-1 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:shadow-none transition-all">
                                        {submittingApp ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
