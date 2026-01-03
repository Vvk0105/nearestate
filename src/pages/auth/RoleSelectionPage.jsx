import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Store } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoleSelectionPage() {
    const { apiClient } = useAuth();
    const navigate = useNavigate();

    const handleSelectRole = async (role) => {
        try {
            await apiClient.post('http://127.0.0.1:8000/api/auth/select-role/', { role });

            if (role === 'VISITOR') {
                navigate('/visitor/home');
                toast.success("Welcome, Visitor!");
            } else {
                try {
                    const statusRes = await apiClient.get('/exhibitions/exhibitor/profile/status/');
                    if (statusRes.data.exists) {
                        navigate('/exhibitor/home');
                        toast.success("Welcome back to your Dashboard!");
                    } else {
                        navigate('/exhibitor/profile');
                        toast.success("Please complete your exhibitor profile.");
                    }
                } catch (err) {
                    console.error("Profile status check failed", err);
                    navigate('/exhibitor/profile');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to select role.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-8">
                How would you like to continue?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Visitor Card */}
                <button
                    onClick={() => handleSelectRole('VISITOR')}
                    className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md border 
                     border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all group"
                >
                    <div className="p-4 bg-teal-50 rounded-full group-hover:bg-teal-100 mb-4 text-teal-600">
                        <User size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Visitor</h3>
                    <p className="text-slate-500 text-center text-sm">
                        Explore upcoming events, view properties, and manage your registrations.
                    </p>
                </button>

                {/* Exhibitor Card */}
                <button
                    onClick={() => handleSelectRole('EXHIBITOR')}
                    className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md border 
                     border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all group"
                >
                    <div className="p-4 bg-indigo-50 rounded-full group-hover:bg-indigo-100 mb-4 text-indigo-600">
                        <Store size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Exhibitor</h3>
                    <p className="text-slate-500 text-center text-sm">
                        Showcase your properties, manage inquiries, and connect with visitors.
                    </p>
                </button>

            </div>
        </div>
    );
}
