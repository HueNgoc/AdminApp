const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(503).json({ message: 'Authentication is not configured.' });
  }

  const match = /^Bearer\s+(\S+)$/i.exec(req.get('authorization') || '');
  if (!match) {
    return res.status(401).json({ message: 'A Bearer token is required.' });
  }

  try {
    const payload = jwt.verify(match[1], secret, { algorithms: ['HS256'] });
    if (typeof payload.sub !== 'string' || !payload.sub || payload.role !== 'admin') {
      return res.status(403).json({ message: 'Administrator access is required.' });
    }

    req.auth = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }
}

module.exports = requireAuth;
