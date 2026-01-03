import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader, Plus, Trash2, Edit, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ManagePropertiesPage() {
    const { apiClient } = useAuth();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await apiClient.get('/exhibitions/exhibitor/my-properties/');
            setProperties(res.data);
        } catch (error) {
            console.error("Fetch properties failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this property?")) return;
        try {
            await apiClient.delete(`/exhibitions/exhibitor/property/${id}/`);
            toast.success("Property deleted.");
            setProperties(properties.filter(p => p.id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete property.");
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">My Properties</h1>
                <Link to="/exhibitor/properties/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
                    <Plus size={18} /> Add Property
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                    <div key={property.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="h-40 bg-slate-100 relative">
                            {property.images && property.images.length > 0 ? (
                                <img src={property.images[0].image || property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 font-bold">NO IMAGE</div>
                            )}
                            <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                {property.exhibition_name || 'Event'}
                            </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{property.title}</h3>
                            <p className="text-slate-500 text-sm flex items-center gap-1 mb-2">
                                <MapPin size={14} /> {property.location}
                            </p>
                            <p className="text-blue-600 font-bold mb-4">₹{property.price_from} - ₹{property.price_to}</p>

                            <div className="flex gap-2 mt-auto">
                                <button onClick={() => handleDelete(property.id)} className="flex-1 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 flex items-center justify-center gap-1 text-sm">
                                    <Trash2 size={16} /> Delete
                                </button>
                                {/* Edit could be added later */}
                            </div>
                        </div>
                    </div>
                ))}
                {properties.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        No properties listed. Add your first property!
                    </div>
                )}
            </div>
        </div>
    );
}
