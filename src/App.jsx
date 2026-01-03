import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout'; // New
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import AdminLoginPage from './pages/admin/AdminLoginPage'; // New
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import ExhibitorProfileForm from './pages/exhibitor/ExhibitorProfileForm';

import VisitorHome from './pages/visitor/VisitorHome';
import EventDetailsPage from './pages/visitor/EventDetailsPage';
import ExhibitorDetailsPage from './pages/visitor/ExhibitorDetailsPage';
import MyEventsPage from './pages/visitor/MyEventsPage';

import ExhibitorHome from './pages/exhibitor/ExhibitorHome';
import ApplyExhibitionPage from './pages/exhibitor/ApplyExhibitionPage';
import ApplicationFormPage from './pages/exhibitor/ApplicationFormPage';
import MyApplicationsPage from './pages/exhibitor/MyApplicationsPage';
import ManagePropertiesPage from './pages/exhibitor/ManagePropertiesPage';
import AddPropertyForm from './pages/exhibitor/AddPropertyForm';

import AdminDashboard from './pages/admin/AdminDashboard'; // New
import AdminEventsPage from './pages/admin/AdminEventsPage'; // New
import AdminEventDetailsPage from './pages/admin/AdminEventDetailsPage'; // New

import ProfilePage from './pages/common/ProfilePage';
import PublicHome from './pages/PublicHome';

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="events/:id" element={<AdminEventDetailsPage />} />
                <Route path="events/new" element={<div className="p-8">Create Event Form Coming Soon</div>} /> 
            </Route>
            
            <Route path="/auth/select-role" element={<RoleSelectionPage />} />

            {/* Main Application Routes */}
            <Route element={<MainLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<PublicHome />} />
              
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/auth/login" element={<LoginPage />} />
              </Route>

               {/* Protected User Routes */}
               <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/exhibitor/profile" element={<ExhibitorProfileForm />} /> 
               </Route>

              {/* Visitor Routes */}
              <Route element={<ProtectedRoute allowedRoles={['VISITOR']} />}>
                  <Route path="/visitor/home" element={<VisitorHome />} />
                  <Route path="/visitor/events/:id" element={<EventDetailsPage />} />
                  <Route path="/visitor/events/:eventId/exhibitors/:exhibitorId" element={<ExhibitorDetailsPage />} />
                  <Route path="/visitor/my-events" element={<MyEventsPage />} />
              </Route>

              {/* Exhibitor Routes */}
              <Route element={<ProtectedRoute allowedRoles={['EXHIBITOR']} />}>
                  <Route path="/exhibitor/home" element={<ExhibitorHome />} />
                  <Route path="/exhibitor/applications" element={<MyApplicationsPage />} />
                  <Route path="/exhibitor/applications/new" element={<ApplyExhibitionPage />} />
                  <Route path="/exhibitor/apply/:id" element={<ApplicationFormPage />} />
                  <Route path="/exhibitor/properties" element={<ManagePropertiesPage />} />
                  <Route path="/exhibitor/properties/new" element={<AddPropertyForm />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;
