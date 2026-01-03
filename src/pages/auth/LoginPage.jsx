import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import toast from 'react-hot-toast';
import { Mail, ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('email');
    const [loading, setLoading] = useState(false);
    const { login, apiClient } = useAuth();
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post('/auth/email-otp/send/', { email });
            setStep('otp');
            toast.success('OTP sent to your email!');
        } catch (error) {
            toast.error('Failed to send OTP. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiClient.post('/auth/email-otp/verify/', { email, otp });
            const { access, user } = res.data;
            login(access, user);
            toast.success('Login successful!');
            navigateUser(user);
        } catch (error) {
            console.error("Login verification failed:", error);
            toast.error('Invalid OTP or Login Failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!window.google) return;

        window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: async (response) => {
                try {
                    const res = await apiClient.post("/auth/google/login/", {
                        token: response.credential,
                    });

                    const { access, user } = res.data;

                    login(access, user);
                    toast.success("Google login successful");

                    navigateUser(user);
                } catch (err) {
                    console.error(err);
                    toast.error("Google login failed");
                }
            },
        });

        window.google.accounts.id.renderButton(
            document.getElementById("google-btn"),
            {
                theme: "outline",
                size: "large",
                width: "100%",
            }
        );
    }, []);

    const navigateUser = (user) => {
        // Normalize role for check
        let role = user?.role;
        if (user?.active_role) role = user.active_role;
        else if (Array.isArray(role)) role = role[0];

        if (!role) {
            navigate('/auth/select-role');
        } else {
            if (role === 'VISITOR') navigate('/visitor/home');
            else if (role === 'EXHIBITOR') navigate('/exhibitor/home');
            else navigate('/auth/select-role');
        }
    };

    return (
        <>
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-extrabold text-slate-900">
                    Sign in
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    Access your NearEstate account
                </p>
            </div>

            <div className="space-y-6">
                {step === 'email' ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-slate-700">
                                Enter OTP
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    required
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
                        >
                            Change Email
                        </button>
                    </form>
                )}

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-500">Or continue with</span>
                    </div>
                </div>

                <div>
                    <div className="space-y-6">
                        {/* Google button renders here */}
                        <div
                            id="google-btn"
                            className="flex justify-center"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
