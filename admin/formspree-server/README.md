# Render Backend

This Express service handles administrator authentication, secure sessions, SMTP password recovery, and JSONBin operations. Netlify continues to serve the public website and admin dashboard frontend. Administrator credentials and reset state are stored as a salted password hash and expiring token hash in a dedicated private JSONBin record, so Render Free does not require a persistent disk.

Location
- Render root directory: `admin/formspree-server`
- Build command: `npm install`
- Start command: `npm start`

Environment
- Copy `.env.example` to `.env` and set values:
  - `JSONBIN_BIN_ID` — private winners JSONBin ID
  - `ADMIN_AUTH_BIN_ID` — separate private JSONBin ID for administrator authentication state
  - `JSONBIN_MASTER_KEY` — private JSONBin master key
  - `ADMIN_EMAIL` — bootstrap Gmail address; needed until the auth bin is initialized
  - `ADMIN_PASSWORD` — bootstrap password; hashed immediately and never stored plaintext
  - `ADMIN_ALLOWED_ORIGIN` — HTTPS origin of the deployed admin frontend
  - `SMTP_HOST` — required SMTP hostname from your email provider
  - `SMTP_PORT` — optional SMTP port; `587` for STARTTLS or `465` for implicit TLS
  - `SMTP_SECURE` — optional `true` for port 465, otherwise `false` for port 587
  - `SMTP_USER` — required authenticated SMTP mailbox username
  - `SMTP_PASS` — required SMTP password or provider-issued app password
  - `SMTP_FROM` — optional approved sender address, normally the authenticated mailbox
  - `ADMIN_PUBLIC_URL` — public absolute HTTPS URL used in reset links in production
  - `PORT` — supplied by Render
  - `NODE_ENV` — set to `production`
  - `SERVE_FRONTEND` — set to `false`

DO NOT commit your `.env` to source control.

Install & Run (local)
1. Open a terminal and change directory:
```bash
cd admin/formspree-server
```
2. Install dependencies and start the server:
```bash
npm install
npm start
```
3. Open the admin dashboard served by the proxy (do not open files with `file://`):

http://localhost:3000/admin/index.html

What this does
- Binds to `0.0.0.0` and `process.env.PORT` for Render.
- Stores administrator email, a salted scrypt password hash, credential revision, and hashed expiring reset state in the private auth JSONBin.
- Provides server-side login, logout, session validation, and one-time password-reset endpoints.
- Exposes `GET /api/public/winners` for the public winners page; it returns only the winners array and never exposes the JSONBin Master Key.
- Public application and contact forms submit directly from Netlify to `https://formspree.io/f/xgawendv` using Formspree's standard HTTP form endpoint. No Formspree credentials are required on Render.
- Does not require a Render persistent disk.

Quick tests
Debug tips
- If the client shows CORS or network errors, confirm `ADMIN_ALLOWED_ORIGIN` exactly matches the deployed admin origin.
- Check the server console for logged errors and the static root path printed on startup.

Security notes
- Render provides HTTPS and the backend sets `Secure; SameSite=None` cookies in production for the separate Netlify origin.
- Password recovery requires `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS`. In production, `ADMIN_PUBLIC_URL` must use HTTPS.

The admin dashboard must be served by this server. Opening the HTML file directly with `file://` will not provide authentication or API access.
