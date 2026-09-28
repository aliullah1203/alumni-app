import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { User, GraduationCap, Briefcase, Image, Contact, CalendarDays, Building2, Mail, Phone, MapPin, BookOpen, Pencil, X, Check } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import Badge from "../components/Badge";
import Button from "../components/Button";
import FormField from "../components/FormField";
import SocialLinks from "../components/SocialLinks";
import VerifyQR from "../components/VerifyQR";
import { alumniApi } from "../api/alumni";
import { alumniAuthApi } from "../api/alumniAuth";
import { useAlumniAuth } from "../context/AlumniAuthContext";

const TABS = [
  { key: "Profile", Icon: User },
  { key: "Education", Icon: GraduationCap },
  { key: "Experience", Icon: Briefcase },
  { key: "Gallery", Icon: Image },
];

const SOCIAL_KEYS = ["facebook", "linkedin", "github", "youtube"];

export default function Profile() {
  const { id } = useParams();
  const { alumniUser } = useAlumniAuth();
  const [alumni, setAlumni] = useState(null);
  const [tab, setTab] = useState("Profile");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    alumniApi.get(id)
      .then((r) => setAlumni(r.data))
      .catch((e) => { if (e.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id]);

  const isOwn = alumniUser && alumni && alumniUser.alumniId === alumni.id;

  const startEdit = () => {
    setDraft({
      about: alumni.about || "",
      phone: alumni.phone || "",
      address: alumni.address || "",
      showContact: alumni.showContact ?? false,
      socialLinks: alumni.socialLinks || {},
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setSaveError("");
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setSaveError(""); };

  const handlePhotoChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { setSaveError("Photo must be under 2 MB"); return; }
    setPhotoFile(f);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaveError(""); setSaving(true);
    try {
      const fd = new FormData();
      const data = {
        about: draft.about,
        phone: draft.phone,
        address: draft.address,
        showContact: draft.showContact,
        socialLinks: draft.socialLinks,
      };
      fd.append("data", JSON.stringify(data));
      if (photoFile) fd.append("photo", photoFile);

      const r = await alumniAuthApi.updateProfile(fd);
      setAlumni((prev) => ({ ...prev, ...r.data }));
      setEditing(false);
    } catch (err) {
      setSaveError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

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
    ...(alumni.email   ? [[Mail,  "Email",   alumni.email]]   : []),
    ...(alumni.phone   ? [[Phone, "Phone",   alumni.phone]]   : []),
    ...(alumni.address ? [[MapPin,"Address", alumni.address]] : []),
  ];

  const verifyUrl = alumni.verifyToken ? `${window.location.origin}/verify/${alumni.verifyToken}` : null;

  return (
    <PublicLayout active="Alumni" showRegister={false}>
      <div className="container profile-wrap">
        <div className="card profile">
          <div className="profile__side">
            {(photoPreview || alumni.photoUrl) && (
              <img className="profile__photo" src={photoPreview || alumni.photoUrl} alt={alumni.name} />
            )}
            {editing && (
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <label className="link" style={{ fontSize: 13, cursor: "pointer" }}>
                  Change Photo
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhotoChange} />
                </label>
              </div>
            )}
            <ul className="profile__tabs">
              {TABS.map(({ key, Icon }) => (
                <li key={key}>
                  <button className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}>
                    <Icon size={17} />{key}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="profile__main">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0 }}>{alumni.name} <Badge status="Active" /></h1>
              {isOwn && !editing && (
                <Button size="sm" variant="outline" onClick={startEdit} style={{ marginLeft: "auto" }}>
                  <Pencil size={14} style={{ marginRight: 4 }} />Edit Profile
                </Button>
              )}
            </div>

            {editing && tab === "Profile" ? (
              <form onSubmit={saveEdit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                {saveError && (
                  <div className="notice-ok" style={{ background: "#fef2f2", color: "#b91c1c" }}>{saveError}</div>
                )}
                <FormField label="About Me">
                  <textarea className="control" rows={4} maxLength={1000}
                    value={draft.about} onChange={(e) => setDraft({ ...draft, about: e.target.value })} />
                </FormField>
                <FormField label="Phone">
                  <input className="control" type="tel" value={draft.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                </FormField>
                <FormField label="Address">
                  <input className="control" value={draft.address}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
                </FormField>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                  <input type="checkbox" checked={draft.showContact}
                    onChange={(e) => setDraft({ ...draft, showContact: e.target.checked })} />
                  Show contact details publicly
                </label>
                <fieldset style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
                  <legend style={{ fontSize: 13, fontWeight: 600, padding: "0 6px" }}>Social Links</legend>
                  {SOCIAL_KEYS.map((k) => (
                    <FormField key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
                      <input className="control" type="url" placeholder={`https://${k}.com/yourprofile`}
                        value={draft.socialLinks[k] || ""}
                        onChange={(e) => setDraft({ ...draft, socialLinks: { ...draft.socialLinks, [k]: e.target.value } })} />
                    </FormField>
                  ))}
                </fieldset>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <Button type="submit" size="sm" disabled={saving}>
                    <Check size={14} style={{ marginRight: 4 }} />{saving ? "Saving…" : "Save Changes"}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={cancelEdit} disabled={saving}>
                    <X size={14} style={{ marginRight: 4 }} />Cancel
                  </Button>
                </div>
              </form>
            ) : tab === "Profile" ? (
              <>
                <dl className="profile__rows">
                  {rows.map(([Icon, k, v]) => (
                    <div key={k}><dt><Icon size={16} />{k}</dt><dd>: &nbsp;{v}</dd></div>
                  ))}
                </dl>
                {alumni.about && <><h3>About Me</h3><p className="profile__about">{alumni.about}</p></>}
                <h3>Social Links</h3>
                <SocialLinks items={SOCIAL_KEYS} size={16} itemSize={30} />
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
