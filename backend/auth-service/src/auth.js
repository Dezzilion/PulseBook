const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'pulsebook-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'pulsebook-refresh-secret';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

function createAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

function createRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}


module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
};
