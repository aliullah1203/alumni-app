import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { getAlumnus, getDeptCode } from "../data/alumni";
import { SITE } from "../data/site.js";

export default function Verify() {
  const { id } = useParams();
  const a = getAlumnus(id);
  return (
    <div className="verify">
      <Logo />
      <div className="card verify__card">
        {a ? (
          <>
            <CheckCircle2 className="verify__ok" size={48} strokeWidth={1.8} />
            <h1>Verification Successful!</h1>
            <p className="verify__sub">This is a valid {SITE.shortName} alumni profile.</p>
            <div className="verify__person">
              <img src={a.photoVerify || a.photo} alt={a.name} />
              <div>
                <h2>{a.name}</h2>
                <p>Registration No: {a.id}<br />Batch: {a.batch}<br />Department: {getDeptCode(a.department)}<br />Email: {a.email}</p>
              </div>
            </div>
            <Button to={`/alumni/${a.id}`} size="lg">View Full Profile</Button>
            <span className="verify__time">Verified on: 27 Apr 2025, 12:30 PM</span>
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
