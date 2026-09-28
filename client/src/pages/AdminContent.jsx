import { useEffect, useRef, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Button from "../components/Button";
import { adminApi } from "../api/admin";
import { SITE } from "../data/site.js";

const TABS = ["Homepage", "About Us", "Notice", "Gallery", "Contact", "Footer"];

const DEFAULT_HERO = {
  title: `Welcome to the ${SITE.shortName} Alumni Community`,
  description: "Reconnecting Friends | Building Networks | Shaping the Future",
  bannerUrl: "",
};

export default function AdminContent() {
  const [tab, setTab] = useState("Homepage");
  const [draft, setDraft] = useState(DEFAULT_HERO);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    adminApi.getContent()
      .then((r) => { const hero = r.data?.hero ?? {}; setDraft({ title: hero.title || DEFAULT_HERO.title, description: hero.description || DEFAULT_HERO.description, bannerUrl: hero.bannerUrl || "" }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const change = (k) => (e) => { setDraft({ ...draft, [k]: e.target.value }); setSaved(false); };

  const pickImage = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { setDraft((d) => ({ ...d, bannerUrl: r.result, _file: f })); setSaved(false); };
    r.readAsDataURL(f);
  };

  const save = async () => {
    setSaving(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify({ hero: { title: draft.title, description: draft.description, bannerUrl: draft._file ? undefined : (draft.bannerUrl || "") } }));
      if (draft._file) fd.append("banner", draft._file);
      const r = await adminApi.updateContent(fd);
      const hero = r.data?.hero ?? {};
      setDraft({ title: hero.title || DEFAULT_HERO.title, description: hero.description || DEFAULT_HERO.description, bannerUrl: hero.bannerUrl || "" });
      setSaved(true);
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify({ hero: DEFAULT_HERO }));
      await adminApi.updateContent(fd);
      setDraft({ ...DEFAULT_HERO });
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="admin__title">Website Content Management</h1>
      {loading ? <p>Loading…</p> : (
        <div className="card cms">
          <div className="cms__tabs" role="tablist">
            {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "is-active" : ""} onClick={() => setTab(t)}>{t}</button>)}
          </div>
          {tab === "Homepage" ? (
            <div className="cms__panel">
              <h2>Hero Section</h2>
              <div className="cms__row"><label htmlFor="t">Title</label><input id="t" className="control" value={draft.title} onChange={change("title")} /></div>
              <div className="cms__row"><label htmlFor="d">Description</label><textarea id="d" className="control" value={draft.description} onChange={change("description")} /></div>
              <div className="cms__row">
                <label>Banner Image</label>
                <div className="cms__banner">
                  {draft.bannerUrl ? <img src={draft.bannerUrl} alt="Banner" /> : <div className="cms__empty">No image</div>}
                  <Button size="sm" onClick={() => fileRef.current.click()}>Change Image</Button>
                  <Button size="sm" variant="danger" onClick={() => { setDraft({ ...draft, bannerUrl: "", _file: null }); setSaved(false); }}>Remove</Button>
                  <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={pickImage} />
                </div>
              </div>
            </div>
          ) : <div className="cms__panel"><p className="cms__placeholder">Content editor for "{tab}" is not part of this design.</p></div>}
          <div className="cms__foot">
            {saved && <span className="cms__saved">Saved — changes are live on the homepage.</span>}
            {error && <span style={{ color: "#e04444", fontSize: 13 }}>{error}</span>}
            <Button variant="outline" size="sm" onClick={resetToDefault} style={{ marginRight: 8 }} disabled={saving}>Reset to Default</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
