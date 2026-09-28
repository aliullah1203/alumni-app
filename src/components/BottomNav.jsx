import { NavLink } from "react-router-dom";
import { Home, Users, Bell, Mail } from "lucide-react";

const ITEMS = [
  { label: "Home", to: "/", Icon: Home },
  { label: "Alumni", to: "/alumni", Icon: Users },
  { label: "Notice", to: "/#notice", Icon: Bell },
  { label: "Contact", to: "/#contact", Icon: Mail },
];

/** Mobile-only bottom tab bar (reference part 9). Hidden ≥ 641px via CSS. */
export default function BottomNav({ active }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {ITEMS.map(({ label, to, Icon }) => (
        <NavLink key={label} to={to} className={`bottom-nav__item${active === label ? " is-active" : ""}`}>
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
