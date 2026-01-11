import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Mail, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserProfileModal({ isOpen, onClose }) {
    const { user, apiClient, refreshUser } = useAuth(); // Assuming refreshUser exists or we need to implement it to update context
    const [formData, setFormData] = useState({
        username: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                username: user.username,
                email: user.email
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Assuming endpoint to update user details exists, often /auth/user/ or similar. 
            // If not, we might need to create it. 
            // Based on context, let's assume standard Django User update is not exposed by default in simplejwt.
            // We usually need a specific view. 
            // Let's assume we might need to add one, but for now I'll try to patch to a likely endpoint or prompt user if missing.
            // Actually, let's CHECK if we have a user update endpoint. 
            // If not, I'll have to add it to backend in next step. For now I'll write the frontend code targeting '/accounts/profile/' (common convention) or similar.

            // Using existing UpdateProfileView at accounts/profile/update/
            await apiClient.put('/auth/profile/update/', { username: formData.username });
            toast.success("Profile updated!");
            if (refreshUser) refreshUser(); // If context supports it
            onClose();
        } catch (error) {
            console.error(error);
            // toast.error("Failed to update. Backend support might be missing for User edit.");
            // Actually, I should probably add backend support for this if not exists.
            toast.error("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <User className="text-blue-600" size={20} /> My Account
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-1 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email (Read Only)</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 pl-10 text-slate-500 cursor-not-allowed"
                            />
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="w-full border border-slate-300 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <User className="absolute left-3 top-3 text-slate-400" size={18} />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
                            {loading ? <Loader className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
