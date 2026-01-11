import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Upload, X, MapPin, Calendar, Layout, Hash, Loader, Save, ArrowLeft } from 'lucide-react';

export default function AdminEditEventPage() {
    const { id } = useParams();
    const { apiClient } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const mapInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Existing Data
    const [existingImages, setExistingImages] = useState([]);
    const [removedImageIds, setRemovedImageIds] = useState([]);

    // New Data
    const [newImages, setNewImages] = useState([]);
    const [newMapImage, setNewMapImage] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        venue: '',
        city: '',
        state: '',
        country: '',
        booth_capacity: '',
        visitor_capacity: '',
        is_active: true
    });
    
    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await apiClient.get(`/exhibitions/public/exhibitions/${id}/`);
            const data = res.data;
            setFormData({
                name: data.name,
                description: data.description,
                start_date: data.start_date,
                end_date: data.end_date,
                venue: data.venue,
                city: data.city,
                state: data.state,
                country: data.country,
                booth_capacity: data.booth_capacity,
                visitor_capacity: data.visitor_capacity,
                is_active: data.is_active,
                map_image: data.map_image
            });
            setExistingImages(data.images || []);
            // setMapImage(data.map_image) - we only show preview or existing link
        } catch (error) {
            console.error("Failed to load event", error);
            toast.error("Failed to load event");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            setNewImages([...newImages, ...Array.from(e.target.files)]);
        }
    };

    const removeNewImage = (index) => {
        const images = [...newImages];
        images.splice(index, 1);
        setNewImages(images);
    };

    const removeExistingImage = (imgId) => {
        setExistingImages(existingImages.filter(img => img.id !== imgId));
        setRemovedImageIds([...removedImageIds, imgId]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        if (newMapImage) data.append('map_image', newMapImage);

        newImages.forEach(img => data.append('images', img));
        if (removedImageIds.length > 0) {
            data.append('remove_image_ids', removedImageIds.join(','));
        }

        try {
            await apiClient.put(`/exhibitions/admin/exhibitions/${id}/update/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Event Updated Successfully!");
            navigate('/admin/events');
        } catch (error) {
            console.error(error);
            toast.error("Failed to update event");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <Link to={`/admin/events/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={18} /> Back to {formData.name}
                </Link>
                <h1 className="text-3xl font-bold text-slate-900">Edit Event</h1>
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border hover:bg-slate-50">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-slate-700">Is Active</span>
                    </label>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Basic Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Event Name</label>
                        <input type="text" required name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>

                {/* Date & Location */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Calendar size={20} /> Date & Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Start Date</label>
                            <input type="date" required name="start_date" value={formData.start_date} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">End Date</label>
                            <input type="date" required name="end_date" value={formData.end_date} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Venue</label>
                            <input type="text" required name="venue" value={formData.venue} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">City</label>
                            <input type="text" required name="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">State</label>
                            <input type="text" required name="state" value={formData.state} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Country</label>
                            <input type="text" required name="country" value={formData.country} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                    </div>
                </div>

                {/* Capacity */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Hash size={20} /> Capacity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Booth Capacity</label>
                            <input type="number" required name="booth_capacity" value={formData.booth_capacity} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Visitor Capacity</label>
                            <input type="number" required name="visitor_capacity" value={formData.visitor_capacity} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Layout size={20} /> Images</h3>

                    {/* Map Image */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Update Banner/Map</label>
                        <div
                            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer"
                            onClick={() => mapInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={mapInputRef}
                                onChange={e => setNewMapImage(e.target.files[0])}
                                accept="image/*"
                            />
                            {newMapImage ? (
                                <p className="text-sm text-green-600 font-bold">{newMapImage.name}</p>
                            ) : (
                                <div className="text-slate-500">
                                    <Upload className="mx-auto h-8 w-8 mb-2" />
                                    <span>Click to upload new banner</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Current Images</label>
                            <div className="flex flex-wrap gap-4">
                                {existingImages.map((img) => (
                                    <div key={img.id} className="relative w-24 h-24 bg-slate-100 rounded-lg overflow-hidden border">
                                        <img src={img.image} alt="existing" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(img.id)}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl hover:bg-red-600"
                                            title="Delete Image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gallery Images */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Add New Images</label>
                        <div
                            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                            />
                            <div className="text-slate-500">
                                <Upload className="mx-auto h-8 w-8 mb-2" />
                                <span>Click to upload multiple images</span>
                            </div>
                        </div>

                        {/* Preview New */}
                        {newImages.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-4">
                                {newImages.map((file, idx) => (
                                    <div key={idx} className="relative w-24 h-24 bg-slate-100 rounded-lg overflow-hidden border">
                                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(idx)}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl hover:bg-red-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t flex gap-4">
                    <button type="button" onClick={() => navigate('/admin/events')} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                        {saving ? <Loader className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
