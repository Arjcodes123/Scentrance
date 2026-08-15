import jwt from 'jsonwebtoken';

const PLACEHOLDERS = new Set([
  'change-me-to-a-long-random-secret-string',
  'dev-only-insecure-secret',
  '',
]);

function resolveSecret() {
  const secret = process.env.JWT_SECRET || '';
  const isProd = process.env.NODE_ENV === 'production';
  // Refuse to boot in production without a real secret — a weak/placeholder
  // JWT secret lets anyone forge admin sessions.
  if (isProd && (PLACEHOLDERS.has(secret) || secret.length < 32)) {
    throw new Error(
      'JWT_SECRET is missing, too short, or still the placeholder. Set a strong random ' +
        'JWT_SECRET (32+ chars, e.g. `openssl rand -hex 32`) before running in production.'
    );
  }
  if (PLACEHOLDERS.has(secret)) {
    console.warn(
      '[security] JWT_SECRET is not set (using an insecure dev fallback). ' +
        'This is fine for local dev only — never deploy like this.'
    );
    return 'dev-only-insecure-secret';
  }
  return secret;
}

const SECRET = resolveSecret();
export const COOKIE_NAME = 'scentrances_token';

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, SECRET, { expiresIn: '7d' });
}

export function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

// Attaches req.user if a valid token is present; never throws.
export function optionalAuth(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      req.user = jwt.verify(token, SECRET);
    } catch {
      /* ignore invalid token */
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}
