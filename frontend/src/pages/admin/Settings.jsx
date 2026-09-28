import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Button from "../../components/Button";
import FormField from "../../components/FormField";
import { adminApi } from "../../api/admin";

const DEFAULT = { siteName: "UITS Alumni Association", tagline: "Future will be better than the past", registrationOpen: true };

export default function AdminSettings() {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.getSettings()
      .then((r) => { if (r.data) setForm({ siteName: r.data.siteName, tagline: r.data.tagline, registrationOpen: r.data.registrationOpen }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError(null); setSaving(true); setSaved(false);
    try { await adminApi.updateSettings(form); setSaved(true); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <h1 className="admin__title">Settings</h1>
      {loading ? <p>Loading…</p> : (
        <div className="card panel" style={{ maxWidth: 560 }}>
          {error && <p style={{ color: "#e04444", marginBottom: 12, fontSize: 13 }}>{error}</p>}
          {saved && <p style={{ color: "#16a663", marginBottom: 12, fontSize: 13 }}>Settings saved.</p>}
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FormField label="Site Name"><input className="control" value={form.siteName} onChange={set("siteName")} /></FormField>
            <FormField label="Tagline"><input className="control" value={form.tagline} onChange={set("tagline")} /></FormField>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={form.registrationOpen} onChange={set("registrationOpen")} />
              Registration Open (allows new alumni to register)
            </label>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Settings"}</Button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
