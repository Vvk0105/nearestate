import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Store, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoleSelectionPage() {
    const { selectRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const nextPath = location.state?.next || null;

    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleConfirmRole = async () => {
        if (!selectedRole || loading) return;
        setLoading(true);
        try {
            const response = await selectRole(selectedRole);
            if (!response) {
                toast.error("Failed to update role. Please try again.");
                return;
            }

            if (selectedRole === 'VISITOR') {
                navigate(nextPath || '/visitor/home');
                toast.success('Welcome, Visitor!');
            } else if (selectedRole === 'EXHIBITOR') {
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
        } finally {
            setLoading(false);
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
                    onClick={() => setSelectedRole('VISITOR')}
                    className={`group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border-2 
                     transition-all duration-300 transform hover:-translate-y-1 overflow-hidden
                     ${selectedRole === 'VISITOR'
                        ? 'border-teal-500 shadow-2xl ring-2 ring-teal-200'
                        : 'border-slate-200 hover:shadow-2xl hover:border-teal-400'}`}
                >
                    {/* Selected checkmark badge */}
                    {selectedRole === 'VISITOR' && (
                        <div className="absolute top-3 right-3">
                            <CheckCircle2 className="h-6 w-6 text-teal-500 fill-teal-50" />
                        </div>
                    )}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ opacity: selectedRole === 'VISITOR' ? 1 : undefined }}
                    ></div>

                    <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-6 transition-colors
                        ${selectedRole === 'VISITOR' ? 'bg-teal-100' : 'bg-teal-50 group-hover:bg-teal-100'}`}>
                        <User className="h-10 w-10 text-teal-600" />
                    </div>

                    <h3 className={`text-2xl font-bold mb-3 transition-colors
                        ${selectedRole === 'VISITOR' ? 'text-teal-700' : 'text-slate-800 group-hover:text-teal-700'}`}>
                        I am a Visitor
                    </h3>
                    <p className="text-slate-500 text-center mb-8 leading-relaxed">
                        I want to explore upcoming exhibitions, view property details, and manage my event pass.
                    </p>

                    <div className={`mt-auto flex items-center font-semibold transition-transform group-hover:translate-x-1
                        ${selectedRole === 'VISITOR' ? 'text-teal-600' : 'text-teal-500'}`}>
                        Continue as Visitor <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </button>

                {/* Exhibitor Card */}
                <button
                    onClick={() => setSelectedRole('EXHIBITOR')}
                    className={`group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border-2 
                     transition-all duration-300 transform hover:-translate-y-1 overflow-hidden
                     ${selectedRole === 'EXHIBITOR'
                        ? 'border-indigo-500 shadow-2xl ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:shadow-2xl hover:border-indigo-400'}`}
                >
                    {/* Selected checkmark badge */}
                    {selectedRole === 'EXHIBITOR' && (
                        <div className="absolute top-3 right-3">
                            <CheckCircle2 className="h-6 w-6 text-indigo-500 fill-indigo-50" />
                        </div>
                    )}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ opacity: selectedRole === 'EXHIBITOR' ? 1 : undefined }}
                    ></div>

                    <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-6 transition-colors
                        ${selectedRole === 'EXHIBITOR' ? 'bg-indigo-100' : 'bg-indigo-50 group-hover:bg-indigo-100'}`}>
                        <Store className="h-10 w-10 text-indigo-600" />
                    </div>

                    <h3 className={`text-2xl font-bold mb-3 transition-colors
                        ${selectedRole === 'EXHIBITOR' ? 'text-indigo-700' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                        I am an Exhibitor
                    </h3>
                    <p className="text-slate-500 text-center mb-8 leading-relaxed">
                        I want to showcase my properties, manage inquiries, and connect with potential buyers.
                    </p>

                    <div className={`mt-auto flex items-center font-semibold transition-transform group-hover:translate-x-1
                        ${selectedRole === 'EXHIBITOR' ? 'text-indigo-600' : 'text-indigo-500'}`}>
                        Continue as Exhibitor <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </button>
            </div>

            {/* Next button — only appears after a role is selected */}
            <div className={`mt-10 flex flex-col items-center gap-3 transition-all duration-300
                ${selectedRole ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <button
                    onClick={handleConfirmRole}
                    disabled={!selectedRole || loading}
                    className={`inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-bold text-lg
                        shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-60
                        ${selectedRole === 'VISITOR'
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-teal-200'
                            : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-indigo-200'
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Setting up...
                        </>
                    ) : (
                        <>
                            Continue
                            <ArrowRight className="h-5 w-5" />
                        </>
                    )}
                </button>
                <p className="text-sm text-slate-400">
                    Selected: <span className="font-medium text-slate-600 capitalize">{selectedRole?.toLowerCase()}</span>
                </p>
            </div>

            <div className="mt-8 text-center text-sm text-slate-400">
                <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
        </div>
    );
}
