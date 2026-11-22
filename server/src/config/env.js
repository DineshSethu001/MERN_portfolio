import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

function required(key, devFallback) {
  const value = process.env[key] ?? (isProd ? undefined : devFallback);
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv,
  isProd,
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT || 5000),
  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/portfolio'),
  jwtSecret: required('JWT_SECRET', 'dev-only-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
};
