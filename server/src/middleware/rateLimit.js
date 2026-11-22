import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit: env.isTest ? 1000 : limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: { message } },
  });

export const apiLimiter = make(15 * 60 * 1000, 300, 'Too many requests, slow down a little.');
export const loginLimiter = make(15 * 60 * 1000, 10, 'Too many sign-in attempts. Try again in 15 minutes.');
export const passwordLimiter = make(15 * 60 * 1000, 5, 'Too many password change attempts. Try again in 15 minutes.');
export const contactLimiter = make(60 * 60 * 1000, 5, 'You have sent several messages already — please try again later.');
