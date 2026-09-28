import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import Button from "../components/Button";
import FormField from "../components/FormField";
import { adminApi } from "../api/admin";

const EMPTY = { title: "", text: "", isPublished: true };

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = () => adminApi.listNotices().then((r) => setNotices(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(load, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError(null); setSaving(true);
    try {
      if (editId) await adminApi.updateNotice(editId, form);
      else await adminApi.createNotice(form);
      setForm(EMPTY); setEditId(null); load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const edit = (n) => { setForm({ title: n.title, text: n.text, isPublished: n.isPublished }); setEditId(n.id); };

  const del = async (id, title) => {
    if (!confirm(`Delete notice "${title}"?`)) return;
    try { await adminApi.deleteNotice(id); load(); } catch (e) { alert(e.message); }
  };

  return (
    <AdminLayout>
      <h1 className="admin__title">Notices</h1>

      <div className="card panel" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 16 }}>{editId ? "Edit Notice" : "New Notice"}</h2>
        {error && <p style={{ color: "#e04444", marginBottom: 12, fontSize: 13 }}>{error}</p>}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Title" required><input className="control" required value={form.title} onChange={set("title")} /></FormField>
          <FormField label="Text" required><textarea className="control" required value={form.text} onChange={set("text")} /></FormField>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={form.isPublished} onChange={set("isPublished")} /> Published
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : editId ? "Update" : "Create"}</Button>
            {editId && <Button variant="outline" type="button" onClick={() => { setForm(EMPTY); setEditId(null); }}>Cancel</Button>}
          </div>
        </form>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="card panel">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Title</th><th>Date</th><th>Published</th><th>Actions</th></tr></thead>
              <tbody>
                {notices.map((n) => (
                  <tr key={n.id}>
                    <td>{n.title}</td>
                    <td>{new Date(n.date).toLocaleDateString()}</td>
                    <td>{n.isPublished ? "Yes" : "No"}</td>
                    <td>
                      <span style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn--sm btn--outline" onClick={() => edit(n)}><Pencil size={13} /></button>
                        <button className="btn btn--sm btn--danger" onClick={() => del(n.id, n.title)}><Trash2 size={13} /></button>
                      </span>
                    </td>
                  </tr>
                ))}
                {!notices.length && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)" }}>No notices.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
