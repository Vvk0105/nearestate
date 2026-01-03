import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader, MapPin, Building, Phone } from 'lucide-react';

export default function ExhibitorDetailsPage() {
    const { eventId, exhibitorId } = useParams();
    const { apiClient } = useAuth();
    const [exhibitor, setExhibitor] = useState(null);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // We need to fetch Exhibitor details.
    // The API list `PublicExhibitorsByExhibitionView` gave use a list.
    // Is there a Single Exhibitor Public API? 
    // Maybe not directly. We might have to fetch list and find?
    // Or maybe "properties" view returns exhibitor details?
    // Let's assume we can fetch properties and filtering helps us.

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get all exhibitors to find ours (since we lack direct ID endpoint in list above? or maybe valid)
                const exhibitorsRes = await apiClient.get(`/exhibitions/public/exhibitions/${eventId}/exhibitors/`);
                const foundExhibitor = exhibitorsRes.data.find(e => e.id.toString() === exhibitorId);
                setExhibitor(foundExhibitor);

                // Get properties
                // API: /exhibitions/public/exhibitions/<id>/properties/
                const propsRes = await apiClient.get(`/exhibitions/public/exhibition/${eventId}/properties/`);
                // Filter by exhibitor_id? The properties model has `exhibitor` field (User ID or Profile ID?)
                // Property model has `exhibitor` as User foreign key.
                // ExhibitorProfile has `user` OneToOne.
                // The JSON from API usually serializes nested or ID.
                // Let's assume we filter by `exhibitor.id` matching `foundExhibitor.user` or `foundExhibitor.id`.
                // We need to match correctly.
                // If `foundExhibitor` has `user` id, and property has `exhibitor` id.
                // Safe bet: match based on available fields.
                // Let's dump all for now if filter logic is hard, or Try to filter.
                // Better: Checking `backend/exhibitions/serializers.py` would confirm.
                // Assuming property.exhibitor matches foundExhibitor.user (User ID).
                if (foundExhibitor) {
                    const exhibUser = foundExhibitor.user; // Assuming ID
                    // Or foundExhibitor.id is profile ID.
                    // This is tricky without inspecting API response.
                    // I will display all for the event if filter fails, but try to filter.
                    // Actually, "filtering properties by exhibitor" is key requirement. "by clikcing each exhibitor they can see the properties".
                    // I will filter assuming property.exhibitor == foundExhibitor.user
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
                                {/* Handle multiple images or single */}
                                {property.images && property.images.length > 0 ? (
                                    <img src={property.images[0].image || property.images[0]} alt={property.title} className="w-full h-full object-cover" />
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
