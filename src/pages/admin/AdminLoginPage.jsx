import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Lock, User } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, apiClient } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {

            const res = await apiClient.post('/auth/admin/login/', { email, password });
            const { access, user } = res.data;

            if (!user?.role=='ADMIN' && !user?.is_superuser) {
                toast.error("Access Denied. Admins only.");
                return;
            }

            login(access, user);
            navigate('/admin/dashboard');
            toast.success("Welcome Admin");

        } catch (error) {
            console.error(error);
            toast.error("Admin Login Failed. Check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Portal</h1>
                    <p className="text-slate-500 mt-2">Secure access for administrators</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-10 border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2.5"
                                placeholder="admin"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full pl-10 border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2.5"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Authenticating...' : 'Login to Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}
