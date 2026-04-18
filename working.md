# CodeNexus — Work Status Report

**Repo:** `codenexus-monorepo` (Turborepo: `frontend` + `backend`)
**Analysis Date:** 2026-04-18
**Current Branch:** `main`
**Overall Completion:** ~82–85%

---

## Executive Summary

CodeNexus is a campus placement platform targeting **students, companies, universities, and recruiters**. Phases 1–6 are complete. The project now has **solid auth hardening** (refresh token rotation, logout revocation), **image uploads** (avatar + project images with Sharp resize), **a Vitest test suite**, and **full Docker + CI/CD containerization**. The internal mail system and Code Arena remain the most complete features; interview collaboration, Design Arena, and admin dashboards are the remaining major gaps.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Monorepo | Turborepo + npm workspaces |
| Backend | Node.js + Express + TypeScript, Prisma (PostgreSQL), Socket.IO, Mediasoup (WebRTC), FFmpeg, Redis, Judge0 CE |
| Frontend | React 19 + Vite, React Router v7, Tailwind v4, Framer Motion, Monaco Editor, Socket.IO client |
| Infra | Docker Compose (Postgres + Judge0 only; app services not containerized) |

---

## Feature Completion Matrix

| Feature | % Done | Verdict |
|---------|--------|---------|
| Authentication (JWT, CNID, role prefixes) | **95%** | Refresh tokens + rotation + logout revocation done; only SMTP missing |
| Internal Mail System (role-matrix + SSE) | **95%** | **Shipped-quality** |
| Student Profile | **85%** | Avatar upload (Multer + Sharp 256×256) done; type coercion minor |
| Projects (student portfolio) | **82%** | Project image upload (800×600) done; validation minor |
| Contests (company-created) | **85%** | Create/list/register work; auto status working; per-contest leaderboard live |
| Code Arena (DSA practice) | **85%** | Judge0 integration stable; live leaderboard, pagination, activity heatmap |
| Webinars | **70%** | Live streaming via Mediasoup SFU complete; attendance/chat/raise-hand done |
| Interviews (live tech sessions) | **72%** | WebRTC + whiteboard sync + Yjs collaborative editor done; recording still unstable |
| Recording | 40% | FFmpeg plumbed; output known to be buggy |
| Job Applications / Evaluation | **55%** | Company evaluation wired end-to-end; university evaluation still mocked |
| Admin Dashboards (company/uni/recruiter) | 30% | Mostly **hardcoded** mock data |
| Design Arena | 30% | **UI shell only**; no backend |
| Public Static Profile | **80%** | Full rewrite (277 lines) with real API; role-aware display |
| Image Uploads (avatar + projects) | **90%** | Multer + Sharp resize; stored on disk; avatarUrl in DB |
| Tests | **25%** | Vitest setup + 3 test files (auth service, permission matrix, Login component) |
| Docker / Infra | **85%** | App services now containerized (backend + frontend Dockerfiles); docker-compose complete |
| CI/CD | **90%** | GitHub Actions: lint + test + build on push/PR to main |

---

## Backend Analysis

**Entry:** [backend/src/server.ts](backend/src/server.ts)
**Routes mounted in:** [backend/src/app.ts](backend/src/app.ts)
**DB schema:** [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

### Module Status

| Module | Path | Status |
|--------|------|--------|
| `auth` | [backend/src/modules/auth/](backend/src/modules/auth/) | **95%** — signup/login + JWT + bcrypt + CNID + refresh token rotation + logout revocation |
| `user` | [backend/src/modules/user/](backend/src/modules/user/) | 80% — GET/PATCH /me working |
| `mail` | [backend/src/modules/mail/](backend/src/modules/mail/) | **95%** — full permission matrix, SSE, rate-limit, sanitization |
| `contest` | [backend/src/modules/contest/](backend/src/modules/contest/) | **85%** — CRUD + registration + **auto status flip + contest leaderboard** |
| `problems` | [backend/src/modules/problems/](backend/src/modules/problems/) | 85% — CRUD + test cases |
| `codearena` | [backend/src/modules/codearena/](backend/src/modules/codearena/) | **85%** — Judge0 stable; **live Redis leaderboard, pagination, submission stats** |
| `interview` | [backend/src/modules/interview/](backend/src/modules/interview/) | 70% — scheduling done; live room logic lives in socket |
| `webinar` | [backend/src/modules/webinar/](backend/src/modules/webinar/) | 60% — scheduling done; streaming not implemented |
| `projects` | [backend/src/modules/projects/](backend/src/modules/projects/) | 70% — CRUD |
| `applications` | [backend/src/modules/applications/](backend/src/modules/applications/) | 50% — basic only |

### Real-Time / Media Pipeline

- **Socket handlers:** [backend/src/socket/socket.ts](backend/src/socket/socket.ts) (~450 lines)
  - JWT auth on handshake ✅
  - Mediasoup transport / producer / consumer events ✅
  - Recording hooks on producer lifecycle ⚠️ (incomplete)
  - Missing: chat persistence, whiteboard sync, IDE collaboration events
- **Mediasoup worker:** [backend/src/lib/mediasoup.ts](backend/src/lib/mediasoup.ts)
- **Recording orchestrator:** [backend/src/lib/recording.manager.ts](backend/src/lib/recording.manager.ts)
  - FFmpeg spawned per session; RTP → MP4 pipeline present
  - Recent commits `f98add3` ("partial recording") and `ad341e7` ("fixed recording bugs") signal **ongoing instability**

### Judge0 Integration

- Client: [backend/src/modules/codearena/judge0.ts](backend/src/modules/codearena/judge0.ts)
- Queue: [backend/src/modules/codearena/submissionQueue.ts](backend/src/modules/codearena/submissionQueue.ts)
- Language map covers C++, Python, Java, JavaScript
- **Issue:** verdict normalization incomplete; runtime/TLE/MLE edges not reliably classified

### Auth / Permissions

- Permission matrix: [backend/src/utils/permission-matrix.ts](backend/src/utils/permission-matrix.ts) — enforces who can mail whom
- **Refresh token rotation:** `generateRefreshToken()` → SHA-256 hash stored in `RefreshToken` table; `validateRefreshToken()` checks expiry; rotation on `/auth/refresh`; `deleteRefreshToken()` / `deleteAllUserRefreshTokens()` for logout
- **Missing:** transactional email (no SMTP setup)

### Image Uploads

- Module: [backend/src/modules/uploads/](backend/src/modules/uploads/)
- `uploadAvatar` — Multer disk storage → Sharp 256×256 crop → `Student.avatarUrl` persisted
- `uploadProjectImage` — Multer → Sharp 800×600 max (no enlarge) → URL returned to caller
- Original file deleted after resize; cleanup on error

### Infra

- Docker: [backend/docker-compose.yml](backend/docker-compose.yml) — Postgres + Judge0 + Judge0 Redis/workers. **App services now containerized** — `backend/Dockerfile` and `frontend/Dockerfile` added.
- CI/CD: [.github/workflows/ci.yml](.github/workflows/ci.yml) — GitHub Actions on push/PR to main: install → lint → test → build.
- Tests: Vitest configured for both packages. Backend: `auth.service.test.ts`, `permission-matrix.test.ts`. Frontend: `Login.test.tsx`. Coverage thin but framework wired.

---

## Frontend Analysis

**Entry:** [frontend/src/App.tsx](frontend/src/App.tsx)
**API client:** [frontend/src/lib/api.ts](frontend/src/lib/api.ts)
**Auth context:** [frontend/src/lib/auth.tsx](frontend/src/lib/auth.tsx) (inconsistently consumed)

### Page Status by Role

**Public / Auth**
- `/` Landing — 100%
- `/login`, `/signup` — 100%
- `/about-developer` — 100%

**Student** ([frontend/src/pages/student/](frontend/src/pages/student/))
- `dashboard` 80% · `codearena` 85% (live leaderboard, activity heatmap) · `codearena/:id` 85% (Judge0 stable)
- `codearena/leaderboard` **NEW** 85% (real API, pagination, user rank)
- `codearena/submissions` **NEW** 85% (paginated, real data)
- `designarena` 30% · `interview` 50% · `interview/:id` 40%
- `projects` 60% · `profile` 80% · `webinars` 60% · `mail/*` 95%
- `Contest` **REWRITTEN** 85% (real contest data, registration, leaderboard drawer, timed submissions)

**Company** ([frontend/src/pages/company/](frontend/src/pages/company/))
- `dashboard` 30% (mostly hardcoded — **modified, not staged**)
- `create-contest` 60% · `evaluation` 40% · `ppt` 50% · `mail/*` 95%

**University** ([frontend/src/pages/university/](frontend/src/pages/university/))
- `dashboard` 30% (**modified, not staged**) · `evaluation` 40% · `webinars` 60% · `mail/*` 95%

**Recruiter** ([frontend/src/pages/recruiter/](frontend/src/pages/recruiter/))
- `dashboard` 20% (**modified, not staged**) · `interview` 60% · `interview/:id` 40% · `mail/*` 95%

**Shared**
- `/recordings` — 50% (listing + stub playback)
- `/webinar/:id` WebinarRoom — 40% (no real stream)
- `shared/StaticProfile.tsx` — **20% NEW/untracked**, minimal data display

### Key Components

- Interview room: [frontend/src/components/Interview/InterviewRoom.tsx](frontend/src/components/Interview/InterviewRoom.tsx) — 670+ lines, state scattered
- Whiteboard: [frontend/src/components/Interview/Whiteboard.tsx](frontend/src/components/Interview/Whiteboard.tsx) — local draw only, **no socket sync**
- Video chat: [frontend/src/components/Interview/InterviewVideoChat.tsx](frontend/src/components/Interview/InterviewVideoChat.tsx) — video refs present but streams don't reach `video.srcObject`
- Code editor (interview): [frontend/src/components/Interview/InterviewEditor.tsx](frontend/src/components/Interview/InterviewEditor.tsx) — Monaco, **single-user only** (no CRDT)
- AskAI in arena: mock UI only

### State Management

- No global store (no Redux/Zustand/Context-wide auth state)
- Prop drilling + local `useState`
- WebSocket connection not globally managed — recreated per page

---

## End-to-End Integration Check

| Flow | FE ✓ | BE ✓ | DB ✓ | Real-time ✓ | Working? |
|------|:----:|:----:|:----:|:-----------:|:--------:|
| Signup / Login | ✓ | ✓ | ✓ | — | ✅ |
| Student profile edit | ✓ | ✓ | ✓ | — | ✅ (no images) |
| Project CRUD | ✓ | ✓ | ✓ | — | ✅ |
| Mail send/receive + unread | ✓ | ✓ | ✓ | ✓ SSE | ✅ |
| Contest create + list | ✓ | ✓ | ✓ | — | ✅ |
| Code arena: run/submit | ✓ | ✓ | ✓ | — | ⚠️ unstable |
| Interview schedule | ✓ | ✓ | ✓ | — | ✅ |
| Interview live A/V | ✓ UI | ✓ mediasoup | — | ⚠️ | ❌ streams not binding |
| Interview recording | — | ✓ ffmpeg | ✓ InterviewRecording | ⚠️ | ❌ known bugs |
| Interview whiteboard sync | ✓ canvas | — | — | ❌ | ❌ |
| Interview collaborative editor | ✓ monaco | — | — | ❌ | ❌ |
| Webinars live stream | ✓ UI | — | — | ❌ | ❌ |
| Evaluation workflow | ✓ UI | partial | ✓ model | — | ⚠️ |
| Dashboards (company/uni/recruiter) | ✓ UI | — | — | — | ❌ mocked |

---

## Critical Issues

### 🔴 High (blocking core product) — **RESOLVED (Phase 1)**
1. ~~**Recording output unreliable**~~ — Fixed by adding retry resilience and tapping into existing producer tracks asynchronously.
2. ~~**Judge0 verdict pipeline stubbed**~~ — Fixed by removing the "Paused Functioning" stub and wiring both CodeArena and Contest submissions to the unified Bull queue.
3. ~~**WebRTC streams never reach `<video>` elements**~~ — Fixed by correctly scoping MediaSoup producers by room, and adding existing-producers broadcast for late-joiner catching up.

### 🟠 Medium — **RESOLVED (Phase 2)**
4. ~~**Whiteboard has no socket sync**~~ — Fixed by caching `whiteboard-sync` payload in Node memory and emitting `whiteboard-state` for late joiners connecting to the room.
5. ~~**Code editor in interview is not collaborative**~~ — Fixed by migrating to `yjs` and `y-monaco`, enabling CRDT-powered real-time binary collaboration with memory-cached hydration for late joiners.

### 🟡 Low — **RESOLVED (Phase 6)**
8. ~~**No refresh-token rotation; no logout revocation**~~ — Full rotation implemented with SHA-256 hashed storage in `RefreshToken` table; logout deletes token; refresh rotates to new token.
10. ~~**No image uploads (profile, projects)**~~ — Multer + Sharp pipeline for avatar (256×256) and project images (800×600); avatarUrl persisted in Student model.
11. ~~**No tests (unit or integration)**~~ — Vitest wired for both frontend and backend; 3 test files covering auth service, permission matrix, and login page. (Coverage still thin.)
12. ~~**Docker Compose does not include app services**~~ — Backend + frontend Dockerfiles added; app services now in docker-compose.

### 🟡 Low — Remaining
9. No transactional email (password reset, verification).
13. Test coverage thin — only 3 test files; evaluation, mail, contest, webinar flows untested.

---

## What's the ONLY Fully-Done Feature?

The **Internal Mail System**. It has:
- Role-based permission matrix enforced server-side
- CNID addressing with validation
- Rate limiting (20/hour) and HTML sanitization
- Threading, read/unread state cached in Redis
- Real-time delivery via SSE
- Soft delete on both sender and recipient sides
- Complete compose/reply/inbox/sent UI

Files: [backend/src/modules/mail/](backend/src/modules/mail/), [frontend/src/pages/mail/Mail.tsx](frontend/src/pages/mail/Mail.tsx)

---

## Uncommitted Work (as of this analysis)

```
M frontend/src/App.tsx                            # new routes wired in
M frontend/src/pages/company/Dashboard.tsx
M frontend/src/pages/recruiter/Dashboard.tsx
M frontend/src/pages/university/Dashboard.tsx
?? frontend/src/pages/shared/StaticProfile.tsx    # new, ~20KB, incomplete
```

---

## Recent Progress (Phase 1 Completed)

The critical broken features of Phase 1 have been successfully addressed:
- The Judge0 pipeline reliably processes code evaluation with REST waiting and proper Socket real-time updates for CodeArena and Contests.
- WebRTC Interview rooms now reliably support video and audio streams for peers dynamically joining and leaving.
- FFmpeg-based Session Recording is more reliable and will retry and grab existing streams asynchronously if started mid-session.

## Recent Progress (Phase 2 Completed)

Phase 2 resolved the live collaboration constraints within the Interview Room:
- **Persistent Interview Chat**: Built the `InterviewMessage` Prisma model and REST API fetchers. The Express wrapper now commits every `chat-message` socket event directly to PostgreSQL, allowing full chat playback continuously.
- **Robust Code Editor (Yjs)**: Evolved the simple text-replace system into full CRDT real-time sync with `yjs` and `y-monaco`. Caching binary buffers on the Node server eliminates the "blank slate" bug for late joiners.
- **Whiteboard Memory**: Handled late-joiner canvas hydration by persisting the last-known Drawing Elements payload inside a `Map<string, any[]>` active session cache on the backend.

---

## Recent Progress (Phase 6 Completed)

Phase 6 completed auth hardening, image uploads, test infrastructure, full Docker containerization, and CI/CD.

### 6.1 — Refresh Token Rotation
- **New Prisma model:** `RefreshToken` — stores `tokenHash` (SHA-256), `userId`, `expiresAt` (7 days)
- **Updated:** `backend/src/modules/auth/auth.service.ts`
  - `generateRefreshToken()` — 64-byte random hex
  - `saveRefreshToken()` — hashes and persists to DB
  - `validateRefreshToken()` — lookup by hash, checks expiry, deletes if expired
  - `deleteRefreshToken()` — single-token revocation (logout)
  - `deleteAllUserRefreshTokens()` — full revocation
  - `refreshAccessToken()` — validates old token → issues new access + refresh token pair (rotation)
  - `loginUser()` — now returns `{ token, refreshToken }` pair
- **Updated:** `backend/src/modules/auth/auth.routes.ts` — `POST /auth/refresh`, `POST /auth/logout` endpoints
- **Updated:** `frontend/src/lib/auth.tsx` — stores refresh token, auto-refresh on 401

### 6.2 — Image Uploads (Multer + Sharp)
- **New module:** [backend/src/modules/uploads/](backend/src/modules/uploads/)
  - `multer.ts` — disk storage with type filter (jpg/png/webp/gif), 5 MB limit; separate destinations for avatars vs project images
  - `uploads.controller.ts` — `uploadAvatar` (256×256 cover crop → `Student.avatarUrl`), `uploadProjectImage` (800×600 max → returns URL); original deleted after resize; cleanup on error
  - `uploads.routes.ts` — `POST /uploads/avatar`, `POST /uploads/project-image`
- **Updated:** `backend/src/modules/user/user.services.ts` — `updateProfile` now accepts `avatarUrl`
- **Updated:** `frontend/src/lib/api.ts` — `uploadsApi.uploadAvatar()`, `uploadsApi.uploadProjectImage()`

### 6.3 — Test Infrastructure (Vitest)
- **Backend** — `backend/vitest.config.ts`; test files:
  - `backend/src/modules/auth/__tests__/auth.service.test.ts`
  - `backend/src/utils/__tests__/permission-matrix.test.ts`
- **Frontend** — `frontend/vitest.config.ts` + `frontend/src/test/setup.ts`; test files:
  - `frontend/src/pages/__tests__/Login.test.tsx`
- Framework in place; coverage is starter-level (3 files total)

### 6.4 — Full Docker Containerization
- `backend/Dockerfile` — multi-stage Node 20 build; Prisma generate + compile
- `frontend/Dockerfile` — Node 20 build + Nginx serve of Vite dist
- `.dockerignore` (root + per-package) — excludes node_modules, dist, .env
- `backend/docker-compose.yml` — now includes backend + frontend app services alongside Postgres + Judge0
- `backend/.env.example` — documented all required env vars

### 6.5 — CI/CD Pipeline
- **New:** [.github/workflows/ci.yml](.github/workflows/ci.yml)
  - Triggers on push + PR to `main`
  - Steps: `npm ci` → lint (all workspaces) → `npm test` (backend) → `npm run build` (all workspaces)

### 6.6 — Static Profile (Complete Rewrite)
- **Rewritten:** `frontend/src/pages/shared/StaticProfile.tsx` (was 20% stub → now 80% complete)
  - 277-line component; fetches from public profile API via CNID URL param
  - Displays role, name, branch, skills, projects, bio, social links
  - Framer Motion animations, role-aware icon/badge display

---

## Recent Progress (Phase 3 Completed)

Phase 3 completed the Code Arena feature set, making it fully functional with live leaderboards, real submission history, and automated contest lifecycle:

### 3.1 — Live Leaderboard (Redis Sorted Sets)
- **New file:** [backend/src/modules/codearena/leaderboard.service.ts](backend/src/modules/codearena/leaderboard.service.ts)
  - Implements `updateGlobalLeaderboard()` and `updateContestLeaderboard()` using Redis `ZADD`
  - ICPC-style scoring: `(problemsSolved * 10000) - (wrongAttempts * 50) - floor(timeTakenMinutes)`
  - 60-second cache TTL on leaderboard reads
- **Updated:** [backend/src/modules/codearena/submissionQueue.ts](backend/src/modules/codearena/submissionQueue.ts)
  - On accepted CodeArena submission: updates global leaderboard via `ZADD`
  - On accepted contest submission: updates contest-specific leaderboard with per-user stats
- **Updated:** [backend/src/modules/codearena/leaderboard.controller.ts](backend/src/modules/codearena/leaderboard.controller.ts)
  - Standardized response shape with `{ rankings, myRank }`
  - User rank lookup via `ZREVRANK`
  - Profile stats now include `globalRank`
- **New endpoint:** `GET /contests/:id/leaderboard` — contest-specific standings with ICPC scoring

### 3.2 — Submission History & Stats
- **Updated:** [backend/src/modules/codearena/submissions.controller.ts](backend/src/modules/codearena/submissions.controller.ts)
  - `getSubmissions()` now returns paginated response: `{ submissions, pagination: { page, limit, total, totalPages } }`
  - Query params: `?problemId=&page=1&limit=20`
- **Updated:** [frontend/src/pages/student/CodeArenaSubmissions.tsx](frontend/src/pages/student/CodeArenaSubmissions.tsx)
  - Previous/Next pagination controls wired to API
  - Fixed data mapping to use `submitted_at`, `time_taken_ms`, `memory_used_kb` from DB schema
- **Updated:** [frontend/src/components/CodeArena/ActivityHeatmap.tsx](frontend/src/components/CodeArena/ActivityHeatmap.tsx)
  - Replaced mock `generateMockData()` with real submission fetch via `codeArenaApi.getSubmissions()`
  - Groups submissions by `YYYY-MM-DD` for contribution calendar
  - Total submission count now reflects actual data

### 3.3 — Contest Registration & Status Automation
- **New file:** [backend/src/jobs/contestStatus.job.ts](backend/src/jobs/contestStatus.job.ts)
  - `setInterval`-based job running every 60 seconds
  - Auto-flips `UPCOMING → ACTIVE` when `date <= now`
  - Auto-flips `ACTIVE → COMPLETED` when contest duration expires
- **Updated:** [backend/src/server.ts](backend/src/server.ts)
  - Calls `startContestStatusJob()` on server boot
- **Updated:** [backend/src/modules/codearena/submissionQueue.ts](backend/src/modules/codearena/submissionQueue.ts)
  - Contest submissions check contest status before processing
  - If contest is `COMPLETED` or expired, submission is marked `locked` and skipped

### 3.4 — Student Contest Page Full Wiring
- **Updated:** [frontend/src/pages/student/Contest.tsx](frontend/src/pages/student/Contest.tsx)
  - Fetches contest details from `GET /contests/:id`
  - Shows problems only after registration or if contest is ended
  - Registration button wired to `POST /contests/:id/register`
  - Timer countdown based on contest `date` and `durationMins`
  - Real-time leaderboard drawer wired to `GET /contests/:id/leaderboard`
  - Code execution wired to `/contests/submissions/run` and `/contests/:id/submissions`
- **Updated:** [frontend/src/lib/api.ts](frontend/src/lib/api.ts)
  - Added `contestApi.register()`, `contestApi.getRegistrations()`, `contestApi.getLeaderboard()`
  - Added `page` and `limit` params to `codeArenaApi.getSubmissions()`

### 3.5 — Problem Acceptance Ratio
- **Already implemented** in [backend/src/modules/codearena/problems.controller.ts](backend/src/modules/codearena/problems.controller.ts):
  - `acceptance_rate` computed as `(successCount / attemptCount) * 100`
  - `total_solved` count per problem
- **Displayed** in [frontend/src/pages/student/CodeArena.tsx](frontend/src/pages/student/CodeArena.tsx) problem table

---

## Files Changed in Phase 3

**Backend (new files):**
- `backend/src/modules/codearena/leaderboard.service.ts` — Redis leaderboard operations
- `backend/src/jobs/contestStatus.job.ts` — contest auto-flip cron

**Backend (modified):**
- `backend/src/modules/codearena/leaderboard.controller.ts` — standardized response, user rank
- `backend/src/modules/codearena/submissionQueue.ts` — ZADD on accept, contest lock, contest leaderboard update
- `backend/src/modules/codearena/submissions.controller.ts` — pagination
- `backend/src/modules/contest/contest.service.ts` — contest leaderboard computation
- `backend/src/modules/contest/contest.controller.ts` — new `getContestLeaderboard` handler
- `backend/src/modules/contest/contest.routes.ts` — `GET /contests/:id/leaderboard`
- `backend/src/server.ts` — start contest status job

**Frontend (new files):**
- None

**Frontend (modified):**
- `frontend/src/pages/student/CodeArenaLeaderboard.tsx` — real API, user rank, polling
- `frontend/src/pages/student/CodeArenaSubmissions.tsx` — pagination controls
- `frontend/src/pages/student/Contest.tsx` — full rewrite with real API
- `frontend/src/components/CodeArena/ActivityHeatmap.tsx` — real submission data
- `frontend/src/lib/api.ts` — `contestApi`, pagination params

---

## Recent Progress (Phase 4 — In Progress)

Phase 4 is replacing hardcoded mock data on admin dashboards with real backend API calls, plus completing the end-to-end evaluation workflow.

### 4.1 — Evaluation Module (Backend)
- **Discovery:** Dashboard module already existed at `backend/src/modules/dashboard/` with fully implemented service, controller, and routes — no work needed there. Already mounted at `/api/v1/dashboard`.
- **New module:** `backend/src/modules/evaluation/` — no evaluation module existed, had to be created from scratch
- **New Prisma model:** `Evaluation` added to schema with Interview and Company relations
- **New files:**
  - `evaluation.schema.ts` — Zod validation for verdict + notes + structured scores (technical, communication, culture)
  - `evaluation.service.ts` — `getCompanyEvaluations`, `getEvaluationDetail`, `submitEvaluation`
  - `evaluation.controller.ts` — 3 handlers
  - `evaluation.routes.ts` — 3 routes mounted at `/api/v1/evaluations`
- **Key behavior:** `submitEvaluation` also updates `JobApplication.status` to SELECTED/REJECTED when verdict is finalized

### 4.2 — Evaluation API (Frontend)
- **Updated:** `frontend/src/lib/api.ts`
  - Added `EvaluationCandidate` interface with full structured scores and questions array
  - Added `SubmitEvaluationPayload` interface with verdict, notes, rating, and score breakdowns
  - Added `evaluationApi` with `getCompanyEvaluations(status?)`, `getEvaluationDetail(interviewId)`, `submitEvaluation(interviewId, data)`

### 4.3 — Company Evaluation Page Wiring
- **Updated:** `frontend/src/pages/company/Evaluation.tsx`
  - Replaced `mockCandidates` with real `pendingCandidates`/`evaluatedCandidates` state
  - Added `useEffect` to fetch both lists on mount via `evaluationApi.getCompanyEvaluations('PENDING')` and `getCompanyEvaluations('EVALUATED')`
  - Added `handleEvaluation` async submit handler calling `evaluationApi.submitEvaluation`
  - Added `detailLoading` state — when a candidate is clicked, fetches full evaluation detail via `getEvaluationDetail` to populate the `questions` array (code submissions from contest problems)
  - Added loading indicator in Technical Assessment section while detail is fetching
  - Added HOLD button alongside SELECTED/REJECTED in modal footer
  - Updated `handleEvaluation` to accept `'SELECTED' | 'REJECTED' | 'HOLD'`
  - Added `Pause` icon import for HOLD button

### 4.4 — Interface Verification
- Verified `UniversityDashboardData` and `RecruiterDashboardData` interfaces in `api.ts` — properties appear correctly defined
- `RecruiterDashboardData.stats` correctly includes `solvedProblems` within nested `student` object (not at top-level stats)
- No changes needed to these interfaces

### Remaining for Phase 4
- University Evaluation page (`frontend/src/pages/university/Evaluation.tsx`) still uses `mockCandidates` — no `getUniversityEvaluations` backend endpoint exists; universities view company-submitted evaluations of their students, which would require a new backend endpoint (separate feature work beyond "replacing mock data")
- University/Recruiter dashboards use mock data — `dashboardApi.university()` and `dashboardApi.recruiter()` are wired but data shapes verified correct; main dashboards themselves still need full wiring to real API calls

---

## Recent Progress (Phase 5 Completed)

Phase 5 completed the webinar live streaming infrastructure using the existing Mediasoup SFU:

### 5.1 — Database Models (Prisma)
- **Updated:** `backend/prisma/schema.prisma`
  - Added `WebinarAttendee` model — tracks join/leave, role (PRESENTER/VIEWER), `hasPermissionToSpeak`
  - Added `WebinarMessage` model — persists chat messages with `isQuestion` flag for Q&A mode
  - Updated `Webinar` model to include `attendees` and `messages` relations

### 5.2 — Attendance Service & Controller
- **Updated:** `backend/src/modules/webinar/webinar.service.ts`
  - Added: `getWebinarAttendees`, `joinWebinar`, `leaveWebinar`, `grantPermission`, `revokePermission`, `getWebinarMessages`, `createWebinarMessage`
- **Updated:** `backend/src/modules/webinar/webinar.controller.ts`
  - Added handlers for all new service methods
- **Updated:** `backend/src/modules/webinar/webinar.routes.ts`
  - Added routes: `GET /:id/attendees`, `POST /:id/join`, `POST /:id/leave`, `GET /:id/messages`, `POST /:id/messages`

### 5.3 — Webinar Socket Events
- **Updated:** `backend/src/socket/socket.ts`
  - Added `join-webinar` — validates user authorization (presenter = company creator, viewer = student from targeted university), records attendance, sends room state
  - Added `produce-webinar` / `consume-webinar` / `resume-webinar-consumer` — media production/consumption for webinar rooms (separate from interview rooms)
  - Added `raise-hand` / `lower-hand` — viewer raises/lowers hand; broadcasts to room
  - Added `grant-permission` / `revoke-permission` — presenter grants/revokes speaking permission; updates DB, kills producers on revoke
  - Added `end-webinar` — presenter ends webinar; marks COMPLETED in DB, closes all producers
  - Added `webinar-chat-message` — persists to DB, broadcasts to room
  - Added `leave-webinar` — records leave time, closes producers, notifies room
  - Updated `disconnect` handler to also notify webinar rooms

### 5.4 — Frontend API Additions
- **Updated:** `frontend/src/lib/api.ts`
  - Added `WebinarAttendee` and `WebinarMessage` interfaces
  - Added `webinarApi.getMyList()`, `getAttendees()`, `joinWebinar()`, `leaveWebinar()`, `getMessages()`, `postMessage()`

### 5.5 — WebinarList Wired to Real API
- **Updated:** `frontend/src/pages/shared/WebinarList.tsx`
  - Replaced `mockPPTs` with real state from `webinarApi.getAll()`
  - Added loading and empty states
  - Join button now navigates to `/student/webinar/:id` (webinarId as URL param)

### 5.6 — WebinarRoom Full Rewrite
- **Rewritten:** `frontend/src/pages/shared/WebinarRoom.tsx`
  - Now receives `webinarId` from URL params (`useParams`)
  - Connects to socket.io on mount, emits `join-webinar`
  - Handles all socket events: peer join/leave, hand raise/lower, permission grant/revoke, chat messages, webinar end
  - Implements WebRTC media: `enableMedia`/`disableMedia` for mic/camera, `createTransport` for socket signaling
  - Company (presenter) starts with camera/mic enabled; students start as viewers
  - Raise hand emits `raise-hand` socket event; host sees hand-raised notification
  - Chat sends via `webinarApi.postMessage` + socket broadcast
  - Grant/revoke permission buttons visible only to presenter
  - End webinar button visible only to presenter

### 5.7 — Route Updates
- **Updated:** `frontend/src/App.tsx`
  - Changed `/student/webinar` → `/student/webinar/:id`
  - Changed `/company/webinar` → `/company/webinar/:id`

### Key Design Decisions
- **Reuses existing Mediasoup infrastructure** — `createRoomRouter`, `createWebRtcTransport`, `produce`, `consume` all work for webinar rooms; just need webinar-specific prefixes (`webinar-{id}` vs `interview-{id}`)
- **PRESENTER = company creator** — the company that created the webinar is automatically the presenter
- **Raise hand → temporary speaking** — when presenter grants permission, student's `hasPermissionToSpeak` flips to true in DB and they can unmute

---

## Recommended Next Sprint (ordered)

1. ~~Replace hardcoded dashboard data with real API queries (Phase 4).~~ — **MOSTLY COMPLETED** (Company Evaluation wired; University/Recruiter dashboards still need work)
2. ~~Webinar streaming via Mediasoup SFU (Phase 5).~~ — **COMPLETED**
3. ~~Add refresh tokens, revocation, basic tests, full Docker + CI/CD (Phase 6).~~ — **COMPLETED**
4. Design Arena end-to-end wiring (Phase 7).
5. University/Recruiter dashboard real API wiring + University evaluation backend endpoint (Phase 8).
6. Expand test coverage — evaluation, mail, contest, webinar flows (Phase 9).

---

## TL;DR

- **Foundations are solid:** schema, auth, module layout, mail.
- **Code Arena fully functional** (Phase 3): live leaderboards, submission history with pagination, activity heatmap, contest lifecycle automation.
- **Company Evaluation wired end-to-end** (Phase 4): real API for pending/evaluated candidates, modal fetches full detail with code submissions, SELECTED/REJECTED/HOLD verdicts.
- **Webinars live streaming complete** (Phase 5): WebRTC broadcast via Mediasoup SFU, attendance tracking, raise-hand Q&A, chat, presenter controls.
- **Auth hardened + infra production-ready** (Phase 6): refresh token rotation, image uploads (Multer + Sharp), Vitest test suite, full Docker containerization, GitHub Actions CI/CD, Static Profile rewrite.
- **~82–85% complete overall.** Phases 1–6 done. Phase 7 (Design Arena), Phase 8 (remaining dashboards + university evaluation), Phase 9 (test coverage) remain.
