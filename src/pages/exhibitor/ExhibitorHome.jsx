import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EventCard from '../../components/EventCard';
import { ArrowRight, Loader, Info, Edit, Building2, Phone, MapPin, Briefcase, Save, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ExhibitorHome() {
    const { apiClient, user } = useAuth(); // Assuming 'user' has some basic info or we fetch profile
    const [events, setEvents] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Profile State
    const [profile, setProfile] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState({});
    const [savingProfile, setSavingProfile] = useState(false);

    // Query param check removed as My Profile now opens UserProfileModal globally

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventsRes, appsRes, profileRes] = await Promise.all([
                    apiClient.get('/exhibitions/public/exhibitions/'),
                    apiClient.get('/exhibitions/exhibitor/my-applications/'),
                    apiClient.get('/exhibitions/exhibitor/profile/status/') // Assuming this returns profile data or we have another endpoint
                ]);

                setEvents(eventsRes.data);
                setMyApplications(appsRes.data);

                // If profile exists, set it
                if (profileRes.data.exists) {
                    // Fetch full profile details if status doesn't give it all. 
                    // Based on previous code, endpoint might be different for fetching details.
                    // Let's assume GET /exhibitions/exhibitor/profile/ returns details if it exists.
                    // Or we just use what we have. If previous code posted to /profile/, maybe GET works too.
                    try {
                        const detailRes = await apiClient.get('/exhibitions/exhibitor/profile/');
                        setProfile(detailRes.data);
                    } catch (e) {
                        // ignore if get not allowed, but usually is
                    }
                }

            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [apiClient]);

    const getApplicationStatus = (eventId) => {
        const app = myApplications.find(a => a.exhibition.id === eventId || a.exhibition === eventId);
        return app ? app.status : null;
    };

    // Profile Edit Handlers
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
            // Use PATCH since we are editing existing profile
            const res = await apiClient.patch('/exhibitions/exhibitor/profile/', editProfileForm);
            setProfile(res.data);
            toast.success("Profile updated successfully!");
            setShowProfileModal(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

    const activeEvents = events.filter(e => e.is_active && new Date(e.end_date) >= new Date());

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Dashboard Header & Profile Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Building2 size={120} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 relative z-10">Welcome, {profile?.company_name || 'Exhibitor'}!</h1>
                    <p className="text-indigo-200 mb-6 relative z-10 max-w-md">Manage your event applications and property listings all in one place.</p>

                    <div className="flex flex-wrap gap-4 relative z-10">
                        {profile && (
                            <button
                                onClick={openProfileModal}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
                            >
                                <Edit size={16} /> Edit Company Details
                            </button>
                        )}
                        <Link to="/exhibitor/properties" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all">
                            Manage Properties <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 flex items-center gap-2"><Info size={16} /> Active Events</span>
                            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">{activeEvents.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 flex items-center gap-2"><Briefcase size={16} /> Applications</span>
                            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">{myApplications.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event List */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-8 bg-blue-600 rounded-full block"></span>
                    Available Exhibitions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeEvents.map(event => {
                        const status = getApplicationStatus(event.id);
                        const actionButton = status === 'APPROVED' ? (
                            <Link
                                to="/exhibitor/properties"
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200 hover:bg-green-100 transition-colors"
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
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                                View Details & Apply <ArrowRight size={16} />
                            </Link>
                        );

                        return (
                            <div key={event.id}>
                                <EventCard event={event} action={actionButton} />
                            </div>
                        );
                    })}
                    {activeEvents.length === 0 && (
                        <div className="col-span-full text-center py-16 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            No active exhibitions found at the moment.
                        </div>
                    )}
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Building2 className="text-blue-600" size={20} /> Edit Company Details
                            </h3>
                            <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-1 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleProfileUpdate} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                                    <input
                                        type="text" required
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={editProfileForm.company_name}
                                        onChange={(e) => setEditProfileForm({ ...editProfileForm, company_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Council Area</label>
                                    <input
                                        type="text" required
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={editProfileForm.council_area}
                                        onChange={(e) => setEditProfileForm({ ...editProfileForm, council_area: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Number</label>
                                    <input
                                        type="text" required
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={editProfileForm.contact_number}
                                        onChange={(e) => setEditProfileForm({ ...editProfileForm, contact_number: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Business Type</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={editProfileForm.business_type}
                                        onChange={(e) => setEditProfileForm({ ...editProfileForm, business_type: e.target.value })}
                                    >
                                        <option value="DEVELOPER">Real Estate Developer</option>
                                        <option value="BROKER">Real Estate Agent / Broker</option>
                                        <option value="LOAN">Mortgage / Loan Provider</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={savingProfile} className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-colors disabled:opacity-70">
                                        {savingProfile ? 'Saving...' : 'Save Changes'}
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
