import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Contact, CalendarDays, Building2, Mail, Phone, MapPin, Printer, ArrowLeft, BookOpen } from "lucide-react";
import Logo from "../components/Logo";
import VerifyQR from "../components/VerifyQR";
import { alumniApi } from "../api/alumni";
import { SITE } from "../data/site.js";

export default function PdfView() {
  const { id } = useParams();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alumniApi.get(id)
      .then((r) => setAlumni(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pdf-page"><p style={{ padding: 40 }}>Loading…</p></div>;
  if (!alumni) return null;

  const rows = [
    [Contact,      "Registration No", alumni.registrationNo],
    [CalendarDays, "Batch",           String(alumni.batch)],
    [Building2,    "Department",      alumni.department],
    [BookOpen,     "Faculty",         alumni.faculty],
    ...(alumni.email ? [[Mail, "Email", alumni.email]] : []),
    ...(alumni.phone ? [[Phone, "Phone", alumni.phone]] : []),
    ...(alumni.address ? [[MapPin, "Address", alumni.address]] : []),
  ];

  const verifyUrl = alumni.verifyToken ? `${window.location.origin}/verify/${alumni.verifyToken}` : null;

  return (
    <div className="pdf-page">
      <div className="pdf-toolbar">
        <Link to={`/alumni/${alumni.registrationNo}`} className="link"><ArrowLeft size={16} /> Back to profile</Link>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={alumniApi.pdfUrl(alumni.registrationNo)} download className="btn btn--sm">Download PDF</a>
          <button className="btn btn--sm" onClick={() => window.print()}><Printer size={15} /> Print</button>
        </div>
      </div>
      <div className="pdf-frame"><div className="pdf">
        <div className="pdf__head"><Logo to={`/alumni/${alumni.registrationNo}`} /></div>
        <div className="pdf__title">Alumni Profile</div>
        <div className="pdf__body">
          {alumni.photoUrl && <img className="pdf__photo" src={alumni.photoUrl} alt={alumni.name} />}
          <div className="pdf__info">
            <h2>{alumni.name}</h2>
            <dl>
              {rows.map(([Icon, k, v]) => <div key={k}><dt><Icon size={14} />{k}</dt><dd>: &nbsp;{v}</dd></div>)}
            </dl>
          </div>
          {verifyUrl && (
            <div className="pdf__qr">
              <VerifyQR url={verifyUrl} size={104} />
              <strong>Verify Now</strong>
              <span>Scan QR Code<br />to verify this certificate</span>
            </div>
          )}
        </div>
        {alumni.about && <div className="pdf__about"><h3>About Me</h3><p>{alumni.about}</p></div>}
        <div className="pdf__sign">
          <span className="pdf__signature">{alumni.name.replace("Md. ", "")}</span>
          <strong>{SITE.associationName}</strong>
          <span>Authorized Signature</span>
        </div>
        <svg className="pdf__wave" viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 55C170 15 330 105 560 62 700 36 830 46 1000 18V110H0Z" fill="#1a6ef2" />
          <path d="M0 78C200 40 380 112 620 82 760 64 860 70 1000 48V110H0Z" fill="#0c3f8f" />
        </svg>
        <span className="pdf__date">Date: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
      </div></div>
    </div>
  );
}
