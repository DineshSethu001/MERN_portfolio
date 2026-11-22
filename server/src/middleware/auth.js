import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { HttpError, asyncHandler } from '../utils/http.js';

export const COOKIE_NAME = 'token';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  };
}

function readToken(req) {
  if (req.cookies?.[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = readToken(req);
  if (!token) throw new HttpError(401, 'Not authenticated');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new HttpError(401, 'Session expired — please sign in again');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, 'Account no longer exists');
  req.user = user;
  next();
});
