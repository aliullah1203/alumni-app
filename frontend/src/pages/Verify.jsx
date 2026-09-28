import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { alumniApi } from "../api/alumni";
import { SITE } from "../data/site.js";

export default function Verify() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alumniApi.verify(id)
      .then((r) => setResult(r.data))
      .catch(() => setResult({ valid: false }))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="verify">
      <Logo />
      <div className="card verify__card">
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Verifying…</p>
        ) : result?.valid ? (
          <>
            <CheckCircle2 className="verify__ok" size={48} strokeWidth={1.8} />
            <h1>Verification Successful!</h1>
            <p className="verify__sub">This is a valid {SITE.shortName} alumni profile.</p>
            <div className="verify__person">
              {result.photoUrl && <img src={result.photoUrl} alt={result.name} />}
              <div>
                <h2>{result.name}</h2>
                <p>
                  Registration No: {result.registrationNo}<br />
                  Batch: {result.batch}<br />
                  Department: {result.department}
                </p>
              </div>
            </div>
            <Button to={`/alumni/${result.registrationNo}`} size="lg">View Full Profile</Button>
            {result.verifiedAt && (
              <span className="verify__time">
                Approved on: {new Date(result.verifiedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            )}
          </>
        ) : (
          <>
            <XCircle className="verify__bad" size={48} strokeWidth={1.8} />
            <h1>Verification Failed</h1>
            <p className="verify__sub">No alumni profile matches this code.</p>
            <Link to="/alumni" className="link">Browse directory</Link>
          </>
        )}
      </div>
    </div>
  );
}
