import { Users, ClipboardList, LayoutGrid, Eye, FileText } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { RECENT_REGISTRATIONS } from "../data/alumni";

const CARDS = [
  { label: "Total Alumni", value: "1250", color: "#1a6ef2", Icon: Users },
  { label: "Pending Approval", value: "48", color: "#f59e0b", Icon: ClipboardList },
  { label: "Total Batches", value: "45", color: "#16a663", Icon: LayoutGrid },
  { label: "Website Visits", value: "3240", color: "#8b3fd9", Icon: Eye },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="admin__title">Dashboard</h1>
      <div className="dash-cards">
        {CARDS.map(({ label, value, color, Icon }) => (
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
            <thead><tr><th>Name</th><th>Department</th><th>Batch</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {RECENT_REGISTRATIONS.map((r) => (
                <tr key={r.name}><td>{r.name}</td><td>{r.department}</td><td>{r.batch}</td><td><Badge status={r.status} /></td><td>{r.date}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <h2 className="admin__sub">Quick Actions</h2>
      <div className="quick">
        <Button variant="success" size="lg" to="/register">Add Alumni</Button>
        <Button size="lg" to="/admin">Manage Notices</Button>
        <Button variant="purple" size="lg" to="/admin/content">Edit Website</Button>
        <Button variant="slate" size="lg" to="/alumni"><FileText size={15} />View All</Button>
      </div>
    </AdminLayout>
  );
}
