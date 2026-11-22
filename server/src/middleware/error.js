import multer from 'multer';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http.js';
import { zodToFields } from './validate.js';
import { removeUpload, publicPath } from './upload.js';

export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  // If a request failed after multer saved a file, clean it up.
  if (req.file) removeUpload(publicPath(req.file));

  let status = err.status || 500;
  let message = err.message || 'Something went wrong';
  let details = err.details;

  if (err instanceof ZodError) {
    status = 400;
    message = 'Please fix the highlighted fields';
    details = zodToFields(err);
  } else if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image is larger than 5 MB' : err.message;
    details = { cover: message };
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Validation failed';
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err.code === 11000) {
    status = 409;
    message = 'A record with that value already exists';
  }

  if (status >= 500) {
    console.error(err);
    if (env.isProd) message = 'Internal server error';
  }

  res.status(status).json({ error: { message, ...(details ? { details } : {}) } });
}
