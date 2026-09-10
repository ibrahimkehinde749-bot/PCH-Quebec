# Render Backend

This Express service handles administrator authentication, secure sessions, SMTP password recovery, JSONBin operations, and Formspree proxy operations. Netlify continues to serve the public website and admin dashboard frontend.

Location
- Render root directory: `admin/formspree-server`
- Build command: `npm install`
- Start command: `npm start`

Environment
- Copy `.env.example` to `.env` and set values:
  - `FORM_ID` — private Formspree form id
  - `FORM_TOKEN` — private Formspree API token
  - `JSONBIN_BIN_ID` — private winners JSONBin ID
  - `JSONBIN_MASTER_KEY` — private JSONBin master key
  - `ADMIN_EMAIL` — initial administrator Gmail address
  - `ADMIN_PASSWORD` — initial administrator password, at least 12 characters
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
- Stores the administrator email and a salted scrypt password hash in `private/admin-auth.json`.
- Provides server-side login, logout, session validation, and one-time password-reset endpoints.
- Keeps JSONBin and Formspree credentials in server environment variables only.
- Requires an attached Render persistent disk mounted at `/opt/render/project/src/admin/formspree-server/private` if Settings changes must survive restarts or deploys.

Quick tests
- In the browser: open DevTools → Network and watch requests to `/api/formspree/submissions` when you click the `Submissions` tab in the admin dashboard.
- From the terminal (simple fetch, after logging in):
```bash
curl http://localhost:3000/api/formspree/submissions
```

Debug tips
- If the client shows CORS or network errors, confirm `ADMIN_ALLOWED_ORIGIN` exactly matches the deployed admin origin.
- Check the server console for logged errors and the static root path printed on startup.

Security notes
- Keep `FORM_TOKEN` secret. Use server-side environment variables and never expose the token in front-end code.
- Render provides HTTPS and the backend sets `Secure; SameSite=None` cookies in production for the separate Netlify origin.
- Password recovery requires `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS`. In production, `ADMIN_PUBLIC_URL` must use HTTPS.

The admin dashboard must be served by this server. Opening the HTML file directly with `file://` will not provide authentication or API access.
