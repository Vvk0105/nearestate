import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { publicApiClient } from '../../context/AuthContext';
import { MapPin, Building, Phone } from 'lucide-react';
import ImageCarousel from '../../components/ImageCarousel';
import FullPageLoader from '../../components/FullPageLoader';

export default function ExhibitorDetailsPage() {
    const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL;
    // Public route uses :id, role-based routes use :eventId — read both and use whichever is defined
    const { id, eventId: eventIdParam, exhibitorId } = useParams();
    const eventId = eventIdParam ?? id;
    const [exhibitor, setExhibitor] = useState(null);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ✅ Uses publicApiClient — no auth token required.
        // Exhibitor profiles and property listings are public content
        // that guests can browse freely (Apple Guideline 5.1.1v).
        const fetchData = async () => {
            try {
                const exhibitorsRes = await publicApiClient.get(
                    `/exhibitions/public/exhibitions/${eventId}/exhibitors/`
                );
                const foundExhibitor = exhibitorsRes.data.find(
                    e => e.id.toString() === exhibitorId
                );
                setExhibitor(foundExhibitor);

                const propsRes = await publicApiClient.get(
                    `/exhibitions/public/exhibition/${exhibitorId}/properties/`
                );
                setProperties(propsRes.data);
            } catch (error) {
                console.error('Fetch details failed', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId, exhibitorId]);

    if (loading) return <FullPageLoader message="Loading exhibitor details..." />;

    if (!exhibitor) return (
        <div className="text-center p-12 text-slate-500 font-medium">
            Exhibitor not found.
        </div>
    );

    return (
        <div className="space-y-8">
            <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
                &larr; Back
            </button>

            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow border border-slate-200 p-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {exhibitor.company_name}
                </h1>
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
                    <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm">
                        Booth: {exhibitor.booth_number}
                    </span>
                </div>
            </div>

            {/* Listed Properties */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Listed Properties</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map(property => (
                        <div
                            key={property.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all"
                        >
                            <div className="h-48 bg-slate-200 relative">
                                {property.images && property.images.length > 0 ? (
                                    <ImageCarousel
                                        images={property.images.map((img) => ({
                                            id: img.id,
                                            image: img.image.startsWith('http')
                                                ? img.image
                                                : `${MEDIA_BASE}${img.image}`,
                                        }))}
                                        height="h-full"
                                        rounded="rounded-none"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 font-bold">
                                        NO IMAGE
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    {property.title}
                                </h3>
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
                            <p className="text-slate-500">
                                No properties listed by this exhibitor for this event.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
