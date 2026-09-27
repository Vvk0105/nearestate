import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ScrollToTop from './components/ScrollToTop';
import AuthProvider from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import MinimalLayout from './layouts/MinimalLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// ─── Page Skeleton (shown while lazy chunks download) ─────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Loading…</span>
      </div>
    </div>
  );
}

// ─── Lazy-loaded route chunks ─────────────────────────────────────────────────
// Auth
const LoginPage           = lazy(() => import('./pages/auth/LoginPage'));
const RoleSelectionPage   = lazy(() => import('./pages/auth/RoleSelectionPage'));
const AdminLoginPage      = lazy(() => import('./pages/admin/AdminLoginPage'));
const ExhibitorProfileForm = lazy(() => import('./pages/exhibitor/ExhibitorProfileForm'));

// Public pages
const PublicHome          = lazy(() => import('./pages/PublicHome'));
const PublicEventsPage    = lazy(() => import('./pages/PublicEventsPage'));
const EventDetailsPage    = lazy(() => import('./pages/visitor/EventDetailsPage'));
const ExhibitorDetailsPage = lazy(() => import('./pages/visitor/ExhibitorDetailsPage'));
const AboutPage           = lazy(() => import('./pages/AboutPage'));

// Visitor pages
const VisitorHome         = lazy(() => import('./pages/visitor/VisitorHome'));
const MyEventsPage        = lazy(() => import('./pages/visitor/MyEventsPage'));

// Exhibitor pages
const ExhibitorHome       = lazy(() => import('./pages/exhibitor/ExhibitorHome'));
const ApplyExhibitionPage = lazy(() => import('./pages/exhibitor/ApplyExhibitionPage'));
const ApplicationFormPage = lazy(() => import('./pages/exhibitor/ApplicationFormPage'));
const CheckoutPage        = lazy(() => import('./pages/exhibitor/CheckoutPage'));
const PaymentSuccessPage  = lazy(() => import('./pages/exhibitor/PaymentSuccessPage'));
const PaymentCancelPage   = lazy(() => import('./pages/exhibitor/PaymentCancelPage'));
const MyApplicationsPage  = lazy(() => import('./pages/exhibitor/MyApplicationsPage'));
const ManagePropertiesPage = lazy(() => import('./pages/exhibitor/ManagePropertiesPage'));
const AddPropertyForm     = lazy(() => import('./pages/exhibitor/AddPropertyForm'));

// Admin pages (heaviest chunk — only loaded when user navigates to /admin)
const AdminDashboard      = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminEventsPage     = lazy(() => import('./pages/admin/AdminEventsPage'));
const AdminEventDetailsPage = lazy(() => import('./pages/admin/AdminEventDetailsPage'));
const AdminCreateEventPage = lazy(() => import('./pages/admin/AdminCreateEventPage'));
const AdminEditEventPage  = lazy(() => import('./pages/admin/AdminEditEventPage'));
const AdminQRScanPage     = lazy(() => import('./pages/admin/AdminQRScanPage'));
const AdminEventRecapPage = lazy(() => import('./pages/admin/AdminEventRecapPage'));

// Common
const ProfilePage         = lazy(() => import('./pages/common/ProfilePage'));

// ─── TanStack Query Client ────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,          // 5 min: re-renders use cached data instantly
      gcTime:    1000 * 60 * 30,          // 30 min: keep in memory after unmount
      refetchOnWindowFocus: false,        // Don't refetch when user switches tabs
      retry: 1,                           // Retry failed requests once
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <Toaster
              position="top-center"
              containerStyle={{ top: 24 }}
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '12px 18px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
                loading: { iconTheme: { primary: '#6366f1', secondary: '#ffffff' } },
              }}
            />
            <Suspense fallback={<PageSkeleton />}>
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
                  <Route path="events/:id/recap" element={<AdminEventRecapPage />} />
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
                  <Route path="/about" element={<AboutPage />} />

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
                    {/* Legacy manual-payment route (kept for backward compat) */}
                    <Route path="/exhibitor/apply/:id" element={<ApplicationFormPage />} />
                    {/* New Stripe checkout route */}
                    <Route path="/exhibitor/checkout/:id" element={<CheckoutPage />} />
                    <Route path="/exhibitor/properties" element={<ManagePropertiesPage />} />
                    <Route path="/exhibitor/properties/new" element={<AddPropertyForm />} />
                  </Route>

                  {/* ─── Stripe redirect landing pages (no auth needed) ─── */}
                  <Route path="/exhibitor/payment-success" element={<PaymentSuccessPage />} />
                  <Route path="/exhibitor/payment-cancel" element={<PaymentCancelPage />} />

                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
