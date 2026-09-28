import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { alumniAuthApi } from "../../api/alumniAuth";
import Logo from "../../components/Logo";
import FormField from "../../components/FormField";
import Button from "../../components/Button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await alumniAuthApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify" style={{ minHeight: "100vh" }}>
      <Logo />
      <div className="card verify__card" style={{ maxWidth: 420 }}>
        <Mail size={40} className="verify__ok" strokeWidth={1.6} />
        <h1 style={{ fontSize: 22 }}>Forgot Password</h1>
        {sent ? (
          <>
            <p className="verify__sub">
              If an account exists for that email, you will receive a password reset link shortly. Check your inbox (and spam folder).
            </p>
            <Link to="/alumni/login" className="link" style={{ marginTop: 16, fontSize: 13 }}>← Back to login</Link>
          </>
        ) : (
          <>
            <p className="verify__sub">Enter the email address linked to your alumni account.</p>
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
              <Button type="submit" size="lg" block disabled={loading}>
                {loading ? "Sending…" : "Send Reset Link"}
              </Button>
            </form>
            <Link to="/alumni/login" className="link" style={{ marginTop: 16, fontSize: 13 }}>← Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
}
