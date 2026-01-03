import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader, MapPin, Building, Phone } from 'lucide-react';
import ImageCarousel from '../../components/ImageCarousel';

export default function ExhibitorDetailsPage() {
    const API_BASE = 'http://127.0.0.1:8000/';
    // ... no changes to logic ...
    const { eventId, exhibitorId } = useParams();
    const { apiClient } = useAuth();
    const [exhibitor, setExhibitor] = useState(null);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    console.log('ImageCarousel',properties);
    
    useEffect(() => {
        // ... same fetch logic ...
        const fetchData = async () => {
            try {
                const exhibitorsRes = await apiClient.get(`/exhibitions/public/exhibitions/${eventId}/exhibitors/`);
                const foundExhibitor = exhibitorsRes.data.find(e => e.id.toString() === exhibitorId);
                setExhibitor(foundExhibitor);

                const propsRes = await apiClient.get(`/exhibitions/public/exhibition/${exhibitorId}/properties/`);

                if (foundExhibitor) {
                    const userProps = propsRes.data.filter(p => p.exhibitor === foundExhibitor.user || p.exhibitor.id === foundExhibitor.user);
                    setProperties(userProps);
                }
            } catch (error) {
                console.error("Fetch details failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId, exhibitorId, apiClient]);

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;
    if (!exhibitor) return <div className="text-center p-12">Exhibitor not found.</div>;

    return (
        <div className="space-y-8">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                &larr; Back
            </button>

            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow border border-slate-200 p-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{exhibitor.company_name}</h1>
                <div className="flex flex-wrap gap-4 text-slate-600 mt-4">
                    <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm">
                        <Building size={16} /> {exhibitor.business_type}
                    </span>
                    <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm">
                        <MapPin size={16} /> {exhibitor.council_area}
                    </span>
                    <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm">
                        <Phone size={16} /> {exhibitor.contact_number}
                    </span>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Listed Properties</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map(property => (
                        <div key={property.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                            <div className="h-48 bg-slate-200 relative">
                                {property.images && property.images.length > 0 ? (
                                    <ImageCarousel
                                        images={property.images.map((img, i) => ({
                                        id: img.id,
                                        image: img.image.startsWith("http")
                                            ? img.image
                                            : `${API_BASE}${img.image}`,
                                        }))}
                                        height="h-full"
                                        rounded="rounded-none"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 font-bold">NO IMAGE</div>
                                )}
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{property.title}</h3>
                                <p className="text-slate-500 text-sm mb-3 flex items-center gap-1">
                                    <MapPin size={14} /> {property.location}
                                </p>
                                <p className="text-blue-600 font-bold mb-3">
                                    ₹{property.price_from} - ₹{property.price_to}
                                </p>
                                <p className="text-slate-600 text-sm line-clamp-3">
                                    {property.description}
                                </p>
                            </div>
                        </div>
                    ))}
                    {properties.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-500">No properties listed by this exhibitor for this event.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
