const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');

dotenv.config();

const PORT = process.env.PORT || 3000;
const AUTH_FILE = process.env.ADMIN_AUTH_FILE || path.join(__dirname, 'private', 'admin-auth.json');
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const FORMSPREE_API_URL = 'https://formspree.io/api/0/forms';
const sessions = new Map();
const resetTokens = new Map();

const app = express();
app.set('trust proxy', 1);
const allowedOrigins = String(process.env.ADMIN_ALLOWED_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
function isAllowedOrigin(origin) {
    return !origin || allowedOrigins.includes(origin);
}

app.use(cors({
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) return callback(null, origin || false);
        return callback(new Error('Origin is not allowed.'));
    },
    credentials: true
}));
app.use(express.json());

app.use('/api', (req, res, next) => {
    if (!isAllowedOrigin(req.headers.origin)) return res.status(403).json({ error: 'Origin is not allowed.' });
    next();
});

function ensureAuthStore() {
    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    if (!fs.existsSync(AUTH_FILE)) {
        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            return null;
        }
        saveAuth({ email: normalizeEmail(process.env.ADMIN_EMAIL), password: hashPassword(process.env.ADMIN_PASSWORD) });
    }
    return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
}

function saveAuth(auth) {
    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2), { mode: 0o600 });
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function isGmail(email) {
    return /^[\w.-]+@gmail\.com$/i.test(email);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { salt, hash };
}

function verifyPassword(password, stored) {
    if (!stored || typeof stored.salt !== 'string' || typeof stored.hash !== 'string') return false;
    const candidate = crypto.scryptSync(password, stored.salt, 64);
    const expected = Buffer.from(stored.hash, 'hex');
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

function getSession(req) {
    const cookies = Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(cookie => {
        const index = cookie.indexOf('=');
        return [cookie.slice(0, index).trim(), decodeURIComponent(cookie.slice(index + 1))];
    }));
    const token = cookies.admin_session;
    const session = token ? sessions.get(token) : null;
    if (!session || session.expiresAt < Date.now()) {
        if (token) sessions.delete(token);
        return null;
    }
    return session;
}

function requireSession(req, res, next) {
    if (!getSession(req)) return res.status(401).json({ error: 'Authentication required.' });
    next();
}

function setSession(req, res) {
    const token = crypto.randomBytes(32).toString('base64url');
    sessions.set(token, { expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
    const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const sameSite = process.env.NODE_ENV === 'production' ? 'None' : 'Lax';
    res.setHeader('Set-Cookie', `admin_session=${encodeURIComponent(token)}; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=28800${secure ? '; Secure' : ''}`);
}

function clearSession(res, req) {
    const cookies = (req.headers.cookie || '').split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_session='));
    if (tokenCookie) sessions.delete(decodeURIComponent(tokenCookie.trim().slice('admin_session='.length)));
    const sameSite = process.env.NODE_ENV === 'production' ? 'None' : 'Lax';
    res.setHeader('Set-Cookie', `admin_session=; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}

function mailer() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
    const port = Number(process.env.SMTP_PORT || 587);
    if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
}

function getResetBaseUrl() {
    const configuredUrl = String(process.env.ADMIN_PUBLIC_URL || '').trim().replace(/\/$/, '');
    if (!configuredUrl) return `http://localhost:${PORT}`;

    let parsedUrl;
    try {
        parsedUrl = new URL(configuredUrl);
    } catch {
        throw new Error('ADMIN_PUBLIC_URL must be a valid absolute URL.');
    }

    if (process.env.NODE_ENV === 'production' && parsedUrl.protocol !== 'https:') {
        throw new Error('ADMIN_PUBLIC_URL must use HTTPS in production.');
    }

    return configuredUrl;
}

app.post('/api/admin/login', (req, res) => {
    const auth = ensureAuthStore();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!auth || email !== auth.email || !verifyPassword(password, auth.password)) {
        return res.status(401).json({ error: 'Invalid administrator email or password.' });
    }
    setSession(req, res);
    return res.json({ ok: true });
});

app.get('/api/admin/me', (req, res) => {
    const auth = ensureAuthStore();
    const authenticated = Boolean(auth && getSession(req));
    return res.json({ authenticated, email: authenticated ? auth.email : null });
});

app.post('/api/admin/logout', (req, res) => {
    clearSession(res, req);
    res.json({ ok: true });
});

app.put('/api/admin/settings', requireSession, (req, res) => {
    const current = ensureAuthStore();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!isGmail(email)) return res.status(400).json({ error: 'A valid Gmail address is required.' });
    if (!current && password.length < 12) return res.status(400).json({ error: 'The initial password must be at least 12 characters.' });
    if (password && password.length < 12) return res.status(400).json({ error: 'The password must be at least 12 characters.' });
    saveAuth({ email, password: password ? hashPassword(password) : current.password });
    sessions.clear();
    const sameSite = process.env.NODE_ENV === 'production' ? 'None' : 'Lax';
    res.setHeader('Set-Cookie', `admin_session=; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    res.json({ ok: true, email });
});

function requireEnvironment(names) {
    const missing = names.filter(name => !String(process.env[name] || '').trim());
    if (missing.length > 0) {
        const error = new Error(`Missing server configuration: ${missing.join(', ')}`);
        error.statusCode = 503;
        throw error;
    }
}

async function jsonBinRequest(method, body) {
    requireEnvironment(['JSONBIN_BIN_ID', 'JSONBIN_MASTER_KEY']);
    const response = await fetch(`${JSONBIN_API_URL}/${encodeURIComponent(process.env.JSONBIN_BIN_ID)}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
            'X-Bin-Versioning': 'false'
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data.message || `JSONBin request failed with status ${response.status}.`);
        error.statusCode = response.status >= 500 ? 502 : response.status;
        throw error;
    }
    return data.record || data;
}

function sendServerError(res, error) {
    console.error(error);
    return res.status(error.statusCode || 502).json({ error: error.statusCode === 503 ? error.message : 'The upstream service is unavailable.' });
}

app.get('/api/admin/winners', requireSession, async (req, res) => {
    try {
        const record = await jsonBinRequest('GET');
        return res.json({ winners: Array.isArray(record.winners) ? record.winners : [] });
    } catch (error) {
        return sendServerError(res, error);
    }
});

app.put('/api/admin/winners', requireSession, async (req, res) => {
    if (!req.body || !Array.isArray(req.body.winners)) return res.status(400).json({ error: 'Winners must be an array.' });
    try {
        const record = await jsonBinRequest('PUT', { winners: req.body.winners });
        return res.json({ winners: Array.isArray(record.winners) ? record.winners : req.body.winners });
    } catch (error) {
        return sendServerError(res, error);
    }
});

app.get('/api/formspree/submissions', requireSession, async (req, res) => {
    try {
        requireEnvironment(['FORM_ID', 'FORM_TOKEN']);
        const response = await fetch(`${FORMSPREE_API_URL}/${encodeURIComponent(process.env.FORM_ID)}/submissions`, {
            headers: { Accept: 'application/json', Authorization: `Bearer ${process.env.FORM_TOKEN}` }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(data.message || `Formspree request failed with status ${response.status}.`);
            error.statusCode = response.status >= 500 ? 502 : response.status;
            throw error;
        }
        return res.json({ submissions: Array.isArray(data) ? data : data.submissions || [] });
    } catch (error) {
        return sendServerError(res, error);
    }
});

app.post('/api/forms/submit', multer().none(), async (req, res) => {
    try {
        requireEnvironment(['FORM_ID', 'FORM_TOKEN']);
        const formFields = new URLSearchParams(req.body || {});
        const response = await fetch(`https://formspree.io/f/${encodeURIComponent(process.env.FORM_ID)}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${process.env.FORM_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formFields
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(data.error || `Formspree request failed with status ${response.status}.`);
            error.statusCode = response.status >= 500 ? 502 : response.status;
            throw error;
        }
        return res.status(response.status).json({ ok: true, message: data.message || 'Form submitted successfully.' });
    } catch (error) {
        return sendServerError(res, error);
    }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/admin/recovery', async (req, res) => {
    const auth = ensureAuthStore();
    const email = normalizeEmail(req.body.email);
    const generic = { message: 'If that address is configured, a password reset link has been sent.' };
    if (!auth || email !== auth.email) return res.json(generic);
    const transport = mailer();
    if (!transport) return res.status(503).json({ error: 'Password recovery email is not configured on the server.' });
    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, { email, expiresAt: Date.now() + 15 * 60 * 1000 });
    let resetUrl;
    try {
        resetUrl = `${getResetBaseUrl()}/admin/?reset=${encodeURIComponent(token)}`;
    } catch (error) {
        resetTokens.delete(token);
        return res.status(503).json({ error: error.message });
    }
    try {
        await transport.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: email, subject: 'Admin password reset', text: `Use this one-time link within 15 minutes to reset your admin password:\n\n${resetUrl}` });
        res.json(generic);
    } catch (error) {
        resetTokens.delete(token);
        console.error('Password recovery email failed:', error);
        res.status(500).json({ error: 'Unable to send the password recovery email.' });
    }
});

app.post('/api/admin/reset-password', (req, res) => {
    const record = resetTokens.get(String(req.body.token || ''));
    const password = String(req.body.password || '');
    if (!record || record.expiresAt < Date.now()) return res.status(400).json({ error: 'This reset link is invalid or expired.' });
    if (password.length < 12) return res.status(400).json({ error: 'The password must be at least 12 characters.' });
    const auth = ensureAuthStore();
    if (!auth) return res.status(400).json({ error: 'Administrator authentication is not configured.' });
    saveAuth({ email: auth.email, password: hashPassword(password) });
    resetTokens.delete(String(req.body.token));
    sessions.clear();
    res.json({ ok: true });
});

const siteRoot = path.join(__dirname, '..', '..');
if (process.env.SERVE_FRONTEND === 'true') app.use('/', express.static(siteRoot));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Authentication server listening on 0.0.0.0:${PORT}`);
});
