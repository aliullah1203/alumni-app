import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Bell, Users, Briefcase, CalendarCheck } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import FormField from "../components/FormField";
import Button from "../components/Button";
import { BATCH_YEARS, DEPARTMENTS_CONFIG } from "../data/alumni";

const PERKS = [
  { Icon: Bell,          text: "Get Latest Updates" },
  { Icon: Users,         text: "Connect with Alumni" },
  { Icon: Briefcase,     text: "Career Opportunities" },
  { Icon: CalendarCheck, text: "Exclusive Event Access" },
];
const EMPTY = { name: "", reg: "", email: "", phone: "", batch: "", dept: "", address: "" };

export default function Register() {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = (e) => { e.preventDefault(); setDone(true); setForm(EMPTY); setFile(null); };

  return (
    <PublicLayout active="Alumni" showRegister={false}>
      <div className="container register">
        <form className="card register__form" onSubmit={submit}>
          <h1>Alumni Registration</h1>
          <p className="register__sub">Fill up the form to become a member of our alumni community.</p>
          {done && <div className="notice-ok" role="status">Thank you! Your registration has been submitted for approval.</div>}
          <div className="register__grid">
            <FormField label="Full Name" required><input className="control" required placeholder="Enter your full name" value={form.name} onChange={set("name")} /></FormField>
            <FormField label="Registration No" required><input className="control" required placeholder="Enter registration number" value={form.reg} onChange={set("reg")} /></FormField>
            <FormField label="Email Address" required><input className="control" type="email" required placeholder="Enter your email" value={form.email} onChange={set("email")} /></FormField>
            <FormField label="Phone Number" required><input className="control" type="tel" required placeholder="Enter phone number" value={form.phone} onChange={set("phone")} /></FormField>
            <FormField label="Batch" required>
              <select className={`control${form.batch ? "" : " is-empty"}`} required value={form.batch} onChange={set("batch")}>
                <option value="">Select your batch</option>
                {BATCH_YEARS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </FormField>
            <FormField label="Department" required>
              <select className={`control${form.dept ? "" : " is-empty"}`} required value={form.dept} onChange={set("dept")}>
                <option value="">Select your department</option>
                {DEPARTMENTS_CONFIG.map((d) => (
                  <option key={d.full} value={d.full}>{d.full} ({d.code})</option>
                ))}
              </select>
            </FormField>
            <FormField label="Current Address" required><textarea className="control" required placeholder="Enter your current address" value={form.address} onChange={set("address")} /></FormField>
            <FormField label="Profile Photo" hint="(Max: 2MB)">
              <span className="file">
                <span className="file__btn">Choose File</span>
                {file ? file.name : "No file chosen"}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files[0] || null)} />
              </span>
            </FormField>
          </div>
          <div className="register__submit">
            <Button size="lg" type="submit" style={{ minWidth: 260 }}>Register Now</Button>
            <p>Already have an account? <Link to="/admin" className="link">Login</Link></p>
          </div>
        </form>

        <aside className="card register__aside">
          <GraduationCap size={64} strokeWidth={1.4} className="register__cap" />
          <h2>Join Our Alumni Network</h2>
          <p>Stay connected with your batchmates, share your success stories and be a part of something bigger.</p>
          <ul>
            {PERKS.map(({ Icon, text }) => (
              <li key={text}><span><Icon size={17} /></span>{text}</li>
            ))}
          </ul>
        </aside>
      </div>
    </PublicLayout>
  );
}
