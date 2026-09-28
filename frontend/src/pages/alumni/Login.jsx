import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAlumniAuth } from "../../context/AlumniAuthContext";
import Logo from "../../components/Logo";
import FormField from "../../components/FormField";
import Button from "../../components/Button";

export default function AlumniLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { alumniLogin } = useAlumniAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const alumni = await alumniLogin(email, password);
      navigate(`/alumni/${alumni.registrationNo}`, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify" style={{ minHeight: "100vh" }}>
      <Logo />
      <div className="card verify__card" style={{ maxWidth: 420 }}>
        <LogIn size={40} className="verify__ok" strokeWidth={1.6} />
        <h1 style={{ fontSize: 22 }}>Alumni Portal</h1>
        <p className="verify__sub">Sign in to view and manage your profile</p>
        {error && (
          <div className="notice-ok" role="alert"
            style={{ background: "#fef2f2", color: "#b91c1c", marginBottom: 12 }}>
            {error}
          </div>
        )}
        <form onSubmit={submit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
          <FormField label="Email">
            <input className="control" type="email" required autoComplete="email"
              placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <FormField label="Password">
            <input className="control" type="password" required autoComplete="current-password"
              placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
          <Button type="submit" size="lg" block disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", marginTop: 16 }}>
          <Link to="/alumni/forgot-password" className="link" style={{ fontSize: 13 }}>
            Forgot password?
          </Link>
          <Link to="/" className="link" style={{ fontSize: 13 }}>
            ← Back to website
          </Link>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            Not registered yet? <Link to="/register" className="link">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
