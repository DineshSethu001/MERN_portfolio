import { z } from 'zod';
import { CATEGORIES } from '../models/Project.js';

// Multipart forms send everything as strings, so these helpers coerce them.
const bool = z.preprocess((v) => (typeof v === 'string' ? v === 'true' : v), z.boolean());

const list = (separator, max, itemMax) =>
  z.preprocess((v) => {
    if (Array.isArray(v)) return v;
    if (typeof v !== 'string') return v;
    const s = v.trim();
    if (!s) return [];
    if (s.startsWith('[')) {
      try { return JSON.parse(s); } catch { /* fall through */ }
    }
    return s.split(separator);
  }, z.array(z.string().trim().max(itemMax)).transform((a) => a.filter(Boolean)).pipe(z.array(z.string()).max(max)));

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), 'Must start with http:// or https://')
  .optional();

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').max(200),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password').max(200),
    newPassword: z.string().min(10, 'Use at least 10 characters').max(200),
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current one',
  });

const projectFields = {
  title: z.string().trim().min(3, 'Title needs at least 3 characters').max(120),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: `Pick one of: ${CATEGORIES.join(', ')}` }) }),
  summary: z.string().trim().min(20, 'Summary needs at least 20 characters').max(300),
  description: z.string().max(10000).optional(),
  highlights: list(/\r?\n/, 10, 200).optional(),
  tags: list(',', 20, 60).refine((a) => a.length > 0, 'Add at least one technology'),
  sourceUrl: optionalUrl,
  liveUrl: optionalUrl,
  featured: bool.optional(),
  published: bool.optional(),
  removeCover: bool.optional(),
};

export const createProjectSchema = z.object(projectFields);
export const updateProjectSchema = z.object(projectFields).partial();

export const projectQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  featured: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')).min(1).max(200),
});

export const messageSchema = z.object({
  name: z.string().trim().min(2, 'Tell me your name').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(160),
  subject: z.string().trim().max(120).optional().default(''),
  body: z.string().trim().min(10, 'Message needs at least 10 characters').max(5000),
  website: z.string().max(0, 'Spam detected').optional(), // honeypot: real users never fill this
});

export const messageUpdateSchema = z.object({ read: z.boolean() });
