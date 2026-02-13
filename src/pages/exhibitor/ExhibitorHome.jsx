import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EventCard from '../../components/EventCard';
import {
    ArrowRight,
    Loader,
    Info,
    Edit,
    Building2,
    Briefcase,
    X,
    CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ExhibitorHome() {
    const { apiClient, loading: authLoading } = useAuth();
    const [events, setEvents] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Profile State
    const [profile, setProfile] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState({});
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        // Wait for auth to complete before fetching data
        if (authLoading) return;

        const fetchData = async () => {
            try {
                const [eventsRes, appsRes, profileRes] = await Promise.all([
                    apiClient.get('/exhibitions/public/exhibitions/'),
                    apiClient.get('/exhibitions/exhibitor/my-applications/'),
                    apiClient.get('/exhibitions/exhibitor/profile/status/')
                ]);

                setEvents(eventsRes.data);
                setMyApplications(appsRes.data);

                if (profileRes.data.exists) {
                    try {
                        const detailRes = await apiClient.get('/exhibitions/exhibitor/profile/');
                        setProfile(detailRes.data);
                    } catch { }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading]);

    const getApplicationStatus = (eventId) => {
        const app = myApplications.find(
            a => a.exhibition.id === eventId || a.exhibition === eventId
        );
        return app ? app.status : null;
    };

    const openProfileModal = () => {
        if (!profile) return;
        setEditProfileForm({
            company_name: profile.company_name,
            council_area: profile.council_area,
            business_type: profile.business_type,
            contact_number: profile.contact_number
        });
        setShowProfileModal(true);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await apiClient.patch(
                '/exhibitions/exhibitor/profile/',
                editProfileForm
            );
            setProfile(res.data);
            toast.success("Profile updated successfully!");
            setShowProfileModal(false);
        } catch {
            toast.error("Failed to update profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader className="animate-spin text-blue-600" />
            </div>
        );
    }

    /* ==================================================
       ✅ ADDED: ONGOING + UPCOMING LOGIC (ONLY CHANGE)
       ================================================== */

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ongoingEvents = events.filter(e => {
        if (!e.is_active) return false;
        const start = new Date(e.start_date);
        const end = new Date(e.end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return start <= today && end >= today;
    });

    const upcomingEvents = events.filter(e => {
        if (!e.is_active) return false;
        const start = new Date(e.start_date);
        start.setHours(0, 0, 0, 0);
        return start > today;
    });

    // KEEP OLD BEHAVIOUR (Quick stats, etc.)
    const activeEvents = [...ongoingEvents, ...upcomingEvents];

    /* ================================================== */

    const renderEventCard = (event) => {
        const status = getApplicationStatus(event.id);

        const actionButton =
            status === 'APPROVED' ? (
                <Link
                    to="/exhibitor/properties"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200"
                >
                    Application Approved <CheckCircle size={18} />
                </Link>
            ) : status === 'PENDING' ? (
                <div className="w-full py-2.5 bg-yellow-50 text-yellow-700 font-bold rounded-xl border border-yellow-200 text-center flex items-center justify-center gap-2">
                    <Loader size={16} className="animate-spin" /> Pending Approval
                </div>
            ) : status === 'REJECTED' ? (
                <div className="w-full py-2.5 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200 text-center">
                    Application Rejected
                </div>
            ) : (
                <Link
                    to={`/exhibitor/events/${event.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800"
                >
                    View Details & Apply <ArrowRight size={16} />
                </Link>
            );

        return <EventCard event={event} action={actionButton} />;
    };

    return (
        <>
            <div className="space-y-8 animate-fade-in-up">

                {/* HEADER + STATS (UNCHANGED) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-xl p-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome, {profile?.company_name || 'Exhibitor'}!
                        </h1>
                        <p className="text-indigo-200 mb-6">
                            Manage your event applications and property listings.
                        </p>

                        <div className="flex gap-4">
                            {profile && (
                                <button
                                    onClick={openProfileModal}
                                    className="bg-white/10 px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <Edit size={16} /> Edit Company Details
                                </button>
                            )}
                            <Link
                                to="/exhibitor/properties"
                                className="bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                Manage Properties <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6">
                        <h3 className="font-bold mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="flex items-center gap-2">
                                    <Info size={16} /> Active Events
                                </span>
                                <span className="font-bold">{activeEvents.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-2">
                                    <Briefcase size={16} /> Applications
                                </span>
                                <span className="font-bold">{myApplications.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔴 ONGOING EVENTS */}
                {ongoingEvents.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-8 bg-green-600 rounded-full"></span>
                            Ongoing Exhibitions
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ongoingEvents.map(event => (
                                <div key={event.id}>
                                    {renderEventCard(event)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🔵 UPCOMING EVENTS */}
                {upcomingEvents.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                            Upcoming Exhibitions
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingEvents.map(event => (
                                <div key={event.id}>
                                    {renderEventCard(event)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* EMPTY STATE */}
                {activeEvents.length === 0 && (
                    <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        No active exhibitions found at the moment.
                    </div>
                )}

            </div>

            {/* PROFILE MODAL (UNCHANGED) */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white rounded-2xl w-full max-w-lg">
                        <div className="flex justify-between p-4 border-b">
                            <h3 className="font-bold">Edit Company Details</h3>
                            <button onClick={() => setShowProfileModal(false)}>
                                <X />
                            </button>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="block text-sm font-medium text-slate-700">Company Name</label>
                                <input
                                    value={editProfileForm.company_name}
                                    onChange={e =>
                                        setEditProfileForm({
                                            ...editProfileForm,
                                            company_name: e.target.value
                                        })
                                    }
                                    className="w-full border p-2 rounded"
                                />
                                <label className="block text-sm font-medium text-slate-700">Council Area</label>
                                <input
                                    value={editProfileForm.council_area}
                                    onChange={e =>
                                        setEditProfileForm({
                                            ...editProfileForm,
                                            council_area: e.target.value
                                        })
                                    }
                                    className="w-full border p-2 rounded"
                                />
                                <label className="block text-sm font-medium text-slate-700">Business Type</label>
                                <select
                                    value={editProfileForm.business_type}
                                    onChange={e =>
                                        setEditProfileForm({
                                            ...editProfileForm,
                                            business_type: e.target.value
                                        })
                                    }
                                    className="w-full border p-2 rounded">
                                    <option value="DEVELOPER">Developer</option>
                                    <option value="PUBLISHER">Publisher</option>
                                    <option value="ADVERTISER">Advertiser</option>
                                </select>
                                <label className="block text-sm font-medium text-slate-700">Contact Number</label>
                                <input
                                    type="tel"
                                    value={editProfileForm.contact_number}
                                    onChange={e =>
                                        setEditProfileForm({
                                            ...editProfileForm,
                                            contact_number: e.target.value
                                        })
                                    }
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                            <button
                                disabled={savingProfile}
                                className="w-full bg-blue-600 text-white py-2 rounded"
                            >
                                {savingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
