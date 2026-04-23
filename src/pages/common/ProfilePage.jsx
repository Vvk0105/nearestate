import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader, Save, User, Trash2, AlertTriangle, Building2, Edit3, ArrowLeftRight, Store, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { apiClient, user, setUser, logout, switchRole, selectRole } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [switchLoading, setSwitchLoading] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '' });

    // Exhibitor company profile
    const isExhibitor = user?.role === 'EXHIBITOR' || user?.active_role === 'EXHIBITOR';
    const [companyProfile, setCompanyProfile] = useState(null);
    const [companyLoading, setCompanyLoading] = useState(false);
    const [companyForm, setCompanyForm] = useState({
        company_name: '', council_area: '', business_type: 'DEVELOPER', contact_number: ''
    });
    const [savingCompany, setSavingCompany] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ username: user.username || '', email: user.email || '' });
        }
    }, [user]);

    useEffect(() => {
        if (!isExhibitor) return;
        const fetchCompany = async () => {
            setCompanyLoading(true);
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
                console.error('Failed to fetch exhibitor profile', err);
            } finally {
                setCompanyLoading(false);
            }
        };
        fetchCompany();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExhibitor]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.put('/auth/profile/update/', { username: formData.username });
            toast.success('Profile updated successfully.');
            setUser({ ...user, username: formData.username });
        } catch (error) {
            console.error('Profile update failed', error);
            toast.error('Failed to update profile.');
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
            toast.success('Company details updated successfully!');
        } catch (err) {
            console.error('Company update failed', err);
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
            if (logout) await logout();
        } catch (error) {
            console.error('Delete account failed', error);
            toast.error('Failed to delete account.');
            setDeleteLoading(false);
        }
    };

    const handleSwitchRole = async (targetRole) => {
        if (switchLoading) return;
        setSwitchLoading(targetRole);
        try {
            const alreadyHasRole = user?.roles?.includes(targetRole);
            let response;
            if (alreadyHasRole) {
                response = await switchRole(targetRole);
            } else {
                response = await selectRole(targetRole);
            }
            if (!response) {
                toast.error('Failed to switch role. Please try again.');
                return;
            }
            toast.success(`Switched to ${targetRole.charAt(0) + targetRole.slice(1).toLowerCase()}!`);
            if (targetRole === 'EXHIBITOR') {
                if (response.profile_completed) {
                    navigate('/exhibitor/home');
                } else {
                    navigate('/exhibitor/profile');
                }
            } else if (targetRole === 'VISITOR') {
                navigate('/visitor/home');
            }
        } catch (err) {
            console.error('Role switch failed', err);
            toast.error('An error occurred while switching role.');
        } finally {
            setSwitchLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>

            {/* ── Account Details ── */}
            <div className="bg-white rounded-xl shadow border border-slate-200 p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User size={40} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{user?.username}</h2>
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">
                            {user?.active_role || user?.role}
                        </span>
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
                    <div className="pt-2">
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

            {/* ── Switch Role ── */}
            {(() => {
                const activeRole = user?.active_role || user?.role;
                const otherRole = activeRole === 'VISITOR' ? 'EXHIBITOR' : 'VISITOR';
                const alreadyHasOther = user?.roles?.includes(otherRole);
                return (
                    <div className="bg-white rounded-xl shadow border border-slate-200 p-8">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-10 w-10 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
                                <ArrowLeftRight size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Switch Role</h2>
                                <p className="text-sm text-slate-500">Change how you interact with the platform</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Current role — greyed out */}
                            <div className={`relative flex items-center gap-4 p-4 rounded-xl border-2 ${
                                activeRole === 'VISITOR'
                                    ? 'border-teal-500 bg-teal-50'
                                    : 'border-indigo-500 bg-indigo-50'
                            }`}>
                                <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${
                                    activeRole === 'VISITOR' ? 'bg-teal-100' : 'bg-indigo-100'
                                }`}>
                                    {activeRole === 'VISITOR'
                                        ? <User size={22} className="text-teal-600" />
                                        : <Store size={22} className="text-indigo-600" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold text-sm ${
                                        activeRole === 'VISITOR' ? 'text-teal-800' : 'text-indigo-800'
                                    }`}>{activeRole === 'VISITOR' ? 'Visitor' : 'Exhibitor'}</p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {activeRole === 'VISITOR' ? 'Browse & attend events' : 'Showcase & apply for booths'}
                                    </p>
                                </div>
                                <CheckCircle2 size={20} className={activeRole === 'VISITOR' ? 'text-teal-500 shrink-0' : 'text-indigo-500 shrink-0'} />
                                <span className={`absolute -top-2.5 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    activeRole === 'VISITOR' ? 'bg-teal-500 text-white' : 'bg-indigo-500 text-white'
                                }`}>Active</span>
                            </div>

                            {/* Target role — clickable */}
                            <button
                                onClick={() => handleSwitchRole(otherRole)}
                                disabled={!!switchLoading}
                                className={`relative flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 bg-white
                                    hover:border-violet-400 hover:bg-violet-50 hover:shadow-md
                                    transition-all duration-200 text-left disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                                <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    {otherRole === 'VISITOR'
                                        ? <User size={22} className="text-slate-500" />
                                        : <Store size={22} className="text-slate-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-slate-700">
                                        {otherRole === 'VISITOR' ? 'Visitor' : 'Exhibitor'}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                        {otherRole === 'VISITOR' ? 'Browse & attend events' : 'Showcase & apply for booths'}
                                    </p>
                                    {!alreadyHasOther && (
                                        <p className="text-[10px] text-violet-500 font-semibold mt-0.5">New role</p>
                                    )}
                                </div>
                                {switchLoading === otherRole
                                    ? <Loader size={18} className="animate-spin text-violet-500 shrink-0" />
                                    : <ArrowLeftRight size={18} className="text-slate-400 shrink-0" />}
                            </button>
                        </div>

                        <p className="text-xs text-slate-400 mt-4">
                            {alreadyHasOther
                                ? 'You have used both roles before. Switching is instant.'
                                : `Switching to ${otherRole === 'EXHIBITOR' ? 'Exhibitor' : 'Visitor'} will set up a new role for your account.`}
                        </p>
                    </div>
                );
            })()}

            {/* ── Company Details (Exhibitor only) ── */}
            {isExhibitor && (
                <div className="bg-white rounded-xl shadow border border-slate-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                            <Building2 size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Company Details</h2>
                            <p className="text-sm text-slate-500">Edit your exhibitor company information</p>
                        </div>
                    </div>

                    {companyLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader className="animate-spin text-blue-500" size={28} />
                        </div>
                    ) : !companyProfile ? (
                        <div className="py-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <Edit3 size={32} className="mx-auto mb-2 text-slate-400" />
                            <p className="font-medium">No company profile found.</p>
                            <p className="text-sm mt-1">Complete your exhibitor profile first.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleCompanyUpdate} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={companyForm.company_name}
                                        onChange={e => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                        placeholder="Acme Realty Pvt. Ltd."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Council Area</label>
                                    <input
                                        type="text"
                                        value={companyForm.council_area}
                                        onChange={e => setCompanyForm({ ...companyForm, council_area: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                        placeholder="Mumbai Central"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
                                    <select
                                        value={companyForm.business_type}
                                        onChange={e => setCompanyForm({ ...companyForm, business_type: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white"
                                    >
                                        <option value="DEVELOPER">Developer</option>
                                        <option value="PUBLISHER">Publisher</option>
                                        <option value="ADVERTISER">Advertiser</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                                    <input
                                        type="tel"
                                        value={companyForm.contact_number}
                                        onChange={e => setCompanyForm({ ...companyForm, contact_number: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={savingCompany}
                                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {savingCompany ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save Company Details
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* ── Danger Zone ── */}
            <div className="bg-white rounded-xl shadow border border-red-200 p-8 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
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
                    <div>
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
