const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

dotenv.config();

const PORT = process.env.PORT || 3000;
const JSONBIN_API_URL = process.env.JSONBIN_API_URL || 'https://api.jsonbin.io/v3/b';
const sessions = new Map();

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
    getAuthRecord()
        .then(auth => {
            const session = getSession(req);
            if (!auth || !session || session.revision !== auth.revision) {
                return res.status(401).json({ error: 'Authentication required.', code: 'AUTH_REQUIRED' });
            }
            req.auth = auth;
            return next();
        })
        .catch(error => sendServerError(res, error));
}

function setSession(req, res, revision) {
    const token = crypto.randomBytes(32).toString('base64url');
    sessions.set(token, { revision, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
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

function createConfigurationError(message) {
    const error = new Error(message);
    error.statusCode = 503;
    error.code = 'CONFIGURATION_ERROR';
    return error;
}

function requireEnvironment(names) {
    const missing = names.filter(name => !String(process.env[name] || '').trim());
    if (missing.length > 0) throw createConfigurationError(`Missing server configuration: ${missing.join(', ')}`);
}

function createUpstreamError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = 'JSONBIN_ERROR';
    return error;
}

async function readJsonBinRecord(binId) {
    const response = await fetch(`${JSONBIN_API_URL}/${encodeURIComponent(binId)}`, {
        headers: { 'X-Master-Key': process.env.JSONBIN_MASTER_KEY }
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 404) return null;
    if (!response.ok) throw createUpstreamError(data.message || `JSONBin request failed with status ${response.status}.`, response.status >= 500 ? 502 : 503);
    return data.record || data;
}

async function writeJsonBinRecord(binId, record) {
    const response = await fetch(`${JSONBIN_API_URL}/${encodeURIComponent(binId)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': process.env.JSONBIN_MASTER_KEY,
            'X-Bin-Versioning': 'false'
        },
        body: JSON.stringify(record)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw createUpstreamError(data.message || `JSONBin request failed with status ${response.status}.`, response.status >= 500 ? 502 : 503);
    return data.record || data;
}

async function getAuthRecord() {
    requireEnvironment(['ADMIN_AUTH_BIN_ID', 'JSONBIN_MASTER_KEY']);
    const existing = await readJsonBinRecord(process.env.ADMIN_AUTH_BIN_ID);
    if (existing && existing.email && existing.password && existing.revision) return existing;

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        throw createConfigurationError('Administrator authentication is not initialized. Set ADMIN_EMAIL and ADMIN_PASSWORD once, then remove them after the auth bin is created.');
    }
    const password = String(process.env.ADMIN_PASSWORD);
    if (!isGmail(process.env.ADMIN_EMAIL) || password.length < 12) {
        throw createConfigurationError('Initial administrator credentials are invalid. Use a Gmail address and a password of at least 12 characters.');
    }
    return writeJsonBinRecord(process.env.ADMIN_AUTH_BIN_ID, {
        email: normalizeEmail(process.env.ADMIN_EMAIL),
        password: hashPassword(password),
        revision: 1,
        reset: null
    });
}

function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

app.post('/api/admin/login', async (req, res) => {
    let auth;
    try {
        auth = await getAuthRecord();
    } catch (error) {
        return sendServerError(res, error);
    }
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!auth || email !== auth.email || !verifyPassword(password, auth.password)) {
        return res.status(401).json({ error: 'Invalid administrator email or password.', code: 'INVALID_CREDENTIALS' });
    }
    setSession(req, res, auth.revision);
    return res.json({ ok: true });
});

app.get('/api/admin/me', async (req, res) => {
    try {
        const auth = await getAuthRecord();
        const session = getSession(req);
        const authenticated = Boolean(auth && session && session.revision === auth.revision);
        return res.json({ authenticated, email: authenticated ? auth.email : null });
    } catch (error) {
        return sendServerError(res, error);
    }
});

app.post('/api/admin/logout', (req, res) => {
    clearSession(res, req);
    res.json({ ok: true });
});

app.put('/api/admin/settings', requireSession, async (req, res) => {
    const current = req.auth;
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!isGmail(email)) return res.status(400).json({ error: 'A valid Gmail address is required.' });
    if (password && password.length < 12) return res.status(400).json({ error: 'The password must be at least 12 characters.' });
    try {
        await writeJsonBinRecord(process.env.ADMIN_AUTH_BIN_ID, {
            email,
            password: password ? hashPassword(password) : current.password,
            revision: Number(current.revision || 0) + 1,
            reset: null
        });
    } catch (error) {
        return sendServerError(res, error);
    }
    sessions.clear();
    const sameSite = process.env.NODE_ENV === 'production' ? 'None' : 'Lax';
    res.setHeader('Set-Cookie', `admin_session=; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    res.json({ ok: true, email });
});

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
    const statusCode = error.statusCode || 502;
    const message = statusCode === 503 || error.code === 'SMTP_ERROR' ? error.message : 'The requested backend operation failed.';
    return res.status(statusCode).json({ error: message, code: error.code || 'BACKEND_ERROR' });
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

app.get('/api/public/winners', async (req, res) => {
    try {
        requireEnvironment(['JSONBIN_BIN_ID', 'JSONBIN_MASTER_KEY']);
        const record = await jsonBinRequest('GET');
        res.setHeader('Cache-Control', 'no-store');
        return res.json({ winners: Array.isArray(record.winners) ? record.winners : [] });
    } catch (error) {
        return sendServerError(res, error);
    }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/admin/recovery', async (req, res) => {
    let auth;
    try {
        auth = await getAuthRecord();
    } catch (error) {
        return sendServerError(res, error);
    }
    const email = normalizeEmail(req.body.email);
    const generic = { message: 'If that address is configured, a password reset link has been sent.' };
    if (!auth || email !== auth.email) return res.json(generic);
    const transport = mailer();
    if (!transport) return res.status(503).json({ error: 'Password recovery email is not configured on the server.', code: 'SMTP_NOT_CONFIGURED' });
    const token = crypto.randomBytes(32).toString('hex');
    const reset = { tokenHash: hashResetToken(token), expiresAt: Date.now() + 15 * 60 * 1000 };
    try {
        await writeJsonBinRecord(process.env.ADMIN_AUTH_BIN_ID, { ...auth, reset });
    } catch (error) {
        return sendServerError(res, error);
    }
    let resetUrl;
    try {
        resetUrl = `${getResetBaseUrl()}/admin/?reset=${encodeURIComponent(token)}`;
    } catch (error) {
        await writeJsonBinRecord(process.env.ADMIN_AUTH_BIN_ID, { ...auth, reset: null }).catch(() => {});
        return res.status(503).json({ error: error.message });
    }
    try {
        await transport.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: email, subject: 'Admin password reset', text: `Use this one-time link within 15 minutes to reset your admin password:\n\n${resetUrl}` });
        res.json(generic);
    } catch (error) {
        await writeJsonBinRecord(process.env.ADMIN_AUTH_BIN_ID, { ...auth, reset: null }).catch(() => {});
        console.error('Password recovery email failed:', error);
        res.status(502).json({ error: 'Unable to send the password recovery email.', code: 'SMTP_ERROR' });
    }
});

app.post('/api/admin/reset-password', async (req, res) => {
    let auth;
    try {
        auth = await getAuthRecord();
    } catch (error) {
        return sendServerError(res, error);
    }
    const token = String(req.body.token || '');
    const password = String(req.body.password || '');
    const reset = auth.reset;
    const expected = reset && typeof reset.tokenHash === 'string' ? Buffer.from(reset.tokenHash, 'hex') : null;
    const actual = Buffer.from(hashResetToken(token), 'hex');
    const validToken = expected && expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
    if (!validToken || !Number.isFinite(reset?.expiresAt) || reset.expiresAt < Date.now()) return res.status(400).json({ error: 'This reset link is invalid or expired.', code: 'RESET_INVALID' });
    if (password.length < 12) return res.status(400).json({ error: 'The password must be at least 12 characters.' });
    try {
        await writeJsonBinRecord(process.env.ADMIN_AUTH_BIN_ID, {
            email: auth.email,
            password: hashPassword(password),
            revision: Number(auth.revision || 0) + 1,
            reset: null
        });
    } catch (error) {
        return sendServerError(res, error);
    }
    sessions.clear();
    res.json({ ok: true });
});

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.message === 'Origin is not allowed.') {
        return res.status(403).json({ error: 'This frontend origin is not allowed.', code: 'CORS_ERROR' });
    }
    console.error(error);
    return res.status(500).json({ error: 'The authentication server encountered an unexpected error.', code: 'BACKEND_ERROR' });
});

const siteRoot = path.join(__dirname, '..', '..');
if (process.env.SERVE_FRONTEND === 'true') app.use('/', express.static(siteRoot));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Authentication server listening on 0.0.0.0:${PORT}`);
});
