import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { User, GraduationCap, Briefcase, Image, Contact, CalendarDays, Building2, Mail, Phone, MapPin, BookOpen } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import Badge from "../components/Badge";
import Button from "../components/Button";
import SocialLinks from "../components/SocialLinks";
import VerifyQR from "../components/VerifyQR";
import { alumniApi } from "../api/alumni";

const TABS = [
  { key: "Profile", Icon: User },
  { key: "Education", Icon: GraduationCap },
  { key: "Experience", Icon: Briefcase },
  { key: "Gallery", Icon: Image },
];

export default function Profile() {
  const { id } = useParams();
  const [alumni, setAlumni] = useState(null);
  const [tab, setTab] = useState("Profile");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    alumniApi.get(id)
      .then((r) => setAlumni(r.data))
      .catch((e) => { if (e.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PublicLayout active="Alumni"><div className="container directory__empty">Loading…</div></PublicLayout>;
  if (notFound || !alumni) return (
    <PublicLayout active="Alumni">
      <div className="container directory__empty">Alumni not found. <Link className="link" to="/alumni">Back to directory</Link></div>
    </PublicLayout>
  );

  const rows = [
    [Contact,      "Registration No", alumni.registrationNo],
    [CalendarDays, "Batch",           String(alumni.batch)],
    [Building2,    "Department",      alumni.department],
    [BookOpen,     "Faculty",         alumni.faculty],
    ...(alumni.email ? [[Mail, "Email", alumni.email]] : []),
    ...(alumni.phone ? [[Phone, "Phone", alumni.phone]] : []),
    ...(alumni.address ? [[MapPin, "Address", alumni.address]] : []),
  ];

  const verifyUrl = alumni.verifyToken ? `${window.location.origin}/verify/${alumni.verifyToken}` : null;

  return (
    <PublicLayout active="Alumni" showRegister={false}>
      <div className="container profile-wrap">
        <div className="card profile">
          <div className="profile__side">
            {alumni.photoUrl && <img className="profile__photo" src={alumni.photoUrl} alt={alumni.name} />}
            <ul className="profile__tabs">
              {TABS.map(({ key, Icon }) => (
                <li key={key}><button className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}><Icon size={17} />{key}</button></li>
              ))}
            </ul>
          </div>

          <div className="profile__main">
            <h1>{alumni.name} <Badge status="Active" /></h1>
            {tab === "Profile" ? (
              <>
                <dl className="profile__rows">
                  {rows.map(([Icon, k, v]) => (
                    <div key={k}><dt><Icon size={16} />{k}</dt><dd>: &nbsp;{v}</dd></div>
                  ))}
                </dl>
                {alumni.about && <><h3>About Me</h3><p className="profile__about">{alumni.about}</p></>}
                <h3>Social Links</h3>
                <SocialLinks items={["facebook", "linkedin", "github", "youtube"]} size={16} itemSize={30} />
              </>
            ) : tab === "Education" ? (
              alumni.education?.length
                ? alumni.education.map((e, i) => (
                    <div key={i} style={{ marginTop: 16 }}>
                      <strong>{e.school}</strong>{e.degree && ` — ${e.degree}`}{e.field && ` (${e.field})`}
                      {(e.startYear || e.endYear) && <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: 8 }}>{e.startYear}–{e.endYear || "Present"}</span>}
                      {e.description && <p className="profile__about">{e.description}</p>}
                    </div>
                  ))
                : <p className="profile__about" style={{ marginTop: 24 }}>No education information added yet.</p>
            ) : tab === "Experience" ? (
              alumni.experience?.length
                ? alumni.experience.map((e, i) => (
                    <div key={i} style={{ marginTop: 16 }}>
                      <strong>{e.company}</strong> — {e.title}
                      {(e.startYear || e.endYear) && <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: 8 }}>{e.startYear}–{e.current ? "Present" : (e.endYear || "")}</span>}
                      {e.description && <p className="profile__about">{e.description}</p>}
                    </div>
                  ))
                : <p className="profile__about" style={{ marginTop: 24 }}>No experience information added yet.</p>
            ) : (
              <p className="profile__about" style={{ marginTop: 24 }}>No gallery images added yet.</p>
            )}
          </div>

          <aside className="profile__download">
            <h3>Download Profile</h3>
            <a href={alumniApi.pdfUrl(alumni.registrationNo)} download>
              <Button size="lg" block>Download PDF</Button>
            </a>
            <Button variant="success" size="lg" block onClick={() => window.open(`/alumni/${alumni.registrationNo}/pdf`, "_blank")}>Print Profile</Button>
            {verifyUrl && (
              <Link to={`/verify/${alumni.verifyToken}`} className="profile__qr" aria-label="Verify profile">
                <VerifyQR url={verifyUrl} size={112} />
              </Link>
            )}
            <span>Scan to Verify</span>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
