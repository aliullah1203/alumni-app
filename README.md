# Alumni Association – React frontend

Vite + React 18 + React Router. Run:

    npm install
    npm run dev      # http://localhost:5173
    npm run build

## Routes (the 9 reference parts)
| # | Part | Route |
|---|------|-------|
| 1 | Homepage | `/` |
| 2 | Registration form | `/register` |
| 3 | Alumni directory | `/alumni` |
| 4 | Alumni profile | `/alumni/:id` (e.g. `/alumni/2016-001`) |
| 5 | Admin dashboard | `/admin` |
| 6 | Website content (CMS) | `/admin/content` – edits appear on `/` |
| 7 | PDF download view | `/alumni/:id/pdf` |
| 8 | QR verification | `/verify/:id` (the QR on the profile links here) |
| 9 | Mobile view | responsive CSS of the same pages (≤ 900px nav collapse, ≤ 640px mobile layout + bottom tab bar) |

## Structure
- `src/components` – Logo, Navbar, Footer, BottomNav, PublicLayout, AdminLayout, Button, FormField, Badge, PersonCard, StatItem, SocialLinks, VerifyQR
- `src/pages` – one file per part
- `src/styles` – tokens.css (colors, radius, spacing), base.css, components.css, pages.css, admin.css
- `src/data/alumni.js` – sample data; `src/context/ContentContext.jsx` – CMS state (localStorage)
- `src/assets` – photos cropped from the reference image (replace with originals when available)
