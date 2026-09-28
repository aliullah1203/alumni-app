import { useEffect, useState } from "react";
import { Users, ClipboardList, LayoutGrid, Eye, FileText, Check, X } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import { adminApi } from "../../api/admin";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = () => {
    adminApi.dashboard().then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const patchStatus = async (id, status) => {
    setUpdating(id);
    try {
      await adminApi.patchStatus(id, status);
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setUpdating(null);
    }
  };

  const cards = data ? [
    { label: "Total Alumni",      value: data.counts.approved, color: "#1a6ef2", Icon: Users },
    { label: "Pending Approval",  value: data.counts.pending,  color: "#f59e0b", Icon: ClipboardList },
    { label: "Total Batches",     value: "—",                  color: "#16a663", Icon: LayoutGrid },
    { label: "Website Visits",    value: data.visits.total,    color: "#8b3fd9", Icon: Eye },
  ] : [];

  return (
    <AdminLayout>
      <h1 className="admin__title">Dashboard</h1>
      {loading ? <p>Loading…</p> : (
        <>
          <div className="dash-cards">
            {cards.map(({ label, value, color, Icon }) => (
              <div className="card dash-card" key={label}>
                <span className="dash-card__icon" style={{ background: color }}><Icon size={22} /></span>
                <div><span>{label}</span><strong>{value}</strong></div>
              </div>
            ))}
          </div>

          <section className="card panel">
            <h2>Recent Registrations</h2>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Name</th><th>Department</th><th>Batch</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {(data?.recentAlumni || []).map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.department}</td>
                      <td>{r.batch}</td>
                      <td><Badge status={r.status === "APPROVED" ? "Approved" : r.status === "REJECTED" ? "Rejected" : "Pending"} /></td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        {r.status === "PENDING" && (
                          <span style={{ display: "flex", gap: 4 }}>
                            <button className="btn btn--sm" style={{ background: "#16a663", padding: "0 10px" }} disabled={updating === r.id} onClick={() => patchStatus(r.id, "APPROVED")}><Check size={14} /></button>
                            <button className="btn btn--sm btn--danger" style={{ padding: "0 10px" }} disabled={updating === r.id} onClick={() => patchStatus(r.id, "REJECTED")}><X size={14} /></button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <h2 className="admin__sub">Quick Actions</h2>
          <div className="quick">
            <Button variant="success" size="lg" to="/register">Add Alumni</Button>
            <Button size="lg" to="/admin/notices">Manage Notices</Button>
            <Button variant="purple" size="lg" to="/admin/content">Edit Website</Button>
            <Button variant="slate" size="lg" to="/admin/alumni"><FileText size={15} />View All</Button>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
