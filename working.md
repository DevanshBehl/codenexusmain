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
| Contests (company-created) | 65% | Create/list work; no auto status, no per-contest leaderboard |
| Code Arena (DSA practice) | 60% | Judge0 integration **unstable**; verdict logic stubbed |
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
| `contest` | [backend/src/modules/contest/](backend/src/modules/contest/) | 75% — CRUD works; registration partial |
| `problems` | [backend/src/modules/problems/](backend/src/modules/problems/) | 85% — CRUD + test cases |
| `codearena` | [backend/src/modules/codearena/](backend/src/modules/codearena/) | 60–70% — Judge0 integrated but **verdict logic stubbed** (see `problem.service.ts` ~line 187 "Paused Functioning") |
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
- `dashboard` 80% · `codearena` 75% · `codearena/:id` 60% (Judge0 unstable)
- `designarena` 30% · `interview` 50% · `interview/:id` 40%
- `projects` 60% · `profile` 80% · `webinars` 60% · `mail/*` 95%

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

### 🟠 Medium
4. **Whiteboard has no socket sync** — only the drawer sees their strokes.
5. **Code editor in interview is not collaborative** — no Yjs/CRDT; recruiter can't see candidate's typing in real time.
6. **Webinar live streaming not implemented** — no HLS/RTMP/SFU broadcast path.
7. **Company / University / Recruiter dashboards are hardcoded** — no real API calls for analytics.

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

---

## Recommended Next Sprint (ordered)

1. Add whiteboard stroke sync via socket events.
2. Add collaborative editing via Yjs + `y-monaco`.
3. Replace hardcoded dashboard data with real API queries.
7. Plan webinar streaming (likely WebRTC SFU via existing Mediasoup, or nginx-rtmp + HLS).
8. Add refresh tokens, revocation, and basic e2e tests around auth + mail.

---

## TL;DR

- **Foundations are solid:** schema, auth, module layout, mail.
- **The product pitch depends on live interviews + code arena**, and both are currently broken or unstable.
- **~55–60% complete overall.** Of the remaining 40%, most is real-time plumbing and admin analytics — the hardest parts are still ahead.
