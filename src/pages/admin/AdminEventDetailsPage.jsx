import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader, CheckCircle, XCircle, Users, Store, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminEventDetailsPage() {
    const { id } = useParams();
    const { apiClient } = useAuth();
    const [event, setEvent] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, requests, exhibitors, visitors

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [eventRes, requestsRes] = await Promise.all([
                apiClient.get(`/exhibitions/public/exhibitions/${id}/`),
                apiClient.get(`/exhibitions/admin/exhibitor-applications/${id}/`).catch(() => ({ data: [] }))
            ]);
            setEvent(eventRes.data);
            setRequests(requestsRes.data);
        } catch (error) {
            console.error("Failed to fetch event admin details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId, status) => {
        try {
            await apiClient.patch(`/exhibitions/admin/applications/${applicationId}/status/`, { status });
            toast.success(`Application ${status}`);
            fetchData(); // Refresh
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;
    if (!event) return <div className="text-center p-12">Event not found</div>;

    return (
        <div className="space-y-6">
            <Link to="/admin/events" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft size={18} /> Back to Events
            </Link>

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
                                        <p className="font-bold text-slate-900">{req.company_name}</p>
                                        <p className="text-sm text-slate-500">Requested Booth: {req.booth_number || 'Any'}</p>
                                        <p className="text-xs text-slate-400 mt-1">Files: {req.payment_screenshot ? <a href={req.payment_screenshot} target="_blank" rel="noreferrer" className="text-blue-500 underline">View Payment</a> : 'None'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleStatusUpdate(req.id, 'APPROVED')} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Approve">
                                            <CheckCircle size={24} />
                                        </button>
                                        <button onClick={() => handleStatusUpdate(req.id, 'REJECTED')} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Reject">
                                            <XCircle size={24} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-slate-500 text-sm font-medium uppercase">Visitor Capacity</h3>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{event.visitor_capacity}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-slate-500 text-sm font-medium uppercase">Booth Capacity</h3>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{event.booth_capacity}</p>
                    </div>
                </div>
            )}

            {/* Placeholders for other tabs */}
            {(activeTab === 'exhibitors' || activeTab === 'visitors') && (
                <div className="bg-white p-12 text-center text-slate-500 border border-slate-200 rounded-xl border-dashed">
                    List functionality coming soon.
                </div>
            )}
        </div>
    );
}
