import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { User, GraduationCap, Briefcase, Image, Contact, CalendarDays, Building2, Mail, Phone, MapPin, BookOpen } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import Badge from "../components/Badge";
import Button from "../components/Button";
import SocialLinks from "../components/SocialLinks";
import VerifyQR from "../components/VerifyQR";
import { getAlumnus, getDeptCode, getDeptFaculty } from "../data/alumni";

const TABS = [
  { key: "Profile", Icon: User },
  { key: "Education", Icon: GraduationCap },
  { key: "Experience", Icon: Briefcase },
  { key: "Gallery", Icon: Image },
];

export default function Profile() {
  const { id } = useParams();
  const a = getAlumnus(id);
  const [tab, setTab] = useState("Profile");
  if (!a) return <PublicLayout active="Alumni"><div className="container directory__empty">Alumni not found. <Link className="link" to="/alumni">Back to directory</Link></div></PublicLayout>;

  const faculty = getDeptFaculty(a.department);
  const rows = [
    [Contact,   "Registration No", a.id],
    [CalendarDays, "Batch",        a.batch],
    [Building2, "Department",      getDeptCode(a.department)],
    ...(faculty ? [[BookOpen, "Faculty", faculty]] : []),
    [Mail,      "Email",           a.email],
    [Phone,     "Phone",           a.phone],
    [MapPin,    "Address",         a.address],
  ];
  return (
    <PublicLayout active="Alumni" showRegister={false}>
      <div className="container profile-wrap">
        <div className="card profile">
          <div className="profile__side">
            <img className="profile__photo" src={a.photoLarge || a.photo} alt={a.name} />
            <ul className="profile__tabs">
              {TABS.map(({ key, Icon }) => (
                <li key={key}><button className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}><Icon size={17} />{key}</button></li>
              ))}
            </ul>
          </div>

          <div className="profile__main">
            <h1>{a.name} <Badge status="Active" /></h1>
            {tab === "Profile" ? (
              <>
                <dl className="profile__rows">
                  {rows.map(([Icon, k, v]) => (
                    <div key={k}><dt><Icon size={16} />{k}</dt><dd>: &nbsp;{v}</dd></div>
                  ))}
                </dl>
                <h3>About Me</h3>
                <p className="profile__about">{a.about}</p>
                <h3>Social Links</h3>
                <SocialLinks items={["facebook", "linkedin", "github", "youtube"]} size={16} itemSize={30} />
              </>
            ) : <p className="profile__about" style={{ marginTop: 24 }}>No {tab.toLowerCase()} information added yet.</p>}
          </div>

          <aside className="profile__download">
            <h3>Download Profile</h3>
            <Button to={`/alumni/${a.id}/pdf`} size="lg" block>Download PDF</Button>
            <Button variant="success" size="lg" block onClick={() => window.open(`/alumni/${a.id}/pdf?print=1`, "_blank")}>Print Profile</Button>
            <Link to={`/verify/${a.id}`} className="profile__qr" aria-label="Verify profile"><VerifyQR id={a.id} size={112} /></Link>
            <span>Scan to Verify</span>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
