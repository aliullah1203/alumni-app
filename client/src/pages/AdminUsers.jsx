import { useEffect, useState } from "react";
import { Trash2, UserCheck, UserX } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import Button from "../components/Button";
import FormField from "../components/FormField";
import Badge from "../components/Badge";
import { adminApi } from "../api/admin";
import { useAuth } from "../context/AuthContext";

const EMPTY = { name: "", email: "", password: "", role: "EDITOR" };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { user: me } = useAuth();

  const load = () => adminApi.listUsers().then((r) => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(load, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError(null); setSaving(true);
    try { await adminApi.createUser(form); setForm(EMPTY); load(); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const toggleActive = async (u) => {
    try { await adminApi.updateUser(u.id, { isActive: !u.isActive }); load(); }
    catch (e) { alert(e.message); }
  };

  const del = async (u) => {
    if (!confirm(`Delete user ${u.name}?`)) return;
    try { await adminApi.deleteUser(u.id); load(); } catch (e) { alert(e.message); }
  };

  return (
    <AdminLayout>
      <h1 className="admin__title">Users</h1>

      <div className="card panel" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 16 }}>Create User</h2>
        {error && <p style={{ color: "#e04444", marginBottom: 12, fontSize: 13 }}>{error}</p>}
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FormField label="Name" required><input className="control" required value={form.name} onChange={set("name")} /></FormField>
          <FormField label="Email" required><input className="control" type="email" required value={form.email} onChange={set("email")} /></FormField>
          <FormField label="Password" required hint="Min 8 chars"><input className="control" type="password" required minLength={8} value={form.password} onChange={set("password")} /></FormField>
          <FormField label="Role">
            <select className="control" value={form.role} onChange={set("role")}>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </FormField>
          <div style={{ gridColumn: "1/-1" }}><Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create User"}</Button></div>
        </form>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="card panel">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}{u.id === me?.id && " (you)"}</td>
                    <td>{u.email}</td>
                    <td><Badge status={u.role === "ADMIN" ? "Active" : "Pending"} /></td>
                    <td>{u.isActive ? "Yes" : "No"}</td>
                    <td>
                      {u.id !== me?.id && (
                        <span style={{ display: "flex", gap: 4 }}>
                          <button className="btn btn--sm btn--outline" title={u.isActive ? "Deactivate" : "Activate"} onClick={() => toggleActive(u)}>
                            {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                          </button>
                          <button className="btn btn--sm btn--danger" onClick={() => del(u)}><Trash2 size={13} /></button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
