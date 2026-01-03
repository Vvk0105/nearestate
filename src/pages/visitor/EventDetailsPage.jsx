import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Calendar, Users, Store, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EventDetailsPage() {
    const { id } = useParams();
    const { apiClient } = useAuth();
    const [event, setEvent] = useState(null);
    const [exhibitors, setExhibitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details'); // details, exhibitors
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false); // Check if already registered?

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, exhibitorRes] = await Promise.all([
                    apiClient.get(`/exhibitions/public/exhibitions/${id}/`),
                    apiClient.get(`/exhibitions/public/exhibitions/${id}/exhibitors/`)
                ]);
                setEvent(eventRes.data);
                setExhibitors(exhibitorRes.data);
                // Check registration status? API doesn't seem to have "am i registered" easily 
                // without fetching "my-registrations". 
                // We will just let them try to register or handle duplicate gracefully.
            } catch (error) {
                console.error("Failed to fetch event details", error);
                toast.error("Failed to load event details.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, apiClient]);

    const handleRegister = async () => {
        setRegistering(true);
        try {
            await apiClient.post(`/exhibitions/visitor/register/${id}/`);
            toast.success("Successfully registered! Check My Events for QR Code.");
            setIsRegistered(true);
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message === "Already registered") {
                toast("You are already registered.", { icon: 'ℹ️' });
                setIsRegistered(true);
            } else {
                toast.error("Registration failed. Please try again.");
            }
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;
    if (!event) return <div className="text-center p-12">Event not found.</div>;

    return (
        <div className="space-y-8">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                &larr; Back
            </button>

            {/* Header/Banner */}
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg bg-slate-900">
                {event.map_image ? (
                    <img src={event.map_image} alt={event.name} className="w-full h-full object-cover opacity-80" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <span className="text-6xl font-black opacity-20">EVENT BANNER</span>
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 sm:p-8 text-white">
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{event.name}</h1>
                    <div className="flex flex-wrap gap-4 text-sm sm:text-base text-slate-200">
                        <span className="flex items-center gap-1"><Calendar size={18} /> {new Date(event.start_date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MapPin size={18} /> {event.city}, {event.venue}</span>
                    </div>
                </div>
            </div>

            {/* Actions & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Event Details
                    </button>
                    <button
                        onClick={() => setActiveTab('exhibitors')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'exhibitors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Exhibitors ({exhibitors.length})
                    </button>
                </div>

                {/* Register Button */}
                <button
                    onClick={handleRegister}
                    disabled={registering}
                    className={`px-6 py-2.5 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 ${isRegistered
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {isRegistered ? (
                        <><CheckCircle size={20} /> Registered</>
                    ) : (
                        <>{registering ? 'Registering...' : 'Register for Event'}</>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow border border-slate-200 p-6 min-h-[300px]">
                {activeTab === 'details' && (
                    <div className="prose prose-slate max-w-none">
                        <h3 className="text-xl font-bold mb-4">About this Event</h3>
                        <p className="whitespace-pre-line text-slate-600">{event.description}</p>

                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-2">Venue Details</h4>
                                <p className="text-slate-600">{event.venue}</p>
                                <p className="text-slate-600">{event.city}, {event.state}</p>
                                <p className="text-slate-600">{event.country}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-2">Capacity</h4>
                                <p className="text-slate-600">Booths: {event.booth_capacity}</p>
                                <p className="text-slate-600">Expected Visitors: {event.visitor_capacity}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'exhibitors' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exhibitors.map(exhibitor => (
                            <Link
                                key={exhibitor.id}
                                to={`/visitor/events/${id}/exhibitors/${exhibitor.id}`}
                                className="block group"
                            >
                                <div className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer h-full">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Store size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-blue-600">{exhibitor.company_name}</h4>
                                            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">{exhibitor.business_type}</span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        <p className="line-clamp-2">Council: {exhibitor.council_area}</p>
                                        <p className="mt-2 text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Properties →
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {exhibitors.length === 0 && (
                            <p className="text-slate-500 col-span-full">No exhibitors listed yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
