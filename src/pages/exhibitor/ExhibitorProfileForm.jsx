import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
            toast.success("Profile created successfully!");
            navigate('/exhibitor/home');
        } catch (error) {
            console.error(error);
            toast.error("Failed to save profile. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4">Exhibitor Profile</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Company Name</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Council Area</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.council_area}
                                onChange={(e) => setFormData({ ...formData, council_area: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Business Type</label>
                            <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                value={formData.business_type}
                                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                            >
                                <option value="DEVELOPER">Developer</option>
                                <option value="BROKER">Broker</option>
                                <option value="LOAN">Loan Provider</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Contact Number</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.contact_number}
                                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Continue'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
