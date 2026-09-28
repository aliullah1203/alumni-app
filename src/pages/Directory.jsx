import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import PersonCard from "../components/PersonCard";
import Button from "../components/Button";
import { ALUMNI, BATCHES, DEPARTMENTS } from "../data/alumni";

export default function Directory() {
  const [q, setQ] = useState("");
  const [batch, setBatch] = useState("");
  const [dept, setDept] = useState("");
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return ALUMNI.filter((a) =>
      (!batch || a.batch === batch) && (!dept || a.department === dept) &&
      (!t || [a.name, a.id, a.department].some((v) => v.toLowerCase().includes(t))));
  }, [q, batch, dept]);
  const reset = () => { setQ(""); setBatch(""); setDept(""); };

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
            <input className="control" placeholder="Search by name, registration no, or department..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button className="filters__btn" size="lg" style={{ height: 46 }}>Search</Button>
          <select className={`control${batch ? "" : " is-empty"}`} value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Batch">
            <option value="">All Batches</option>
            {BATCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select className={`control${dept ? "" : " is-empty"}`} value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <Button className="filters__btn" variant="outline" onClick={reset} style={{ height: 46 }}>Reset</Button>
        </div>
        <div className="directory__grid">
          {results.map((a) => <PersonCard key={a.id} person={a} />)}
        </div>
        {!results.length && <p className="directory__empty">No alumni match your search.</p>}
      </div>
    </PublicLayout>
  );
}
