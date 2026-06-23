import { Fragment, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Repeat, Home, Calendar, QrCode, Shield, Menu, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import Footer from '../components/Footer';
import UserProfileModal from '../components/UserProfileModal';

export default function MainLayout() {
    const { user, logout, switchRole, selectRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const closeMobile = () => setMobileOpen(false);

    const handleSwitchRole = async () => {
        closeMobile();
        if (!user) return;
        const targetRole = user.role === 'VISITOR' ? 'EXHIBITOR' : 'VISITOR';

        let response = null;
        if (user.roles && user.roles.includes(targetRole)) {
            response = await switchRole(targetRole);
        } else {
            response = await selectRole(targetRole);
        }

        if (response) {
            if (targetRole === 'VISITOR') {
                navigate('/visitor/home');
                toast.success('Switched to Visitor');
            } else {
                if (response.profile_completed) {
                    navigate('/exhibitor/home');
                    toast.success('Switched to Exhibitor');
                } else {
                    navigate('/exhibitor/profile');
                    toast.success('Please complete your exhibitor profile');
                }
            }
        }
    };

    const isActive = (path) => location.pathname.startsWith(path);

    // ── Nav link definitions per role ──────────────────────────────────────────
    const visitorLinks = [
        { to: '/visitor/home',      icon: Home,     label: 'Home' },
        { to: '/visitor/my-events', icon: QrCode,   label: 'My Events' },
    ];

    const exhibitorLinks = [
        { to: '/exhibitor/home',         icon: Home,     label: 'Dashboard' },
        { to: '/exhibitor/applications', icon: Calendar, label: 'My Applications' },
        { to: '/exhibitor/properties',   icon: Home,     label: 'My Properties' },
    ];

    const activeLinks =
        user?.role === 'VISITOR'  ? visitorLinks  :
        user?.role === 'EXHIBITOR' ? exhibitorLinks : [];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">

            {/* ── Top Nav ─────────────────────────────────────────────────────── */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">

                        {/* Logo + Desktop Links */}
                        <div className="flex items-center gap-6">
                            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMobile}>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    NearEstate
                                </span>
                            </Link>

                            {/* Desktop nav links */}
                            {user && activeLinks.length > 0 && (
                                <div className="hidden md:flex space-x-1">
                                    {activeLinks.map(({ to, icon: Icon, label }) => (
                                        <Link
                                            key={to}
                                            to={to}
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                                isActive(to)
                                                    ? 'bg-slate-100 text-blue-600'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Icon size={16} /> {label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Admin desktop link */}
                            {user?.role === 'ADMIN' && (
                                <div className="hidden md:flex">
                                    <Link
                                        to="/admin/dashboard"
                                        className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <Shield size={16} className="text-blue-600" /> Admin Panel
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Right side: user menu + mobile burger */}
                        <div className="flex items-center gap-2">
                            {!user ? (
                                <Link
                                    to="/auth/login"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
                                >
                                    Login
                                </Link>
                            ) : (
                                /* Desktop user dropdown */
                                <HeadlessMenu as="div" className="relative hidden md:block">
                                    <HeadlessMenu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center gap-2 p-1 border border-slate-200 hover:bg-slate-50 transition-colors">
                                        <span className="sr-only">Open user menu</span>
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <User size={18} />
                                        </div>
                                        <span className="hidden lg:block font-medium text-slate-700 pr-1 max-w-[120px] truncate">
                                            {user.username || 'User'}
                                        </span>
                                        <ChevronDown size={14} className="text-slate-400 mr-1" />
                                    </HeadlessMenu.Button>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <HeadlessMenu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                            <div className="px-4 py-3 border-b border-slate-100">
                                                <p className="text-xs text-slate-400">Signed in as</p>
                                                <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700 capitalize">
                                                    {user.role?.toLowerCase()}
                                                </span>
                                            </div>

                                            <HeadlessMenu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => setIsProfileModalOpen(true)}
                                                        className={`${active ? 'bg-slate-50' : ''} flex w-full text-left px-4 py-2 text-sm text-slate-700 items-center gap-2`}
                                                    >
                                                        <User size={15} /> My Profile
                                                    </button>
                                                )}
                                            </HeadlessMenu.Item>

                                            {user.role === 'ADMIN' ? (
                                                <HeadlessMenu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => navigate('/admin/dashboard')}
                                                            className={`${active ? 'bg-slate-50' : ''} flex w-full text-left px-4 py-2 text-sm text-blue-600 items-center gap-2 font-semibold`}
                                                        >
                                                            <Shield size={15} /> Admin Panel
                                                        </button>
                                                    )}
                                                </HeadlessMenu.Item>
                                            ) : (
                                                <HeadlessMenu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={handleSwitchRole}
                                                            className={`${active ? 'bg-slate-50' : ''} flex w-full text-left px-4 py-2 text-sm text-slate-700 items-center gap-2`}
                                                        >
                                                            <Repeat size={15} />
                                                            Switch to {user.role === 'VISITOR' ? 'Exhibitor' : 'Visitor'}
                                                        </button>
                                                    )}
                                                </HeadlessMenu.Item>
                                            )}

                                            <HeadlessMenu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => { logout(); navigate('/'); }}
                                                        className={`${active ? 'bg-red-50' : ''} flex w-full text-left px-4 py-2 text-sm text-red-600 items-center gap-2`}
                                                    >
                                                        <LogOut size={15} /> Sign out
                                                    </button>
                                                )}
                                            </HeadlessMenu.Item>
                                        </HeadlessMenu.Items>
                                    </Transition>
                                </HeadlessMenu>
                            )}

                            {/* Mobile burger — always visible when logged in OR on small screens */}
                            {user && (
                                <button
                                    onClick={() => setMobileOpen(!mobileOpen)}
                                    className="md:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                    aria-label="Toggle mobile menu"
                                >
                                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Mobile Drawer ──────────────────────────────────────────────── */}
                {mobileOpen && user && (
                    <div className="md:hidden border-t border-slate-100 bg-white animate-slide-down shadow-lg">
                        {/* User info */}
                        <div className="px-4 py-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <User size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{user.username || 'User'}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700 capitalize">
                                    {user.role?.toLowerCase()}
                                </span>
                            </div>
                        </div>

                        {/* Nav links */}
                        <div className="px-2 py-2 space-y-0.5">
                            {activeLinks.map(({ to, icon: Icon, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={closeMobile}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                        isActive(to)
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon size={18} /> {label}
                                </Link>
                            ))}

                            {user.role === 'ADMIN' && (
                                <Link
                                    to="/admin/dashboard"
                                    onClick={closeMobile}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                                >
                                    <Shield size={18} /> Admin Panel
                                </Link>
                            )}

                            {/* Profile */}
                            <button
                                onClick={() => { setIsProfileModalOpen(true); closeMobile(); }}
                                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <User size={18} /> My Profile
                            </button>

                            {/* Switch role */}
                            {user.role !== 'ADMIN' && (
                                <button
                                    onClick={handleSwitchRole}
                                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Repeat size={18} />
                                    Switch to {user.role === 'VISITOR' ? 'Exhibitor' : 'Visitor'}
                                </button>
                            )}

                            {/* Sign out */}
                            <button
                                onClick={() => { logout(); navigate('/'); closeMobile(); }}
                                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={18} /> Sign out
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* ── Page Content ─────────────────────────────────────────────── */}
            <main className="max-w-8xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
                <Outlet />
            </main>

            <Footer />
            <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        </div>
    );
}
