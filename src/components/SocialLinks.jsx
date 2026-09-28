import { Facebook, Twitter, Linkedin, Youtube, Github } from "lucide-react";

const ICONS = { facebook: [Facebook, ""], twitter: [Twitter, "tw"], linkedin: [Linkedin, "in"], youtube: [Youtube, "yt"], github: [Github, "gh"] };

export default function SocialLinks({ items = ["facebook", "twitter", "linkedin", "youtube"], size = 14, itemSize = 26 }) {
  return (
    <div className="social">
      {items.map((k) => {
        const [Icon, mod] = ICONS[k];
        return (
          <a key={k} href="#" aria-label={k} className={`social__item${mod ? ` social__item--${mod}` : ""}`} style={{ width: itemSize, height: itemSize }}>
            <Icon size={size} fill={k === "youtube" || k === "facebook" ? "currentColor" : "none"} strokeWidth={k === "youtube" ? 1.5 : 2} />
          </a>
        );
      })}
    </div>
  );
}
