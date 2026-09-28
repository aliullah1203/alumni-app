import { useRef, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Button from "../components/Button";
import { useContent, DEFAULTS } from "../context/ContentContext";

const TABS = ["Homepage", "About Us", "Notice", "Gallery", "Contact", "Footer"];

export default function AdminContent() {
  const { content, setContent } = useContent();
  const [tab, setTab] = useState("Homepage");
  const [draft, setDraft] = useState(content);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  const change = (k) => (e) => { setDraft({ ...draft, [k]: e.target.value }); setSaved(false); };
  const pickImage = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { setDraft((d) => ({ ...d, banner: r.result })); setSaved(false); };
    r.readAsDataURL(f);
  };
  const resetToDefault = () => { setDraft(DEFAULTS); setContent(DEFAULTS); setSaved(true); };

  return (
    <AdminLayout>
      <h1 className="admin__title">Website Content Management</h1>
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
                {draft.banner ? <img src={draft.banner} alt="Banner" /> : <div className="cms__empty">No image</div>}
                <Button size="sm" onClick={() => fileRef.current.click()}>Change Image</Button>
                <Button size="sm" variant="danger" onClick={() => { setDraft({ ...draft, banner: "" }); setSaved(false); }}>Remove</Button>
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={pickImage} />
              </div>
            </div>
          </div>
        ) : <div className="cms__panel"><p className="cms__placeholder">Content editor for "{tab}" is not part of this design.</p></div>}
        <div className="cms__foot">
          {saved && <span className="cms__saved">Saved — changes are live on the homepage.</span>}
          <Button variant="outline" size="sm" onClick={resetToDefault} style={{ marginRight: 8 }}>Reset to Default</Button>
          <Button onClick={() => { setContent(draft); setSaved(true); }}>Save Changes</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
