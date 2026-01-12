import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Calendar, Store, Loader, CheckCircle, Upload, X, Info, Map as MapIcon, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageCarousel from '../../components/ImageCarousel';

export default function EventDetailsPage() {
    const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL;
    const { id } = useParams();
    const { apiClient, user } = useAuth();
    const [event, setEvent] = useState(null);
    const [exhibitors, setExhibitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    // Exhibitor Apply State
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyFile, setApplyFile] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [boothNumber, setBoothNumber] = useState('');
    const [submittingApp, setSubmittingApp] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState(null);

    const isExhibitor = user?.role === 'EXHIBITOR';

    const roleBasePath =
        user?.role === "EXHIBITOR"
            ? "/exhibitor"
            : "/visitor";

    const fetchData = useCallback(async () => {
        try {
            const [eventRes, exhibitorRes] = await Promise.all([
                apiClient.get(`/exhibitions/public/exhibitions/${id}/`),
                apiClient.get(`/exhibitions/public/exhibitions/${id}/exhibitors/`)
            ]);
            setEvent(eventRes.data);
            setExhibitors(exhibitorRes.data);

            // Check registration/application status
            if (user) {
                if (user.role === 'VISITOR') {
                    const statusRes = await apiClient.get(
                        `/exhibitions/visitor/register/${id}/`
                    );
                    setIsRegistered(statusRes.data.is_registered);
                } else if (user.role === 'EXHIBITOR') {
                    const appsRes = await apiClient.get('/exhibitions/exhibitor/my-applications/');
                    const myApp = appsRes.data.find(a => a.exhibition_id === parseInt(id));
                    if (myApp) {
                        setApplicationStatus(myApp.status);
                        setIsRegistered(true);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch event details", error);
            toast.error("Failed to load event details.");
        } finally {
            setLoading(false);
        }
    }, [id, apiClient, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRegister = async () => {
        if (!user) {
            toast.error("Please login to register.");
            return;
        }
        if (isExhibitor) {
            setShowApplyModal(true);
            return;
        }

        setRegistering(true);
        try {
            await apiClient.post(`/exhibitions/visitor/register/${id}/`);
            toast.success("Successfully registered! Check My Events for QR Code.");
            setIsRegistered(true);
            fetchData(); // Refresh to update capacity
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message === "Already registered") {
                toast("You are already registered.", { icon: 'ℹ️' });
                setIsRegistered(true);
            } else {
                toast.error(error.response?.data?.error || "Registration failed. Please try again.");
            }
        } finally {
            setRegistering(false);
        }
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        if (!applyFile) {
            toast.error("Please upload payment screenshot.");
            return;
        }
        setSubmittingApp(true);

        const formData = new FormData();
        formData.append('payment_screenshot', applyFile);
        formData.append('transaction_id', transactionId);
        if (boothNumber) formData.append('booth_number', boothNumber);

        try {
            await apiClient.post(`/exhibitions/exhibitor/apply/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Application submitted successfully!");
            setApplicationStatus('PENDING');
            setIsRegistered(true); // Mark as applied
            setShowApplyModal(false);
            fetchData(); // Refresh to update capacity
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Application failed.");
        } finally {
            setSubmittingApp(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12 min-h-screen items-center"><Loader className="animate-spin text-blue-600 w-10 h-10" /></div>;
    if (!event) return <div className="text-center p-12 font-medium text-slate-500">Event not found.</div>;

    const formattedMapImage = event.map_image
        ? (event.map_image.startsWith('http') ? event.map_image : `${MEDIA_BASE}${event.map_image}`)
        : null;

    return (
        <div className="space-y-8 relative animate-fade-in-up pb-12">
            {/* Header/Banner Section with Carousel */}
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl bg-slate-900 group">
                {event.images ? (
                    <ImageCarousel
                        images={event.images.map((img) => ({
                            id: img.id,
                            image: img.image.startsWith("http") ? img.image : `${MEDIA_BASE}${img.image}`,
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Details & Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex space-x-2 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                        >
                            <span className="flex items-center gap-2"><Info size={16} /> Details & Guide</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('exhibitors')}
                            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'exhibitors' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                        >
                            <span className="flex items-center gap-2"><Store size={16} /> Exhibitors <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{exhibitors.length}</span></span>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                        {activeTab === 'details' && (
                            <div className="space-y-8">
                                <div className="flex w-full justify-between items-center rounded-2xl text-slate-900 prose prose-slate max-w-none">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">About the Event</h3>
                                        <p className="leading-relaxed text-slate-600 whitespace-pre-line">{event.description}</p>
                                    </div>
                                    <div>
                                        { user.role === 'EXHIBITOR' ? (
                                            <>
                                            <h3 className="text-xl font-bold text-slate-900 mb-3">Application Fee</h3>
                                            <p className="text-sm text-slate-600 font-semibold "> Rs:{event.registration_fee}</p>
                                            </>
                                        ) : (
                                            <h3 className="text-xl font-bold text-slate-900 mb-3">Free Register</h3>
                                        )}
                                    </div>
                                </div>

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

                        {activeTab === 'exhibitors' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {exhibitors.map(exhibitor => (
                                    <Link
                                        key={exhibitor.id}
                                        to={`${roleBasePath}/events/${id}/exhibitors/${exhibitor.id}`}
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
                    </div>
                </div>

                {/* Right Column: Status & Action Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        {/* Status Card */}
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
                                        ></div>
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
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {!user ? (
                                <Link to="/auth/login" className="block w-full text-center py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md hover:shadow-xl">
                                    Login to Register
                                </Link>
                            ) : (
                                <button
                                    onClick={handleRegister}
                                    disabled={registering || (isExhibitor && Boolean(applicationStatus)) || (!isExhibitor && isRegistered)}
                                    className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${(isRegistered || applicationStatus) && !(applicationStatus === 'REJECTED')
                                        ? 'bg-green-600 text-white cursor-default hover:shadow-md'
                                        : (applicationStatus === 'REJECTED' ? 'bg-red-600 text-white cursor-default' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700')
                                        }`}
                                >
                                    {isExhibitor ? (
                                        applicationStatus ? (
                                            <><CheckCircle size={20} /> Application {applicationStatus}</>
                                        ) : (
                                            "Apply for Booth"
                                        )
                                    ) : (
                                        isRegistered ? (
                                            <><CheckCircle size={20} /> You're Going!</>
                                        ) : (
                                            <>{registering ? 'Processing...' : 'Register for Event'}</>
                                        )
                                    )}
                                </button>
                            )}
                            {isRegistered && !isExhibitor && (
                                <p className="text-center text-xs text-green-600 font-medium mt-3">
                                    Check "My Events" for your QR Code
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Modal */}
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
        </div>
    );
}
