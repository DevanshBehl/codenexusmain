# CodeNexus — Backend Development Guide

> **Goal:** Write the entire backend yourself. No vibe coding. Learn every concept. Ship production-grade TypeScript.

---

## 1. Frontend Analysis — What You Already Have

### 1.1 Monorepo Setup

| Layer | Tech |
|---|---|
| Monorepo tool | **Turborepo** |
| Package manager | **npm workspaces** |
| Frontend | `frontend/` — React 19, Vite 8, TailwindCSS v4 |
| Backend | `backend/` — empty shell (just a `package.json`) |

### 1.2 User Roles (4 Roles)

| Role | Dashboard Route | Key Features |
|---|---|---|
| **Student** | `/student/dashboard` | CodeArena, DesignArena, Interviews, Projects, Profile, Mail, Webinars |
| **Company** | `/company/dashboard` | Create Contests, Evaluation, Schedule PPTs, Webinars |
| **University** | `/university/dashboard` | Evaluation, Webinars |
| **Recruiter** | `/recruiter/dashboard` | Interview management |

### 1.3 Full Route Map (26+ routes)

```
/                            → Landing page
/signup                      → Signup
/login                       → Login
/about-developer             → Developer portfolio

# Student
/student/dashboard           → CMD Center (stats, contests, events)
/student/codearena           → Problem list + leaderboard links
/student/codearena/:id       → Problem + code editor + AI assistant
/student/codearena/leaderboard
/student/codearena/submissions
/student/designarena         → Design challenges
/student/designarena/:id     → Design problem workspace
/student/interview           → Interview schedule
/student/projects            → Project portfolio
/student/profile             → Editable student profile
/student/webinars            → Webinar list
/student/webinar             → Live webinar room
/student/mail/*              → Mail system

# Company
/company/dashboard           → Hiring analytics dashboard
/company/create-contest      → Create coding contests
/company/evaluation          → Candidate evaluation
/company/ppt                 → Schedule PPT presentations
/company/webinar             → Host webinars
/company/mail/*

# University
/university/dashboard
/university/evaluation       → Student evaluation
/university/webinars
/university/mail/*

# Recruiter
/recruiter/dashboard
/recruiter/interview         → Interview management
/recruiter/mail/*
```

### 1.4 Feature Inventory & Backend Needs

| Feature | Current State | Backend Required |
|---|---|---|
| Auth (Login/Signup) | Static forms, no API calls | JWT auth, OAuth, session management |
| Student Profile | Hardcoded mock data, edit modal saves to local state | CRUD API, file uploads (avatar) |
| CodeArena Problems | Hardcoded problem object | Problem CRUD, test case storage |
| Code Execution | Mock editor, no actual execution | **Code execution sandbox** (containerized) |
| Submissions | Static list data | Submission storage, verdict pipeline |
| Leaderboard | Mock rankings | Real-time ranking computation |
| DesignArena | Static design challenges | Challenge CRUD, submission uploads |
| Interviews | Mock schedule | Scheduling API, WebRTC signaling server |
| Interview Room | Video chat + whiteboard + code editor components | **WebSocket server**, WebRTC signaling, collaborative state sync |
| Webinars | List + room components | Live streaming, scheduling, attendance tracking |
| Mail System | Full inbox UI with compose/reply | Email/notification service, inbox CRUD |
| Company Dashboard | Analytics cards | Aggregation queries, reporting |
| Contest Creation | Complex multi-step form | Contest CRUD, scheduling, participant management |
| Evaluation | Pending/Evaluated tabs with notes | Review workflow API |
| PPT Scheduling | Calendar form UI | Event scheduling, notifications |

### 1.5 Data Models Visible in Frontend

From examining the TypeScript interfaces and mock data:

```typescript
// Student Profile (from StudentProfile.tsx)
interface ProfileData {
    name: string;
    age: string;
    email: string;
    number: string;
    gender: string;
    branch: string;
    registrationNumber: string;
    codeNexusId: string;
    parentsName: string;
    parentContactNo: string;
    parentEmail: string;
    address: string;
    currentCgpa: string;
    institute: string;
    xSchool: string;
    xPercentage: string;
    xiiSchool: string;
    xiiPercentage: string;
    otherInfo: string;
}

// Problem (from CodeArenaProblem.tsx)
interface Problem {
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    acceptance: string;
    timeLimit: string;
    memoryLimit: string;
    tags: string[];
    description: string; // markdown
}

// Contest (from Dashboard.tsx)
interface Contest {
    title: string;
    date: string;
    participants: string;
    status: 'REGISTERED' | 'OPEN';
}

// Upcoming Event
interface Event {
    title: string;
    type: 'INTERVIEW' | 'DEADLINE' | 'WORKSHOP';
    time: string;
}
```

---

## 2. Backend Tech Stack (All TypeScript)

### 2.1 Core Runtime & Framework

| Tool | Why | Learn |
|---|---|---|
| **Node.js 20 LTS** | JS/TS runtime | Event loop, libuv, streams, buffers |
| **TypeScript 5.x** | Type-safe backend | Generics, utility types, discriminated unions, strict mode |
| **Express.js** or **Fastify** | HTTP framework | Routing, middleware, request lifecycle |

> **Recommendation:** Start with **Express** (larger ecosystem, more tutorials), graduate to **Fastify** later if you need raw speed.

**NPM packages:**
```
express                    # HTTP framework
@types/express             # Express type definitions
tsx                        # TypeScript execution (dev)
typescript                 # Compiler
```

### 2.2 Database

| Tool | Why | Learn |
|---|---|---|
| **PostgreSQL 16** | Relational DB for structured data (users, problems, submissions) | SQL, joins, indexes, transactions, JSONB |
| **Redis 7** | Caching, sessions, real-time leaderboard, pub/sub | Key-value ops, sorted sets, pub/sub, TTL |
| **Prisma** | TypeScript-first ORM | Schema, migrations, relations, raw queries |

**NPM packages:**
```
prisma                     # ORM CLI
@prisma/client             # Query builder (auto-generated)
ioredis                    # Redis client (TypeScript friendly)
```

### 2.3 Authentication & Authorization

| Tool | Why | Learn |
|---|---|---|
| **jsonwebtoken** | JWT token creation/verification | Access tokens, refresh tokens, token rotation |
| **bcrypt** | Password hashing | Salt rounds, hash comparison |
| **passport.js** (optional) | OAuth strategies (Google, GitHub) | OAuth 2.0 flow, strategy pattern |

**NPM packages:**
```
jsonwebtoken               # JWT
@types/jsonwebtoken
bcrypt                     # Password hashing
@types/bcrypt
```

### 2.4 Validation

| Tool | Why | Learn |
|---|---|---|
| **Zod** | Runtime schema validation (TypeScript native) | Schema composition, transforms, refinements |

**NPM packages:**
```
zod                        # Schema validation
```

### 2.5 Real-Time Communication

| Tool | Why | Learn |
|---|---|---|
| **Socket.IO** | WebSocket server for interviews, whiteboard sync, live webinars | Rooms, namespaces, acknowledgements, reconnection |
| **WebRTC** (browser-side) + signaling server | Peer-to-peer video for interviews | ICE candidates, SDP, STUN/TURN |

**NPM packages:**
```
socket.io                  # WebSocket server
@types/socket.io
```

### 2.6 Code Execution Engine

| Tool | Why | Learn |
|---|---|---|
| **Docker SDK** (`dockerode`) | Spin up sandboxed containers per submission | Docker API, container lifecycle, resource limits |
| **Bull / BullMQ** | Job queue for code execution tasks | Redis-backed queues, workers, retries, concurrency |

**NPM packages:**
```
dockerode                  # Docker API client
@types/dockerode
bullmq                     # Job/task queue
```

### 2.7 File Storage & Uploads

| Tool | Why | Learn |
|---|---|---|
| **Multer** | Multipart file upload handling | File streams, storage engines |
| **AWS S3** or **MinIO** | Object storage for avatars, design submissions, recordings | Buckets, presigned URLs, multipart upload |

**NPM packages:**
```
multer                     # File uploads
@types/multer
@aws-sdk/client-s3         # S3 SDK v3
```

### 2.8 Email & Notifications

| Tool | Why | Learn |
|---|---|---|
| **Nodemailer** | Transactional emails (verification, password reset) | SMTP, templates |
| **Socket.IO** | In-app real-time notifications | Already listed above |

**NPM packages:**
```
nodemailer                 # Email sending
@types/nodemailer
```

### 2.9 Logging & Error Handling

| Tool | Why | Learn |
|---|---|---|
| **Pino** | Structured JSON logging (fast) | Log levels, serializers, transports |
| **http-errors** | Consistent HTTP error creation | Status codes, error classes |

**NPM packages:**
```
pino                       # Logger
pino-pretty                # Dev-friendly log formatting
http-errors                # HTTP error factory
@types/http-errors
```

### 2.10 Testing

| Tool | Why | Learn |
|---|---|---|
| **Vitest** | Test runner (same config as your frontend Vite) | Unit tests, mocking, coverage |
| **Supertest** | HTTP endpoint testing | Integration tests for routes |

**NPM packages:**
```
vitest                     # Test runner
supertest                  # HTTP test client
@types/supertest
```

---

## 3. Concepts You Must Learn (Ordered by Priority)

### Phase 1 — Foundations (Week 1–2)

- [ ] **HTTP protocol**: Methods (GET, POST, PUT, PATCH, DELETE), status codes, headers, CORS
- [ ] **REST API design**: Resource naming, versioning (`/api/v1/...`), pagination, filtering
- [ ] **Express.js fundamentals**: Routing, middleware chain, `req`/`res`/`next`, error-handling middleware
- [ ] **TypeScript for backend**: Project setup, `tsconfig.json`, path aliases, strict mode
- [ ] **Environment variables**: `dotenv`, secrets management, `.env` files (NEVER commit them)

### Phase 2 — Data Layer (Week 2–3)

- [ ] **SQL fundamentals**: DDL, DML, joins, subqueries, indexes, `EXPLAIN ANALYZE`
- [ ] **PostgreSQL specific**: JSONB, arrays, enums, full-text search, `ON CONFLICT`
- [ ] **Prisma ORM**: Schema definition, migrations (`prisma migrate`), seeding, relations (1:1, 1:N, M:N)
- [ ] **Database design patterns**: Normalization (3NF), when to denormalize, soft deletes, audit columns (`createdAt`, `updatedAt`)
- [ ] **Redis basics**: Strings, hashes, sorted sets (for leaderboard), TTL, pub/sub

### Phase 3 — Auth & Security (Week 3–4)

- [ ] **Password hashing**: bcrypt, salt rounds, never store plaintext
- [ ] **JWT authentication**: Access tokens (short-lived), refresh tokens (long-lived), token rotation
- [ ] **Authorization**: Role-based access control (RBAC) — your 4 roles map perfectly
- [ ] **Middleware guards**: Protect routes by role (`isStudent`, `isCompany`, `isAdmin`)
- [ ] **Security headers**: Helmet.js, rate limiting, CORS configuration, input sanitization
- [ ] **OAuth 2.0**: Authorization code flow, Google/GitHub login

### Phase 4 — Real-Time (Week 4–5)

- [ ] **WebSocket protocol**: Upgrade handshake, frames, heartbeat
- [ ] **Socket.IO**: Server setup, rooms (per interview/webinar), namespaces, events
- [ ] **WebRTC signaling**: SDP offer/answer, ICE candidates, STUN vs TURN
- [ ] **Collaborative editing**: Operational Transform (OT) or CRDT basics for whiteboard/code sync

### Phase 5 — Code Execution Engine (Week 5–6)

- [ ] **Docker fundamentals**: Images, containers, volumes, networking, Dockerfile
- [ ] **Sandboxing**: CPU/memory limits (`--cpus`, `--memory`), timeout enforcement, network isolation
- [ ] **Job queues**: BullMQ workers, concurrency, retries, dead-letter queues
- [ ] **Execution pipeline**: Receive code → enqueue job → spin container → run with test cases → capture stdout/stderr → compare expected output → return verdict

### Phase 6 — Advanced Patterns (Week 6–8)

- [ ] **File uploads**: Multer, streaming to S3, presigned URLs for client-side upload
- [ ] **Email system**: Transactional emails, HTML templates, queue-based sending
- [ ] **Pagination**: Cursor-based vs offset-based, Prisma's `skip`/`take`/`cursor`
- [ ] **Caching strategies**: Cache-aside pattern, Redis TTL, cache invalidation
- [ ] **Error handling**: Centralized error handler, custom error classes, async wrapper (`express-async-errors`)
- [ ] **API documentation**: OpenAPI/Swagger with `swagger-jsdoc` or `tsoa`

---

## 4. Recommended Backend Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Auto-generated migration files
│   └── seed.ts                 # Seed data for development
├── src/
│   ├── index.ts                # Entry point — starts Express server
│   ├── app.ts                  # Express app setup (middleware, routes)
│   ├── config/
│   │   ├── env.ts              # Environment variable validation (Zod)
│   │   ├── database.ts         # Prisma client singleton
│   │   └── redis.ts            # Redis client singleton
│   ├── modules/                # Feature-based modules
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts  # Zod validation schemas
│   │   │   └── auth.middleware.ts
│   │   ├── user/
│   │   │   ├── user.routes.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.schema.ts
│   │   ├── problem/
│   │   │   ├── problem.routes.ts
│   │   │   ├── problem.controller.ts
│   │   │   ├── problem.service.ts
│   │   │   └── problem.schema.ts
│   │   ├── submission/
│   │   │   ├── submission.routes.ts
│   │   │   ├── submission.controller.ts
│   │   │   ├── submission.service.ts
│   │   │   └── submission.schema.ts
│   │   ├── contest/
│   │   ├── interview/
│   │   ├── webinar/
│   │   ├── mail/
│   │   ├── evaluation/
│   │   └── design-arena/
│   ├── middleware/
│   │   ├── authenticate.ts     # JWT verification
│   │   ├── authorize.ts        # Role-based guards
│   │   ├── validate.ts         # Zod validation middleware
│   │   ├── error-handler.ts    # Centralized error handling
│   │   └── rate-limiter.ts
│   ├── socket/
│   │   ├── index.ts            # Socket.IO server setup
│   │   ├── interview.socket.ts # Interview room handlers
│   │   ├── webinar.socket.ts   # Webinar handlers
│   │   └── notification.socket.ts
│   ├── jobs/
│   │   ├── queue.ts            # BullMQ queue setup
│   │   ├── code-runner.job.ts  # Code execution worker
│   │   └── email.job.ts        # Email sending worker
│   ├── utils/
│   │   ├── api-response.ts     # Standardized response format
│   │   ├── api-error.ts        # Custom error classes
│   │   ├── logger.ts           # Pino logger setup
│   │   └── helpers.ts
│   └── types/
│       ├── express.d.ts        # Express type augmentation
│       └── index.ts            # Shared types
├── tests/
│   ├── unit/
│   └── integration/
├── docker/
│   ├── Dockerfile              # Backend Dockerfile
│   └── runners/                # Code execution Dockerfiles (C++, Python, Java, JS)
│       ├── Dockerfile.cpp
│       ├── Dockerfile.python
│       └── Dockerfile.java
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 5. Database Schema (Prisma) — Starting Point

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  COMPANY
  UNIVERSITY
  RECRUITER
  ADMIN
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum Verdict {
  ACCEPTED
  WRONG_ANSWER
  TIME_LIMIT_EXCEEDED
  MEMORY_LIMIT_EXCEEDED
  RUNTIME_ERROR
  COMPILATION_ERROR
  PENDING
}

model User {
  id                 String    @id @default(cuid())
  email              String    @unique
  passwordHash       String
  role               Role
  name               String
  codeNexusId        String    @unique
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  studentProfile     StudentProfile?
  companyProfile     CompanyProfile?
  submissions        Submission[]
  sentMails          Mail[]       @relation("sender")
  receivedMails      Mail[]       @relation("receiver")
}

model StudentProfile {
  id                 String    @id @default(cuid())
  userId             String    @unique
  user               User      @relation(fields: [userId], references: [id])
  age                Int?
  gender             String?
  phone              String?
  branch             String?
  registrationNumber String?
  parentName         String?
  parentContact      String?
  parentEmail        String?
  address            String?
  currentCgpa        Float?
  institute          String?
  xSchool            String?
  xPercentage        Float?
  xiiSchool          String?
  xiiPercentage      Float?
  otherInfo          String?
}

model CompanyProfile {
  id          String    @id @default(cuid())
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id])
  companyName String
  website     String?
  industry    String?
  contests    Contest[]
}

model Problem {
  id           String      @id @default(cuid())
  title        String
  slug         String      @unique
  difficulty   Difficulty
  description  String      // Markdown
  tags         String[]
  timeLimit    Int         // milliseconds
  memoryLimit  Int         // MB
  acceptance   Float       @default(0)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  testCases    TestCase[]
  submissions  Submission[]
}

model TestCase {
  id          String   @id @default(cuid())
  problemId   String
  problem     Problem  @relation(fields: [problemId], references: [id])
  input       String
  expected    String
  isHidden    Boolean  @default(false)
  order       Int
}

model Submission {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  problemId   String
  problem     Problem  @relation(fields: [problemId], references: [id])
  language    String
  code        String
  verdict     Verdict  @default(PENDING)
  runtime     Int?     // milliseconds
  memory      Int?     // KB
  createdAt   DateTime @default(now())
}

model Contest {
  id             String   @id @default(cuid())
  title          String
  companyId      String
  company        CompanyProfile @relation(fields: [companyId], references: [id])
  description    String?
  startsAt       DateTime
  endsAt         DateTime
  maxParticipants Int?
  createdAt      DateTime @default(now())
}

model Mail {
  id          String   @id @default(cuid())
  senderId    String
  sender      User     @relation("sender", fields: [senderId], references: [id])
  receiverId  String
  receiver    User     @relation("receiver", fields: [receiverId], references: [id])
  subject     String
  body        String
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

---

## 6. API Design — Key Endpoints

### Auth
```
POST   /api/v1/auth/signup          # Register new user
POST   /api/v1/auth/login           # Login → returns JWT
POST   /api/v1/auth/refresh         # Refresh access token
POST   /api/v1/auth/logout          # Invalidate refresh token
POST   /api/v1/auth/forgot-password # Send password reset email
POST   /api/v1/auth/reset-password  # Reset password with token
```

### Users & Profiles
```
GET    /api/v1/users/me             # Get current user
PATCH  /api/v1/users/me             # Update profile
GET    /api/v1/users/:id            # Get user by ID (public info)
```

### Problems (CodeArena)
```
GET    /api/v1/problems             # List problems (paginated, filterable by difficulty/tag)
GET    /api/v1/problems/:slug       # Get single problem
POST   /api/v1/problems             # Create problem (admin/company only)
PATCH  /api/v1/problems/:slug       # Update problem
DELETE /api/v1/problems/:slug       # Delete problem
GET    /api/v1/problems/daily       # Problem of the day
```

### Submissions
```
POST   /api/v1/submissions          # Submit code (triggers execution job)
GET    /api/v1/submissions          # My submissions (paginated)
GET    /api/v1/submissions/:id      # Single submission detail
```

### Leaderboard
```
GET    /api/v1/leaderboard          # Global rankings (Redis sorted set)
GET    /api/v1/leaderboard/contest/:id  # Contest-specific rankings
```

### Contests
```
GET    /api/v1/contests             # List contests
POST   /api/v1/contests             # Create contest (company only)
GET    /api/v1/contests/:id         # Contest detail
POST   /api/v1/contests/:id/register   # Register for contest
```

### Interviews
```
POST   /api/v1/interviews           # Schedule interview
GET    /api/v1/interviews           # My interviews
GET    /api/v1/interviews/:id       # Interview detail + room token
```

### Webinars
```
GET    /api/v1/webinars             # List webinars
POST   /api/v1/webinars             # Create webinar (company/university)
GET    /api/v1/webinars/:id         # Webinar detail + join token
```

### Mail
```
GET    /api/v1/mail/inbox           # Received mails (paginated)
GET    /api/v1/mail/sent            # Sent mails
POST   /api/v1/mail                 # Send mail
PATCH  /api/v1/mail/:id/read       # Mark as read
DELETE /api/v1/mail/:id             # Delete mail
```

### Evaluation
```
GET    /api/v1/evaluations/pending  # Pending evaluations
GET    /api/v1/evaluations/completed
POST   /api/v1/evaluations/:id      # Submit evaluation (select/reject + notes)
```

---

## 7. Build Order — Step-by-Step Implementation

Build these features in order. Each step builds on the previous:

```
Step 1: Project scaffolding
        → tsconfig, Express server, env config, logger, health check endpoint
        → Verify: GET /api/v1/health returns { status: "ok" }

Step 2: Database setup
        → Install PostgreSQL, create Prisma schema, run first migration
        → Seed with test data
        → Verify: `npx prisma studio` shows tables

Step 3: Authentication
        → Signup, login, JWT middleware, refresh tokens
        → Verify: Can signup, login, and hit protected routes

Step 4: User profiles (CRUD)
        → GET/PATCH for student profiles
        → Connect to frontend: Replace mock data with API calls
        → Verify: Frontend loads real data from API

Step 5: Problems (CodeArena)
        → CRUD for problems, test cases, daily problem
        → Verify: Frontend problem list loads from API

Step 6: Code execution engine
        → Docker-based sandbox, BullMQ job queue
        → Submission endpoint → queue → execute → store result
        → Verify: Submit code → get verdict

Step 7: Leaderboard
        → Redis sorted set, recalculate on accepted submission
        → Verify: Leaderboard updates after submission

Step 8: Mail system
        → CRUD for in-app messaging
        → Verify: Send/receive mails between users

Step 9: Contests
        → Create, schedule, register, associate problems
        → Verify: Full contest lifecycle works

Step 10: Real-time features
         → Socket.IO setup, interview rooms, webinar rooms
         → WebRTC signaling for video
         → Verify: Two users can join an interview room

Step 11: Evaluation system
         → Company/university evaluation workflow
         → Verify: Complete evaluation flow

Step 12: File uploads + S3
         → Profile avatars, design arena submissions
         → Verify: Upload and retrieve files
```

---

## 8. DevOps — Deployment & Infrastructure

### 8.1 Concepts to Learn

| Concept | Why | Learn |
|---|---|---|
| **Docker** | Containerize your backend, DB, Redis | Dockerfile, docker-compose, multi-stage builds |
| **docker-compose** | Local dev environment with all services | Service definitions, networking, volumes |
| **CI/CD** | Automated testing & deployment | GitHub Actions workflows |
| **Nginx** | Reverse proxy, SSL termination, static file serving | Config, upstream, load balancing |
| **PM2** or **Docker** | Process management in production | Clustering, restart policies |
| **SSL/TLS** | HTTPS for production | Let's Encrypt, certbot |
| **DNS** | Domain configuration | A records, CNAME, Cloudflare |

### 8.2 Docker Compose for Local Dev

```yaml
# docker-compose.yml (at project root)
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: codenexus
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: codenexus
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://codenexus:devpassword@postgres:5432/codenexus
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your-dev-secret
      NODE_ENV: development
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend/src:/app/src  # Hot reload

volumes:
  pgdata:
```

### 8.3 GitHub Actions CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: codenexus_test
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx prisma migrate deploy
        working-directory: backend
      - run: npm test
        working-directory: backend
```

### 8.4 Deployment Options (Cheapest → Enterprise)

| Option | Cost | Best For |
|---|---|---|
| **Railway** / **Render** | Free tier / ~$7/mo | Getting started, small traffic |
| **VPS (DigitalOcean/Hetzner)** | ~$5–12/mo | Full control, Docker deployment |
| **AWS EC2 + RDS** | Pay-as-you-go | Scalable production |
| **AWS ECS/Fargate** | Pay-as-you-go | Container orchestration at scale |

### 8.5 Production Checklist

- [ ] Environment variables via secrets manager (not `.env` files)
- [ ] Database backups (automated daily)
- [ ] Rate limiting on all auth endpoints
- [ ] CORS configured for your frontend domain only
- [ ] HTTPS everywhere
- [ ] Health check endpoint for monitoring
- [ ] Structured logging with log aggregation
- [ ] Error tracking (Sentry)
- [ ] Database connection pooling (`pgbouncer` or Prisma connection pool)

---

## 9. Learning Resources

### Courses / Tutorials
- [Node.js Official Docs](https://nodejs.org/en/learn) — Start here
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [Socket.IO Tutorial](https://socket.io/get-started/chat)
- [Docker for Beginners](https://docs.docker.com/get-started/)

### Books
- **"Designing Data-Intensive Applications"** by Martin Kleppmann — understand databases deeply
- **"Node.js Design Patterns"** by Mario Casciaro — advanced patterns

### Practice
- Build each module in isolation first, test it, then integrate
- Write tests from Step 3 onward — don't skip testing
- Use Postman/Insomnia to test APIs before connecting frontend

---

## 10. Quick Start Commands

```bash
# Initialize the backend
cd backend
npm init -y
npm install express @prisma/client ioredis jsonwebtoken bcrypt zod pino socket.io bullmq dotenv cors helmet http-errors
npm install -D typescript @types/express @types/node @types/jsonwebtoken @types/bcrypt @types/cors tsx prisma vitest supertest @types/supertest pino-pretty

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init

# Start Postgres + Redis (requires Docker)
docker compose up -d postgres redis

# Run first migration
npx prisma migrate dev --name init

# Start dev server
npx tsx watch src/index.ts
```

---

> **Remember:** The entire frontend currently runs on hardcoded mock data. Every single feature listed above needs a corresponding API. Take it one module at a time. Get auth working first, then build outward. Your Turborepo setup already supports running frontend + backend together via `npm run dev` at the root.
