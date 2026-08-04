import jwt from 'jsonwebtoken';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';

const COOKIE_NAME = 'fcu_session';
const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function setAuthCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })
  );
}

export function clearAuthCookie(res) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  );
}

export function getUserFromReq(req) {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const parsed = parseCookie(raw);
  const token = parsed[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { id: payload.sub, pseudo: payload.pseudo, role: payload.role };
  } catch {
    return null;
  }
}

// Wrap a Vercel serverless handler so it requires a valid session, and
// optionally restricts access to a set of roles. On success req.user is set.
export function requireRole(roles, handler) {
  return async (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      res.status(401).json({ error: 'Non authentifie' });
      return;
    }
    if (roles && roles.length > 0 && !roles.includes(user.role)) {
      res.status(403).json({ error: 'Acces refuse' });
      return;
    }
    req.user = user;
    return handler(req, res);
  };
}
