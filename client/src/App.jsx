import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Directory from "./pages/Directory";
import Profile from "./pages/Profile";
import PdfView from "./pages/PdfView";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminContent from "./pages/AdminContent";
import AdminAlumni from "./pages/AdminAlumni";
import AdminNotices from "./pages/AdminNotices";
import AdminGallery from "./pages/AdminGallery";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import ChangePassword from "./pages/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";

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
        <Route path="/alumni/:id" element={<Profile />} />
        <Route path="/alumni/:id/pdf" element={<PdfView />} />
        <Route path="/verify/:id" element={<Verify />} />
        <Route path="/login" element={<Login />} />

        {/* Admin — protected */}
        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
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
