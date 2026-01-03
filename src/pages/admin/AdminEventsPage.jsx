import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader, Plus, Calendar, MapPin, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminEventsPage() {
    const { apiClient } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState('all'); // all, ongoing, upcoming, completed

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await apiClient.get('/exhibitions/public/exhibitions/');
            setEvents(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredEvents = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return events.filter(event => {
            const start = new Date(event.start_date);
            const end = new Date(event.end_date);

            if (filter === 'ongoing') {
                return start <= today && end >= today && event.is_active;
            } else if (filter === 'upcoming') {
                return start > today;
            } else if (filter === 'completed') {
                return end < today;
            }
            return true;
        });
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

    const filteredEvents = getFilteredEvents();

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Events Management</h1>
                <Link to="/admin/events/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg">
                    <Plus size={18} /> Create Event
                </Link>
            </div>

            {/* Filters */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
                {['all', 'ongoing', 'upcoming', 'completed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Event Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredEvents.map(event => (
                            <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900">{event.name}</div>
                                            <div className="text-xs text-slate-500">ID: {event.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-900">{new Date(event.start_date).toLocaleDateString()}</div>
                                    <div className="text-xs text-slate-500">to {new Date(event.end_date).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-slate-500">
                                        <MapPin size={16} className="mr-1" />
                                        {event.city}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {event.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/events/${event.id}`} className="text-blue-600 hover:text-blue-900">View Details</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredEvents.length === 0 && (
                    <div className="p-12 text-center text-slate-500">No events found for this filter.</div>
                )}
            </div>
        </div>
    );
}
