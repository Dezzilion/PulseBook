const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  getUserByEmail,
  getUserById,
  createUser,
  setUserRefreshToken,
  clearUserRefreshToken,
  userResponse,
} = require('./auth');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  if (getUserByEmail(email)) {
    return res.status(409).json({ message: 'Email already registered.' });
  }

  const user = createUser({ email, password, firstName, lastName });
  const accessToken = createAccessToken({ userId: user.id });
  const refreshToken = createRefreshToken({ userId: user.id });

  setUserRefreshToken(user.id, refreshToken);

  res.json({
    user: userResponse(user),
    accessToken,
    refreshToken,
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password.' });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const bcrypt = require('bcryptjs');
  const passwordMatches = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const accessToken = createAccessToken({ userId: user.id });
  const refreshToken = createRefreshToken({ userId: user.id });
  setUserRefreshToken(user.id, refreshToken);

  res.json({
    user: userResponse(user),
    accessToken,
    refreshToken,
  });
});

app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Missing refresh token.' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = getUserById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const accessToken = createAccessToken({ userId: user.id });
    const nextRefreshToken = createRefreshToken({ userId: user.id });
    setUserRefreshToken(user.id, nextRefreshToken);

    return res.json({ accessToken, refreshToken: nextRefreshToken });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token expired or invalid.' });
  }
});

app.post('/auth/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Missing refresh token.' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = getUserById(payload.userId);
    if (user && user.refreshToken === refreshToken) {
      clearUserRefreshToken(user.id);
    }
  } catch (_) {
    // ignore invalid tokens during logout
  }

  res.json({ success: true });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(port, () => {
  console.log(`Auth service listening on http://localhost:${port}`);
});
