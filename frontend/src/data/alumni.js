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

// UITS intake batch numbers (Batch 1 = first intake, 2003)
// Roughly 2 intakes/year; update MAX_BATCH as new intakes open
const MAX_BATCH = 60;
export const BATCH_YEARS = Array.from({ length: MAX_BATCH }, (_, i) => String(i + 1));

