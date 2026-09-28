import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { KeyRound, CheckCircle } from "lucide-react";
import { alumniAuthApi } from "../../api/alumniAuth";
import Logo from "../../components/Logo";
import FormField from "../../components/FormField";
import Button from "../../components/Button";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();

  const [tokenInfo, setTokenInfo] = useState(null);
  const [tokenError, setTokenError] = useState("");
  const [validating, setValidating] = useState(true);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setTokenError("No reset token provided."); setValidating(false); return; }
    alumniAuthApi.validateResetToken(token)
      .then((r) => setTokenInfo(r.data))
      .catch((e) => setTokenError(e.message || "Invalid reset link"))
      .finally(() => setValidating(false));
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(""); setLoading(true);
    try {
      await alumniAuthApi.resetPassword({ token, password });
      setDone(true);
      setTimeout(() => navigate("/alumni/login", { replace: true }), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (validating) return (
    <div className="verify" style={{ minHeight: "100vh" }}>
      <Logo /><div className="card verify__card" style={{ maxWidth: 420 }}><p className="verify__sub">Validating reset link…</p></div>
    </div>
  );

  if (tokenError) return (
    <div className="verify" style={{ minHeight: "100vh" }}>
      <Logo />
      <div className="card verify__card" style={{ maxWidth: 420 }}>
        <div className="verify__x" style={{ fontSize: 40 }}>✗</div>
        <h2 style={{ fontSize: 18, marginTop: 12 }}>Reset Link Invalid</h2>
        <p className="verify__sub">{tokenError}</p>
        <Link to="/alumni/forgot-password" className="link" style={{ marginTop: 16, fontSize: 13, display: "inline-block" }}>
          Request a new reset link
        </Link>
      </div>
    </div>
  );

  if (done) return (
    <div className="verify" style={{ minHeight: "100vh" }}>
      <Logo />
      <div className="card verify__card" style={{ maxWidth: 420 }}>
        <CheckCircle size={48} className="verify__ok" strokeWidth={1.5} />
        <h2 style={{ fontSize: 18, marginTop: 12 }}>Password Updated!</h2>
        <p className="verify__sub">Redirecting you to the login page…</p>
      </div>
    </div>
  );

  return (
    <div className="verify" style={{ minHeight: "100vh" }}>
      <Logo />
      <div className="card verify__card" style={{ maxWidth: 420 }}>
        <KeyRound size={40} className="verify__ok" strokeWidth={1.6} />
        <h1 style={{ fontSize: 22 }}>Reset Password</h1>
        <p className="verify__sub">
          Setting new password for <strong>{tokenInfo?.email}</strong>
        </p>
        {error && (
          <div className="notice-ok" role="alert"
            style={{ background: "#fef2f2", color: "#b91c1c", marginBottom: 12 }}>
            {error}
          </div>
        )}
        <form onSubmit={submit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
          <FormField label="New Password">
            <input className="control" type="password" required minLength={8} autoComplete="new-password"
              placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
          <FormField label="Confirm Password">
            <input className="control" type="password" required minLength={8} autoComplete="new-password"
              placeholder="Repeat your password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </FormField>
          <Button type="submit" size="lg" block disabled={loading}>
            {loading ? "Updating…" : "Update Password"}
          </Button>
        </form>
        <Link to="/alumni/login" className="link" style={{ marginTop: 16, fontSize: 13 }}>← Back to login</Link>
      </div>
    </div>
  );
}
