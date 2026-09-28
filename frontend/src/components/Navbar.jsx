import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";
import { useAlumniAuth } from "../context/AlumniAuthContext";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Alumni", to: "/alumni" },
  { label: "Gallery", to: "/gallery" },
  { label: "Notice", to: "/notices" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar({ active, showRegister = true, showLogin = true }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { alumniUser, alumniLogout } = useAlumniAuth();
  const navigate = useNavigate();

  const handleAdminLogout = async () => { await logout(); navigate("/login"); };
  const handleAlumniLogout = async () => { await alumniLogout(); navigate("/"); };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Logo />
        <nav className={`navbar__links${open ? " is-open" : ""}`}>
          {LINKS.map((l) => (
            <NavLink key={l.label} to={l.to} end onClick={() => setOpen(false)}
              className={() => `navbar__link${active === l.label ? " is-active" : ""}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="navbar__actions">
          {user ? (
            <>
              <NavLink to="/admin" className="navbar__login">Dashboard</NavLink>
              <Button size="sm" variant="outline" onClick={handleAdminLogout}>Logout</Button>
            </>
          ) : alumniUser ? (
            <>
              <NavLink to={`/alumni/${alumniUser.registrationNo}`} className="navbar__login">My Profile</NavLink>
              <NavLink to="/alumni/settings" className="navbar__login">Settings</NavLink>
              <Button size="sm" variant="outline" onClick={handleAlumniLogout}>Logout</Button>
            </>
          ) : (
            <>
              {showLogin && <NavLink to="/alumni/login" className="navbar__login">Alumni Login</NavLink>}
              {showRegister && <Button to="/register" size="sm">Register</Button>}
            </>
          )}
        </div>
        <button className="navbar__toggle" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
