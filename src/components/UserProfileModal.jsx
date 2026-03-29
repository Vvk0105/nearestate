import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Mail, Save, Loader, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserProfileModal({ isOpen, onClose }) {
    const { user, apiClient, refreshUser, logout } = useAuth(); // Assuming refreshUser exists or we need to implement it to update context
    const [formData, setFormData] = useState({
        username: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

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
            // Using existing UpdateProfileView at accounts/profile/update/
            await apiClient.put('/auth/profile/update/', { username: formData.username });
            toast.success("Profile updated!");
            if (refreshUser) refreshUser(); // If context supports it
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            await apiClient.delete('/auth/account/delete/');
            toast.success("Account deleted successfully.");
            onClose();
            if (logout) await logout();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete account.");
            setDeleteLoading(false);
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

                {/* DANGER ZONE */}
                <div className="px-6 py-4 bg-red-50/50 border-t border-red-100">
                    {!showDeleteConfirm ? (
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <h4 className="font-bold text-red-800">Danger Zone</h4>
                                <p className="text-red-600 text-xs">Permanently delete your account and data.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Delete Account
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-2 items-start text-red-800">
                                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-bold">Are you absolutely sure?</p>
                                    <p className="text-red-700 text-xs mt-1">This action cannot be undone. All your data will be permanently removed.</p>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleteLoading}
                                    className="flex-1 py-2 bg-white border border-red-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteLoading}
                                    className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex justify-center items-center gap-2 text-sm"
                                >
                                    {deleteLoading ? <Loader className="animate-spin" size={16} /> : 'Yes, Delete My Account'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
