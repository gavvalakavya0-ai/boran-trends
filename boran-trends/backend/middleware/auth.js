const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'boran_trends_jwt_secret_key_2026';

function verifyAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
    }
    req.adminUser = decoded.username;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired admin session token.' });
  }
}

module.exports = { verifyAdminToken };
