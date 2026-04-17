<div align="center">

# 🌌 &lt;cn/&gt; CodeNexus

### THE COMPLETE CAMPUS PLACEMENT ECOSYSTEM

<p align="center">
  <img src="https://img.shields.io/badge/Monorepo-Turborepo-050505?style=for-the-badge&logo=turborepo&logoColor=EF4444" alt="Turborepo" />
  <img src="https://img.shields.io/badge/TypeScript-Full_Stack-050505?style=for-the-badge&logo=typescript&logoColor=3178C6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_19-050505?style=for-the-badge&logo=react&logoColor=00D4FF" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-050505?style=for-the-badge&logo=node.js&logoColor=339933" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-050505?style=for-the-badge&logo=postgresql&logoColor=4169E1" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-050505?style=for-the-badge&logo=redis&logoColor=DC382D" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-050505?style=for-the-badge&logo=docker&logoColor=2496ED" alt="Docker" />
</p>

<br/>

<p>
  <strong>A closed-loop campus placement platform that eliminates the need for any external communication tools.</strong>
</p>

<p>
  <code>bg-[#050505]</code> · <code>accent: oklch(0.777 0.152 181.912)</code> · <code>font: JetBrains Mono</code>
</p>

</div>

---

## 🚀 Overview

**CodeNexus** connects four stakeholders — **Students**, **Universities**, **Companies**, and **Recruiters** — through dedicated role-based dashboards, an internal mailing system, live webinar rooms, a competitive coding arena with sandboxed code execution (Judge0 integration), and a real-time interview IDE with WebRTC multi-peer video and robust FFmpeg session recording.

Every interaction — from scheduling a pre-placement talk to conducting a live, recordable technical interview — happens entirely within CodeNexus.

---

## 🏗️ Monorepo Architecture

```
codenexus/
├── frontend/          # React 19 SPA — Vite, TailwindCSS v4, Framer Motion
├── backend/           # Node.js API — Express, Prisma, Socket.IO, BullMQ
├── turbo.json         # Turborepo pipeline config
└── package.json       # npm workspaces root
```

```mermaid
graph TB
    subgraph "Client"
        FE["⚛️ React Frontend<br/>Vite + TailwindCSS v4"]
    end

    subgraph "Real-Time / Media Engine"
        SFU["📹 Mediasoup SFU<br/>WebRTC Routing"]
        REC["⏺️ FFmpeg Pipelines<br/>Session Recording"]
    end

    subgraph "Backend Core"
        API["🟢 Express API + Socket.IO<br/>REST & WSS Handlers"]
        QUEUE["📋 BullMQ<br/>Async Job Queue"]
        JUDGE["⚖️ Judge0 CE<br/>Sandboxed Execution"]
    end

    subgraph "Data Persistence"
        PG["🐘 PostgreSQL<br/>Primary Database"]
        RD["⚡ Redis<br/>Cache & Leaderboard"]
        S3["📦 Local / S3<br/>File & MP4 Storage"]
    end

    FE -->|REST + WebSocket| API
    FE <-->|WebRTC RTP/RTCP| SFU
    API <-->|Control Router/Producer| SFU
    SFU -->|Tap Media Streams| REC
    REC -->|Save MP4| S3
    API --> PG
    API --> RD
    API --> S3
    API -->|Enqueue contest/code submissions| QUEUE
    QUEUE -->|Process & Poll| JUDGE

    style FE fill:#0a0a0a,stroke:#06b6d4,color:#06b6d4
    style API fill:#0a0a0a,stroke:#339933,color:#339933
    style SFU fill:#0a0a0a,stroke:#8b5cf6,color:#8b5cf6
    style REC fill:#0a0a0a,stroke:#ef4444,color:#ef4444
    style PG fill:#0a0a0a,stroke:#4169E1,color:#4169E1
    style RD fill:#0a0a0a,stroke:#DC382D,color:#DC382D
    style QUEUE fill:#0a0a0a,stroke:#f59e0b,color:#f59e0b
    style JUDGE fill:#0a0a0a,stroke:#2496ED,color:#2496ED
    style S3 fill:#0a0a0a,stroke:#888,color:#888
```

---

## 🗃️ Database Schema

```mermaid
erDiagram
    User {
        string id PK
        string email
        string password
        string role
        string cnid UK
        datetime createdAt
        datetime updatedAt
    }

    University {
        string id PK
        string userId
        string name
        string location
        int tier
        string status
        datetime createdAt
    }

    Company {
        string id PK
        string userId
        string name
        string description
        string industry
        datetime createdAt
    }

    CompanyUniversity {
        string companyId
        string universityId
        datetime createdAt
    }

    Recruiter {
        string id PK
        string userId
        string companyId
        string name
    }

    Student {
        string id PK
        string userId
        string universityId
        string name
        int age
        string phone
        string branch
        float cgpa
        string specialization
        string gender
        string registrationNumber
        string codeNexusId
        string parentsName
        string parentContactNo
        string parentEmail
        string address
        string xSchool
        string xPercentage
        string xiiSchool
        string xiiPercentage
        string otherInfo
        string status
        int codeArenaScore
        datetime createdAt
    }

    Project {
        string id PK
        string studentId
        string title
        string description
        string techStack
        string githubLink
        string liveLink
    }

    Contest {
        string id PK
        string companyId
        string title
        string description
        datetime date
        int durationMins
        int timeLimitMinutes
        string languages
        string status
    }

    Problem {
        string id PK
        string contestId
        string title
        string description
        string difficulty
        string topic
        int points
        string constraints
    }

    TestCase {
        string id PK
        string problemId
        string input
        string output
        boolean isHidden
    }

    Submission {
        string id PK
        string studentId
        string problemId
        string code
        string language
        int passed
        int total
        string status
        datetime createdAt
    }

    JobApplication {
        string id PK
        string studentId
        string companyId
        string status
        datetime createdAt
    }

    Interview {
        string id PK
        string recruiterId
        string studentId
        string role
        datetime scheduledAt
        string type
        string status
    }

    Recording {
        string id PK
        string interviewId
        string videoUrl
        string durationStr
        float rating
        string verdict
        string notes
        datetime createdAt
    }

    Webinar {
        string id PK
        string companyId
        string title
        string agenda
        datetime scheduledAt
        int durationMins
        string meetingLink
        string status
    }

    WebinarTargetUniversity {
        string webinarId
        string universityId
    }

    Mail {
        string id PK
        string sender_cnid
        string recipient_cnid
        string subject
        string body
        datetime sent_at
        boolean is_read
        boolean is_deleted_sender
        boolean is_deleted_recipient
        string thread_id
        string parent_mail_id FK
        datetime created_at
        datetime updated_at
    }

    MailPermissionViolation {
        string id PK
        string sender_cnid
        string attempted_recipient_cnid
        string action
        datetime timestamp
        string ip_address
        string user_agent
    }

    User ||--o| Student : "studentProfile"
    User ||--o| University : "universityProfile"
    User ||--o| Company : "companyProfile"
    User ||--o| Recruiter : "recruiterProfile"
    User ||--o{ Mail : "sentMails"
    User ||--o{ Mail : "receivedMails"

    University ||--o{ Student : "has"
    University ||--o{ CompanyUniversity : "partners"
    University ||--o{ WebinarTargetUniversity : "targeted"

    Company ||--o{ Recruiter : "employs"
    Company ||--o{ Contest : "hosts"
    Company ||--o{ Webinar : "organizes"
    Company ||--o{ CompanyUniversity : "partners"
    Company ||--o{ JobApplication : "receives"

    Recruiter ||--o{ Interview : "conducts"

    Student ||--o{ Project : "creates"
    Student ||--o{ Submission : "submits"
    Student ||--o{ Interview : "attends"
    Student ||--o{ JobApplication : "applies"

    Contest ||--o{ Problem : "contains"

    Problem ||--o{ TestCase : "has"
    Problem ||--o{ Submission : "receives"

    Interview ||--o| Recording : "has"

    Webinar ||--o{ WebinarTargetUniversity : "targets"

    Mail ||--o| Mail : "parent"
    Mail ||--o{ Mail : "replies"
```

---

## ✨ Features by Role

### 🎓 Student Portal

| Feature | Description |
|---------|-------------|
| **Command Center** | Personalized analytics, placement drive status, progress tracking |
| **Code Arena** | Competitive programming — curated problems, difficulty filters, leaderboard |
| **Problem IDE** | Full-screen editor with multi-language support, real-time test-case execution |
| **Design Arena** | UI/UX design challenges with submission uploads |
| **Interview Room** | Three-column live IDE — problem, code editor, video/chat + whiteboard |
| **Webinars** | Join live pre-placement talks with chat and screen sharing |
| **Internal Mail** | Message university placement cell; receive updates from companies (CNID-based addressing) |
| **Student Profile** | Editable personal, educational, and parental information |
| **Projects** | Portfolio of student projects with descriptions |

### 🏛️ University Placement Cell

| Feature | Description |
|---------|-------------|
| **Command Center** | Manage placement drives, student pools, company partnerships |
| **Evaluations** | Review student performance across interviews and contests |
| **Webinar Management** | View and manage scheduled company webinars |
| **Internal Mail** | Communicate with students and companies; send placement announcements (CNID-based) |

### 🏢 Company Portal

| Feature | Description |
|---------|-------------|
| **Command Center** | Candidate pipelines, active drives, recruitment analytics |
| **Contest Builder** | Custom coding assessments with problem sets, time limits, target universities |
| **PPT Scheduler** | Schedule pre-placement talk webinars with agenda and targeting |
| **Webinar Host** | Host live webinars with screen sharing and participant management |
| **Candidate Evaluation** | Review recordings, reports, Select/Reject with evaluator notes |
| **Internal Mail** | Message students, universities, and recruiters; receive inquiries (CNID-based) |

### 👔 Recruiter Portal

| Feature | Description |
|---------|-------------|
| **Command Center** | Upcoming interviews, past recordings, candidate profiles |
| **Interview Room** | Conduct live technical interviews in the three-column IDE |
| **Internal Mail** | Contact company admins directly (CNID-based, role-restricted) |

---

## 💻 Live Interview IDE

```
┌─────────────────┬─────────────────────────┬──────────────────┐
│                 │                         │                  │
│  📋 PROBLEM     │  ⌨️  CODE EDITOR         │  📹 VIDEO CHAT   │
│  DESCRIPTION    │                         │                  │
│                 │  • Multi-language        │  • HD WebRTC     │
│  • Statement    │  • Syntax highlighting   │  • Text chat     │
│  • Constraints  │  • Real-time execution   │  • Screen share  │
│  • Test Cases   │  • Test case feedback    │  • Whiteboard    │
│  • Expected I/O │  • Tab management        │  • Controls      │
│                 │                         │                  │
└─────────────────┴─────────────────────────┴──────────────────┘
```

---

## 📬 Internal Mail System

CodeNexus features a fully enclosed mailing system — no external email required. Communication is role-restricted and CNID-based.

### Communication Matrix

| From ↓ / To → | Student | University | Company | Recruiter |
|:-:|:-:|:-:|:-:|:-:|
| **Student** | ❌ | ✅ | ❌ | ❌ |
| **University** | ✅ | ❌ | ✅ | ❌ |
| **Company** | ✅ | ✅ | ❌ | ✅ |
| **Recruiter** | ❌ | ❌ | ✅ | ❌ |

### CNID Format

Every user gets a unique CodeNexus ID at registration:

```
CN-{PREFIX}-{6 RANDOM CHARS}
```

| Role | Prefix | Example |
|------|--------|---------|
| Student | STU | `CN-STU-A1B2C3` |
| University | UNI | `CN-UNI-X7Y8Z9` |
| Company | COM | `CN-COM-M4N5O6` |
| Recruiter | REC | `CN-REC-P1Q2R3` |

### Mail Features

- **Threaded Conversations**: Messages group into threads via shared `thread_id`
- **Real-Time Notifications**: SSE stream delivers new mail instantly
- **Soft Delete**: Both sender and recipient must independently delete
- **Unread Badge**: Cached unread count with 10s TTL
- **Recipient Search**: Role-filtered autocomplete with rate limiting

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/mail/send` | Send a mail |
| `GET` | `/api/v1/mail/inbox` | Paginated inbox |
| `GET` | `/api/v1/mail/sent` | Paginated sent box |
| `GET` | `/api/v1/mail/:id` | Get single mail |
| `GET` | `/api/v1/mail/thread/:thread_id` | Get full thread |
| `PATCH` | `/api/v1/mail/:id/read` | Mark as read |
| `DELETE` | `/api/v1/mail/:id` | Delete mail |
| `GET` | `/api/v1/mail/unread-count` | Get unread count (cached) |
| `GET` | `/api/v1/mail/search-recipients` | Search recipients |
| `GET` | `/api/v1/mail/events` | SSE notification stream |

### Detailed Documentation

For complete technical documentation, architecture diagrams, security details, and integration guides, see:

📄 **[Mail System Documentation](./backend/docs/mailing.md)**

### Security

- **Server-Side Permission Enforcement**: Role matrix validated on every send
- **Content Sanitization**: HTML stripped, angle brackets validated, max lengths enforced
- **Rate Limiting**: 20 mails/hour, 30 searches/minute per user
- **Audit Logging**: All permission violations logged with IP and timestamp

---

## 🛠️ Tech Stack

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19 |
| Language | TypeScript | 5.9 |
| Styling | Tailwind CSS | 4.2 |
| Routing | React Router | 7.13 |
| Animations | Framer Motion | 12.36 |
| Icons | Lucide React | 0.577 |
| Build Tool | Vite | 8.0 |
| Utilities | clsx, tailwind-merge | latest |

### Backend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 20 LTS | Server runtime |
| Language | TypeScript 5.x | Type-safe backend |
| Framework | Express | HTTP routing + middleware |
| ORM | Prisma | Type-safe database queries + migrations |
| Database | PostgreSQL 16 | Relational data (users, problems, submissions) |
| Cache | Redis 7 | Sessions, leaderboard (sorted sets), pub/sub |
| Auth | JWT + bcrypt | Access/refresh token auth, password hashing |
| Validation | Zod | Runtime schema validation |
| Real-Time | Socket.IO | WebSocket for interviews, webinars, notifications |
| Video | WebRTC | Peer-to-peer video for interview rooms |
| Job Queue | BullMQ | Async code execution, email sending |
| Code Runner | Docker (dockerode) | Sandboxed containers per submission |
| File Storage | AWS S3 / MinIO | Avatars, design submissions, recordings |
| Email | Nodemailer | Transactional emails (verification, reset) |
| Logging | Pino | Structured JSON logging |
| Testing | Vitest + Supertest | Unit + integration tests |

### DevOps

| Tool | Purpose |
|------|---------|
| Turborepo | Monorepo build orchestration |
| Docker Compose | Local dev environment (Postgres + Redis + backend) |
| GitHub Actions | CI/CD pipeline |
| Nginx | Reverse proxy + SSL termination |

---

## 🎨 Design System

Dark, premium, developer-centric design language:

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#050505` | Root — deep space aesthetic |
| Accent 500 | `oklch(0.777 0.152 181.912)` | Primary CTA, borders, neon cyan signature |
| Accent 400 | `oklch(0.85 0.152 181.912)` | Hover states, highlights |
| Font Mono | `JetBrains Mono` | Code, labels, navigation, data |
| Font Sans | `Inter, Space Grotesk` | Headings, body text, cards |

**Signature elements:** dotted radial-gradient background · glassmorphism overlays · Framer Motion micro-animations · monospaced uppercase labels with left-border accent highlights

---

## 📂 Project Structure

```
codenexus/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── CodeArena/          # AskAI, ActivityHeatmap
│       │   ├── Interview/          # InterviewRoom, VideoChat, Whiteboard, Editor
│       │   └── Landing/            # Hero, Navbar, Features, CTA sections
│       ├── pages/
│       │   ├── student/            # Dashboard, CodeArena, DesignArena, Profile, Projects, Interview
│       │   ├── company/            # Dashboard, CreateContest, Evaluation, SchedulePPT
│       │   ├── university/         # Dashboard, Evaluation
│       │   ├── recruiter/          # Dashboard, RecruiterInterview
│       │   ├── shared/             # WebinarList, WebinarRoom
│       │   ├── mail/               # Mail (universal for all roles)
│       │   ├── Login.tsx, Signup.tsx, Landing.tsx
│       │   └── AboutDeveloper.tsx
│       ├── App.tsx                  # 26+ route definitions
│       └── main.tsx                 # Entry point
│
├── backend/
│   ├── prisma/                      # Schema + migrations
│   └── src/
│       ├── modules/                 # Feature modules (auth, user, problem, submission, etc.)
│       ├── middleware/              # JWT auth, RBAC guards, validation, error handler
│       ├── socket/                  # Socket.IO handlers (interview, webinar, notifications)
│       ├── jobs/                    # BullMQ workers (code execution, emails)
│       ├── config/                  # Env, database, Redis clients
│       └── utils/                   # Logger, API response helpers, custom errors
│
├── docker/                          # Dockerfiles for code runners (C++, Python, Java, JS)
├── docker-compose.yml               # Local dev stack
├── turbo.json                       # Pipeline config
└── package.json                     # Workspace root
```

---

## 🗺️ Route Map

```mermaid
graph TD
    subgraph "Public"
        Landing["/"]
        Login["/login"]
        Signup["/signup"]
    end

    subgraph "Student — 10 routes"
        SD["/student/dashboard"]
        SCA["/student/codearena"]
        SCAP["/student/codearena/:id"]
        SDA["/student/designarena"]
        SI["/student/interview"]
        SP["/student/profile"]
        SPR["/student/projects"]
        SW["/student/webinars"]
        SM["/student/mail"]
    end

    subgraph "Company — 6 routes"
        CD["/company/dashboard"]
        CC["/company/create-contest"]
        CE["/company/evaluation"]
        CP["/company/ppt"]
        CW["/company/webinar"]
        CM["/company/mail"]
    end

    subgraph "University — 4 routes"
        UD["/university/dashboard"]
        UE["/university/evaluation"]
        UW["/university/webinars"]
        UM["/university/mail"]
    end

    subgraph "Recruiter — 3 routes"
        RD["/recruiter/dashboard"]
        RI["/recruiter/interview"]
        RM["/recruiter/mail"]
    end

    Landing --> Login & Signup
    Login --> SD & CD & UD & RD

    style Landing fill:#111,stroke:#06b6d4,color:#fff
    style SD fill:#0a0a0a,stroke:#06b6d4,color:#06b6d4
    style CD fill:#0a0a0a,stroke:#06b6d4,color:#06b6d4
    style UD fill:#0a0a0a,stroke:#06b6d4,color:#06b6d4
    style RD fill:#0a0a0a,stroke:#06b6d4,color:#06b6d4
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/) (for backend services)
- npm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/DevanshBehl/codenexus.git
cd codenexus

# Install all dependencies (frontend + backend)
npm install

# Start local infrastructure (Postgres + Redis)
docker compose up -d postgres redis

# Run database migrations
cd backend && npx prisma migrate dev && cd ..

# Start both frontend and backend in development mode
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:4000` |
| Prisma Studio | `npx prisma studio` (port 5555) |

### Production Build

```bash
npm run build
```

---

## 🔧 Environment Variables

Create a `.env` file in `backend/`:

```env
# Database
DATABASE_URL=postgresql://codenexus:password@localhost:5432/codenexus

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Server
PORT=4000
NODE_ENV=development

# S3 (optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
```

---

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend linting
cd frontend && npm run lint
```

---

## 📊 API Overview

| Domain | Endpoints | Description |
|--------|-----------|-------------|
| Auth | `POST /api/v1/auth/signup, login, refresh, logout` | JWT auth with refresh token rotation |
| Users | `GET/PATCH /api/v1/users/me` | Profile CRUD |
| Problems | `GET/POST /api/v1/problems` | CodeArena problem management |
| Submissions | `POST /api/v1/submissions` | Code submission → sandboxed execution → verdict |
| Leaderboard | `GET /api/v1/leaderboard` | Redis sorted-set rankings |
| Contests | `GET/POST /api/v1/contests` | Company-created coding challenges |
| Interviews | `GET/POST /api/v1/interviews` | Schedule + WebRTC room tokens |
| Webinars | `GET/POST /api/v1/webinars` | Live session management |
| Mail | `GET/POST /api/v1/mail` | Internal messaging system |
| Evaluations | `GET/POST /api/v1/evaluations` | Select/reject with evaluator notes |

---

<div align="center">

## 👨‍💻 Developer

<br/>

<img src="https://img.shields.io/badge/Developed%20by-Devansh%20Behl-050505?style=for-the-badge&labelColor=050505&color=06b6d4" alt="Developer" />

<br/><br/>

**Devansh Behl**

<br/>

<p>
  <a href="https://github.com/DevanshBehl">
    <img src="https://img.shields.io/badge/GitHub-050505?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
</p>

---

<p><strong>YOU SHOWCASE THE SKILLS. WE PROVIDE THE PLATFORM.</strong></p>
<p><i>© 2026 CodeNexus — All Rights Reserved</i></p>

</div>
