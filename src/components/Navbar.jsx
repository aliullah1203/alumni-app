import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import Button from "./Button";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/#about" },
  { label: "Alumni", to: "/alumni" },
  { label: "Gallery", to: "/#gallery" },
  { label: "Notice", to: "/#notice" },
  { label: "Contact", to: "/#contact" },
];

export default function Navbar({ active, showRegister = true, showLogin = true }) {
  const [open, setOpen] = useState(false);
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
          {showLogin && <NavLink to="/admin" className="navbar__login">Login</NavLink>}
          {showRegister && <Button to="/register" size="sm">Register</Button>}
        </div>
        <button className="navbar__toggle" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
