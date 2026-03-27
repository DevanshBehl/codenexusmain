# Database Architecture & Tech Stack Decision for CodeNexus

## MongoDB vs. PostgreSQL (with Prisma)

### Analysis of the Application
Based on the existing frontend and structure, CodeNexus is a multi-sided platform involving **Students, Universities, Companies, and Recruiters**. Features include:
- Complex many-to-many relationships (e.g., Students applying to Companies, Universities partnered with Companies).
- Coding Contests (Code Arena) with Submissions mapped to Problems and Candidates.
- Interview Scheduling and Video Recordings mapped to Recruiters, Companies, and Students.
- Structured evaluations, scoring, and placement tracking.

### MongoDB Approach
- **Pros**: Flexible schema for features that change often; easy to dump unstructured data like code submission logs or real-time interview chat/event logs.
- **Cons**: Complex relational queries (like finding all students from a specific university who applied to a specific company contest and got a score > 80) become difficult and require expensive aggregation pipelines. Data integrity relies heavily on application-level logic.

### PostgreSQL + Prisma Approach
- **Pros**: 
  - **Relational Integrity**: Enforces strict relationships, ensuring a `Recruiter` always belongs to a valid `Company`, and an `Interview` cannot exist without a `Student`.
  - **Prisma's Type Safety**: The Prisma ORM auto-generates TypeScript types based on the schema, giving you end-to-end type safety from the database to the frontend.
  - **Complex Queries**: Effortless complex joins natively handled by SQL and cleanly abstracted by Prisma.
- **Cons**: Requires initial schema design and migration management (though Prisma makes migrations very easy).

### Verdict
**PostgreSQL + Prisma is the much better choice for this project.** The platform's entire value proposition is based on structured relationships between different user roles, evaluations, and structured content (contests). Relational databases excel exactly at this.

---

## Proposed Database Schema (Prisma)

Below is the comprehensive database schema tailored for every section of your frontend portals (Student, University, Company, Recruiter).

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql" // Represents PostgreSQL
  url      = env("DATABASE_URL")
}

// ==========================================
// 1. CORE USERS & AUTHENTICATION
// ==========================================

enum Role {
  STUDENT
  UNIVERSITY
  COMPANY_ADMIN
  RECRUITER
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Role-specific profiles (A User has exactly one of these based on their Role)
  studentProfile     Student?
  universityProfile  University?
  companyProfile     Company?    // For COMPANY_ADMIN
  recruiterProfile   Recruiter?
}

// ==========================================
// 2. ROLE DOMAINS
// ==========================================

model University {
  id          String   @id @default(uuid())
  userId      String   @unique
  name        String
  location    String
  tier        Int      @default(3)
  status      String   @default("ACTIVE") // ACTIVE, UPCOMING
  createdAt   DateTime @default(now())
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  students    Student[]
  // Affiliations with companies
  partnerCompanies CompanyUniversity[]
}

model Company {
  id          String   @id @default(uuid())
  userId      String   @unique // The COMPANY_ADMIN mapping
  name        String
  description String?
  industry    String?
  createdAt   DateTime @default(now())
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  recruiters  Recruiter[]
  contests    Contest[]
  webinars    Webinar[]
  
  partnerUniversities CompanyUniversity[]
}

// Join table for University <-> Company partnerships
model CompanyUniversity {
  companyId    String
  universityId String
  createdAt    DateTime @default(now())

  company      Company    @relation(fields: [companyId], references: [id], onDelete: Cascade)
  university   University @relation(fields: [universityId], references: [id], onDelete: Cascade)

  @@id([companyId, universityId])
}

model Recruiter {
  id        String   @id @default(uuid())
  userId    String   @unique
  companyId String
  name      String
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  interviews Interview[]
}

model Student {
  id             String   @id @default(uuid())
  userId         String   @unique
  universityId   String
  name           String
  branch         String
  cgpa           Float
  specialization String?
  gender         String?
  status         String   @default("AVAILABLE") // PLACED, AVAILABLE
  codeArenaScore Int      @default(0)
  createdAt      DateTime @default(now())

  user           User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  university     University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  
  projects       Project[]
  submissions    Submission[]
  interviews     Interview[]
  applications   JobApplication[]
}

model Project {
  id          String  @id @default(uuid())
  studentId   String
  title       String
  description String
  techStack   String[]
  url         String?
  
  student     Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
}

// ==========================================
// 3. CODE ARENA (CONTESTS & PROBLEMS)
// ==========================================

model Contest {
  id           String   @id @default(uuid())
  companyId    String
  title        String
  description  String?
  date         DateTime
  durationMins Int
  status       String   @default("UPCOMING") // UPCOMING, ACTIVE, COMPLETED
  
  company      Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  problems     Problem[]
}

model Problem {
  id          String   @id @default(uuid())
  contestId   String?  // Nullable if problem is standalone in the general Arena
  title       String
  description String
  difficulty  String   // EASY, MEDIUM, HARD
  
  contest     Contest?     @relation(fields: [contestId], references: [id], onDelete: Cascade)
  testCases   TestCase[]
  submissions Submission[]
}

model TestCase {
  id         String  @id @default(uuid())
  problemId  String
  input      String
  output     String
  isHidden   Boolean @default(false)
  
  problem    Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)
}

model Submission {
  id          String   @id @default(uuid())
  studentId   String
  problemId   String
  code        String
  language    String
  passed      Int
  total       Int
  status      String   // AC, WA, TLE, MLE, CE
  createdAt   DateTime @default(now())

  student     Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
  problem     Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)
}

// ==========================================
// 4. INTERVIEWS, EVALUATIONS & RECORDINGS
// ==========================================

model JobApplication {
  id           String   @id @default(uuid())
  studentId    String
  companyId    String // Applied to general company or specific job
  status       String   @default("APPLIED") // APPLIED, SHORTLISTED, INTERVIEWED, SELECTED, REJECTED
  createdAt    DateTime @default(now())

  student      Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
}

model Interview {
  id           String   @id @default(uuid())
  recruiterId  String
  studentId    String
  role         String   // e.g., "SDE I"
  scheduledAt  DateTime
  type         String   // TECHNICAL, HR, SYSTEM_DESIGN
  status       String   @default("SCHEDULED") // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  
  recruiter    Recruiter @relation(fields: [recruiterId], references: [id], onDelete: Cascade)
  student      Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  recording    Recording?
}

model Recording {
  id          String   @id @default(uuid())
  interviewId String   @unique
  videoUrl    String
  durationStr String
  rating      Float    @default(0.0)
  verdict     String   @default("PENDING") // SELECTED, REJECTED, PENDING
  notes       String?  @db.Text
  createdAt   DateTime @default(now())
  
  interview   Interview @relation(fields: [interviewId], references: [id], onDelete: Cascade)
}

// ==========================================
// 5. WEBINARS / PRE-PLACEMENT TALKS (PPT)
// ==========================================

model Webinar {
  id                  String   @id @default(uuid())
  companyId           String
  title               String
  agenda              String   @db.Text
  scheduledAt         DateTime
  durationMins        Int
  meetingLink         String
  status              String   @default("UPCOMING")
  
  company             Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  // Which universities this PPT is open to
  targetUniversities  WebinarTargetUniversity[]
}

model WebinarTargetUniversity {
  webinarId    String
  universityId String

  webinar      Webinar    @relation(fields: [webinarId], references: [id], onDelete: Cascade)
  university   University @relation(fields: [universityId], references: [id], onDelete: Cascade)

  @@id([webinarId, universityId])
}
```

## Summary of How This DB Supports Your Frontend structure
1. **Student Dashboard**: Query `Student` including `projects`. `JobApplication` logs their statuses natively.
2. **University Dashboard**: Query `University` with included nested `students` and `.count()` query on `students` for placement statistics.
3. **Company & Recruiter Dashboard**: Recruiter logs in, system fetches `Recruiter` -> `Interview`s and `Recording`s. The dashboards use `Contest` relations.
4. **Recordings Page**: We can easily query `Recording` by joining `Interview -> Recruiter -> Company` and filtering by the role querying it.
5. **Webinars**: The `Webinar` model is easily joined with `WebinarTargetUniversity` allowing you to render the respective sidebar links and PPTs natively.
