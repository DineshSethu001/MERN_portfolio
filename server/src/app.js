import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { UPLOAD_DIR } from './middleware/upload.js';
import { notFound, errorHandler } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
        },
      },
    })
  );
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(cookieParser());
  if (!env.isTest) app.use(morgan(env.isProd ? 'combined' : 'dev'));

  app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', index: false }));
  app.use('/api', apiLimiter, routes);
  app.use('/api', notFound);

  // In production the API also serves the built React app.
  if (env.isProd && fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST, { maxAge: '1h', index: false }));
    app.get('*', (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
