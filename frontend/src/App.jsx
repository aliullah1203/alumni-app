import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Directory from "./pages/Directory";
import Profile from "./pages/Profile";
import PdfView from "./pages/PdfView";
import Verify from "./pages/Verify";
import Login from "./pages/admin/Login";
import ChangePassword from "./pages/admin/ChangePassword";
import Dashboard from "./pages/admin/Dashboard";
import AdminContent from "./pages/admin/Content";
import AdminAlumni from "./pages/admin/Alumni";
import AdminNotices from "./pages/admin/Notices";
import AdminGallery from "./pages/admin/Gallery";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import AlumniLogin from "./pages/alumni/Login";
import SetupPassword from "./pages/alumni/SetupPassword";
import ForgotPassword from "./pages/alumni/ForgotPassword";
import ResetPassword from "./pages/alumni/ResetPassword";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function AdminGuard({ children, requireAdmin }) {
  return <ProtectedRoute requireAdmin={requireAdmin}>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/alumni" element={<Directory />} />
        <Route path="/alumni/login" element={<AlumniLogin />} />
        <Route path="/alumni/setup-password" element={<SetupPassword />} />
        <Route path="/alumni/forgot-password" element={<ForgotPassword />} />
        <Route path="/alumni/reset-password" element={<ResetPassword />} />
        <Route path="/alumni/:id" element={<Profile />} />
        <Route path="/alumni/:id/pdf" element={<PdfView />} />
        <Route path="/verify/:id" element={<Verify />} />
        <Route path="/login" element={<Login />} />

        {/* Admin — protected */}
        <Route path="/admin" element={<AdminGuard><Dashboard /></AdminGuard>} />
        <Route path="/admin/change-password" element={<AdminGuard><ChangePassword /></AdminGuard>} />
        <Route path="/admin/alumni" element={<AdminGuard><AdminAlumni /></AdminGuard>} />
        <Route path="/admin/content" element={<AdminGuard><AdminContent /></AdminGuard>} />
        <Route path="/admin/gallery" element={<AdminGuard><AdminGallery /></AdminGuard>} />
        <Route path="/admin/notices" element={<AdminGuard><AdminNotices /></AdminGuard>} />
        <Route path="/admin/users" element={<AdminGuard requireAdmin><AdminUsers /></AdminGuard>} />
        <Route path="/admin/settings" element={<AdminGuard requireAdmin><AdminSettings /></AdminGuard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
