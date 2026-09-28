import { Fragment } from "react";
import { Users, User, CalendarDays, Heart, Megaphone } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import Button from "../components/Button";
import StatItem from "../components/StatItem";
import { useContent } from "../context/ContentContext";
import { STATS, NOTICES } from "../data/alumni";

const STAT_ICONS = { alumni: Users, members: User, batch: CalendarDays, forever: Heart };

export default function Home() {
  const { content } = useContent();
  const [first, ...rest] = content.title.split(/\s+(?=Alumni Community)/);
  const tagline = content.description.split("|").map((s) => s.trim());
  return (
    <PublicLayout active="Home">
      <section className="hero" style={{ "--hero-image": `url(${content.banner})` }}>
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

      <section className="stats">
        <div className="container stats__grid">
          {STATS.map((s) => <StatItem key={s.key} icon={STAT_ICONS[s.key]} value={s.value} label={s.label} />)}
        </div>
      </section>

      <section className="notices" id="notice">
        <div className="container">
          <div className="notices__head">
            <h2>Latest Notice</h2>
            <a href="#notice" className="link">View All</a>
          </div>
          {NOTICES.map((n) => (
            <div className="notice" key={n.id}>
              <Megaphone className="notice__icon" size={26} />
              <div className="notice__body">
                <h3>{n.title}</h3>
                <p>{n.text}</p>
              </div>
              <time>{n.date}</time>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
