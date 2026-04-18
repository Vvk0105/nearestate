import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Store, ArrowRight, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoleSelectionPage() {
    const { selectRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const nextPath = location.state?.next || null;

    const handleSelectRole = async (role) => {
        try {
            const response = await selectRole(role);
            if (!response) {
                toast.error("Failed to update role. Please try again.");
                return;
            }

            if (role === 'VISITOR') {
                // If user came via "Login to Register" flow, send them back to the event
                navigate(nextPath || '/visitor/home');
                toast.success('Welcome, Visitor!');
            } else if (role === 'EXHIBITOR') {
                // Use profile_completed from backend response
                if (response.profile_completed) {
                    navigate('/exhibitor/home');
                    toast.success("Welcome back to your Dashboard!");
                } else {
                    navigate('/exhibitor/profile');
                    toast.success("Please complete your exhibitor profile.");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during role selection.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto animate-fade-in-up">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 mb-4 tracking-tight">
                    Welcome to NearEstate
                </h1>
                <p className="text-lg text-slate-500 max-w-lg mx-auto">
                    Please select how you would like to continue. You can switch roles later from your profile.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4">
                {/* Visitor Card */}
                <button
                    onClick={() => handleSelectRole('VISITOR')}
                    className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 
                     hover:shadow-2xl hover:border-teal-500 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="h-24 w-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors">
                        <User className="h-10 w-10 text-teal-600" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-teal-700 transition-colors">I am a Visitor</h3>
                    <p className="text-slate-500 text-center mb-8 leading-relaxed">
                        I want to explore upcoming exhibitions, view property details, and manage my event pass.
                    </p>

                    <div className="mt-auto flex items-center text-teal-600 font-semibold group-hover:translate-x-1 transition-transform">
                        Continue as Visitor <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </button>

                {/* Exhibitor Card */}
                <button
                    onClick={() => handleSelectRole('EXHIBITOR')}
                    className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 
                     hover:shadow-2xl hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                        <Store className="h-10 w-10 text-indigo-600" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-indigo-700 transition-colors">I am an Exhibitor</h3>
                    <p className="text-slate-500 text-center mb-8 leading-relaxed">
                        I want to showcase my properties, manage inquiries, and connect with potential buyers.
                    </p>

                    <div className="mt-auto flex items-center text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                        Continue as Exhibitor <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </button>
            </div>

            <div className="mt-12 text-center text-sm text-slate-400">
                <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
        </div>
    );
}
