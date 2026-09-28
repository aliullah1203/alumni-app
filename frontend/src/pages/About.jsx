import { Users, Target, Eye, Calendar, MapPin, Globe } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import Button from "../components/Button";
import { SITE } from "../data/site.js";

const GOALS = [
  { icon: Users,    title: "Build a Network",   desc: "Connect thousands of UITS graduates across industries and geographies into a single, active community." },
  { icon: Target,   title: "Create Opportunity", desc: "Facilitate mentorship, job referrals, and collaborative ventures between alumni and current students." },
  { icon: Eye,      title: "Promote Excellence", desc: "Celebrate alumni achievements and foster a culture of lifelong learning and professional growth." },
];

const FACTS = [
  { label: "University Founded",     value: SITE.foundedDate },
  { label: "Short Name",             value: SITE.shortName },
  { label: "Association Established",value: `${SITE.established}` },
  { label: "Address",                value: SITE.address },
  { label: "Website",                value: SITE.website },
];

export default function About() {
  return (
    <PublicLayout active="About">
      <section className="banner">
        <h1>About Us</h1>
        <p>Learn about the {SITE.associationName} and our mission</p>
      </section>

      <div className="container about-page">

        {/* Who We Are */}
        <section className="about__section card">
          <h2>Who We Are</h2>
          <p>
            The <strong>{SITE.associationName}</strong> is the official alumni body of the{" "}
            <strong>{SITE.universityName} ({SITE.shortName})</strong>, bringing together graduates
            from all departments and batches under one roof.
          </p>
          <p>
            Our association was founded with a single belief: that the bonds formed during university
            life should last a lifetime. We serve as a bridge between the institution and its graduates,
            and between alumni themselves - fostering friendship, collaboration, and mutual support
            long after graduation day.
          </p>
          <p>
            Whether you graduated last year or decades ago, you are a vital part of this community.
            Together we represent the legacy and future of {SITE.shortName}.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="about__goals">
          {GOALS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="about__goal card">
              <span className="about__goal-icon"><Icon size={28} /></span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </section>

        {/* University Facts */}
        <section className="about__section card">
          <h2>Quick Facts</h2>
          <dl className="about__facts">
            {FACTS.map(({ label, value }) => (
              <div key={label} className="about__fact">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA */}
        <section className="about__cta card">
          <Calendar size={32} className="about__cta-icon" />
          <div>
            <h2>Join Our Community</h2>
            <p>If you are a {SITE.shortName} graduate and haven't registered yet, join the alumni network today.</p>
          </div>
          <div className="about__cta-actions">
            <Button to="/register" size="lg">Register Now</Button>
            <Button to="/contact" size="lg" variant="outline">Contact Us</Button>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
