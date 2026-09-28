import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Contact, CalendarDays, Building2, Mail, Phone, MapPin, Printer, ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";
import VerifyQR from "../components/VerifyQR";
import { getAlumnus, getDeptCode } from "../data/alumni";
import { SITE } from "../data/site.js";

export default function PdfView() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const a = getAlumnus(id);
  useEffect(() => { if (a && params.get("print")) setTimeout(() => window.print(), 400); }, [a, params]);
  if (!a) return null;
  const rows = [
    [Contact,      "Registration No", a.id],
    [CalendarDays, "Batch",           a.batch],
    [Building2,    "Department",      getDeptCode(a.department)],
    [Mail,         "Email",           a.email],
    [Phone,        "Phone",           a.phone],
    [MapPin,       "Address",         a.address],
  ];
  return (
    <div className="pdf-page">
      <div className="pdf-toolbar">
        <Link to={`/alumni/${a.id}`} className="link"><ArrowLeft size={16} /> Back to profile</Link>
        <button className="btn btn--sm" onClick={() => window.print()}><Printer size={15} /> Print / Save as PDF</button>
      </div>
      <div className="pdf-frame"><div className="pdf">
        <div className="pdf__head"><Logo to={`/alumni/${a.id}`} /></div>
        <div className="pdf__title">Alumni Profile</div>
        <div className="pdf__body">
          <img className="pdf__photo" src={a.photoPdf || a.photoLarge || a.photo} alt={a.name} />
          <div className="pdf__info">
            <h2>{a.name}</h2>
            <dl>
              {rows.map(([Icon, k, v]) => <div key={k}><dt><Icon size={14} />{k}</dt><dd>: &nbsp;{v}</dd></div>)}
            </dl>
          </div>
          <div className="pdf__qr">
            <VerifyQR id={a.id} size={104} />
            <strong>Verify Now</strong>
            <span>Scan QR Code<br />to verify this certificate</span>
          </div>
        </div>
        <div className="pdf__about"><h3>About Me</h3><p>{a.about}</p></div>
        <div className="pdf__sign">
          <span className="pdf__signature">{a.name.replace("Md. ", "")}</span>
          <strong>{SITE.associationName}</strong>
          <span>Authorized Signature</span>
        </div>
        <svg className="pdf__wave" viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 55C170 15 330 105 560 62 700 36 830 46 1000 18V110H0Z" fill="#1a6ef2" />
          <path d="M0 78C200 40 380 112 620 82 760 64 860 70 1000 48V110H0Z" fill="#0c3f8f" />
        </svg>
        <span className="pdf__date">Date: 27 Apr 2025</span>
      </div></div>
    </div>
  );
}
