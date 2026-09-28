import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { authApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/Logo";
import FormField from "../../components/FormField";
import Button from "../../components/Button";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (next !== confirm) return setError("Passwords do not match");
    setError("");
    setLoading(true);
    try {
      await authApi.changePassword(current, next);
      setUser((u) => ({ ...u, mustChangePassword: false }));
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify" style={{ minHeight: "100vh" }}>
      <Logo />
      <div className="card verify__card" style={{ maxWidth: 420 }}>
        <KeyRound size={40} className="verify__ok" strokeWidth={1.6} />
        <h1 style={{ fontSize: 22 }}>Change Password</h1>
        <p className="verify__sub">You must change your password before continuing.</p>
        {error && <div className="notice-ok" role="alert" style={{ background: "#fef2f2", color: "#b91c1c", marginBottom: 12 }}>{error}</div>}
        <form onSubmit={submit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
          <FormField label="Current Password">
            <input className="control" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
          </FormField>
          <FormField label="New Password" hint="Min 8 chars, 1 uppercase, 1 number">
            <input className="control" type="password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} />
          </FormField>
          <FormField label="Confirm New Password">
            <input className="control" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </FormField>
          <Button type="submit" size="lg" block disabled={loading}>{loading ? "Saving…" : "Change Password"}</Button>
        </form>
      </div>
    </div>
  );
}
