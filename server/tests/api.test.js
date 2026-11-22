import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

let mongo, app, mongoose, User;
const ADMIN = { email: 'admin@test.dev', password: 'super-secret-pass' };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  ({ default: mongoose } = await import('mongoose'));
  const { connectDB } = await import('../src/config/db.js');
  const { createApp } = await import('../src/app.js');
  ({ User } = await import('../src/models/User.js'));
  await connectDB(process.env.MONGO_URI);
  app = createApp();

  const user = new User({ email: ADMIN.email });
  await user.setPassword(ADMIN.password);
  await user.save();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongo.stop();
});

async function loginAgent() {
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send(ADMIN).expect(200);
  return agent;
}

describe('meta', () => {
  test('GET /api/health reports database status', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'connected' });
  });

  test('unknown API route returns JSON 404', async () => {
    const res = await request(app).get('/api/nope').expect(404);
    expect(res.body.error.message).toMatch(/not found/i);
  });
});

describe('auth', () => {
  test('rejects a wrong password with a generic message', async () => {
    const res = await request(app).post('/api/auth/login').send({ ...ADMIN, password: 'wrong' }).expect(401);
    expect(res.body.error.message).toBe('Invalid email or password');
  });

  test('validates the email format', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nope', password: 'x' }).expect(400);
    expect(res.body.error.details.email).toBeDefined();
  });

  test('sets an httpOnly cookie and never returns the hash', async () => {
    const res = await request(app).post('/api/auth/login').send(ADMIN).expect(200);
    expect(res.headers['set-cookie'][0]).toMatch(/token=.*HttpOnly/i);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('GET /api/auth/me requires a session', async () => {
    await request(app).get('/api/auth/me').expect(401);
    const agent = await loginAgent();
    const res = await agent.get('/api/auth/me').expect(200);
    expect(res.body.user.email).toBe(ADMIN.email);
  });
});

describe('change password', () => {
  test('requires a session', async () => {
    await request(app).patch('/api/auth/password').send({ currentPassword: ADMIN.password, newPassword: 'another-long-pass' }).expect(401);
  });

  test('rejects a wrong current password and a short new one', async () => {
    const agent = await loginAgent();
    const wrong = await agent.patch('/api/auth/password').send({ currentPassword: 'nope-nope-nope', newPassword: 'another-long-pass' }).expect(400);
    expect(wrong.body.error.details.currentPassword).toBeDefined();
    const short = await agent.patch('/api/auth/password').send({ currentPassword: ADMIN.password, newPassword: 'short' }).expect(400);
    expect(short.body.error.details.newPassword).toBeDefined();
  });

  test('changes the password, keeps the session, and the old one stops working', async () => {
    const agent = await loginAgent();
    const next = 'brand-new-password-123';
    await agent.patch('/api/auth/password').send({ currentPassword: ADMIN.password, newPassword: next }).expect(200);
    await agent.get('/api/auth/me').expect(200);
    await request(app).post('/api/auth/login').send(ADMIN).expect(401);
    await request(app).post('/api/auth/login').send({ email: ADMIN.email, password: next }).expect(200);

    // Restore for the remaining tests.
    const user = await User.findOne({ email: ADMIN.email });
    await user.setPassword(ADMIN.password);
    await user.save();
  });
});

describe('projects', () => {
  test('anonymous users cannot create projects', async () => {
    await request(app).post('/api/projects').send({ title: 'Nope' }).expect(401);
  });

  test('admin can create, update, list, reorder and delete', async () => {
    const agent = await loginAgent();

    const created = await agent
      .post('/api/projects')
      .field('title', 'Payments API')
      .field('category', 'APIs')
      .field('summary', 'Handles payments and refunds for the shop.')
      .field('tags', 'Node.js, Express, MongoDB')
      .field('highlights', 'Idempotent webhooks\nRetries')
      .field('featured', 'true')
      .attach('cover', PNG, { filename: 'cover.png', contentType: 'image/png' })
      .expect(201);
    const p = created.body.data;
    expect(p.slug).toBe('payments-api');
    expect(p.tags).toEqual(['Node.js', 'Express', 'MongoDB']);
    expect(p.highlights).toHaveLength(2);
    expect(p.featured).toBe(true);
    expect(p.coverImage).toMatch(/^\/uploads\/.+\.png$/);

    await request(app).get(p.coverImage).expect(200);

    const draft = await agent.post('/api/projects').field({
      title: 'Secret Draft', category: 'Infra', summary: 'Not ready for the public yet, sorry.', tags: 'Docker', published: 'false',
    }).expect(201);

    const pub = await request(app).get('/api/projects').expect(200);
    expect(pub.body.data.map((x) => x.title)).toEqual(['Payments API']);
    await request(app).get('/api/projects/secret-draft').expect(404);

    const all = await agent.get('/api/projects/admin/all').expect(200);
    expect(all.body.count).toBe(2);

    const updated = await agent.put(`/api/projects/${p._id}`).field('title', 'Payments Platform API').field('removeCover', 'true').expect(200);
    expect(updated.body.data.slug).toBe('payments-platform-api');
    expect(updated.body.data.coverImage).toBe('');
    await request(app).get(p.coverImage).expect(404);

    await agent.patch('/api/projects/reorder').send({ ids: [p._id, draft.body.data._id] }).expect(200);

    await agent.delete(`/api/projects/${p._id}`).expect(204);
    await agent.delete(`/api/projects/${p._id}`).expect(404);
  });

  test('returns field errors for invalid input', async () => {
    const agent = await loginAgent();
    const res = await agent.post('/api/projects').field({ title: 'X', category: 'Nope', summary: 'short', tags: '' }).expect(400);
    expect(Object.keys(res.body.error.details)).toEqual(expect.arrayContaining(['title', 'category', 'summary', 'tags']));
  });

  test('rejects non-image uploads', async () => {
    const agent = await loginAgent();
    await agent
      .post('/api/projects')
      .field({ title: 'Bad File', category: 'APIs', summary: 'Trying to upload a text file.', tags: 'x' })
      .attach('cover', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' })
      .expect(400);
  });

  test('ignores query-operator injection', async () => {
    await request(app).get('/api/projects?category[$ne]=x').expect(400);
  });
});

describe('messages', () => {
  test('visitors can send a message; admin can read, mark and delete it', async () => {
    await request(app).post('/api/messages').send({ name: 'Ada', email: 'ada@example.com', body: 'Hi! Want to talk about a backend role?' }).expect(201);
    await request(app).get('/api/messages').expect(401);

    const agent = await loginAgent();
    const list = await agent.get('/api/messages').expect(200);
    expect(list.body.unread).toBe(1);
    const id = list.body.data[0]._id;

    const marked = await agent.patch(`/api/messages/${id}`).send({ read: true }).expect(200);
    expect(marked.body.data.read).toBe(true);
    await agent.delete(`/api/messages/${id}`).expect(204);
  });

  test('blocks the honeypot and short messages', async () => {
    await request(app).post('/api/messages').send({ name: 'Bot', email: 'b@b.co', body: 'Buy cheap stuff now!!!', website: 'spam.io' }).expect(400);
    const res = await request(app).post('/api/messages').send({ name: 'A', email: 'bad', body: 'hey' }).expect(400);
    expect(Object.keys(res.body.error.details)).toEqual(expect.arrayContaining(['name', 'email', 'body']));
  });
});
