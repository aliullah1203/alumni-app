import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import PersonCard from "../components/PersonCard";
import Button from "../components/Button";
import { alumniApi } from "../api/alumni";
import { contentApi } from "../api/content";

export default function Directory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({ batches: [], departments: [] });
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputQ, setInputQ] = useState(searchParams.get("q") || "");

  const q = searchParams.get("q") || "";
  const batch = searchParams.get("batch") || "";
  const dept = searchParams.get("department") || "";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    contentApi.getFilters().then((r) => setFilters(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    alumniApi.list({ q, batch, department: dept, page, limit: 12 })
      .then((r) => { setResults(r.data); setMeta(r.meta); })
      .catch((e) => setError(e.message || "Failed to load alumni"))
      .finally(() => setLoading(false));
  }, [q, batch, dept, page]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams((p) => {
        const next = new URLSearchParams(p);
        if (inputQ) next.set("q", inputQ); else next.delete("q");
        next.delete("page");
        return next;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [inputQ]);

  const setParam = (key, val) => setSearchParams((p) => {
    const next = new URLSearchParams(p);
    if (val) next.set(key, val); else next.delete(key);
    next.delete("page");
    return next;
  });

  const setPage = (n) => setSearchParams((p) => { const next = new URLSearchParams(p); next.set("page", n); return next; });

  const reset = () => { setInputQ(""); setSearchParams({}); };

  return (
    <PublicLayout active="Alumni">
      <section className="banner">
        <h1>Alumni Directory</h1>
        <p>Find and connect with your fellow alumni</p>
      </section>
      <div className="container directory">
        <div className="filters">
          <div className="filters__search">
            <Search size={16} />
            <input className="control" placeholder="Search by name, registration no, or department…" value={inputQ} onChange={(e) => setInputQ(e.target.value)} />
          </div>
          <Button className="filters__btn" size="lg" style={{ height: 46 }}>Search</Button>
          <select className={`control${batch ? "" : " is-empty"}`} value={batch} onChange={(e) => setParam("batch", e.target.value)} aria-label="Batch">
            <option value="">All Batches</option>
            {filters.batches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className={`control${dept ? "" : " is-empty"}`} value={dept} onChange={(e) => setParam("department", e.target.value)} aria-label="Department">
            <option value="">All Departments</option>
            {filters.departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <Button className="filters__btn" variant="outline" onClick={reset} style={{ height: 46 }}>Reset</Button>
        </div>

        {loading && <p className="directory__empty">Loading…</p>}
        {error && <p className="directory__empty" style={{ color: "#e04444" }}>{error}</p>}
        {!loading && !error && (
          <>
            <div className="directory__grid">
              {results.map((a) => <PersonCard key={a.id} person={a} />)}
            </div>
            {!results.length && <p className="directory__empty">No alumni match your search.</p>}

            {meta && meta.totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</Button>
                <span style={{ display: "flex", alignItems: "center", fontSize: 14, color: "var(--text-muted)" }}>
                  Page {meta.page} of {meta.totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
