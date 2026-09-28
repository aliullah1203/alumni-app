import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, FileEdit, Image, Bell, UserCog, Settings, LogOut, Menu, ChevronDown, CircleUser } from "lucide-react";
import { Link } from "react-router-dom";
import adminPhoto from "../assets/admin.png";
import { LogoMark } from "./Logo";
import { SITE } from "../data/site.js";
import { useAuth } from "../context/AuthContext";

const MENU = [
  { label: "Dashboard",        to: "/admin",          Icon: LayoutDashboard },
  { label: "Alumni Management",to: "/admin/alumni",   Icon: Users },
  { label: "Website Content",  to: "/admin/content",  Icon: FileEdit },
  { label: "Gallery",          to: "/admin/gallery",  Icon: Image },
  { label: "Notices",          to: "/admin/notices",  Icon: Bell },
  { label: "Users",            to: "/admin/users",    Icon: UserCog },
  { label: "Settings",         to: "/admin/settings", Icon: Settings },
  { label: "My Profile",       to: "/admin/profile",  Icon: CircleUser },
];

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="admin">
      <aside className={`admin__sidebar${open ? " is-open" : ""}`}>
        <div className="admin__brand">
          <LogoMark className="admin__brand-mark" />
          <div><strong>{SITE.shortName} Alumni</strong><span>Admin Panel</span></div>
        </div>
        <nav>
          {MENU.map(({ label, to, Icon }) => (
            <NavLink key={label} to={to} end onClick={() => setOpen(false)}
              className={({ isActive }) => `admin__item${isActive ? " is-active" : ""}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <button className="admin__item" onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </nav>
      </aside>
      {open && <div className="admin__scrim" onClick={() => setOpen(false)} />}
      <div className="admin__body">
        <div className="admin__topbar">
          <button className="admin__burger" aria-label="Toggle sidebar" onClick={() => setOpen(!open)}><Menu size={22} /></button>
          <Link to="/admin/profile" className="admin__user">
            <span className="admin__divider" />
            <img src={adminPhoto} alt="" />
            <span>{user?.name || "Admin"}</span>
            <ChevronDown size={14} />
          </Link>
        </div>
        <div className="admin__content">{children}</div>
      </div>
    </div>
  );
}
