import { Fragment, useEffect, useState } from "react";
import { Users, User, CalendarDays, Heart, Megaphone, Images } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import Button from "../components/Button";
import StatItem from "../components/StatItem";
import { useContent } from "../context/ContentContext";
import { contentApi } from "../api/content";

const STAT_ICONS = { alumni: Users, members: User, batch: CalendarDays, forever: Heart };

export default function Home() {
  const { content } = useContent();
  const [stats, setStats] = useState(null);
  const [notices, setNotices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([contentApi.getStats(), contentApi.getNotices(3), contentApi.getGallery()])
      .then(([s, n, g]) => { setStats(s.data); setNotices(n.data || []); setGallery(g.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [first, ...rest] = content.title.split(/\s+(?=Alumni Community)/);
  const tagline = content.description.split("|").map((s) => s.trim());

  const statCards = stats
    ? [
        { key: "alumni",   value: `${stats.totalAlumni}+`,       label: "Total Alumni" },
        { key: "members",  value: `${stats.registeredMembers}+`,  label: "Registered Members" },
        { key: "batch",    value: `${stats.batches}+`,            label: "Batch" },
        { key: "forever",  value: "100%",                          label: "Together Forever" },
      ]
    : [];

  return (
    <PublicLayout active="Home">
      <section className="hero" style={{ "--hero-image": content.banner ? `url(${content.banner})` : "none" }}>
        <div className="container hero__inner">
          <h1 className="hero__title">{rest.length ? <>{first}<br />{rest.join(" ")}</> : content.title}</h1>
          <p className="hero__tagline">
            {tagline.map((t, i) => (
              <Fragment key={i}>{i > 0 && <span className="hero__sep">|</span>}{t}</Fragment>
            ))}
          </p>
          <div className="hero__actions">
            <Button to="/register" size="lg">Join Now</Button>
            <Button to="/alumni" size="lg" variant="outline-light">Explore Alumni</Button>
          </div>
        </div>
      </section>

      {!loading && (
        <section className="stats">
          <div className="container stats__grid">
            {statCards.map((s) => <StatItem key={s.key} icon={STAT_ICONS[s.key]} value={s.value} label={s.label} />)}
          </div>
        </section>
      )}

      <section className="notices" id="notice">
        <div className="container">
          <div className="notices__head">
            <h2>Latest Notice</h2>
            <Link to="/notices" className="link">View All</Link>
          </div>
          {notices.length === 0 && !loading && <p style={{ color: "var(--text-muted)" }}>No notices at this time.</p>}
          {notices.map((n) => (
            <Link to="/notices" key={n.id} className="notice notice--link">
              <Megaphone className="notice__icon" size={26} />
              <div className="notice__body">
                <h3>{n.title}</h3>
                <p>{n.text}</p>
              </div>
              <time>{new Date(n.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</time>
            </Link>
          ))}
        </div>
      </section>

      <section className="gallery-section" id="gallery">
        <div className="container">
          <div className="notices__head">
            <h2><Images size={22} style={{ marginRight: 8, verticalAlign: "middle" }} />Photo Gallery</h2>
            <Link to="/gallery" className="link">View All</Link>
          </div>
          {!loading && gallery.length === 0 && (
            <p style={{ color: "var(--text-muted)" }}>No gallery photos yet.</p>
          )}
          {gallery.length > 0 && (
            <div className="gallery__grid">
              {gallery.slice(0, 6).map((item) => (
                <Link to="/gallery" key={item.id} className="gallery__item gallery__item--link">
                  <img src={item.imageUrl} alt={item.title || "Gallery photo"} loading="lazy" />
                  {item.title && <span style={{ display: "block", fontSize: 13, color: "var(--text-muted)", padding: "8px 12px" }}>{item.title}</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
