import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader, Save, User, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { apiClient, user, setUser, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.put('/auth/profile/update/', { username: formData.username });
            toast.success("Profile updated successfully.");
            setUser({ ...user, username: formData.username });
            
        } catch (error) {
            console.error("Profile update failed", error);
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
            if (logout) await logout();
        } catch (error) {
            console.error("Delete account failed", error);
            toast.error("Failed to delete account.");
            setDeleteLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>

            <div className="bg-white rounded-xl shadow border border-slate-200 p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User size={40} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{user?.username}</h2>
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{user?.role}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email Address</label>
                        <input
                            type="email"
                            disabled
                            value={formData.email}
                            className="mt-1 block w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-white rounded-xl shadow border border-red-200 p-8 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                
                {!showDeleteConfirm ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
                                <AlertTriangle size={24} /> Danger Zone
                            </h2>
                            <p className="text-slate-600 mt-1">
                                Permanently delete your account and all associated data. This action is irreversible.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-6 py-2.5 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-200 flex items-center justify-center gap-2 shrink-0"
                        >
                            <Trash2 size={20} /> Delete My Account
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <h2 className="text-xl font-bold text-red-700 flex items-center gap-2 mb-2">
                            <AlertTriangle size={24} /> Are you absolutely sure?
                        </h2>
                        <p className="text-slate-700 mb-6">
                            This action cannot be undone. All your bookings, history, and profile data will be permanently removed.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleteLoading}
                                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {deleteLoading ? <Loader className="animate-spin" size={20} /> : 'Yes, Permanently Delete My Account'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
