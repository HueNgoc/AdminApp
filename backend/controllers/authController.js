const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function login(req, res) {
  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const jwtSecret = process.env.JWT_SECRET;

  if (!adminEmail || !adminPassword || !jwtSecret) {
    return res.status(503).json({ message: 'Admin login is not configured in backend/.env.' });
  }
  if (!email || !password || !safeEqual(email, adminEmail) || !safeEqual(password, adminPassword)) {
    return res.status(401).json({ message: 'Admin email or password is incorrect.' });
  }

  const token = jwt.sign({ sub: adminEmail, role: 'admin' }, jwtSecret, { expiresIn: '8h', algorithm: 'HS256' });
  return res.json({ token, admin: { email: adminEmail } });
}

module.exports = { login };
