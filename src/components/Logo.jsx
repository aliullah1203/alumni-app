import { Link } from "react-router-dom";
import { SITE } from "../data/site.js";

// If src/assets/uits-logo.png is placed here, it replaces the SVG emblem automatically.
// PLACEHOLDER: add the official UITS logo file at src/assets/uits-logo.png
const logoFiles = import.meta.glob("../assets/uits-logo.png", { eager: true });
const uitsLogoSrc = logoFiles["../assets/uits-logo.png"]?.default || null;

export function LogoMark({ className = "logo__mark" }) {
  if (uitsLogoSrc) {
    return <img src={uitsLogoSrc} className={className} alt={SITE.shortName} />;
  }
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22.5" fill="#fff" stroke="#c7d6f2" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18.5" fill="#123f95" />
      <path d="M24 12.5 36.5 18 24 23.5 11.5 18Z" fill="#fff" />
      <path d="M17 21.5v5.2c0 1.8 3.2 3.4 7 3.4s7-1.6 7-3.4v-5.2L24 25.6Z" fill="#dbe7ff" />
      <path d="M36.5 18v6.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 32.5c3 2.6 6.2 3.6 10 3.6s7-1 10-3.6" fill="none" stroke="#8fb2ff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({
  tagline = SITE.tagline,
  name = SITE.associationName,
  light = false,
  to = "/",
}) {
  return (
    <Link to={to} className={`logo${light ? " logo--light" : ""}`}>
      <LogoMark />
      <span>
        <span className="logo__name">{name}</span>
        {tagline && <span className="logo__tag">{tagline}</span>}
      </span>
    </Link>
  );
}
