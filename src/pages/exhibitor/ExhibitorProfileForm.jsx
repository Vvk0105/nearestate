import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Phone, MapPin, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExhibitorProfileForm() {
    const { apiClient } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        company_name: '',
        council_area: '',
        business_type: 'DEVELOPER', // Default
        contact_number: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post('/exhibitions/exhibitor/profile/', formData);
            toast.success("Profile setup complete! Welcome aboard.");
            // Slight delay to allow toast to be visible
            setTimeout(() => {
                navigate('/exhibitor/home');
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save profile. Please check your inputs.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white text-center">
                    <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Setup Exhibitor Profile</h2>
                    <p className="mt-2 text-blue-100 opacity-90">
                        Tell us a bit about your business to get started.
                    </p>
                </div>

                <div className="px-8 py-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Building2 size={16} className="text-slate-400" /> Company Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Acme Properties Ltd."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-400" /> Council Area
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Sydney CBD"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.council_area}
                                    onChange={(e) => setFormData({ ...formData, council_area: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Phone size={16} className="text-slate-400" /> Contact Number
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="+61 400 000 000"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.contact_number}
                                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Briefcase size={16} className="text-slate-400" /> Business Type
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                        value={formData.business_type}
                                        onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                                    >
                                        <option value="DEVELOPER">Real Estate Developer</option>
                                        <option value="BROKER">Real Estate Agent / Broker</option>
                                        <option value="LOAN">Mortgage / Loan Provider</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-4 px-6 border border-transparent rounded-xl shadow-lg 
                                 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>Processing...</>
                                ) : (
                                    <>Complete Setup <ArrowRight size={20} /></>
                                )}
                            </button>
                            <p className="text-center text-xs text-slate-400 mt-4">
                                Your information will be securely stored and visible to event organizers.
                            </p>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
