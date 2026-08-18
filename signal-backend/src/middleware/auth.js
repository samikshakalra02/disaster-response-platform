const jwt = require('jsonwebtoken');
const config = require('../config');

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header. Expected: Bearer <token>' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.staff = { id: payload.sub, role: payload.role, name: payload.name, email: payload.email };
    next();
  } catch (e) {
    const message = e.name === 'TokenExpiredError' ? 'Session expired, please log in again' : 'Invalid token';
    return res.status(401).json({ error: message });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.staff.role)) {
      return res.status(403).json({ error: `Requires role: ${allowedRoles.join(' or ')}` });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
