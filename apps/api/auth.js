const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('./db');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-only-change-me';
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, premiumTier: user.premium_tier || user.premiumTier },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    premiumTier: user.premium_tier || user.premiumTier || 'free',
    premiumUntil: user.premium_until || user.premiumUntil || null,
  };
}

async function register(input) {
  const email = input.email.trim().toLowerCase();

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    const err = new Error('Користувач з таким email вже існує');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const name = input.name?.trim() || email.split('@')[0];

  const result = await query(
    'INSERT INTO users (email, name, password_hash, premium_tier) VALUES ($1, $2, $3, $4) RETURNING *',
    [email, name, passwordHash, 'free']
  );

  const user = result.rows[0];
  return { accessToken: signToken(user), user: publicUser(user) };
}

async function login(input) {
  const email = input.email.trim().toLowerCase();

  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    const err = new Error('Невірний email або пароль');
    err.statusCode = 401;
    throw err;
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) {
    const err = new Error('Невірний email або пароль');
    err.statusCode = 401;
    throw err;
  }

  return { accessToken: signToken(user), user: publicUser(user) };
}

async function profile(userId) {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    const err = new Error('Користувача не знайдено');
    err.statusCode = 404;
    throw err;
  }
  return publicUser(result.rows[0]);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Потрібна авторизація' }));
    return;
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Сесія недійсна або застаріла' }));
  }
}

module.exports = { register, login, profile, authMiddleware };
