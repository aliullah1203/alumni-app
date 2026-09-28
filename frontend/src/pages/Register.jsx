import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Bell, Users, Briefcase, CalendarCheck } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import FormField from "../components/FormField";
import Button from "../components/Button";
import { BATCH_YEARS, DEPARTMENTS_CONFIG } from "../data/alumni";
import { alumniApi } from "../api/alumni";

const PERKS = [
  { Icon: Bell,          text: "Get Latest Updates" },
  { Icon: Users,         text: "Connect with Alumni" },
  { Icon: Briefcase,     text: "Career Opportunities" },
  { Icon: CalendarCheck, text: "Exclusive Event Access" },
];
const EMPTY = { name: "", reg: "", email: "", phone: "", batch: "", dept: "", address: "", about: "" };

export default function Register() {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors({ ...errors, [k]: undefined }); };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { setErrors({ ...errors, photo: "File must be under 2MB" }); return; }
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(f.type)) {
      setErrors({ ...errors, photo: "Only JPG, PNG, or WebP allowed" }); return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErrors({ ...errors, photo: undefined });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const fd = new FormData();
      const dept = DEPARTMENTS_CONFIG.find((d) => d.full === form.dept);
      const payload = {
        name: form.name,
        registrationNo: form.reg,
        email: form.email,
        phone: form.phone,
        batch: form.batch,
        department: form.dept,
        faculty: dept?.faculty || "",
        address: form.address,
        about: form.about,
      };
      fd.append("data", JSON.stringify(payload));
      if (file) fd.append("photo", file);
      await alumniApi.register(fd);
      setDone(true);
      setForm(EMPTY);
      setFile(null);
      setPreview(null);
    } catch (err) {
      if (err.data && Array.isArray(err.data)) {
        const fieldErrors = {};
        err.data.forEach((e) => { fieldErrors[e.path] = e.message; });
        setErrors(fieldErrors);
      } else {
        setErrors({ _form: err.message || "Submission failed" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout active="Alumni" showRegister={false}>
      <div className="container register">
        <form className="card register__form" onSubmit={submit}>
          <h1>Alumni Registration</h1>
          <p className="register__sub">Fill up the form to become a member of our alumni community.</p>
          {done && <div className="notice-ok" role="status">Thank you! Your registration has been submitted for approval.</div>}
          {errors._form && <div className="notice-ok" role="alert" style={{ background: "#fef2f2", color: "#b91c1c" }}>{errors._form}</div>}
          <div className="register__grid">
            <FormField label="Full Name" required><input className="control" required placeholder="Enter your full name" value={form.name} onChange={set("name")} />{errors.name && <span style={{ color: "#e04444", fontSize: 12 }}>{errors.name}</span>}</FormField>
            <FormField label="Registration No" required hint="Format: YYYY-NNN (e.g. 2020-001)"><input className="control" required placeholder="e.g. 2020-001" value={form.reg} onChange={set("reg")} />{errors.registrationNo && <span style={{ color: "#e04444", fontSize: 12 }}>{errors.registrationNo}</span>}</FormField>
            <FormField label="Email Address" required><input className="control" type="email" required placeholder="Enter your email" value={form.email} onChange={set("email")} /></FormField>
            <FormField label="Phone Number" required><input className="control" type="tel" required placeholder="e.g. 01712-345678" value={form.phone} onChange={set("phone")} /></FormField>
            <FormField label="Batch" required>
              <select className={`control${form.batch ? "" : " is-empty"}`} required value={form.batch} onChange={set("batch")}>
                <option value="">Select your batch</option>
                {BATCH_YEARS.map((b) => <option key={b} value={b}>Batch {b}</option>)}
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
            <FormField label="Profile Photo" hint="JPG/PNG/WebP, max 2MB">
              <span className="file">
                <span className="file__btn">Choose File</span>
                {file ? file.name : "No file chosen"}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFile} />
              </span>
              {preview && <img src={preview} alt="Preview" style={{ marginTop: 8, width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />}
              {errors.photo && <span style={{ color: "#e04444", fontSize: 12 }}>{errors.photo}</span>}
            </FormField>
          </div>
          <div className="register__submit">
            <Button size="lg" type="submit" style={{ minWidth: 260 }} disabled={loading}>{loading ? "Submitting…" : "Register Now"}</Button>
            <p>Already have an account? <Link to="/login" className="link">Login</Link></p>
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
