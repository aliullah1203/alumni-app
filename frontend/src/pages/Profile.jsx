import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { User, GraduationCap, Briefcase, Image, Contact, CalendarDays, Building2, Mail, Phone, MapPin, BookOpen, Pencil, X, Check, Trash2, Upload, Droplets, KeyRound } from "lucide-react";
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

  const [eduMode, setEduMode] = useState(false);
  const [eduDraft, setEduDraft] = useState([]);
  const [eduSaving, setEduSaving] = useState(false);
  const [eduError, setEduError] = useState("");

  const [expMode, setExpMode] = useState(false);
  const [expDraft, setExpDraft] = useState([]);
  const [expSaving, setExpSaving] = useState(false);
  const [expError, setExpError] = useState("");

  const [galleryItems, setGalleryItems] = useState(null);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryCaption, setGalleryCaption] = useState("");

  useEffect(() => {
    alumniApi.get(id)
      .then((r) => setAlumni(r.data))
      .catch((e) => { if (e.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id]);

  const isOwn = alumniUser && alumni && alumniUser.id === alumni.id;

  const startEdit = () => {
    setDraft({
      about: alumni.about || "",
      phone: alumni.phone || "",
      address: alumni.address || "",
      bloodGroup: alumni.bloodGroup || "",
      showContact: alumni.showContact ?? false,
      socialLinks: alumni.socialLinks || {},
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setSaveError("");
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setSaveError(""); };

  // Education helpers
  const EMPTY_EDU = { school: "", degree: "", field: "", startYear: "", endYear: "", description: "" };
  const startEduEdit = () => { setEduDraft(alumni.education?.map((e) => ({ ...e })) || []); setEduMode(true); };
  const addEdu = () => setEduDraft((d) => [...d, { ...EMPTY_EDU }]);
  const removeEdu = (i) => setEduDraft((d) => d.filter((_, j) => j !== i));
  const setEdu = (i, k) => (e) => setEduDraft((d) => d.map((r, j) => j === i ? { ...r, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value } : r));
  const saveEdu = async () => {
    setEduSaving(true); setEduError("");
    try {
      const r = await alumniAuthApi.updateEducation(eduDraft);
      setAlumni((prev) => ({ ...prev, education: r.data }));
      setEduMode(false);
    } catch (err) { setEduError(err.message || "Failed to save"); } finally { setEduSaving(false); }
  };

  // Experience helpers
  const EMPTY_EXP = { company: "", title: "", startYear: "", endYear: "", current: false, description: "" };
  const startExpEdit = () => { setExpDraft(alumni.experience?.map((e) => ({ ...e })) || []); setExpMode(true); };
  const addExp = () => setExpDraft((d) => [...d, { ...EMPTY_EXP }]);
  const removeExp = (i) => setExpDraft((d) => d.filter((_, j) => j !== i));
  const setExp = (i, k) => (e) => setExpDraft((d) => d.map((r, j) => j === i ? { ...r, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value } : r));
  const saveExp = async () => {
    setExpSaving(true); setExpError("");
    try {
      const r = await alumniAuthApi.updateExperience(expDraft);
      setAlumni((prev) => ({ ...prev, experience: r.data }));
      setExpMode(false);
    } catch (err) { setExpError(err.message || "Failed to save"); } finally { setExpSaving(false); }
  };

  // Gallery helpers
  const loadGallery = () => {
    if (galleryItems !== null) return;
    setGalleryLoading(true);
    const source = isOwn
      ? alumniAuthApi.listGallery()
      : Promise.resolve({ data: alumni.gallery || [] });
    source
      .then((r) => setGalleryItems(r.data || []))
      .catch(() => setGalleryItems([]))
      .finally(() => setGalleryLoading(false));
  };

  const uploadGalleryPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Photo must be under 2 MB"); return; }
    const fd = new FormData();
    fd.append("image", file);
    if (galleryCaption.trim()) fd.append("caption", galleryCaption.trim());
    setGalleryUploading(true);
    try {
      const r = await alumniAuthApi.uploadGallery(fd);
      setGalleryItems((prev) => [r.data, ...(prev || [])]);
      setGalleryCaption("");
    } catch { } finally { setGalleryUploading(false); }
    e.target.value = "";
  };

  const deleteGalleryPhoto = async (id) => {
    if (!window.confirm("Delete this photo?")) return;
    await alumniAuthApi.deleteGallery(id).catch(() => {});
    setGalleryItems((prev) => prev.filter((g) => g.id !== id));
  };

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
        bloodGroup: draft.bloodGroup || null,
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
    [CalendarDays, "Batch",           `Batch ${alumni.batch}`],
    [Building2,    "Department",      alumni.department],
    [BookOpen,     "Faculty",         alumni.faculty],
    ...(alumni.bloodGroup ? [[Droplets, "Blood Group", alumni.bloodGroup]] : []),
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
                  <button className={tab === key ? "is-active" : ""} onClick={() => { setTab(key); if (key === "Gallery") loadGallery(); }}>
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
                <FormField label="Blood Group">
                  <select className={`control${draft.bloodGroup ? "" : " is-empty"}`} value={draft.bloodGroup}
                    onChange={(e) => setDraft({ ...draft, bloodGroup: e.target.value })}>
                    <option value="">Not specified</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
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
                <SocialLinks links={alumni.socialLinks || {}} size={16} itemSize={30} />
              </>
            ) : tab === "Education" ? (
              eduMode ? (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                  {eduDraft.map((e, i) => (
                    <div key={i} className="entry-form">
                      <div className="entry-form__grid">
                        <FormField label="School / Institution *">
                          <input className="control" placeholder="e.g. UITS" value={e.school} onChange={setEdu(i, "school")} />
                        </FormField>
                        <FormField label="Degree">
                          <input className="control" placeholder="e.g. BSc" value={e.degree} onChange={setEdu(i, "degree")} />
                        </FormField>
                        <FormField label="Field of Study">
                          <input className="control" placeholder="e.g. CSE" value={e.field} onChange={setEdu(i, "field")} />
                        </FormField>
                        <FormField label="Start Year">
                          <input className="control" type="number" placeholder="2018" value={e.startYear} onChange={setEdu(i, "startYear")} />
                        </FormField>
                        <FormField label="End Year">
                          <input className="control" type="number" placeholder="2022" value={e.endYear} onChange={setEdu(i, "endYear")} />
                        </FormField>
                      </div>
                      <FormField label="Description">
                        <textarea className="control" rows={2} maxLength={500} value={e.description} onChange={setEdu(i, "description")} />
                      </FormField>
                      <button className="entry-form__remove" type="button" onClick={() => removeEdu(i)}>Remove</button>
                    </div>
                  ))}
                  {eduError && <div className="notice-ok" style={{ background: "#fef2f2", color: "#b91c1c" }}>{eduError}</div>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button size="sm" variant="outline" type="button" onClick={addEdu}>+ Add Education</Button>
                    <Button size="sm" type="button" disabled={eduSaving} onClick={saveEdu}>{eduSaving ? "Saving…" : "Save"}</Button>
                    <Button size="sm" variant="outline" type="button" onClick={() => { setEduMode(false); setEduError(""); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  {isOwn && <Button size="sm" variant="outline" onClick={startEduEdit} style={{ marginTop: 8 }}><Pencil size={13} style={{ marginRight: 4 }} />Edit Education</Button>}
                  {alumni.education?.length
                    ? alumni.education.map((e, i) => (
                        <div key={i} style={{ marginTop: 16 }}>
                          <strong>{e.school}</strong>{e.degree && ` — ${e.degree}`}{e.field && ` (${e.field})`}
                          {(e.startYear || e.endYear) && <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: 8 }}>{e.startYear}–{e.endYear || "Present"}</span>}
                          {e.description && <p className="profile__about">{e.description}</p>}
                        </div>
                      ))
                    : <p className="profile__about" style={{ marginTop: 16 }}>No education information added yet.</p>}
                </>
              )
            ) : tab === "Experience" ? (
              expMode ? (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                  {expDraft.map((e, i) => (
                    <div key={i} className="entry-form">
                      <div className="entry-form__grid">
                        <FormField label="Company / Organisation *">
                          <input className="control" placeholder="e.g. Google" value={e.company} onChange={setExp(i, "company")} />
                        </FormField>
                        <FormField label="Job Title *">
                          <input className="control" placeholder="e.g. Software Engineer" value={e.title} onChange={setExp(i, "title")} />
                        </FormField>
                        <FormField label="Start Year">
                          <input className="control" type="number" placeholder="2022" value={e.startYear} onChange={setExp(i, "startYear")} />
                        </FormField>
                        <FormField label="End Year">
                          <input className="control" type="number" placeholder="2024" value={e.endYear} disabled={e.current} onChange={setExp(i, "endYear")} />
                        </FormField>
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginBottom: 8 }}>
                        <input type="checkbox" checked={!!e.current} onChange={setExp(i, "current")} />
                        Currently working here
                      </label>
                      <FormField label="Description">
                        <textarea className="control" rows={2} maxLength={500} value={e.description} onChange={setExp(i, "description")} />
                      </FormField>
                      <button className="entry-form__remove" type="button" onClick={() => removeExp(i)}>Remove</button>
                    </div>
                  ))}
                  {expError && <div className="notice-ok" style={{ background: "#fef2f2", color: "#b91c1c" }}>{expError}</div>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button size="sm" variant="outline" type="button" onClick={addExp}>+ Add Experience</Button>
                    <Button size="sm" type="button" disabled={expSaving} onClick={saveExp}>{expSaving ? "Saving…" : "Save"}</Button>
                    <Button size="sm" variant="outline" type="button" onClick={() => { setExpMode(false); setExpError(""); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  {isOwn && <Button size="sm" variant="outline" onClick={startExpEdit} style={{ marginTop: 8 }}><Pencil size={13} style={{ marginRight: 4 }} />Edit Experience</Button>}
                  {alumni.experience?.length
                    ? alumni.experience.map((e, i) => (
                        <div key={i} style={{ marginTop: 16 }}>
                          <strong>{e.company}</strong> — {e.title}
                          {(e.startYear || e.endYear) && <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: 8 }}>{e.startYear}–{e.current ? "Present" : (e.endYear || "")}</span>}
                          {e.description && <p className="profile__about">{e.description}</p>}
                        </div>
                      ))
                    : <p className="profile__about" style={{ marginTop: 16 }}>No experience information added yet.</p>}
                </>
              )
            ) : (
              <div style={{ marginTop: 8 }}>
                {isOwn && (
                  <div className="gallery-upload">
                    <input
                      className="control"
                      placeholder="Caption (optional)"
                      value={galleryCaption}
                      onChange={(e) => setGalleryCaption(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <label className={`btn btn--sm${galleryUploading ? " btn--disabled" : ""}`} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Upload size={14} />{galleryUploading ? "Uploading…" : "Upload Photo"}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={uploadGalleryPhoto} disabled={galleryUploading} />
                    </label>
                  </div>
                )}
                {galleryLoading && <p style={{ color: "var(--text-muted)", marginTop: 16 }}>Loading…</p>}
                {!galleryLoading && galleryItems !== null && galleryItems.length === 0 && (
                  <p className="profile__about" style={{ marginTop: 16 }}>No photos added yet.</p>
                )}
                {galleryItems && galleryItems.length > 0 && (
                  <div className="alumni-gallery__grid">
                    {galleryItems.map((g) => (
                      <div key={g.id} className="alumni-gallery__item">
                        <img src={g.imageUrl} alt={g.caption || "Gallery photo"} loading="lazy" />
                        {g.caption && <p className="alumni-gallery__caption">{g.caption}</p>}
                        {isOwn && (
                          <button className="alumni-gallery__delete" onClick={() => deleteGalleryPhoto(g.id)} title="Delete photo">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="profile__download">
            {isOwn && (
              <Button to="/alumni/settings" size="sm" variant="outline" block style={{ marginBottom: 12 }}>
                <KeyRound size={14} style={{ marginRight: 6 }} />Change Password
              </Button>
            )}
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
