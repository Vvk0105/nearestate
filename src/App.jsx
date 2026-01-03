import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import ExhibitorProfileForm from './pages/exhibitor/ExhibitorProfileForm';
import VisitorHome from './pages/visitor/VisitorHome';
import EventDetailsPage from './pages/visitor/EventDetailsPage';
import ExhibitorDetailsPage from './pages/visitor/ExhibitorDetailsPage';
import MyEventsPage from './pages/visitor/MyEventsPage';
import ExhibitorHome from './pages/exhibitor/ExhibitorHome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/select-role" element={<RoleSelectionPage />} />
          <Route path="/exhibitor/profile" element={<ExhibitorProfileForm />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Visitor Routes */}
          <Route path="/visitor/home" element={<VisitorHome />} />
          <Route path="/visitor/events/:id" element={<EventDetailsPage />} />
          <Route path="/visitor/events/:eventId/exhibitors/:exhibitorId" element={<ExhibitorDetailsPage />} />
          <Route path="/visitor/my-events" element={<MyEventsPage />} />

          {/* Exhibitor Routes */}
          <Route path="/exhibitor/home" element={<ExhibitorHome />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
