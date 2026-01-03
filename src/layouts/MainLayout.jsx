import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Repeat, Home, Calendar, QrCode } from 'lucide-react';

export default function MainLayout() {
    const { user, logout, switchRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSwitchRole = async () => {
        if (!user) return;
        const targetRole = user.role === 'VISITOR' ? 'EXHIBITOR' : 'VISITOR';
        await switchRole(targetRole);
        if (targetRole === 'VISITOR') navigate('/visitor/home');
        else navigate('/exhibitor/home');
    };

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link to="/" className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    NearEstate
                                </span>
                            </Link>

                            {/* Desktop Nav */}
                            {user && user.role === 'VISITOR' && (
                                <div className="hidden md:flex space-x-1">
                                    <Link
                                        to="/visitor/home"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/visitor/home') ? 'bg-slate-100 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                                    >
                                        <Home size={18} /> Home
                                    </Link>
                                    <Link
                                        to="/visitor/my-events"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/visitor/my-events') ? 'bg-slate-100 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                                    >
                                        <QrCode size={18} /> My Events
                                    </Link>
                                </div>
                            )}

                            {user && user.role === 'EXHIBITOR' && (
                                <div className="hidden md:flex space-x-1">
                                    <Link
                                        to="/exhibitor/home"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/exhibitor/home') ? 'bg-slate-100 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                                    >
                                        <Home size={18} /> Dashboard
                                    </Link>
                                    {/* Add more links for exhibitor later */}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {user && (
                                <>
                                    <button
                                        onClick={handleSwitchRole}
                                        className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-2"
                                        title="Switch Role"
                                    >
                                        <Repeat size={18} />
                                        <span className="hidden sm:inline">Switch to {user.role === 'VISITOR' ? 'Exhibitor' : 'Visitor'}</span>
                                    </button>

                                    <Link to="/profile" className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors">
                                        <User size={20} />
                                    </Link>

                                    <button
                                        onClick={logout}
                                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-slate-200 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} NearEstate. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
