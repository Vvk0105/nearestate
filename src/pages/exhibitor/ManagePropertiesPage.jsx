import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader, Plus, Trash2, Edit, MapPin, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ManagePropertiesPage() {
    const { apiClient } = useAuth();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProp, setEditingProp] = useState(null); // Property being edited
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
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
        fetchProperties();
    }, [apiClient]);

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

    const startEdit = (property) => {
        setEditingProp(property);
        setEditForm({
            title: property.title,
            description: property.description,
            location: property.location,
            price_from: property.price_from,
            price_to: property.price_to
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const saveEdit = async () => {
        try {
            // Assuming endpoint PATCH /exhibitions/exhibitor/property/:id/ exists
            // I implemented DELETE at /exhibitions/exhibitor/property/:id/
            // Standard DRF ModelViewSet supports PATCH.
            await apiClient.patch(`/exhibitions/exhibitor/property/${editingProp.id}/`, editForm);
            toast.success("Property updated.");

            // Update local state
            setProperties(properties.map(p => p.id === editingProp.id ? { ...p, ...editForm } : p));
            setEditingProp(null);
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update property.");
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-8 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">My Properties</h1>
                <Link to="/exhibitor/properties/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
                    <Plus size={18} /> Add Property
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                    <div key={property.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
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
                                <button onClick={() => startEdit(property)} className="flex-1 py-1.5 border border-blue-200 text-blue-600 rounded hover:bg-blue-50 flex items-center justify-center gap-1 text-sm font-medium transition-colors">
                                    <Edit size={16} /> Edit
                                </button>
                                <button onClick={() => handleDelete(property.id)} className="flex-1 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 flex items-center justify-center gap-1 text-sm font-medium transition-colors">
                                    <Trash2 size={16} /> Delete
                                </button>
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

            {/* Edit Modal */}
            {editingProp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-bold text-slate-900">Edit Property</h3>
                            <button onClick={() => setEditingProp(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Property Title</label>
                                <input name="title" value={editForm.title} onChange={handleEditChange} className="mt-1 w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Location</label>
                                <input name="location" value={editForm.location} onChange={handleEditChange} className="mt-1 w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Price From</label>
                                    <input name="price_from" type="number" value={editForm.price_from} onChange={handleEditChange} className="mt-1 w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Price To</label>
                                    <input name="price_to" type="number" value={editForm.price_to} onChange={handleEditChange} className="mt-1 w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Description</label>
                                <textarea name="description" rows={3} value={editForm.description} onChange={handleEditChange} className="mt-1 w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setEditingProp(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                            <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
