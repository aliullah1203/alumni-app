import SocialLinks from "./SocialLinks";
import { SITE } from "../data/site.js";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <span>{SITE.copyright}</span>
          <span style={{ display: "block", fontSize: 11, opacity: 0.7, marginTop: 2 }}>
            {SITE.address} · <a href={`https://${SITE.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>{SITE.website}</a>
          </span>
        </div>
        <SocialLinks />
      </div>
    </footer>
  );
}
