import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Upload, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddPropertyForm() {
    const { apiClient } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [exhibitions, setExhibitions] = useState([]); // List of exhibitions user is approved for

    const [formData, setFormData] = useState({
        exhibition: '',
        title: '',
        description: '',
        location: '',
        price_from: '',
        price_to: '',
        images: [] // Array of files
    });

    useEffect(() => {
        // Fetch approved exhibitions only
        const fetchApprovedApps = async () => {
            try {
                const res = await apiClient.get('/exhibitions/exhibitor/my-applications/');
                const approved = res.data.filter(app => app.status === 'APPROVED');
                setExhibitions(approved);
            } catch (error) {
                console.error(error);
            }
        };
        fetchApprovedApps();
    }, [apiClient]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.images.length > 3) {
            toast.error("Maximum 3 images allowed.");
            return;
        }
        setFormData(prev => ({ ...prev, images: [...prev.images, ...files].slice(0, 3) }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.exhibition) {
            toast.error("Please select an exhibition.");
            return;
        }
        setLoading(true);

        const data = new FormData();
        data.append('exhibition', formData.exhibition); // Send Application ID or Exhibition ID? Standard is usually Exhibition ID if Property links to it.
        // If Backend expects Exhibition ID:
        // But Property is linked to Exhibition. User must select which event this property is for.
        // Let's assume sending exhibition ID is correct.
        // NOTE: Backend logic needs to check if user is exhibitor for that event.

        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('location', formData.location);
        data.append('price_from', formData.price_from);
        data.append('price_to', formData.price_to);

        formData.images.forEach((img) => {
            data.append('uploaded_images', img);
        });
        try {
            await apiClient.post(`exhibitions/exhibitor/properties/${formData.exhibition}/create/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Property listed successfully!");
            navigate('/exhibitor/properties');
        } catch (error) {
            console.error(error);
            toast.error("Failed to add property.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Add New Property</h1>

            <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Select Event</label>
                        <select
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={formData.exhibition}
                            onChange={(e) => setFormData({ ...formData, exhibition: e.target.value })}
                        >
                            <option value="">-- Select Approved Event --</option>
                            {exhibitions.map(app => (
                                <option key={app.exhibition_id} value={app.exhibition_id}>
                                    {app.exhibition}
                                </option>
                            ))}
                        </select>
                        {exhibitions.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">You must have an approved application to add properties.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Property Title</label>
                        <input type="text" required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Location</label>
                        <input type="text" required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Price From (₹)</label>
                            <input type="number" required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.price_from} onChange={e => setFormData({ ...formData, price_from: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Price To (₹)</label>
                            <input type="number" required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.price_to} onChange={e => setFormData({ ...formData, price_to: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea required rows={4} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Property Images (Max 3)</label>
                        <div className="grid grid-cols-3 gap-4 mb-2">
                            {formData.images.map((file, idx) => (
                                <div key={idx} className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {formData.images.length < 3 && (
                            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                    <div className="flex text-sm text-slate-600">
                                        <label htmlFor="img-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                            <span>Upload images</span>
                                            <input id="img-upload" name="img-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" multiple />
                                        </label>
                                    </div>
                                    <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => navigate(-1)} className="flex-1 py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                            {loading ? 'Saving Listing...' : 'Add Property'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
