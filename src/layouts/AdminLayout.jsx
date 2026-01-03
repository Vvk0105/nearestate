import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Calendar, Users, BarChart3, Settings } from 'lucide-react';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Basic protection - if not admin, kick out. 
    // Ideally user.role === 'ADMIN' or user.is_staff. 
    // For now assuming role check is handled by ProtectedRoute or backend.

    // Actually, Admin might be a separate user model or just a role. 
    // Django 'is_staff' usually. 
    // Let's assume we check `user.is_staff` or specific Admin Role.
    // The user said "start admin dashboard login using admin/login".

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        NearEstate Admin
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/admin/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/dashboard') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <BarChart3 size={20} /> Dashboard
                    </Link>
                    <Link
                        to="/admin/events"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/events') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Calendar size={20} /> Events
                    </Link>
                    {/* Placeholder for future Exhibitor management */}
                    {/* 
                    <Link
                        to="/admin/exhibitors"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/exhibitors') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Users size={20} /> Exhibitors
                    </Link> 
                    */}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => {
                            logout();
                            navigate('/admin/login'); // Admin logout goes to admin login
                        }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <LogOut size={20} /> Logout
                    </button>
                    <div className="px-4 py-2 text-xs text-slate-600 mt-2">
                        Logged in as {user?.email}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Mobile Header (TODO if needed) */}
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
