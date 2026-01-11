import { Fragment } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Repeat, Home, Calendar, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { Menu, Transition } from '@headlessui/react';
import Footer from '../components/Footer';
import UserProfileModal from '../components/UserProfileModal';
import { useState } from 'react';

export default function MainLayout() {
    const { user, logout, switchRole, selectRole, apiClient } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSwitchRole = async () => {
        if (!user) return;
        const targetRole = user.role === 'VISITOR' ? 'EXHIBITOR' : 'VISITOR';

        let success = false;
        // If user already has the role, just switch. Otherwise, select (add) logic.
        if (user.roles && user.roles.includes(targetRole)) {
            success = await switchRole(targetRole);
        } else {
            success = await selectRole(targetRole);
        }

        if (success) {
            if (targetRole === 'VISITOR') {
                navigate('/visitor/home');
                toast.success("Switched to Visitor");
            } else {
                // Check if profile exists
                try {
                    const statusRes = await apiClient.get('/exhibitions/exhibitor/profile/status/');
                    if (statusRes.data.exists) {
                        navigate('/exhibitor/home');
                        toast.success("Switched to Exhibitor");
                    } else {
                        navigate('/exhibitor/profile');
                        toast.success("Please complete your exhibitor profile");
                    }
                } catch (err) {
                    console.error("Profile check failed", err);
                    navigate('/exhibitor/profile');
                }
            }
        }
    };

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleProfileClick = () => {
        if (user.role === 'EXHIBITOR') {
            // Check if they want to edit user details or company details?
            // User requested "My Profile" (in navbar) to be for USERNAME/EMAIL edit.
            // Exhibitor Dashboard "Edit Company Details" is for COMPANY info.
            // So "My Profile" in navbar should ALWAYS be for User Profile Modal?
            // User said: "My Profile (ProfilePage)... i need as a model too".
            // Let's make "My Profile" in navbar open UserProfileModal for EVERYONE.
            // And Exhibitor Dashboard has the separate "Edit Company Details" button.
            setIsProfileModalOpen(true);
        } else {
            setIsProfileModalOpen(true);
        }
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
                                    <Link
                                        to="/exhibitor/applications"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/exhibitor/applications') ? 'bg-slate-100 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                                    >
                                        <Calendar size={18} /> My Applications
                                    </Link>
                                    <Link
                                        to="/exhibitor/properties"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/exhibitor/properties') ? 'bg-slate-100 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                                    >
                                        <Home size={18} /> My Properties
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {!user ? (
                                <Link to="/auth/login" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm">
                                    Login
                                </Link>
                            ) : (
                                <Menu as="div" className="ml-3 relative">
                                    <div>
                                        <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center gap-2 p-1 border border-slate-200 hover:bg-slate-50 transition-colors">
                                            <span className="sr-only">Open user menu</span>
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <User size={18} />
                                            </div>
                                            <span className="hidden md:block font-medium text-slate-700 pr-2">{user.username || 'User'}</span>
                                        </Menu.Button>
                                    </div>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                            <div className="px-4 py-3 border-b border-slate-100">
                                                <p className="text-sm">Signed in as</p>
                                                <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                                                <p className="text-xs text-slate-500 capitalize">{user.role?.toLowerCase()}</p>
                                            </div>

                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleProfileClick}
                                                        className={`${active ? 'bg-slate-50' : ''} block w-full text-left px-4 py-2 text-sm text-slate-700 flex items-center gap-2`}
                                                    >
                                                        <User size={16} /> My Profile
                                                    </button>
                                                )}
                                            </Menu.Item>

                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleSwitchRole}
                                                        className={`${active ? 'bg-slate-50' : ''} block w-full text-left px-4 py-2 text-sm text-slate-700 flex items-center gap-2`}
                                                    >
                                                        <Repeat size={16} />
                                                        Switch to {user.role === 'VISITOR' ? 'Exhibitor' : 'Visitor'}
                                                    </button>
                                                )}
                                            </Menu.Item>

                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => {
                                                            logout();
                                                            navigate('/');
                                                        }}
                                                        className={`${active ? 'bg-slate-50' : ''} block w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2`}
                                                    >
                                                        <LogOut size={16} /> Sign out
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-8xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
                <Outlet />
            </main>

            <Footer />
            <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        </div>
    );
}
