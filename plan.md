# CodeNexus — Phased Completion Plan

Based on the [workin.md](workin.md) analysis (~55–60% complete). Phases are ordered by dependency and product value.

---

## Phase 1 — Fix Core Broken Features (Week 1–2)

The product's core value proposition (live interviews + code evaluation) is currently broken. Fix these before building anything new.

### 1.1 Fix Judge0 Verdict Pipeline

**Goal:** Code Arena submissions return correct verdicts reliably.

**Files:**
- [backend/src/modules/codearena/judge0.ts](backend/src/modules/codearena/judge0.ts)
- [backend/src/modules/codearena/submissionQueue.ts](backend/src/modules/codearena/submissionQueue.ts)
- [backend/src/modules/codearena/submissions.controller.ts](backend/src/modules/codearena/submissions.controller.ts)

**Tasks:**
- [ ] Remove the "Paused Functioning" stub in `problem.service.ts` ~line 187 and replace with real verdict determination
- [ ] Audit verdict normalization: map Judge0 status IDs to `AC`, `WA`, `TLE`, `MLE`, `RE`, `CE` reliably
- [ ] Fix edge: when FFmpeg or Judge0 worker is cold, handle `pending` → `processing` → `done` transitions gracefully
- [ ] Fix frontend polling in [frontend/src/pages/student/CodeArenaProblem.tsx](frontend/src/pages/student/CodeArenaProblem.tsx) — don't stop polling on first non-final status
- [ ] Test all 4 languages (C++, Python, Java, JavaScript) with sample problems

**Done when:** Running 10 different problems with different edge cases returns consistent, correct verdicts.

---

### 1.2 Fix WebRTC Video/Audio Binding in Interview Room

**Goal:** Both participants see and hear each other during a live interview.

**Files:**
- [frontend/src/components/Interview/InterviewVideoChat.tsx](frontend/src/components/Interview/InterviewVideoChat.tsx)
- [frontend/src/components/Interview/InterviewRoom.tsx](frontend/src/components/Interview/InterviewRoom.tsx)
- [backend/src/socket/socket.ts](backend/src/socket/socket.ts)

**Tasks:**
- [ ] After `socket.emit('consume')` and getting back transport params, attach the MediaStream to `video.srcObject` in `InterviewVideoChat.tsx`
- [ ] Ensure `remoteVideoRef.current.srcObject = stream` is called after `consumer.resume()`
- [ ] Handle late joiners — emit a "catch-up" event so an existing producer is consumed by the new peer
- [ ] Test audio: ensure both `audio` and `video` producers are created and consumed
- [ ] Add mute/unmute and camera-on/off toggle state to `InterviewRoom.tsx`

**Done when:** Two browser tabs can join an interview room and see/hear each other in real time.

---

### 1.3 Fix Recording Pipeline

**Goal:** FFmpeg reliably produces a playable MP4 after an interview ends.

**Files:**
- [backend/src/lib/recording.manager.ts](backend/src/lib/recording.manager.ts)
- [backend/src/socket/socket.ts](backend/src/socket/socket.ts) (producer lifecycle hooks ~lines 206–213, 248–249)

**Tasks:**
- [ ] Add a producer to the recording session when `producer.on('close')` fires — verify the RTP forwarder is torn down cleanly
- [ ] Test MP4 output: join a room, record 30s, end session, verify file is playable
- [ ] Fix partial recordings: if a producer disconnects mid-session, FFmpeg should continue with remaining streams
- [ ] Store final recording file path in `InterviewRecording` DB row and mark `status = 'DONE'`
- [ ] Wire `/recordings` frontend page to fetch from `GET /interviews/:id/recording` and play the MP4
- [ ] Add retry logic: if FFmpeg exits non-zero, log the stderr and mark `status = 'FAILED'`

**Done when:** An interview can be recorded and played back from the recordings page.

---

## Phase 2 — Complete Live Interview Features (Week 3–4)

With A/V working, add the remaining real-time collaboration features that make interviews useful.

### 2.1 Whiteboard Real-Time Sync

**Goal:** Both interviewer and candidate see each other's drawing strokes live.

**Files:**
- [frontend/src/components/Interview/Whiteboard.tsx](frontend/src/components/Interview/Whiteboard.tsx)
- [backend/src/socket/socket.ts](backend/src/socket/socket.ts)

**Tasks:**
- [ ] Add socket event `whiteboard:stroke` — payload: `{ x, y, prevX, prevY, color, lineWidth, tool }`
- [ ] On draw, emit `whiteboard:stroke` to the room (not back to sender)
- [ ] On `whiteboard:stroke` received, replay the stroke on the remote canvas
- [ ] Add `whiteboard:clear` event
- [ ] On new join, emit `whiteboard:state` with the full stroke history so late joiners catch up
- [ ] Add a tool palette: pen, eraser, color picker, line width

**Done when:** Recruiter and candidate both see strokes as they are drawn.

---

### 2.2 Collaborative Code Editor

**Goal:** Both participants see each other's code edits in real time.

**Files:**
- [frontend/src/components/Interview/InterviewEditor.tsx](frontend/src/components/Interview/InterviewEditor.tsx)
- [backend/src/socket/socket.ts](backend/src/socket/socket.ts)

**Tasks:**
- [ ] Install `yjs` and `y-monaco` in frontend
- [ ] Create a Yjs `Doc` per interview room, backed by a Socket.IO provider (`y-socket.io` or custom)
- [ ] Add backend relay: `socket.on('yjs:update', data => socket.to(room).emit('yjs:update', data))`
- [ ] Bind the Y.Text type to the Monaco editor model
- [ ] Show remote cursors with participant name labels (use `@nexode-ai/monaco-remote-cursor` or build custom)
- [ ] Sync language selection across participants

**Done when:** Both users type in the editor and see each other's cursors and changes instantly.

---

### 2.3 Interview Chat

**Goal:** Text chat persisted per interview session.

**Files:**
- [backend/src/modules/interview/](backend/src/modules/interview/)
- [backend/src/socket/socket.ts](backend/src/socket/socket.ts)
- [frontend/src/components/Interview/InterviewRoom.tsx](frontend/src/components/Interview/InterviewRoom.tsx)

**Tasks:**
- [ ] Add `InterviewMessage` model to Prisma schema (`id, interviewId, senderId, content, createdAt`)
- [ ] Add `POST /interviews/:id/messages` and `GET /interviews/:id/messages` endpoints
- [ ] Add socket event `chat:message` → save to DB + broadcast to room
- [ ] Load chat history on room join (`GET /interviews/:id/messages`)
- [ ] Wire the existing chat UI in `InterviewRoom.tsx` to emit and receive messages

**Done when:** Messages sent during an interview are visible to both parties and persist after refresh.

---

## Phase 3 — Complete Code Arena (Week 5)

### 3.1 Leaderboard

**Files:**
- [backend/src/modules/codearena/](backend/src/modules/codearena/)
- [frontend/src/pages/student/CodeArenaLeaderboard.tsx](frontend/src/pages/student/CodeArenaLeaderboard.tsx)

**Tasks:**
- [ ] On accepted submission, write to Redis sorted set: `ZADD leaderboard:<contestId> <score> <userId>`
- [ ] Score formula: penalize wrong attempts + time (ICPC-style or simply by problems solved + time)
- [ ] `GET /codearena/leaderboard` reads from Redis sorted set, hydrates user display names
- [ ] Paginate: top 50 + user's own rank if outside top 50
- [ ] Frontend: poll leaderboard every 60s during an active contest

---

### 3.2 Submission History & Stats

**Files:**
- [frontend/src/pages/student/CodeArenaSubmissions.tsx](frontend/src/pages/student/CodeArenaSubmissions.tsx)
- [frontend/src/components/ActivityHeatmap.tsx](frontend/src/components/ActivityHeatmap.tsx)

**Tasks:**
- [ ] `GET /codearena/submissions?userId=&page=&limit=` — implement pagination
- [ ] Feed real submission data (date + problem solved) to `ActivityHeatmap.tsx` instead of mocked dates
- [ ] Per-problem: show accepted / total attempts ratio on problem list

---

### 3.3 Contest Registration & Status

**Files:**
- [backend/src/modules/contest/](backend/src/modules/contest/)

**Tasks:**
- [ ] `POST /contests/:id/register` — write to `ContestRegistration` table
- [ ] Cron or scheduled check: auto-flip contest status (`UPCOMING` → `ONGOING` → `ENDED`) based on `startTime`/`endTime`
- [ ] Lock submissions after contest ends

---

## Phase 4 — Real Dashboards (Week 6)

Replace all hardcoded mock data with live API calls.

### 4.1 Company Dashboard

**File:** [frontend/src/pages/company/Dashboard.tsx](frontend/src/pages/company/Dashboard.tsx) *(currently modified, not staged)*

**Tasks:**
- [ ] `GET /company/stats` endpoint: active contests count, total applicants, interviews scheduled, offers sent
- [ ] `GET /applications?status=&page=` for applicant pipeline view
- [ ] Wire charts/counters to real data

---

### 4.2 University Dashboard

**File:** [frontend/src/pages/university/Dashboard.tsx](frontend/src/pages/university/Dashboard.tsx) *(currently modified, not staged)*

**Tasks:**
- [ ] `GET /university/stats`: placement rate, companies visited, students placed, avg package
- [ ] `GET /university/students?placed=true/false` for placement tracking

---

### 4.3 Recruiter Dashboard

**File:** [frontend/src/pages/recruiter/Dashboard.tsx](frontend/src/pages/recruiter/Dashboard.tsx) *(currently modified, not staged)*

**Tasks:**
- [ ] `GET /recruiter/stats`: upcoming interviews, pending evaluations, candidates reviewed
- [ ] Show today's interview schedule inline

---

### 4.4 Evaluation Workflow

**Files:**
- [frontend/src/pages/company/Evaluation.tsx](frontend/src/pages/company/Evaluation.tsx)
- [backend/src/modules/applications/](backend/src/modules/applications/)

**Tasks:**
- [ ] `PATCH /applications/:id/status` — accept `SELECTED`, `REJECTED`, `HOLD`
- [ ] `POST /evaluations` — save recruiter notes + scores per interview dimension
- [ ] `GET /evaluations?interviewId=` — retrieve evaluation for display
- [ ] Wire frontend evaluation form to these endpoints

---

## Phase 5 — Webinars Live Streaming (Week 7)

### 5.1 WebRTC Broadcast via Mediasoup SFU

Since Mediasoup is already in the stack, extend the existing SFU to support one-to-many broadcast.

**Tasks:**
- [ ] Create a `webinar` room type in [backend/src/socket/socket.ts](backend/src/socket/socket.ts) with one `PRESENTER` role and many `VIEWER` roles
- [ ] Presenter creates a producer (video + audio); server creates consumers for all viewers automatically on join
- [ ] Viewers only consume, never produce
- [ ] Raise-hand mechanism: viewer requests to speak → presenter approves → viewer temporarily produces
- [ ] Attendance tracking: log join/leave with timestamp to `WebinarAttendee` DB table (add to schema)
- [ ] `GET /webinars/:id/attendees` for company analytics

---

### 5.2 Webinar Chat

**Tasks:**
- [ ] Re-use interview chat approach (Phase 2.3) with `WebinarMessage` model
- [ ] Add `chat:message` socket event for webinar room type
- [ ] Q&A mode: messages marked as questions, presenter can answer inline

---

## Phase 6 — Polish & Missing Infrastructure (Week 8)

### 6.1 Auth Hardening

**Tasks:**
- [ ] Add `POST /auth/refresh` — accept a refresh token (httpOnly cookie), return new access token
- [ ] Issue refresh token (7-day, rotated) on login; store hash in `RefreshToken` DB table
- [ ] `POST /auth/logout` — invalidate refresh token in DB
- [ ] Frontend: intercept 401 responses, auto-call refresh, retry original request

---

### 6.2 Image / File Uploads

**Tasks:**
- [ ] Set up S3 (or compatible: Cloudflare R2, MinIO) bucket
- [ ] `POST /uploads/avatar` — accept multipart, resize to 256×256, return CDN URL
- [ ] `POST /uploads/project-image` — same pattern
- [ ] Update student profile and project forms to include file pickers
- [ ] Store URLs in `Student.avatarUrl` and `Project.imageUrl` fields (add to schema)

---

### 6.3 StaticProfile Page

**File:** [frontend/src/pages/shared/StaticProfile.tsx](frontend/src/pages/shared/StaticProfile.tsx) *(currently untracked, ~20% done)*

**Tasks:**
- [ ] `GET /user/:cnid/profile` — public read-only endpoint, returns safe fields only
- [ ] Render: name, university, skills, projects, contest stats, submission heatmap
- [ ] Shareable link: `codenexus.com/profile/:cnid`

---

### 6.4 Containerize Application

**File:** [backend/docker-compose.yml](backend/docker-compose.yml) *(DB + Judge0 only right now)*

**Tasks:**
- [ ] Add `backend` service to docker-compose (build from `./backend`, port 4000, depends on postgres + redis)
- [ ] Add `frontend` service (Vite preview or nginx static, port 5173)
- [ ] Add env-file support for secrets
- [ ] Document `docker compose up` quick-start in README

---

### 6.5 Testing Baseline

**Tasks:**
- [ ] Backend: add Vitest + Supertest; write tests for auth flow, mail permission matrix, Judge0 integration
- [ ] Frontend: add Vitest + React Testing Library; write tests for Login, Mail compose, submission verdict display
- [ ] Add CI GitHub Actions workflow: `turbo lint && turbo test && turbo build`

---

## Phase 7 — Design Arena (Week 9, if capacity allows)

Currently 30% — UI shell only.

**Tasks:**
- [ ] Define problem schema: `DesignProblem { id, title, description, referenceImages[], submissionType: FIGMA | IMAGE }`
- [ ] `POST /designarena/problems` (company creates), `GET /designarena/problems`
- [ ] `POST /designarena/submissions` — accept Figma URL or uploaded image
- [ ] Recruiter evaluation: score rubric (creativity, usability, fidelity)
- [ ] Frontend: wire `DesignArena.tsx` and `DesignArenaProblem.tsx` to new endpoints

---

## Summary Timeline

| Week | Phase | Outcome |
|------|-------|---------|
| 1–2 | Phase 1 | Judge0 verdicts correct · A/V streaming works · Recording saves MP4 |
| 3–4 | Phase 2 | Whiteboard syncs · Code editor collab · Chat persisted |
| 5 | Phase 3 | Code Arena leaderboard live · Submissions paginated · Contest lifecycle automated |
| 6 | Phase 4 | All dashboards show real data · Evaluation workflow complete |
| 7 | Phase 5 | Webinars broadcast via SFU · Attendance tracked |
| 8 | Phase 6 | Auth hardened · File uploads · Profile pages · Docker · Tests |
| 9 | Phase 7 | Design Arena end-to-end |

**At the end of Phase 3 (~week 5):** the core product (auth + mail + code arena + live interviews) is shippable.
**At the end of Phase 6 (~week 8):** the full feature set is production-ready.
