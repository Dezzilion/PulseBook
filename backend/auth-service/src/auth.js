const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

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

function getUserByEmail(email) {
  return db.getUserByEmail(email);
}

function getUserById(id) {
  return db.getUserById(id);
}

function createUser({ email, password, firstName, lastName }) {
  const passwordHash = bcrypt.hashSync(password, 10);
  return db.addUser({ email, passwordHash, firstName, lastName });
}

function setUserRefreshToken(userId, token) {
  return db.updateUser(userId, { refreshToken: token });
}

function clearUserRefreshToken(userId) {
  return db.updateUser(userId, { refreshToken: null });
}

function userResponse(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  getUserByEmail,
  getUserById,
  createUser,
  setUserRefreshToken,
  clearUserRefreshToken,
  userResponse,
};
