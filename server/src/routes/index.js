import { Router } from 'express';
import mongoose from 'mongoose';
import { createRequire } from 'node:module';
import { asyncHandler } from '../utils/http.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadCover } from '../middleware/upload.js';
import { loginLimiter, passwordLimiter, contactLimiter } from '../middleware/rateLimit.js';
import {
  loginSchema, changePasswordSchema, createProjectSchema, updateProjectSchema, projectQuerySchema,
  reorderSchema, messageSchema, messageUpdateSchema,
} from '../validators/schemas.js';
import * as auth from '../controllers/authController.js';
import * as projects from '../controllers/projectController.js';
import * as messages from '../controllers/messageController.js';
import { profile } from '../config/profile.js';

const { version } = createRequire(import.meta.url)('../../package.json');
const a = asyncHandler;
const router = Router();

// --- meta ---
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version,
    uptimeSeconds: Math.round(process.uptime()),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});
router.get('/profile', (_req, res) => res.json(profile));

// --- auth ---
router.post('/auth/login', loginLimiter, validate(loginSchema), a(auth.login));
router.post('/auth/logout', auth.logout);
router.get('/auth/me', requireAuth, auth.me);
// Rate-limited so the current password can't be brute-forced from a stolen session.
router.patch('/auth/password', requireAuth, passwordLimiter, validate(changePasswordSchema), a(auth.changePassword));

// --- projects ---
router.get('/projects', validate(projectQuerySchema, 'query'), a(projects.listPublic));
router.get('/projects/admin/all', requireAuth, a(projects.listAll));
router.patch('/projects/reorder', requireAuth, validate(reorderSchema), a(projects.reorder));
router.get('/projects/:slug', a(projects.getBySlug));
// Auth runs BEFORE multer so anonymous uploads never touch the disk.
router.post('/projects', requireAuth, uploadCover, validate(createProjectSchema), a(projects.create));
router.put('/projects/:id', requireAuth, uploadCover, validate(updateProjectSchema), a(projects.update));
router.delete('/projects/:id', requireAuth, a(projects.remove));

// --- contact messages ---
router.post('/messages', contactLimiter, validate(messageSchema), a(messages.create));
router.get('/messages', requireAuth, a(messages.list));
router.patch('/messages/:id', requireAuth, validate(messageUpdateSchema), a(messages.update));
router.delete('/messages/:id', requireAuth, a(messages.remove));

export default router;
