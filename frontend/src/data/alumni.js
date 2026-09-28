import a1 from "../assets/alumni-1.png";
import a2 from "../assets/alumni-2.png";
import a3 from "../assets/alumni-3.png";
import a4 from "../assets/alumni-4.png";
import a5 from "../assets/alumni-5.png";
import a6 from "../assets/alumni-6.png";
import profile from "../assets/rahman-profile.png";
import pdf from "../assets/rahman-pdf.png";
import verify from "../assets/rahman-verify.png";
import mobile from "../assets/rahman-mobile.png";
import { SITE } from "./site.js";

// Registration number format: YYYY-NNN (e.g. 2016-001)
export const REG_FORMAT = "YYYY-NNN";

export const DEPARTMENTS_CONFIG = [
  { full: "Civil Engineering",                        code: "CE",       faculty: "Faculty of Science & Engineering" },
  { full: "Computer Science & Engineering",           code: "CSE",      faculty: "Faculty of Science & Engineering" },
  { full: "Information Technology",                   code: "IT",       faculty: "Faculty of Science & Engineering" },
  { full: "Electronics & Communication Engineering",  code: "ECE",      faculty: "Faculty of Science & Engineering" },
  { full: "Electrical & Electronic Engineering",      code: "EEE",      faculty: "Faculty of Science & Engineering" },
  { full: "Pharmacy",                                 code: "B.Pharm",  faculty: "Faculty of Science & Engineering" },
  { full: "Business Administration",                  code: "BBA / MBA",faculty: "Faculty of Business" },
  { full: "English",                                  code: "English",  faculty: "Faculty of Liberal Arts & Social Sciences" },
  { full: "Social Work",                              code: "Social Work", faculty: "Faculty of Liberal Arts & Social Sciences" },
  { full: "Law",                                      code: "LL.B / LL.M", faculty: "Faculty of Law" },
];

export const getDeptCode    = (full) => DEPARTMENTS_CONFIG.find((d) => d.full === full)?.code    || full;
export const getDeptFaculty = (full) => DEPARTMENTS_CONFIG.find((d) => d.full === full)?.faculty || null;

// Batch years from UITS founding to current year
const BATCH_START = SITE.established; // 2003
export const BATCH_YEARS = Array.from(
  { length: new Date().getFullYear() - BATCH_START + 1 },
  (_, i) => String(BATCH_START + i)
);

const ABOUT =
  "I am a passionate developer with a love for technology. Currently working as a Software Engineer at a reputed company. I always try to learn new things and contribute to my community.";

const base = { about: ABOUT, email: "rahman@example.com", phone: "01712-345678", address: "Dhaka, Bangladesh" };

// PLACEHOLDER: sample alumni — not real UITS alumni
export const ALUMNI = [
  { ...base, id: "2016-001", name: "Md. Rahman",     batch: "2016", department: "Computer Science & Engineering",          photo: a1, photoLarge: profile, photoPdf: pdf, photoVerify: verify, photoMobile: mobile },
  { ...base, id: "2018-027", name: "Fatima Akter",   batch: "2018", department: "Business Administration",                 photo: a2, email: "fatima@example.com" },
  { ...base, id: "2019-023", name: "Sabbir Ahmed",   batch: "2019", department: "Electrical & Electronic Engineering",     photo: a3, email: "sabbir@example.com" },
  { ...base, id: "2018-045", name: "Nusrat Jahan",   batch: "2018", department: "Computer Science & Engineering",          photo: a4, email: "nusrat@example.com" },
  { ...base, id: "2020-012", name: "Tanzim Hasan",   batch: "2020", department: "Information Technology",                  photo: a5, email: "tanzim@example.com" },
  { ...base, id: "2020-030", name: "Shakib Rahman",  batch: "2020", department: "Civil Engineering",                       photo: a6, email: "shakib@example.com" },
];

export const getAlumnus = (id) => ALUMNI.find((a) => a.id === id);
export const BATCHES = [...new Set(ALUMNI.map((a) => a.batch))].sort();
export const DEPARTMENTS = DEPARTMENTS_CONFIG.map((d) => d.full);

export const STATS = [
  { key: "alumni",   value: "1250+",                          label: "Total Alumni" },        // PLACEHOLDER
  { key: "members",  value: "950+",                           label: "Registered Members" },   // PLACEHOLDER
  { key: "batch",    value: `${BATCH_YEARS.length}+`,         label: "Batch" },
  { key: "forever",  value: "100%",                           label: "Together Forever" },      // PLACEHOLDER
];

// PLACEHOLDER: sample notice — replace with real UITS notice data
export const NOTICES = [
  { id: 1, title: "Annual Alumni Reunion 2025", text: "UITS Alumni Association cordially invites all alumni to the Annual Reunion 2025. Reconnect with your batchmates and celebrate our shared journey.", date: "15 Apr 2025" },
];

// PLACEHOLDER: sample recent registrations — not real UITS data
export const RECENT_REGISTRATIONS = [
  { name: "Rahim Uddin",   department: "CSE",       batch: "2020", status: "Pending",  date: "2025-04-27" },
  { name: "Fatima Akter",  department: "BBA / MBA", batch: "2018", status: "Approved", date: "2025-04-26" },
  { name: "Sabbir Ahmed",  department: "EEE",       batch: "2019", status: "Approved", date: "2025-04-25" },
  { name: "Nusrat Jahan",  department: "CSE",       batch: "2019", status: "Pending",  date: "2025-04-24" },
  { name: "Tanzim Hasan",  department: "IT",        batch: "2020", status: "Approved", date: "2025-04-23" },
];
