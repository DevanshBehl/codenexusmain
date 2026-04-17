# CodeNexus — Work Status Report

**Repo:** `codenexus-monorepo` (Turborepo: `frontend` + `backend`)
**Analysis Date:** 2026-04-17
**Current Branch:** `main`
**Overall Completion:** ~55–60%

---

## Executive Summary

CodeNexus is a campus placement platform targeting **students, companies, universities, and recruiters**. The project has a strong foundation (auth, DB schema, module-based backend, React 19 frontend) but most real-time and evaluation features are only **partially wired**. The **internal mail system is the only feature that is end-to-end complete**; everything else has gaps between frontend UI, backend API, or real-time plumbing.

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
| Authentication (JWT, CNID, role prefixes) | 85% | Works; no refresh tokens / logout blacklist |
| Internal Mail System (role-matrix + SSE) | **95%** | **Shipped-quality** |
| Student Profile | 75% | Works; no image upload, some type coercion issues |
| Projects (student portfolio) | 75% | CRUD working; no validation / uploads |
| Contests (company-created) | **85%** | Create/list/register work; **auto status now working**; per-contest leaderboard live |
| Code Arena (DSA practice) | **85%** | Judge0 integration **stable**; **live leaderboard, pagination, activity heatmap** |
| Webinars | 50% | Scheduling works; **no live streaming backend** |
| Interviews (live tech sessions) | 45% | Scheduling ok; WebRTC / whiteboard / IDE sync **broken** |
| Recording | 40% | FFmpeg plumbed; output known to be buggy |
| Job Applications / Evaluation | 40% | Basic CRUD; evaluation flow incomplete |
| Admin Dashboards (company/uni/recruiter) | 30% | Mostly **hardcoded** mock data |
| Design Arena | 30% | **UI shell only**; no backend |

---

## Backend Analysis

**Entry:** [backend/src/server.ts](backend/src/server.ts)
**Routes mounted in:** [backend/src/app.ts](backend/src/app.ts)
**DB schema:** [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

### Module Status

| Module | Path | Status |
|--------|------|--------|
| `auth` | [backend/src/modules/auth/](backend/src/modules/auth/) | 90% — signup/login + JWT + bcrypt + CNID |
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
- **Missing:** refresh token rotation, token revocation, transactional email (no SMTP setup)

### Infra

- Docker: [backend/docker-compose.yml](backend/docker-compose.yml) — Postgres + Judge0 + Judge0 Redis/workers. App services not containerized.
- No tests (backend `npm test` is a stub).

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

### 🟡 Low
8. No refresh-token rotation; no logout revocation.
9. No transactional email (password reset, verification).
10. No image uploads (profile, projects).
11. No tests (unit or integration) on either side.
12. Docker Compose does not include app services.

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

## Recommended Next Sprint (ordered)

1. Replace hardcoded dashboard data with real API queries (Phase 4).
2. Plan webinar streaming (likely WebRTC SFU via existing Mediasoup, or nginx-rtmp + HLS) (Phase 5).
3. ~~Complete CodeArena Features (Phase 3: Leaderboard, Test Cases UI)~~ — **COMPLETED**.
4. Add refresh tokens, revocation, and basic e2e tests around auth + mail (Phase 6).

---

## TL;DR

- **Foundations are solid:** schema, auth, module layout, mail.
- **Code Arena is now fully functional** (Phase 3 complete): live leaderboards, submission history with pagination, activity heatmap with real data, contest lifecycle automation.
- **~60–65% complete overall.** Phase 1 (core broken features), Phase 2 (interview collaboration), and Phase 3 (Code Arena completion) are done. Remaining work: Phase 4 (dashboards), Phase 5 (webinars), Phase 6 (polish/infrastructure).
