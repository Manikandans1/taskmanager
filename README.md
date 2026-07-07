# Task Manager — Full Stack Take-Home Assignment

A Task Manager web app with full CRUD, JWT auth, drag-and-drop status board, filtering, and an
AI-powered "Suggest" feature that turns a rough task title into a proper description + priority.

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Java 17 + Spring Boot 3 (REST API)
- **Database:** PostgreSQL (via Spring Data JPA / Hibernate)
- **Auth:** JWT (Spring Security)
- **AI:** Groq API (Llama models, free tier) — called server-side only
- **Bonus feature:** Drag-and-drop to reorder tasks / change status (Kanban board)

---

## 1. Project Structure

```
taskmanager/
├── backend/     Spring Boot REST API (Java 17, Maven)
└── frontend/    React + Vite + Tailwind SPA
```

Each folder is a self-contained project with its own dependencies and `.env.example`.

---

## 2. Tech Stack & Why

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS | Fast dev server, no build config fuss, Tailwind makes a clean responsive UI quick to build |
| Routing | React Router v7 | Standard client-side routing (`/login`, `/signup`, `/`) |
| HTTP client | Axios | Simple interceptors for attaching the JWT to every request and handling 401s globally |
| Drag & drop | `@hello-pangea/dnd` | Actively maintained fork of `react-beautiful-dnd`; clean API for Kanban-style columns |
| Backend | Java 17 + Spring Boot 3 | Strong, explicit REST conventions (`@RestController`, `ResponseEntity`, proper status codes); layered architecture (Controller → Service → Repository) keeps code organized |
| Data access | Spring Data JPA + Hibernate | Repository interfaces auto-generate CRUD + query methods, minimal boilerplate |
| Database | PostgreSQL | Relational fit for fixed-schema task data; free hosted tiers (Neon/Supabase/Railway) work great for a two-day deploy |
| Auth | Spring Security + JWT (jjwt) | Stateless auth suited to a SPA + REST API; no server-side session storage needed |
| AI | Groq API | Free, very fast inference, OpenAI-compatible chat completion schema — simple to call from the backend with Java's built-in `HttpClient` |

---

## 3. Prerequisites

- **Java 17+** and **Maven 3.9+** (or use your IDE's bundled Maven)
- **Node.js 18+** and npm
- A **PostgreSQL** database — easiest options for a free hosted instance:
  - [Neon](https://neon.tech) (recommended, generous free tier)
  - [Supabase](https://supabase.com)
  - [Railway](https://railway.app)
  - Or run Postgres locally / via Docker
- A free **Groq API key** — sign up at [console.groq.com](https://console.groq.com) → API Keys

---

## 4. Backend Setup (`/backend`)

### 4.1 Configure environment variables

Copy the example env file and fill in your values:

```bash
cd backend
cp .env.example .env
```

Then **export these as real environment variables** before running the app (Spring Boot reads
`application.properties`, which references `${ENV_VAR}` placeholders — a `.env` file alone is
not automatically loaded by Java). The simplest way locally:

```bash
export DATABASE_URL=jdbc:postgresql://<host>:5432/<dbname>
export DATABASE_USERNAME=<your-db-username>
export DATABASE_PASSWORD=<your-db-password>
export JWT_SECRET=$(openssl rand -base64 48)
export GROQ_API_KEY=<your-groq-api-key>
export CORS_ALLOWED_ORIGINS=http://localhost:5173
```

(On Windows PowerShell use `$env:DATABASE_URL="..."` etc. Or use an IDE run configuration /
a tool like `direnv` to load `.env` automatically.)

### 4.2 Run it

```bash
mvn spring-boot:run
```

The API starts on **http://localhost:8080**. Tables are auto-created on first run
(`spring.jpa.hibernate.ddl-auto=update`) — no manual migration needed.

Health check: `GET http://localhost:8080/api/health` → `{"status":"ok"}`

### 4.3 Build a runnable JAR (optional)

```bash
mvn clean package -DskipTests
java -jar target/taskmanager-backend.jar
```

### 4.4 REST API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account, returns JWT |
| POST | `/api/auth/login` | No | Log in, returns JWT |
| GET | `/api/tasks` | Yes | List tasks (`?status=`, `?priority=` filters) |
| GET | `/api/tasks/{id}` | Yes | Get one task |
| POST | `/api/tasks` | Yes | Create a task |
| PUT | `/api/tasks/{id}` | Yes | Update a task |
| DELETE | `/api/tasks/{id}` | Yes | Delete a task |
| PATCH | `/api/tasks/reorder` | Yes | Persist new order/status after drag-and-drop |
| POST | `/api/tasks/ai-suggest` | Yes | AI Suggest: rough title → description + priority |

All `/api/tasks/**` routes require `Authorization: Bearer <token>`.

---

## 5. Frontend Setup (`/frontend`)

```bash
cd frontend
cp .env.example .env
# edit .env if your backend isn't on localhost:8080
npm install
npm run dev
```

Opens on **http://localhost:5173**. It expects the backend to be running (see above).

### Build for production

```bash
npm run build
```

Outputs static files to `frontend/dist/` — this was verified to build cleanly.

---

## 6. Deployment

### Backend → Render or Railway
1. Push this repo to GitHub.
2. Create a new **Web Service** on Render/Railway, point it at the `backend/` folder.
3. It will build using the included **Dockerfile** (multi-stage Maven build → slim JRE image).
4. Set the environment variables from step 4.1 in the platform's dashboard (`DATABASE_URL`,
   `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET`, `GROQ_API_KEY`, `CORS_ALLOWED_ORIGINS`
   — set this to your deployed frontend URL once you have it).
5. Note the deployed backend URL, e.g. `https://taskmanager-backend.onrender.com`.

### Frontend → Vercel
1. Import the `frontend/` folder as a new Vercel project (framework preset: Vite).
2. Set the environment variable `VITE_API_URL` to `https://<your-backend-url>/api`.
3. Deploy. `vercel.json` is included so client-side routing (`/login`, `/signup`) works on refresh.
4. Go back to your backend's `CORS_ALLOWED_ORIGINS` env var and set it to this Vercel URL, then
   redeploy the backend so the browser isn't blocked by CORS.

---

## 7. AI Tools & Resources Used

- **Groq API** (`llama-3.1-8b-instant`) powers the "AI Suggest" feature — given a rough task
  title, it returns a JSON object with a generated `description` and a suggested `priority`.
  The prompt asks the model to respond with strict JSON only, which the backend parses and
  validates (falling back to `MEDIUM` priority if the model returns something unexpected).
- The Groq API key is read only from a server-side environment variable
  (`app.groq.api-key` in `application.properties` → `GROQ_API_KEY`) and is never sent to or
  readable from the frontend — the browser only ever calls our own
  `POST /api/tasks/ai-suggest` endpoint.

---

## 8. What I'd Improve With More Time

- Add refresh tokens (currently a single long-lived JWT — fine for a demo, not ideal for production)
- Add pagination/infinite scroll for large task lists
- Add optimistic UI rollback with toast notifications instead of silent reload on drag-and-drop failure
- Add automated tests (JUnit + Mockito for backend services/controllers, React Testing Library for frontend)
- Add Flyway migrations instead of `ddl-auto=update` for safer schema evolution
- Add rate-limiting on the AI Suggest endpoint to prevent API key abuse

---

## 9. Notes

- Tasks are private per user (a `user_id` foreign key scopes every query) — there's no
  cross-user data leakage.
- Passwords are hashed with BCrypt before storage; the raw password is never stored or logged.
- The AI Suggest feature is fully optional per task — the user can always type their own
  description and pick their own priority instead of using it.

## Live Demo
- **Frontend:** https://taskmanager-phi-khaki.vercel.app
- **Backend API:** https://taskmanager-ydl9.onrender.com/api
- **GitHub Repo:** https://github.com/Manikandans1/taskmanager