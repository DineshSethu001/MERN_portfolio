# 🌲 MERN Backend Developer Portfolio

A forest-themed portfolio for a Node.js / MERN backend developer, with an admin dashboard for managing projects and reading contact messages.

- **MongoDB** stores projects, messages and the admin account (Mongoose models)
- **Express** serves a REST API with JWT auth in httpOnly cookies, Zod validation, image uploads (Multer), rate limiting and Helmet
- **React** (Vite) runs the animated portfolio, project case-study pages and the admin panel
- **Node.js** runs it all. In production one Express process serves both the API and the built React app

```
mern-portfolio/
├── server/                  Express + MongoDB API
│   ├── src/
│   │   ├── config/          env, db connection, profile shown in the API console
│   │   ├── models/          User, Project, Message
│   │   ├── middleware/      auth (JWT), validate (Zod), upload (Multer), rate limits, errors
│   │   ├── validators/      request schemas
│   │   ├── controllers/     auth, projects, messages
│   │   ├── routes/          all /api routes in one file
│   │   ├── scripts/seed.js  creates the admin + sample projects
│   │   ├── app.js           Express app (exported for tests)
│   │   └── index.js         starts the server
│   ├── tests/api.test.js    Jest + Supertest integration tests (16 tests)
│   └── uploads/             uploaded cover images
├── client/                  React + Vite
│   └── src/
│       ├── data/site.js     ✏️ your name, links, stack — edit this
│       ├── components/      forest background, treeline, API console, sections…
│       ├── pages/           Home, ProjectDetail, admin/Login, admin/Dashboard, admin/Messages
│       ├── context/         AuthContext (session state)
│       ├── api/client.js    fetch wrapper
│       └── styles/          global.css: theme tokens and all animations
├── docker-compose.yml       MongoDB (and optionally the whole app)
└── Dockerfile               production image
```

---

## 1. Run it locally

**You need:** Node.js 18.18+ and MongoDB, either installed locally, run with Docker (`docker compose up -d mongo`), or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
# install everything
npm run install:all

# configure the API
cp server/.env.example server/.env
#   → set MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD (10+ characters)

# create your admin account (+ 4 sample projects you can edit or delete)
npm run seed

# start the API (port 5000) and React (port 5173) together
npm run dev
```

- Portfolio: <http://localhost:5173>
- Admin: <http://localhost:5173/admin>. Sign in with ADMIN_EMAIL / ADMIN_PASSWORD.

To change the admin password, sign in and open **/admin → Settings**. Running `npm run seed` again won't overwrite it (and won't duplicate projects). If you forget it, set `ADMIN_PASSWORD` in `.env` and run `npm run seed -- --reset-password`.

## 2. Make it yours

| What | Where |
| --- | --- |
| Name, email, links, intro, stack | `client/src/data/site.js` |
| Profile JSON shown in the live API console | `server/src/config/profile.js` |
| Page title and social preview text | `client/index.html` |
| Projects (cover image, case study, tags, featured, draft/published, order) | `/admin` dashboard |
| Colors, fonts, animation speeds | top of `client/src/styles/global.css` |

## 3. Features

**Portfolio**
- Animated forest background: drifting fireflies, falling leaves, swaying pine layers, rolling fog and a glowing moon
- **Greeting by time of day**, using the visitor's own clock: "Good morning" (5–12), "Good afternoon" (12–17), "Good evening" (17–21), "Hello, night owl" (21–5), with a matching icon and a short line. It updates while the page is open, and the admin login and dashboard greet you too. Edit the wording in `client/src/hooks/useGreeting.js`
- Hero text fades in step by step; the **live API console** calls the real `/api/profile`, `/api/health` and `/api/projects` endpoints and shows the real status code and response time
- Sections fade in on scroll; cards lift on hover; projects can be filtered by category
- Projects are loaded from MongoDB. Each has a case-study page at `/projects/:slug`
- Contact form saves messages to MongoDB, with validation, a hidden spam-trap field and a rate limit (5 per hour per IP)
- Works on phones (mobile menu) and turns off animations for visitors who have "reduce motion" switched on

**Admin (`/admin`)**
- Sign in with an httpOnly JWT cookie; protected routes send you to the login page; wrong credentials show an error and shake the form
- Upload projects with drag-and-drop cover images and a preview (JPG/PNG/WebP/GIF, max 5 MB)
- Edit, delete (with confirmation), mark as featured, publish or keep as draft, and reorder projects
- Search, filter and live stats
- Messages inbox with unread count, mark read/unread, reply by email, and delete
- Settings page to change the admin password (current password required, 10+ characters, rate limited)

## 4. API reference

All responses are JSON. Errors look like `{ "error": { "message": "...", "details": { "field": "message" } } }`.

| Method | Route | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/health` | — | status, version, uptime, database connection |
| GET | `/api/profile` | — | profile JSON |
| POST | `/api/auth/login` | — | `{ email, password }` → sets the `token` cookie. Limited to 10 attempts per 15 min |
| POST | `/api/auth/logout` | — | clears the cookie |
| GET | `/api/auth/me` | ✅ | the signed-in user |
| PATCH | `/api/auth/password` | ✅ | `{ currentPassword, newPassword }` (10+ chars). Limited to 5 attempts per 15 min |
| GET | `/api/projects` | — | published projects. Optional `?category=APIs&featured=true&limit=6` |
| GET | `/api/projects/:slug` | — | one published project, including its case study |
| GET | `/api/projects/admin/all` | ✅ | all projects, including drafts |
| POST | `/api/projects` | ✅ | multipart: `title, category, summary, description, highlights (one per line), tags (comma-separated), sourceUrl, liveUrl, featured, published, cover` |
| PUT | `/api/projects/:id` | ✅ | same fields, all optional. Also accepts `removeCover=true` |
| PATCH | `/api/projects/reorder` | ✅ | `{ ids: [...] }` in the new order |
| DELETE | `/api/projects/:id` | ✅ | also deletes the cover file |
| POST | `/api/messages` | — | `{ name, email, subject?, body }`. Limited to 5 per hour |
| GET | `/api/messages` | ✅ | newest first, plus the `unread` count |
| PATCH | `/api/messages/:id` | ✅ | `{ read: true \| false }` |
| DELETE | `/api/messages/:id` | ✅ | |

## 5. Tests

```bash
npm test
```

These are Jest + Supertest tests against a temporary in-memory MongoDB. They cover login, changing the password, protected routes, creating, updating and deleting projects (including uploads and removing covers), keeping drafts private, field validation, rejecting non-image files, blocking query-injection, and the contact inbox.

## 6. Deploy

**Single server (Render, Railway, a VPS…)**
```bash
npm run install:all
npm run build                 # builds client/dist
NODE_ENV=production npm start # Express serves the API and the React app on PORT
```
Set these environment variables: `NODE_ENV=production`, `MONGO_URI` (Atlas), a long random `JWT_SECRET`, and `CLIENT_ORIGIN` = your site URL. Run `npm run seed` once.

**Docker**
```bash
cp server/.env.example server/.env   # fill in JWT_SECRET, ADMIN_*
docker compose up --build -d
docker compose exec app node src/scripts/seed.js
```
The site is then at <http://localhost:5000>.

**Notes for production**
- Uploaded images are saved on the server's disk (`server/uploads`). On hosts where the disk is wiped on every deploy (Render free tier, Heroku…), attach a persistent disk or switch `middleware/upload.js` to S3 or Cloudinary.
- Login cookies are `secure` in production, so serve the site over HTTPS.
- If you host the client and API on different domains, set `VITE_API_URL` when building the client, set `CLIENT_ORIGIN` on the API, and change the cookie's `sameSite` to `'none'` in `middleware/auth.js`.
