import { User } from '../models/User.js';
import { HttpError } from '../utils/http.js';
import { COOKIE_NAME, cookieOptions, signToken } from '../middleware/auth.js';

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');

  // Same message for unknown email and wrong password, so accounts can't be probed.
  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.cookie(COOKIE_NAME, signToken(user), cookieOptions());
  res.json({ user: user.toJSON() });
}

export function logout(_req, res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, opts);
  res.status(204).end();
}

export function me(req, res) {
  res.json({ user: req.user.toJSON() });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user) throw new HttpError(401, 'Not signed in');

  if (!(await user.comparePassword(currentPassword))) {
    throw new HttpError(400, 'Current password is incorrect', { currentPassword: 'Current password is incorrect' });
  }

  await user.setPassword(newPassword);
  await user.save();

  // Re-issue the session cookie so this browser stays signed in.
  res.cookie(COOKIE_NAME, signToken(user), cookieOptions());
  res.json({ message: 'Password updated' });
}
