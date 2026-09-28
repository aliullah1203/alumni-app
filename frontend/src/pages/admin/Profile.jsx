import { useState } from "react";
import { UserCircle, KeyRound } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import FormField from "../../components/FormField";
import Button from "../../components/Button";
import { authApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card admin-profile__section">
      <div className="admin-profile__section-head">
        <Icon size={20} className="admin-profile__icon" />
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function AdminProfile() {
  const { user, setUser } = useAuth();

  const [name,  setName]  = useState(user?.name  || "");
  const [email, setEmail] = useState(user?.email || "");
  const [infoSaving,  setInfoSaving]  = useState(false);
  const [infoOk,      setInfoOk]      = useState(false);
  const [infoError,   setInfoError]   = useState("");

  const [current, setCurrent] = useState("");
  const [next,    setNext]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwOk,      setPwOk]      = useState(false);
  const [pwError,   setPwError]   = useState("");

  const saveInfo = async (e) => {
    e.preventDefault();
    setInfoOk(false); setInfoError(""); setInfoSaving(true);
    try {
      const r = await authApi.updateProfile({ name, email });
      setUser((u) => ({ ...u, name: r.data.name, email: r.data.email }));
      setName(r.data.name); setEmail(r.data.email);
      setInfoOk(true);
    } catch (err) {
      setInfoError(err.message || "Failed to save");
    } finally {
      setInfoSaving(false);
    }
  };

  const savePw = async (e) => {
    e.preventDefault();
    if (next !== confirm) return setPwError("Passwords do not match");
    setPwOk(false); setPwError(""); setPwSaving(true);
    try {
      await authApi.changePassword(current, next);
      setPwOk(true);
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      setPwError(err.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="admin__title">My Profile</h1>
      <div className="admin-profile">

        <Section icon={UserCircle} title="Account Information">
          {infoOk    && <div className="notice-ok" role="status">Profile updated successfully.</div>}
          {infoError && <div className="notice-ok" role="alert" style={{ background: "#fef2f2", color: "#b91c1c" }}>{infoError}</div>}
          <form onSubmit={saveInfo} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            <div className="admin-profile__grid">
              <FormField label="Full Name" required>
                <input className="control" required value={name}
                  onChange={(e) => { setName(e.target.value); setInfoOk(false); }} />
              </FormField>
              <FormField label="Email Address" required>
                <input className="control" type="email" required value={email}
                  onChange={(e) => { setEmail(e.target.value); setInfoOk(false); }} />
              </FormField>
            </div>
            <FormField label="Role">
              <input className="control" value={user?.role || ""} disabled style={{ opacity: .6 }} />
            </FormField>
            <div>
              <Button type="submit" disabled={infoSaving}>{infoSaving ? "Saving…" : "Save Changes"}</Button>
            </div>
          </form>
        </Section>

        <Section icon={KeyRound} title="Change Password">
          {pwOk    && <div className="notice-ok" role="status">Password changed successfully.</div>}
          {pwError && <div className="notice-ok" role="alert" style={{ background: "#fef2f2", color: "#b91c1c" }}>{pwError}</div>}
          <form onSubmit={savePw} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            <FormField label="Current Password">
              <input className="control" type="password" required value={current}
                onChange={(e) => { setCurrent(e.target.value); setPwOk(false); setPwError(""); }} />
            </FormField>
            <div className="admin-profile__grid">
              <FormField label="New Password" hint="Min 8 chars, 1 uppercase, 1 number">
                <input className="control" type="password" required minLength={8} value={next}
                  onChange={(e) => { setNext(e.target.value); setPwOk(false); setPwError(""); }} />
              </FormField>
              <FormField label="Confirm New Password">
                <input className="control" type="password" required value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setPwOk(false); setPwError(""); }} />
              </FormField>
            </div>
            <div>
              <Button type="submit" disabled={pwSaving}>{pwSaving ? "Saving…" : "Change Password"}</Button>
            </div>
          </form>
        </Section>

      </div>
    </AdminLayout>
  );
}
