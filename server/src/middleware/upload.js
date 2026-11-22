import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { HttpError } from '../utils/http.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  // Random names: never trust the client's filename.
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ALLOWED[file.mimetype]}`),
});

export const uploadCover = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED[file.mimetype]) cb(null, true);
    else cb(new HttpError(400, 'Cover must be a JPG, PNG, WebP or GIF image', { cover: 'Unsupported file type' }));
  },
}).single('cover');

export function publicPath(file) {
  return file ? `/uploads/${file.filename}` : '';
}

// Deletes a previously uploaded file; ignores anything outside the uploads folder.
export async function removeUpload(publicUrl) {
  if (!publicUrl || !publicUrl.startsWith('/uploads/')) return;
  const target = path.resolve(UPLOAD_DIR, path.basename(publicUrl));
  if (!target.startsWith(UPLOAD_DIR)) return;
  await fs.promises.unlink(target).catch(() => {});
}
