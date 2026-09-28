import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/Logo";
import FormField from "../../components/FormField";
import Button from "../../components/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.mustChangePassword ? "/admin/change-password" : from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify" style={{ minHeight: "100vh" }}>
      <Logo />
      <div className="card verify__card" style={{ maxWidth: 420 }}>
        <LogIn size={40} className="verify__ok" strokeWidth={1.6} />
        <h1 style={{ fontSize: 22 }}>Admin Login</h1>
        <p className="verify__sub">Sign in to manage the UITS Alumni portal</p>
        {error && <div className="notice-ok" role="alert" style={{ background: "#fef2f2", color: "#b91c1c", marginBottom: 12 }}>{error}</div>}
        <form onSubmit={submit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
          <FormField label="Email">
            <input className="control" type="email" required placeholder="admin@uits.edu.bd" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <FormField label="Password">
            <input className="control" type="password" required placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
          <Button type="submit" size="lg" block disabled={loading}>{loading ? "Signing in…" : "Sign In"}</Button>
        </form>
        <Link to="/" className="link" style={{ marginTop: 16, fontSize: 13 }}>← Back to website</Link>
      </div>
    </div>
  );
}
