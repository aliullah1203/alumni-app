import { Facebook, Linkedin, Youtube, Github } from "lucide-react";

const ICONS = {
  facebook: [Facebook, ""],
  linkedin: [Linkedin, "in"],
  youtube:  [Youtube,  "yt"],
  github:   [Github,   "gh"],
};

export default function SocialLinks({ links = {}, size = 14, itemSize = 26 }) {
  const entries = Object.entries(ICONS).filter(([k]) => links[k]);
  if (!entries.length) return <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No social links added.</p>;
  return (
    <div className="social">
      {entries.map(([k, [Icon, mod]]) => (
        <a key={k} href={links[k]} target="_blank" rel="noreferrer" aria-label={k}
          className={`social__item${mod ? ` social__item--${mod}` : ""}`}
          style={{ width: itemSize, height: itemSize }}>
          <Icon size={size} fill={k === "youtube" || k === "facebook" ? "currentColor" : "none"} strokeWidth={k === "youtube" ? 1.5 : 2} />
        </a>
      ))}
    </div>
  );
}
