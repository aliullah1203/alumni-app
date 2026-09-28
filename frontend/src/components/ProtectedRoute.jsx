import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.mustChangePassword && location.pathname !== "/admin/change-password") {
    return <Navigate to="/admin/change-password" replace />;
  }
  if (requireAdmin && user.role !== "ADMIN") {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
