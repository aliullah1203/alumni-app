import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import { contentApi } from "../api/content";

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentApi.getNotices(100)
      .then((r) => setNotices(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout active="Notice">
      <section className="banner">
        <h1>Notices</h1>
        <p>Stay up to date with the latest announcements</p>
      </section>

      <div className="container notices-page">
        {loading && <p style={{ color: "var(--text-muted)", padding: "40px 0" }}>Loading…</p>}
        {!loading && notices.length === 0 && (
          <p style={{ color: "var(--text-muted)", padding: "40px 0" }}>No notices at this time.</p>
        )}
        {notices.map((n) => (
          <div className="notice notice--card" key={n.id}>
            <Megaphone className="notice__icon" size={26} />
            <div className="notice__body">
              <h3>{n.title}</h3>
              <p>{n.text}</p>
            </div>
            <time>{new Date(n.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</time>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}
