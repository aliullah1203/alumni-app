import { useEffect, useState } from "react";
import { Search, Check, X, Trash2, Eye, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import { adminApi } from "../../api/admin";

const STATUS_LABEL = { APPROVED: "Approved", REJECTED: "Rejected", PENDING: "Pending" };

export default function AdminAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [meta, setMeta] = useState(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.listAlumni({ q, status, page, limit: 15 })
      .then((r) => { setAlumni(r.data); setMeta(r.meta); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, [q, status, page]);

  const patchStatus = async (id, newStatus) => {
    setUpdating(id);
    try { await adminApi.patchStatus(id, newStatus); load(); }
    catch (e) { alert(e.message); }
    finally { setUpdating(null); }
  };

  const del = async (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try { await adminApi.deleteAlumni(id); load(); }
    catch (e) { alert(e.message); }
  };

  const resendSetup = async (id, name) => {
    setUpdating(id);
    try { await adminApi.resendSetup(id); alert(`Setup email resent to ${name}.`); }
    catch (e) { alert(e.message); }
    finally { setUpdating(null); }
  };

  return (
    <AdminLayout>
      <h1 className="admin__title">Alumni Management</h1>
      <div className="card panel">
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200, border: "1px solid var(--border)", borderRadius: 8, padding: "0 12px" }}>
            <Search size={15} /><input className="control" style={{ border: 0, boxShadow: "none", height: 40 }} placeholder="Search name, reg no, email…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <select className={`control${status ? "" : " is-empty"}`} style={{ width: 160 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <Button size="sm" to="/register">Add Alumni</Button>
        </div>

        {loading ? <p>Loading…</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Reg No</th><th>Department</th><th>Batch</th><th>Status</th><th>Registered</th><th>Actions</th></tr></thead>
              <tbody>
                {alumni.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{a.registrationNo}</td>
                    <td>{a.department}</td>
                    <td>{a.batch}</td>
                    <td><Badge status={STATUS_LABEL[a.status]} /></td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span style={{ display: "flex", gap: 4 }}>
                        <Link to={`/alumni/${a.registrationNo}`} target="_blank"><Button size="sm" variant="outline"><Eye size={13} /></Button></Link>
                        {a.status === "PENDING" && <>
                          <button className="btn btn--sm" style={{ background: "#16a663", padding: "0 10px" }} disabled={updating === a.id} onClick={() => patchStatus(a.id, "APPROVED")}><Check size={13} /></button>
                          <button className="btn btn--sm btn--danger" style={{ padding: "0 10px" }} disabled={updating === a.id} onClick={() => patchStatus(a.id, "REJECTED")}><X size={13} /></button>
                        </>}
                        {a.status === "APPROVED" && (<>
                          {!a.hasAccount && (
                            <button className="btn btn--sm" style={{ background: "#0ea5e9", padding: "0 10px" }} title="Resend setup email" disabled={updating === a.id} onClick={() => resendSetup(a.id, a.name)}><MailCheck size={13} /></button>
                          )}
                          <button className="btn btn--sm btn--danger" style={{ padding: "0 10px" }} disabled={updating === a.id} onClick={() => patchStatus(a.id, "REJECTED")}><X size={13} /></button>
                        </>)}
                        <button className="btn btn--sm btn--danger" style={{ padding: "0 10px" }} onClick={() => del(a.id, a.name)}><Trash2 size={13} /></button>
                      </span>
                    </td>
                  </tr>
                ))}
                {!alumni.length && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)" }}>No records found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</Button>
            <span style={{ display: "flex", alignItems: "center", fontSize: 13, color: "var(--text-muted)" }}>{meta.page}/{meta.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
