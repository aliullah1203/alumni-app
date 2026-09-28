import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { KeyRound, CheckCircle } from "lucide-react";
import { alumniAuthApi } from "../../api/alumniAuth";
import { useAlumniAuth } from "../../context/AlumniAuthContext";
import Logo from "../../components/Logo";
import FormField from "../../components/FormField";
import Button from "../../components/Button";

export default function SetupPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const { setAlumniUser } = useAlumniAuth();

  const [alumniInfo, setAlumniInfo] = useState(null);
  const [tokenError, setTokenError] = useState("");
  const [validating, setValidating] = useState(true);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setTokenError("No setup token provided."); setValidating(false); return; }
    alumniAuthApi.validateSetupToken(token)
      .then((r) => setAlumniInfo(r.data))
      .catch((e) => setTokenError(e.message || "Invalid setup link"))
      .finally(() => setValidating(false));
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(""); setLoading(true);
    try {
      const r = await alumniAuthApi.completeSetup({ token, password });
      setAlumniUser(r.data);
      setDone(true);
      setTimeout(() => navigate(`/alumni/${r.data.registrationNo}`, { replace: true }), 1500);
    } catch (err) {
      setError(err.message || "Failed to set up account");
    } finally {
      setLoading(false);
    }
  };

  if (validating) return (
    <div className="verify" style={{ minHeight: "100vh" }}>
      <Logo />
      <div className="card verify__card" style={{ maxWidth: 420 }}>
        <p className="verify__sub">Validating your setup link…</p>
      </div>
    </div>
  );

  if (tokenError) return (
    <div className="verify" style={{ minHeight: "100vh" }}>
      <Logo />
      <div className="card verify__card" style={{ maxWidth: 420 }}>
        <div className="verify__x" style={{ fontSize: 40 }}>✗</div>
        <h2 style={{ fontSize: 18, marginTop: 12 }}>Setup Link Invalid</h2>
        <p className="verify__sub">{tokenError}</p>
        <Link to="/" className="link" style={{ marginTop: 16, fontSize: 13, display: "inline-block" }}>
          ← Back to website
        </Link>
      </div>
    </div>
  );

  if (done) return (
    <div className="verify" style={{ minHeight: "100vh" }}>
      <Logo />
      <div className="card verify__card" style={{ maxWidth: 420 }}>
        <CheckCircle size={48} className="verify__ok" strokeWidth={1.5} />
        <h2 style={{ fontSize: 18, marginTop: 12 }}>Account Ready!</h2>
        <p className="verify__sub">Redirecting you to your profile…</p>
      </div>
    </div>
  );

  return (
    <div className="verify" style={{ minHeight: "100vh" }}>
      <Logo />
      <div className="card verify__card" style={{ maxWidth: 420 }}>
        <KeyRound size={40} className="verify__ok" strokeWidth={1.6} />
        <h1 style={{ fontSize: 22 }}>Set Up Your Account</h1>
        <p className="verify__sub">
          Welcome, <strong>{alumniInfo?.name}</strong>! Choose a password to activate your alumni portal access.
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
            {loading ? "Setting up…" : "Activate Account"}
          </Button>
        </form>
        <Link to="/" className="link" style={{ marginTop: 16, fontSize: 13 }}>← Back to website</Link>
      </div>
    </div>
  );
}
