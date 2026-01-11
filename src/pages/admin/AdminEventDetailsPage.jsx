import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader, CheckCircle, XCircle, Users, Store, MapPin, Calendar, ArrowLeft, Info, ToggleLeft, ToggleRight, Search, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { ApprovalModal } from './ApprovalModal';

export default function AdminEventDetailsPage() {
    const { id } = useParams();
    const { apiClient } = useAuth();
    const [event, setEvent] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [exhibitorsList, setExhibitorsList] = useState([]);
    const [visitorsList, setVisitorsList] = useState([]);
    const [visitorSearch, setVisitorSearch] = useState("");

    // Modal State
    const [selectedReq, setSelectedReq] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [eventRes, requestsRes, exRes, visRes] = await Promise.all([
                apiClient.get(`/exhibitions/public/exhibitions/${id}/`),
                apiClient.get(`/exhibitions/admin/exhibitor-applications/${id}/`).catch(() => ({ data: [] })),
                apiClient.get(`/exhibitions/admin/exhibitions/${id}/exhibitors/`).catch(() => ({ data: [] })),
                apiClient.get(`/exhibitions/admin/exhibitions/${id}/visitors/`).catch(() => ({ data: [] }))
            ]);
            setEvent(eventRes.data);
            setRequests(requestsRes.data);
            setExhibitorsList(exRes.data);
            setVisitorsList(visRes.data);
        } catch (error) {
            console.error("Failed to fetch event admin details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCheckIn = async (visId) => {
        try {
            const res = await apiClient.post(`exhibitions/admin/visitors/${visId}/toggle-checkin/`);
            const updatedList = visitorsList.map(v =>
                v.id === visId ? { ...v, is_checked_in: res.data.is_checked_in } : v
            );
            setVisitorsList(updatedList);
            toast.success(`Visitor ${res.data.is_checked_in ? 'Checked In' : 'Checked Out'}`);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const handleReject = async (reqId) => {
        if (!window.confirm("Are you sure you want to reject this application?")) return;
        try {
            await apiClient.post(`exhibitions/admin/exhibitor-application/${reqId}/`, { action: 'REJECT' });
            toast.success("Application Rejected");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to reject");
        }
    };

    const openApprovalModal = (req) => {
        setSelectedReq(req);
        setShowModal(true);
    };

    const handleConfirmApproval = async (reqId, formData) => {
        try {
            await apiClient.post(`exhibitions/admin/exhibitor-application/${reqId}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Application Approved");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to approve");
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;
    if (!event) return <div className="text-center p-12">Event not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Link to="/admin/events" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={18} /> Back to Events
                </Link>
                <Link to={`/admin/events/${id}/edit`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Edit Event
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{event.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-slate-500">
                            <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(event.start_date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><MapPin size={16} /> {event.city}</span>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${event.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {event.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
                {['overview', 'requests', 'exhibitors', 'visitors'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'requests' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-900">
                        Exhibitor Applications ({requests.length})
                    </div>
                    {requests.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No pending requests found.</div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {requests.map(req => (
                                <li key={req.id} className="p-6 flex items-center justify-between hover:bg-slate-50">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-slate-900">{req.company}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{req.status}</span>
                                        </div>
                                        <p className="text-sm text-slate-500">{req.email} • ID: {req.transaction_id || 'N/A'}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {req.payment_screenshot ? (
                                                <a href={req.payment_screenshot} target="_blank" rel="noreferrer" className="text-blue-500 underline">View Payment</a>
                                            ) : 'No Proof'}
                                            {req.badge && (
                                                <span className="ml-2">• <a href={req.badge} target="_blank" rel="noreferrer" className="text-purple-500 underline">View Assigned Badge</a></span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {req.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => openApprovalModal(req)} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Approve">
                                                    <CheckCircle size={24} />
                                                </button>
                                                <button onClick={() => handleReject(req.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Reject">
                                                    <XCircle size={24} />
                                                </button>
                                            </>
                                        )}
                                        {req.status === 'APPROVED' && (
                                            <div className="text-center">
                                                <span className="block text-xs text-slate-500">Booth</span>
                                                <span className="font-bold text-slate-900">{req.booth_number}</span>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {activeTab === 'overview' && (
                <div>
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

                        {/* Event Details Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Info size={20} className="text-blue-500" /> Event Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Description</p>
                                    <p className="text-slate-800 text-sm whitespace-pre-wrap">{event.description || 'No description provided.'}</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Venue & Location</p>
                                        <p className="font-medium text-slate-900">{event.venue}</p>
                                        <p className="text-slate-700">{event.city}, {event.state}, {event.country}</p>
                                    </div>
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Start Date</p>
                                            <p className="font-medium text-slate-900">{new Date(event.start_date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">End Date</p>
                                            <p className="font-medium text-slate-900">{new Date(event.end_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'exhibitors' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-900">
                        Approved Exhibitors
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {exhibitorsList.length === 0 ? <li className="p-6 text-slate-500 text-center">No exhibitors approved yet.</li> : exhibitorsList.map(ex => (
                            <li key={ex.id} className="p-6 flex items-center justify-between hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                                        <Store size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{ex.company_name}</p>
                                        <p className="text-sm text-slate-500">{ex.email}</p>
                                        <p className="text-xs text-slate-400 mt-1">Booth: <span className="font-bold text-slate-700">{ex.booth_number}</span></p>
                                    </div>
                                </div>
                                {ex.badge && (
                                    <a href={ex.badge} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">View Badge</a>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {activeTab === 'visitors' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="font-bold text-slate-900">
                            Registered Visitors ({visitorsList.length})
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search visitor..."
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                                value={visitorSearch}
                                onChange={(e) => setVisitorSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {visitorsList.filter(v =>
                            v.name.toLowerCase().includes(visitorSearch.toLowerCase()) ||
                            v.email.toLowerCase().includes(visitorSearch.toLowerCase())
                        ).length === 0 ? (
                            <li className="p-6 text-slate-500 text-center">No visitors found.</li>
                        ) : (
                            visitorsList.filter(v =>
                                v.name.toLowerCase().includes(visitorSearch.toLowerCase()) ||
                                v.email.toLowerCase().includes(visitorSearch.toLowerCase())
                            ).map(vis => (
                                <li key={vis.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold ${vis.is_checked_in ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{vis.name}</p>
                                            <p className="text-sm text-slate-500">{vis.email}</p>
                                            <p className="text-xs text-slate-400 mt-1">QR: {vis.qr_code.substring(0, 8)}...</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleToggleCheckIn(vis.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${vis.is_checked_in
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {vis.is_checked_in ? <Check size={14} /> : null}
                                            {vis.is_checked_in ? 'Checked In' : 'Check In'}
                                        </button>
                                    </div>
                                </li>
                            )))}
                    </ul>
                </div>
            )}

            {/* Modal */}
            <ApprovalModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmApproval}
                req={selectedReq}
            />
        </div>
    );
}
