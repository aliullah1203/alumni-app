# UITS Alumni Association — Full-Stack App

Monorepo: React (Vite) client + Express/Prisma server, backed by Neon PostgreSQL.

```
/
├── frontend/   React app (Vite + React Router)
├── backend/    Express API (Prisma ORM, JWT auth, file upload, PDF)
└── package.json  root scripts (concurrently)
```

---

## 1. Neon PostgreSQL Setup

1. Create a project at [neon.tech](https://neon.tech).
2. Create **two branches**:
   - `main` (production)
   - `dev` (development — default branch for local work)
   - `test` (CI / automated tests — never run seeds here manually)
3. For each branch, copy the **Pooled** and **Direct** connection strings from the Neon dashboard.

---

## 2. Environment Variables

### backend/.env (development)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PUBLIC_URL=http://localhost:5173
STORAGE_DRIVER=local
UPLOAD_DIR=./uploads
ADMIN_EMAIL=
ADMIN_PASSWORD=

# SMTP (optional — emails are logged to console if not set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your@gmail.com
```

### backend/.env.test (test suite)
Same as above but pointing to the **test** Neon branch's pooled + direct URLs.

See `backend/.env.example` for full variable reference.

---

## 3. Install & Bootstrap

```bash
# Install all dependencies (root + frontend + backend)
npm run install:all

# Generate Prisma client
cd backend && npx prisma generate

# Run migrations (uses DIRECT_URL)
npx prisma migrate deploy   # production / CI
# OR
npx prisma migrate dev      # local development (interactive)

# Seed the database
node prisma/seed.js

# Optional: reset and re-seed (blocked in production)
node prisma/seed.js --reset
```

---

## 4. Run in Development

```bash
# From project root — starts both frontend (port 5173) and backend (port 5000)
npm run dev
```

Vite proxies `/api` → `http://localhost:5000`, so no CORS issues in dev.

---

## 5. Build & Deploy

```bash
npm run build       # builds frontend → frontend/dist
npm run start       # starts backend (production)
```

Point your web server / platform at `frontend/dist` for the SPA and `backend/` for the API.

---

## 6. API Reference

### Public

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | DB health check |
| GET | /api/content | Hero/about/contact/footer content |
| GET | /api/stats | Alumni counts and batch count |
| GET | /api/notices?limit= | Published notices |
| GET | /api/gallery | Gallery items |
| GET | /api/meta/filters | Distinct batches & departments (approved) |
| POST | /api/contact | Contact form submission (rate-limited 5/15min) |
| POST | /api/alumni/register | Register (multipart, photo ≤2MB jpg/png/webp) |
| GET | /api/alumni | Approved alumni list — `q, batch, department, page, limit` |
| GET | /api/alumni/:registrationNo | Single approved alumni profile |
| GET | /api/alumni/:registrationNo/pdf | Server-generated PDF download |
| GET | /api/verify/:verifyToken | Verify alumni by QR token |

### Admin Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | Login (rate-limited 5/min) |
| POST | /api/auth/logout | Clear cookie |
| GET | /api/auth/me | Current user |
| POST | /api/auth/change-password | Change password (forced on first login) |

### Alumni Auth

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/alumni-auth/setup?token= | Validate account-setup link |
| POST | /api/alumni-auth/setup | Complete setup (set password, auto-login) |
| POST | /api/alumni-auth/login | Alumni login (rate-limited 10/min) |
| POST | /api/alumni-auth/logout | Clear cookie |
| GET | /api/alumni-auth/me | Current alumni user |
| POST | /api/alumni-auth/forgot-password | Send password reset email |
| GET | /api/alumni-auth/reset?token= | Validate reset token |
| POST | /api/alumni-auth/reset-password | Reset password via token |
| PUT | /api/alumni-auth/profile | Update own profile (auth required) |
| PUT | /api/alumni-auth/password | Change own password (auth required) |

### Admin (auth required)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/dashboard | Stats + recent registrations |
| GET/POST | /api/admin/alumni | List (search/status/page) / Create |
| GET/PUT/DELETE | /api/admin/alumni/:id | Get / Update / Delete |
| PATCH | /api/admin/alumni/:id/status | Approve or Reject (sends setup email on approve) |
| POST | /api/admin/alumni/:id/resend-setup | Resend setup email (if not yet set up) |
| GET/POST | /api/admin/notices | List / Create |
| PUT/DELETE | /api/admin/notices/:id | Update / Delete |
| GET/POST | /api/admin/gallery | List / Upload |
| DELETE | /api/admin/gallery/:id | Delete |
| GET/POST | /api/admin/users | List / Create (ADMIN role only) |
| PUT/DELETE | /api/admin/users/:id | Update / Delete (ADMIN role only) |
| GET/PATCH | /api/admin/settings | Get / Update site settings |
| GET/PUT | /api/admin/content | Get / Update site content |

---

## 7. Running Tests

```bash
# Configure backend/.env.test to point to the TEST Neon branch
cd backend
npm test
```

Tests cover: login, register (valid/invalid/duplicate), approval flow, directory filters, pagination, and private field leakage.

---

## 8. Production Checklist

- [ ] HTTPS only (TLS termination at load balancer or reverse proxy)
- [ ] `NODE_ENV=production` on server
- [ ] `JWT_SECRET` is a cryptographically random 64+ char string (not the example value)
- [ ] `CLIENT_URL` set to exact production domain (CORS whitelist)
- [ ] `PUBLIC_URL` set to production domain (used in QR codes)
- [ ] `STORAGE_DRIVER=cloudinary` (or s3); install cloudinary npm package and fill in credentials (see `backend/src/services/storage.js`)
- [ ] Neon backups enabled (point-in-time restore)
- [ ] `prisma migrate deploy` (not `migrate dev`) in CI/CD
- [ ] Rate limits reviewed for production traffic
- [ ] `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` configured so approval and contact emails actually deliver
- [ ] `ADMIN_EMAIL` set to the inbox that receives contact form submissions
- [ ] Neon compute auto-suspend: first query after idle may be slow; retry logic in `backend/src/config/prisma.js` handles this

---

## 9. Known Limitations

- **Cloudinary / S3 driver** — interface is stubbed in `backend/src/services/storage.js`; install `cloudinary` npm package and uncomment the driver code.
- **Contact messages are not stored** — form submissions are emailed to `ADMIN_EMAIL` only; no database inbox or admin UI for them.
- **Social links** on alumni profiles are not editable by the alumni (stored but not exposed in the profile update form).
- **Gallery tab on alumni profile** — not wired to a per-alumni gallery model.
- **Two-factor authentication** — not implemented.
- **`prisma migrate dev`** requires a direct connection (use `DIRECT_URL`). Ensure the Neon dev branch endpoint is not suspended when running migrations.
