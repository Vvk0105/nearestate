import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Mail, Save, Loader, Trash2, AlertTriangle, Building2, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserProfileModal({ isOpen, onClose }) {
    const { user, setUser, apiClient, logout } = useAuth();
    const isExhibitor = user?.active_role === 'EXHIBITOR' || user?.role === 'EXHIBITOR';

    // ── Account form ──────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({ username: '', email: '' });
    const [loading, setLoading] = useState(false);

    // ── Delete ────────────────────────────────────────────────────────────────
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ── Company (Exhibitor only) ───────────────────────────────────────────────
    const [companyProfile, setCompanyProfile] = useState(null);
    const [companyLoading, setCompanyLoading] = useState(false);
    const [companyForm, setCompanyForm] = useState({
        company_name: '', council_area: '', business_type: 'DEVELOPER', contact_number: ''
    });
    const [savingCompany, setSavingCompany] = useState(false);

    // ── Sync user into form when modal opens ──────────────────────────────────
    useEffect(() => {
        if (user && isOpen) {
            setFormData({ username: user.username || '', email: user.email || '' });
        }
    }, [user, isOpen]);

    // ── Fetch exhibitor company profile when modal opens ──────────────────────
    useEffect(() => {
        if (!isOpen || !isExhibitor) return;
        setCompanyLoading(true);
        const fetchCompany = async () => {
            try {
                const statusRes = await apiClient.get('/exhibitions/exhibitor/profile/status/');
                if (statusRes.data.exists) {
                    const detailRes = await apiClient.get('/exhibitions/exhibitor/profile/');
                    setCompanyProfile(detailRes.data);
                    setCompanyForm({
                        company_name:   detailRes.data.company_name   || '',
                        council_area:   detailRes.data.council_area   || '',
                        business_type:  detailRes.data.business_type  || 'DEVELOPER',
                        contact_number: detailRes.data.contact_number || '',
                    });
                }
            } catch (err) {
                console.error('Failed to fetch company profile', err);
            } finally {
                setCompanyLoading(false);
            }
        };
        fetchCompany();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isExhibitor]);

    if (!isOpen) return null;

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.put('/auth/profile/update/', { username: formData.username });
            // ✅ Update context directly — no reload needed
            setUser(prev => ({ ...prev, username: formData.username }));
            toast.success('Username updated!');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update username.');
        } finally {
            setLoading(false);
        }
    };

    const handleCompanyUpdate = async (e) => {
        e.preventDefault();
        setSavingCompany(true);
        try {
            const res = await apiClient.patch('/exhibitions/exhibitor/profile/', companyForm);
            setCompanyProfile(res.data);
            toast.success('Company details updated!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update company details.');
        } finally {
            setSavingCompany(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            await apiClient.delete('/auth/account/delete/');
            toast.success('Account deleted successfully.');
            onClose();
            if (logout) await logout();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete account.');
            setDeleteLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <User className="text-blue-600" size={20} /> My Account
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-1 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1">

                    {/* ── Account / Username ── */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Account Details</h4>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email (Read Only)</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 pl-10 text-slate-500 cursor-not-allowed"
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

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-colors disabled:opacity-70 flex justify-center items-center gap-2 text-sm">
                                {loading ? <Loader className="animate-spin" size={16} /> : <><Save size={16} /> Save Username</>}
                            </button>
                        </div>
                    </form>

                    {/* ── Company Details (Exhibitor only) ── */}
                    {isExhibitor && (
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                                <Building2 size={18} className="text-indigo-600" />
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Company Details</h4>
                            </div>

                            {companyLoading ? (
                                <div className="flex justify-center py-6">
                                    <Loader className="animate-spin text-indigo-500" size={24} />
                                </div>
                            ) : !companyProfile ? (
                                <div className="py-4 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <Edit3 size={24} className="mx-auto mb-1 text-slate-400" />
                                    <p className="text-sm font-medium">No company profile found.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleCompanyUpdate} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name</label>
                                            <input
                                                type="text"
                                                value={companyForm.company_name}
                                                onChange={e => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Council Area</label>
                                            <input
                                                type="text"
                                                value={companyForm.council_area}
                                                onChange={e => setCompanyForm({ ...companyForm, council_area: e.target.value })}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Business Type</label>
                                            <select
                                                value={companyForm.business_type}
                                                onChange={e => setCompanyForm({ ...companyForm, business_type: e.target.value })}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                <option value="DEVELOPER">Developer</option>
                                                <option value="PUBLISHER">Publisher</option>
                                                <option value="ADVERTISER">Advertiser</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Number</label>
                                            <input
                                                type="tel"
                                                value={companyForm.contact_number}
                                                onChange={e => setCompanyForm({ ...companyForm, contact_number: e.target.value })}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={savingCompany}
                                        className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-colors disabled:opacity-70 flex justify-center items-center gap-2 text-sm mt-2"
                                    >
                                        {savingCompany ? <Loader className="animate-spin" size={16} /> : <><Save size={16} /> Save Company Details</>}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ── Danger Zone ── */}
                    <div className="px-6 py-4 bg-red-50/50">
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
                                        <p className="text-red-700 text-xs mt-1">This cannot be undone. All your data will be permanently removed.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading} className="flex-1 py-2 bg-white border border-red-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm">
                                        Cancel
                                    </button>
                                    <button onClick={handleDeleteAccount} disabled={deleteLoading} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex justify-center items-center gap-2 text-sm">
                                        {deleteLoading ? <Loader className="animate-spin" size={16} /> : 'Yes, Delete Account'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
