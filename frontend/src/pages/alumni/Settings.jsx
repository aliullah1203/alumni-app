import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import PublicLayout from "../../components/PublicLayout";
import FormField from "../../components/FormField";
import Button from "../../components/Button";
import { alumniAuthApi } from "../../api/alumniAuth";
import { useAlumniAuth } from "../../context/AlumniAuthContext";

export default function AlumniSettings() {
  const { alumniUser } = useAlumniAuth();
  const navigate = useNavigate();

  const [current, setCurrent] = useState("");
  const [next, setNext]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (next !== confirm) return setError("New passwords do not match");
    if (next.length < 8)  return setError("New password must be at least 8 characters");
    setError(""); setLoading(true);
    try {
      await alumniAuthApi.changePassword({ currentPassword: current, newPassword: next });
      setSuccess(true);
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout showRegister={false}>
      <div className="container settings-page">
        <div className="card settings__card">
          <div className="settings__header">
            <KeyRound size={28} className="settings__icon" />
            <div>
              <h1>Account Settings</h1>
              {alumniUser && <p className="settings__sub">{alumniUser.name} · {alumniUser.registrationNo}</p>}
            </div>
          </div>

          <hr className="settings__divider" />

          <h2>Change Password</h2>

          {success && (
            <div className="notice-ok" role="status">Password changed successfully.</div>
          )}
          {error && (
            <div className="notice-ok" role="alert" style={{ background: "#fef2f2", color: "#b91c1c" }}>{error}</div>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            <FormField label="Current Password">
              <input className="control" type="password" required value={current}
                onChange={(e) => { setCurrent(e.target.value); setError(""); setSuccess(false); }} />
            </FormField>
            <FormField label="New Password" hint="Minimum 8 characters">
              <input className="control" type="password" required minLength={8} value={next}
                onChange={(e) => { setNext(e.target.value); setError(""); setSuccess(false); }} />
            </FormField>
            <FormField label="Confirm New Password">
              <input className="control" type="password" required value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(""); setSuccess(false); }} />
            </FormField>
            <div style={{ display: "flex", gap: 10 }}>
              <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Update Password"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Back</Button>
            </div>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}
