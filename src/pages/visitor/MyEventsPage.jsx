import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader, QrCode as QrIcon, Calendar, CheckCircle, MapPin } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function MyEventsPage() {
    const { apiClient, loading: authLoading } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, completed
    const [selectedQr, setSelectedQr] = useState(null); // For modal

    useEffect(() => {
        // Wait for auth to complete before fetching data
        if (authLoading) return;

        const fetchRegistrations = async () => {
            try {
                // API: visitor/my-registrations/ (Needs to be implemented in backend if not exists, but urls main listing says yes)
                // urls.py: path("visitor/my-registrations/", VisitorMyRegistrationsView.as_view()),
                const res = await apiClient.get('/exhibitions/visitor/my-registrations/');
                setRegistrations(res.data);
            } catch (error) {
                console.error("Fetch registrations failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRegistrations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading]);

    const now = new Date();
    const filteredRegistrations = registrations.filter(reg => {
        const start = new Date(reg.start_date);
        const end = new Date(reg.end_date);

        if (filter === 'upcoming') return start > now;
        if (filter === 'ongoing') return start <= now && end >= now;
        if (filter === 'completed') return end < now;
        return true;
    });

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-slate-900">My Registrations</h1>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {['all', 'upcoming', 'ongoing', 'completed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${filter === f
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRegistrations.map(reg => (
                    <div key={reg.event_id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-900 line-clamp-1" title={reg.event_name}>{reg.event_name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${reg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {reg.is_active ? 'Active' : 'Archived'}
                            </span>
                        </div>

                        <div className="text-sm text-slate-600 space-y-2 mb-6 flex-1">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-blue-500" />
                                <span>{new Date(reg.start_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-red-500" />
                                <span>{reg.city}, {reg.venue}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedQr(reg)}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <QrIcon size={18} /> View Entry Pass
                        </button>
                    </div>
                ))}
                {filteredRegistrations.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        No events found in this category.
                    </div>
                )}
            </div>

            {/* QR Modal */}
            {selectedQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedQr(null)}
                >
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{selectedQr.event_name}</h2>
                            <p className="text-slate-500 text-sm mt-1">Visitor Entry Pass</p>
                        </div>

                        <div className="flex justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-inner">
                            <div style={{ height: "auto", margin: "0 auto", maxWidth: "100%", width: "100%" }}>
                                <QRCode
                                    size={256}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    value={selectedQr.qr_code}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        </div>

                        <div className="text-sm text-slate-600">
                            <p className="font-medium">Scan this code at the entrance.</p>
                            <p className="text-xs text-slate-400 mt-2">ID: {selectedQr.qr_code}</p>
                        </div>

                        <button
                            onClick={() => setSelectedQr(null)}
                            className="w-full py-3 rounded-xl bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
