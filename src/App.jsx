import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

import ScrollToTop from './components/ScrollToTop';
import AuthProvider from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import MinimalLayout from './layouts/MinimalLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import ExhibitorProfileForm from './pages/exhibitor/ExhibitorProfileForm';

// Public (guest-accessible) pages
import PublicHome from './pages/PublicHome';
import PublicEventsPage from './pages/PublicEventsPage';
import EventDetailsPage from './pages/visitor/EventDetailsPage';
import ExhibitorDetailsPage from './pages/visitor/ExhibitorDetailsPage';

// Visitor-only pages (require login)
import VisitorHome from './pages/visitor/VisitorHome';
import MyEventsPage from './pages/visitor/MyEventsPage';

// Exhibitor-only pages
import ExhibitorHome from './pages/exhibitor/ExhibitorHome';
import ApplyExhibitionPage from './pages/exhibitor/ApplyExhibitionPage';
import ApplicationFormPage from './pages/exhibitor/ApplicationFormPage';
import MyApplicationsPage from './pages/exhibitor/MyApplicationsPage';
import ManagePropertiesPage from './pages/exhibitor/ManagePropertiesPage';
import AddPropertyForm from './pages/exhibitor/AddPropertyForm';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminEventDetailsPage from './pages/admin/AdminEventDetailsPage';
import AdminCreateEventPage from './pages/admin/AdminCreateEventPage';
import AdminEditEventPage from './pages/admin/AdminEditEventPage';
import AdminQRScanPage from './pages/admin/AdminQRScanPage';

import ProfilePage from './pages/common/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* ─── Admin Routes ─── */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="events/new" element={<AdminCreateEventPage />} />
              <Route path="events/:id" element={<AdminEventDetailsPage />} />
              <Route path="events/:id/edit" element={<AdminEditEventPage />} />
              <Route path="scan" element={<AdminQRScanPage />} />
            </Route>

            {/* ─── Minimal Layout (No Nav) ─── */}
            <Route element={<MinimalLayout />}>
              <Route path="/auth/select-role" element={<RoleSelectionPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/exhibitor/profile" element={<ExhibitorProfileForm />} />
              </Route>
            </Route>

            {/* ─── Main Application Layout ─── */}
            <Route element={<MainLayout />}>

              {/* ══ PUBLIC ROUTES — no login required ══
                  Apple Guideline 5.1.1(v): browsing is public;
                  login is only required at the point of registration/booking. */}
              <Route path="/" element={<PublicHome />} />
              <Route path="/events" element={<PublicEventsPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/events/:id/exhibitors/:exhibitorId" element={<ExhibitorDetailsPage />} />

              {/* ─── Auth Routes ─── */}
              <Route element={<AuthLayout />}>
                <Route path="/auth/login" element={<LoginPage />} />
              </Route>

              {/* ─── Protected (any logged-in user) ─── */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* ─── Visitor-only routes ─── */}
              <Route element={<ProtectedRoute allowedRoles={['VISITOR']} />}>
                <Route path="/visitor/home" element={<VisitorHome />} />
                {/* Keep old event URLs working for existing deep-links & role-based nav */}
                <Route path="/visitor/events/:id" element={<EventDetailsPage />} />
                <Route path="/visitor/events/:eventId/exhibitors/:exhibitorId" element={<ExhibitorDetailsPage />} />
                <Route path="/visitor/my-events" element={<MyEventsPage />} />
              </Route>

              {/* ─── Exhibitor-only routes ─── */}
              <Route element={<ProtectedRoute allowedRoles={['EXHIBITOR']} requireProfile={true} />}>
                <Route path="/exhibitor/home" element={<ExhibitorHome />} />
                <Route path="/exhibitor/events/:id" element={<EventDetailsPage />} />
                <Route path="/exhibitor/events/:eventId/exhibitors/:exhibitorId" element={<ExhibitorDetailsPage />} />
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
