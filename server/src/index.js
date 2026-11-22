import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { createApp } from './app.js';

async function start() {
  try {
    await connectDB(env.mongoUri);
    console.log('✓ MongoDB connected');
  } catch (err) {
    console.error('✗ Could not connect to MongoDB:', err.message);
    process.exit(1);
  }

  const server = createApp().listen(env.port, () => {
    console.log(`✓ API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
