import { useEffect, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import Button from "../components/Button";
import FormField from "../components/FormField";
import { adminApi } from "../api/admin";

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = () => adminApi.listGallery().then((r) => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(load, []);

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault(); if (!file) return setError("Image is required");
    setError(null); setSaving(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("title", title);
      if (caption) fd.append("caption", caption);
      await adminApi.createGalleryItem(fd);
      setTitle(""); setCaption(""); setFile(null); setPreview(null); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this gallery item?")) return;
    try { await adminApi.deleteGalleryItem(id); load(); } catch (e) { alert(e.message); }
  };

  return (
    <AdminLayout>
      <h1 className="admin__title">Gallery</h1>

      <div className="card panel" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 16 }}>Upload Image</h2>
        {error && <p style={{ color: "#e04444", marginBottom: 12, fontSize: 13 }}>{error}</p>}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Title" required><input className="control" required value={title} onChange={(e) => setTitle(e.target.value)} /></FormField>
          <FormField label="Caption"><input className="control" value={caption} onChange={(e) => setCaption(e.target.value)} /></FormField>
          <FormField label="Image" required>
            <span className="file">
              <span className="file__btn">Choose Image</span>
              {file ? file.name : "No file chosen"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFile} />
            </span>
            {preview && <img src={preview} alt="preview" style={{ marginTop: 8, height: 80, objectFit: "cover", borderRadius: 8 }} />}
          </FormField>
          <Button type="submit" disabled={saving}><Upload size={15} />{saving ? "Uploading…" : "Upload"}</Button>
        </form>
      </div>

      {loading ? <p>Loading…</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ overflow: "hidden" }}>
              <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: 150, objectFit: "cover" }} />
              <div style={{ padding: "10px 12px" }}>
                <strong style={{ fontSize: 14 }}>{item.title}</strong>
                {item.caption && <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{item.caption}</p>}
                <button className="btn btn--sm btn--danger" style={{ marginTop: 10, width: "100%" }} onClick={() => del(item.id)}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
          {!items.length && <p style={{ color: "var(--text-muted)" }}>No gallery items yet.</p>}
        </div>
      )}
    </AdminLayout>
  );
}
