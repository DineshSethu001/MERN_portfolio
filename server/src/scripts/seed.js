// Creates (or updates) the admin account from ADMIN_EMAIL / ADMIN_PASSWORD,
// and adds sample projects if the collection is empty.
//   npm run seed                 -> admin + samples
//   npm run seed -- --no-samples -> admin only
//   npm run seed -- --reset-password -> overwrite the existing admin's password with ADMIN_PASSWORD
//     (use this if you forget the password you set in /admin → Settings)
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';

const samples = [
  {
    title: 'Orders & Payments API', slug: 'orders-payments-api', category: 'APIs', featured: true, order: 0,
    summary: 'The transactional core of an e-commerce platform: carts, orders, inventory and payments.',
    description: 'Replace this with your case study.\n\nThe problem: …\n\nWhat I built: …\n\nWhat I would do differently: …',
    highlights: ['MongoDB multi-document transactions keep stock and orders consistent', 'Idempotent Stripe webhook handling with a retry-safe event log', 'Redis caching for catalogue reads; cursor pagination throughout'],
    tags: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Stripe'],
  },
  {
    title: 'Realtime Chat Service', slug: 'realtime-chat-service', category: 'Real-time', featured: true, order: 1,
    summary: 'Rooms, presence and message history for a collaborative app, built to scale horizontally.',
    highlights: ['Socket.IO with the Redis adapter so any instance can serve any room', 'Message persistence with TTL indexes for ephemeral channels', 'JWT-authenticated socket handshakes and per-room permissions'],
    tags: ['Node.js', 'Socket.IO', 'Redis', 'MongoDB'],
  },
  {
    title: 'Jobs & Notifications Pipeline', slug: 'jobs-notifications-pipeline', category: 'Infra', order: 2,
    summary: 'Background processing for emails, SMS and report generation, decoupled from the API.',
    highlights: ['BullMQ workers with retries, back-off and a dead-letter queue', 'Dockerised services deployed via GitHub Actions to AWS', 'Alerts on queue depth and failure rate'],
    tags: ['BullMQ', 'Docker', 'AWS', 'GitHub Actions'],
  },
  {
    title: 'Multi-tenant SaaS Auth', slug: 'multi-tenant-saas-auth', category: 'APIs', order: 3,
    summary: 'Authentication and authorisation service shared across several products.',
    highlights: ['Access + rotating refresh tokens with reuse detection', 'Role- and tenant-based access control as Express middleware', 'Rate limiting and an append-only audit log'],
    tags: ['Node.js', 'Express', 'JWT', 'MongoDB'],
  },
];

async function run() {
  const { adminEmail, adminPassword } = env;
  if (!adminEmail || !adminPassword) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first');
  if (adminPassword.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters');

  await connectDB(env.mongoUri);

  let user = await User.findOne({ email: adminEmail.toLowerCase() });
  const created = !user;
  const reset = process.argv.includes('--reset-password');
  if (created || reset) {
    if (!user) user = new User({ email: adminEmail });
    await user.setPassword(adminPassword);
    await user.save();
    console.log(`✓ Admin ${created ? 'created' : 'password reset from .env'}: ${user.email}`);
  } else {
    // Don't overwrite a password changed in the dashboard.
    console.log(`✓ Admin already exists: ${user.email} (password unchanged; pass --reset-password to reset it from .env)`);
  }

  if (!process.argv.includes('--no-samples') && (await Project.countDocuments()) === 0) {
    await Project.insertMany(samples);
    console.log(`✓ Added ${samples.length} sample projects (edit or delete them in /admin)`);
  }

  await disconnectDB();
}

run().catch(async (err) => {
  console.error('✗ Seed failed:', err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
