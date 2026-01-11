import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader, Plus, Trash2, Edit, MapPin, X, Save, Upload, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageCarousel from '../../components/ImageCarousel';

export default function ManagePropertiesPage() {
    const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL;
    const { apiClient } = useAuth();
    const [properties, setProperties] = useState([]);
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [selectedExhibitionId, setSelectedExhibitionId] = useState('');

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProp, setEditingProp] = useState(null);

    // Form States
    const [addForm, setAddForm] = useState({
        exhibition: '',
        title: '',
        description: '',
        location: '',
        price_from: '',
        price_to: '',
        images: []
    });

    // Edit Form State
    const [editForm, setEditForm] = useState({});
    const [editNewImages, setEditNewImages] = useState([]);
    const [editRemovedImageIds, setEditRemovedImageIds] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const editFileInputRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [propsRes, appsRes] = await Promise.all([
                    apiClient.get('/exhibitions/exhibitor/my-properties/'),
                    apiClient.get('/exhibitions/exhibitor/my-applications/')
                ]);
                setProperties(propsRes.data);

                // Get approved exhibitions
                const approved = appsRes.data.filter(app => app.status === 'APPROVED').map(app => ({
                    id: app.exhibition_id,
                    name: app.exhibition
                }));
                const uniqueExhibitions = Array.from(new Set(approved.map(e => e.id)))
                    .map(id => approved.find(e => e.id === id));

                setExhibitions(uniqueExhibitions);

            } catch (error) {
                console.error("Fetch failed", error);
                toast.error("Failed to load properties.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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

    // --- ADD PROPERTY LOGIC ---
    const handleAddFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + addForm.images.length > 3) {
            toast.error("Maximum 3 images total.");
            return;
        }
        setAddForm(prev => ({ ...prev, images: [...prev.images, ...files].slice(0, 3) }));
    };

    const removeAddImage = (index) => {
        setAddForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const submitAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const data = new FormData();
        data.append('exhibition', addForm.exhibition);
        data.append('title', addForm.title);
        data.append('description', addForm.description);
        data.append('location', addForm.location);
        data.append('price_from', addForm.price_from);
        data.append('price_to', addForm.price_to);
        addForm.images.forEach((img) => data.append('uploaded_images', img));

        try {
            const res = await apiClient.post(`exhibitions/exhibitor/properties/${addForm.exhibition}/create/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Property added!");

            setProperties(prev => [res.data, ...prev]);
            setShowAddModal(false);
            setAddForm({
                exhibition: '',
                title: '',
                description: '',
                location: '',
                price_from: '',
                price_to: '',
                images: []
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to list property.");
        } finally {
            setSubmitting(false);
        }
    };


    // --- EDIT PROPERTY LOGIC ---
    const startEdit = (property) => {
        setEditingProp(property);
        setEditForm({
            title: property.title,
            description: property.description,
            location: property.location,
            price_from: property.price_from,
            price_to: property.price_to
        });
        setEditNewImages([]);
        setEditRemovedImageIds([]);
    };

    const handleEditImageChange = (e) => {
        if (e.target.files) {
            // Count existing (minus removed) + new
            const currentCount = (editingProp.images?.length || 0) - editRemovedImageIds.length;
            const newCount = editNewImages.length + e.target.files.length;

            if (currentCount + newCount > 3) {
                toast.error("Maximum 3 images allowed total.");
                return;
            }
            setEditNewImages([...editNewImages, ...Array.from(e.target.files)]);
        }
    };

    const removeEditNewImage = (index) => {
        const imgs = [...editNewImages];
        imgs.splice(index, 1);
        setEditNewImages(imgs);
    };

    const removeEditExistingImage = (imgId) => {
        setEditRemovedImageIds([...editRemovedImageIds, imgId]);
    };

    const saveEdit = async () => {
        setSubmitting(true);
        const data = new FormData();
        data.append('title', editForm.title);
        data.append('description', editForm.description);
        data.append('location', editForm.location);
        data.append('price_from', editForm.price_from);
        data.append('price_to', editForm.price_to);

        editNewImages.forEach(img => data.append('images', img));
        if (editRemovedImageIds.length > 0) {
            data.append('remove_image_ids', editRemovedImageIds.join(','));
        }

        try {
            const res = await apiClient.patch(`/exhibitions/exhibitor/property/${editingProp.id}/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Property updated.");

            // Update local state
            setProperties(properties.map(p => p.id === editingProp.id ? res.data : p));
            setEditingProp(null);
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update property.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

    const filteredProperties = selectedExhibitionId
        ? properties.filter(p => p.exhibition === parseInt(selectedExhibitionId) || p.exhibition?.id === parseInt(selectedExhibitionId))
        : properties;

    return (
        <div className="space-y-8 relative animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">My Properties</h1>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-slate-300 text-slate-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                            value={selectedExhibitionId}
                            onChange={(e) => setSelectedExhibitionId(e.target.value)}
                        >
                            <option value="">All Exhibitions</option>
                            {exhibitions.map(ex => (
                                <option key={ex.id} value={ex.id}>{ex.name}</option>
                            ))}
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                        <Plus size={18} /> Add Property
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map(property => (
                    <div key={property.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="h-48 bg-slate-100 relative group">
                            {property.images && property.images.length > 0 ? (
                                <ImageCarousel
                                    images={property.images.map((img) => ({
                                        id: img.id,
                                        image: img.image.startsWith("http")
                                            ? img.image
                                            : `${MEDIA_BASE}${img.image}`,
                                    }))}
                                    height="h-full"
                                    rounded="rounded-none"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 font-bold">NO IMAGE</div>
                            )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{property.title}</h3>
                            <p className="text-slate-500 text-sm flex items-center gap-1 mb-2">
                                <MapPin size={14} /> {property.location}
                            </p>
                            <p className="text-blue-600 font-bold mb-4">₹{property.price_from} - ₹{property.price_to}</p>

                            <div className="flex gap-2 mt-auto">
                                <button onClick={() => startEdit(property)} className="flex-1 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1 text-sm font-medium transition-colors">
                                    <Edit size={16} /> Edit
                                </button>
                                <button onClick={() => handleDelete(property.id)} className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-1 text-sm font-medium transition-colors">
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredProperties.length === 0 && (
                    <div className="col-span-full text-center py-16 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        {selectedExhibitionId ? "No properties match this filter." : "No properties listed yet."}
                    </div>
                )}
            </div>

            {/* ADD PROPERTY MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                            <h3 className="text-xl font-bold text-slate-900">Add New Property</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={submitAdd} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Select Event</label>
                                    <select required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={addForm.exhibition} onChange={(e) => setAddForm({ ...addForm, exhibition: e.target.value })}>
                                        <option value="">-- Select Approved Event --</option>
                                        {exhibitions.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Property Title</label>
                                    <input type="text" required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                                    <input type="text" required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={addForm.location} onChange={e => setAddForm({ ...addForm, location: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Price From (₹)</label>
                                        <input type="number" required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={addForm.price_from} onChange={e => setAddForm({ ...addForm, price_from: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Price To (₹)</label>
                                        <input type="number" required className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={addForm.price_to} onChange={e => setAddForm({ ...addForm, price_to: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                    <textarea required rows={3} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Images (Max 3)</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {addForm.images.map((file, idx) => (
                                            <div key={idx} className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
                                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removeAddImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {addForm.images.length < 3 && (
                                            <label className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors aspect-video">
                                                <Upload className="text-slate-400 mb-1" size={24} />
                                                <span className="text-xs text-blue-600 font-medium">Upload</span>
                                                <input type="file" className="hidden" onChange={handleAddFileChange} accept="image/*" multiple />
                                            </label>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4 border-t flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-slate-700 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                                    <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-colors disabled:opacity-70">
                                        {submitting ? 'Adding...' : 'Add Property'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingProp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="sticky top-0 bg-white flex justify-between items-center mb-0 px-6 py-4 border-b z-10">
                            <h3 className="text-xl font-bold text-slate-900">Edit Property</h3>
                            <button onClick={() => setEditingProp(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Property Title</label>
                                <input name="title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Location</label>
                                <input name="location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Price From</label>
                                    <input name="price_from" type="number" value={editForm.price_from} onChange={(e) => setEditForm({ ...editForm, price_from: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Price To</label>
                                    <input name="price_to" type="number" value={editForm.price_to} onChange={(e) => setEditForm({ ...editForm, price_to: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Description</label>
                                <textarea name="description" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            {/* Image Editing */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Manage Images</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Existing Images */}
                                    {editingProp.images && editingProp.images.map(img => {
                                        // If removed, don't show
                                        if (editRemovedImageIds.includes(img.id)) return null;
                                        return (
                                            <div key={img.id} className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                                <img
                                                    src={img.image.startsWith("http") ? img.image : `${API_BASE}${img.image}`}
                                                    alt="Prop" className="w-full h-full object-cover"
                                                />
                                                <button onClick={() => removeEditExistingImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {/* New Images */}
                                    {editNewImages.map((file, idx) => (
                                        <div key={`new-${idx}`} className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                            <img src={URL.createObjectURL(file)} alt="New" className="w-full h-full object-cover" />
                                            <button onClick={() => removeEditNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Upload Button */}
                                    <label className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors aspect-video">
                                        <Upload className="text-slate-400 mb-1" size={24} />
                                        <span className="text-xs text-blue-600 font-medium">Add Image</span>
                                        <input type="file" className="hidden" ref={editFileInputRef} onChange={handleEditImageChange} accept="image/*" multiple />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t px-6 pb-6">
                            <button onClick={() => setEditingProp(null)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                            <button onClick={saveEdit} disabled={submitting} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-70">
                                {submitting ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
