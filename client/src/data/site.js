// ✏️  Edit this file to make the portfolio yours. Projects are managed in /admin.
export const site = {
  name: 'Dinesh T',
  handle: 'dinesh-t',
  email: 'dineshsethu15981@gmail.com',
  github: 'https://github.com/DineshSethu001',
  linkedin: 'https://www.linkedin.com/in/dinesh-thanigai/',
  // Paste a public link (e.g. Google Drive PDF) to show the résumé buttons.
  resume: '',
  // Leave empty to show the domain the site is running on.
  apiDomain: '',
  // Shown after "Good morning — I'm [Your Name], …"
  intro:
    'a MERN stack developer who builds complete web apps end to end: responsive React interfaces, fast Node.js & Express APIs, well-modelled MongoDB data and the deployment that keeps them running.',
  heroTech: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript', 'REST APIs'],

  mern: [
    { letter: 'M', name: 'MongoDB', level: 'core', text: 'Schema design, compound & TTL indexes, aggregation pipelines, transactions and replica sets.' },
    { letter: 'E', name: 'Express', level: 'core', text: 'Layered routing, middleware, request validation, centralised error handling and versioned APIs.' },
    { letter: 'R', name: 'React', level: 'core', text: 'Component-driven UIs with hooks, context and React Router: responsive, accessible and wired to real APIs.' },
    { letter: 'N', name: 'Node.js', level: 'core', text: 'Event loop, streams, worker threads, clustering and profiling for services that stay fast under load.' },
  ],

  stack: [
    { code: 'RUN', title: 'Runtime & frameworks', items: ['Node.js', 'TypeScript', 'Express', 'NestJS', 'Fastify'] },
    { code: 'DB', title: 'Data', items: ['MongoDB', 'Mongoose', 'Redis', 'PostgreSQL', 'Prisma'] },
    { code: 'API', title: 'Interfaces', items: ['REST', 'GraphQL', 'WebSockets', 'Socket.IO', 'OpenAPI'] },
    { code: 'SEC', title: 'Auth & security', items: ['JWT', 'OAuth 2.0', 'bcrypt', 'Helmet', 'RBAC'] },
    { code: 'OPS', title: 'DevOps & cloud', items: ['Docker', 'AWS', 'Nginx', 'PM2', 'GitHub Actions'] },
    { code: 'QA', title: 'Testing & quality', items: ['Jest', 'Supertest', 'ESLint', 'Postman', 'k6'] },
  ],

  principles: [
    { tag: 'schema-first', title: 'Contracts before code', text: 'OpenAPI specs and Zod validation at every boundary, so clients and servers never guess.' },
    { tag: 'secure by default', title: 'Least privilege everywhere', text: 'httpOnly JWT cookies, RBAC, Helmet, rate limits and secrets kept out of the repo.' },
    { tag: 'observable', title: "If it's not logged, it didn't happen", text: 'Structured logs, request IDs, health checks and metrics wired in from the first commit.' },
    { tag: 'tested', title: 'Confidence to ship on Friday', text: 'Jest + Supertest integration suites against a real MongoDB, run on every push.' },
  ],
};

export const CATEGORIES = ['APIs', 'Real-time', 'Infra', 'Full-stack'];
