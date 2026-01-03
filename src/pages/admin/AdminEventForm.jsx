import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Upload, X, MapPin, Calendar, Layout, Hash } from 'lucide-react';

export default function AdminEventForm() {
    const { apiClient } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const mapInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]); // Array of File
    const [mapImage, setMapImage] = useState(null); // Single File

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
        visitor_capacity: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            setImages([...images, ...Array.from(e.target.files)]);
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        if (mapImage) data.append('map_image', mapImage);
        images.forEach(img => data.append('images', img));

        try {
            await apiClient.post('/exhibitions/admin/exhibitions/create/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Event Created Successfully!");
            navigate('/admin/events');
        } catch (error) {
            console.error(error);
            toast.error("Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Create New Event</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Basic Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Event Name</label>
                        <input type="text" required name="name" onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea required name="description" rows={4} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>

                {/* Date & Location */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Calendar size={20} /> Date & Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Start Date</label>
                            <input type="date" required name="start_date" onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">End Date</label>
                            <input type="date" required name="end_date" onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Venue</label>
                            <input type="text" required name="venue" onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">City</label>
                            <input type="text" required name="city" onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">State</label>
                            <input type="text" required name="state" onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Country</label>
                            <input type="text" required name="country" onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                    </div>
                </div>

                {/* Capacity */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Hash size={20} /> Capacity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Booth Capacity</label>
                            <input type="number" required name="booth_capacity" onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Visitor Capacity</label>
                            <input type="number" required name="visitor_capacity" onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm py-2 px-3" />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Layout size={20} /> Images</h3>

                    {/* Map Image */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Map/Banner Image</label>
                        <div
                            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer"
                            onClick={() => mapInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={mapInputRef}
                                onChange={e => setMapImage(e.target.files[0])}
                                accept="image/*"
                            />
                            {mapImage ? (
                                <p className="text-sm text-green-600 font-bold">{mapImage.name}</p>
                            ) : (
                                <div className="text-slate-500">
                                    <Upload className="mx-auto h-8 w-8 mb-2" />
                                    <span>Click to upload Map/Banner</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gallery Images */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Event Gallery Images (Multiple)</label>
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

                        {/* Preview */}
                        {images.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-4">
                                {images.map((file, idx) => (
                                    <div key={idx} className="relative w-24 h-24 bg-slate-100 rounded-lg overflow-hidden border">
                                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
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

                <div className="pt-4 border-t">
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {loading ? 'Creating Event...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
