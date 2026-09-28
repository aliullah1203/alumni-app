import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Directory from "./pages/Directory";
import Profile from "./pages/Profile";
import PdfView from "./pages/PdfView";
import Verify from "./pages/Verify";
import AdminDashboard from "./pages/AdminDashboard";
import AdminContent from "./pages/AdminContent";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/alumni" element={<Directory />} />
        <Route path="/alumni/:id" element={<Profile />} />
        <Route path="/alumni/:id/pdf" element={<PdfView />} />
        <Route path="/verify/:id" element={<Verify />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
