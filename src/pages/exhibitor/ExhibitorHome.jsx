import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EventCard from '../../components/EventCard';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ExhibitorHome() {
    const { apiClient } = useAuth();
    const [events, setEvents] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get all public events
                const eventsRes = await apiClient.get('/exhibitions/public/exhibitions/');

                // Get my applications to check status
                const appsRes = await apiClient.get('/exhibitions/exhibitor/my-applications/');
                setMyApplications(appsRes.data);

                // Set events
                setEvents(eventsRes.data);
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

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

    const activeEvents = events.filter(e => e.is_active && new Date(e.end_date) >= new Date());

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow p-6 border border-slate-200 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Exhibitor Dashboard</h1>
                    <p className="text-slate-600">Apply for events and manage your listings.</p>
                </div>
                {/* Maybe Profile Edit Button here later */}
            </div>

            {/* Event List */}
            <h2 className="text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">Available Exhibitions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeEvents.map(event => {
                    const status = getApplicationStatus(event.id);
                    const actionButton = status === 'APPROVED' ? (
                        <button
                            className="w-full py-2 bg-green-100 text-green-700 font-bold rounded-lg cursor-default border border-green-200"
                        >
                            Approved - Add Properties ✓
                        </button>
                    ) : status === 'PENDING' ? (
                        <button
                            className="w-full py-2 bg-yellow-100 text-yellow-700 font-bold rounded-lg cursor-default border border-yellow-200"
                        >
                            Application Pending
                        </button>
                    ) : status === 'REJECTED' ? (
                        <button
                            className="w-full py-2 bg-red-100 text-red-700 font-bold rounded-lg cursor-default border border-red-200"
                        >
                            Application Rejected
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate(`/exhibitor/apply/${event.id}`)}
                            className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Apply for Exhibition
                        </button>
                    );

                    return (
                        <div key={event.id}>
                            <EventCard event={event} action={actionButton} />
                        </div>
                    );
                })}
                {activeEvents.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No active exhibitions found.
                    </div>
                )}
            </div>
        </div>
    );
}
