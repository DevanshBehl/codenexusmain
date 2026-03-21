<div align="center">

# 🌌 &lt;cn/&gt; CodeNexus

### THE ALL-IN-ONE PLATFORM FOR PLACEMENT PREP & TECHNICAL HIRING

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-050505?style=for-the-badge&logo=typescript&logoColor=blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-050505?style=for-the-badge&logo=tailwind-css&logoColor=cyan" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-050505?style=for-the-badge&logo=vite&logoColor=yellow" alt="Vite" />
  <img src="https://img.shields.io/badge/Framer_Motion-black?logo=framer&logoColor=blue&style=for-the-badge" alt="Framer Motion" />
</p>

</div>

---

## 🚀 Overview

**CodeNexus** is the ultimate technical interviewing and placement preparation platform. Designed with a sleek, dark-themed, and premium UI, it bridges the gap between students preparing for top-tier companies, university placement cells organizing drives, and recruiters conducting comprehensive technical assessments. 

It replaces disjointed screen-sharing and independent coding environments with a unified, high-performance ecosystem equipped with interactive dashboards, a robust coding arena, and a seamless video interview IDE.

---

## ✨ Comprehensive Features

### 🎓 Student Dashboard & CodeArena
- **Personalized Analytics:** Track coding progress, interview readiness, and placement drive statuses.
- **CodeArena:** A dedicated competitive programming space to solve algorithms, practice system design, and master data structures with instant execution and test-case feedback.
- **Gamified Elements:** Engage with interactive casino-style gamification (Mines, Dice, Crash) built to reward consistent practice and milestones with a sleek UI.

### 🏢 University Placement Cell
- **Drive Management:** Create, schedule, and oversee campus placement drives.
- **Student Analytics:** View comprehensive reports on student performance, problem-solving skills, and interview readiness metrics.
- **Contest Hosting:** Organize institutional coding contests and mock assessments with custom test cases.

### 💼 Company Recruiter Portal
- **Candidate Pipelines:** Manage recruitment workflows from sourcing to the final tech round.
- **Technical Assessments:** Design roles, test algorithms, and evaluate submissions quantitatively. 
- **Automated Scorecards:** Leverage system-generated metrics to make confident hiring decisions.

### 💻 Live Interview IDE Workspace
- **Three-Column Layout:** A meticulously designed interface featuring:
  - **Left Pane:** Comprehensive problem description and dynamic multi-case testing.
  - **Center Pane:** A multi-language Code Editor with intelligent syntax highlighting, compilation, and execution tools.
  - **Right Pane:** Integrated WebRTC high-definition video conferencing and text chat—no third-party apps needed.

---

## 🎨 Design Theme & UI Specifications

CodeNexus is crafted with an immersive and developer-centric design language:

- **Deep Space Backgrounds:** Grounded in a `bg-[#050505]` to `bg-black` gradient for high contrast and minimal eye strain during late-night coding.
- **Neon Cyan Highlights:** Signature `Cyan` accents (`oklch(0.777 0.152 181.912)`) highlight active states, primary buttons, and critical interactive components.
- **Immersive Micro-interactions:** Powered by **Framer Motion**, the UI responds instantly with subtle hover effects, active "Thunder" visualizations, and elegant workflow diagrams.
- **Glassmorphism:** Elegant use of backdrop blurs on dropdowns, modals, and sticky navbars to maintain context without clutter.
- **Typography:** Custom mono-spaced fonts (`JetBrains Mono`, `Space Grotesk`) mimicking professional development IDEs.

---

## 🛠️ Tech Stack

We utilize a modern, high-performance web technology stack geared for reactivity and scalability:

- **Frontend Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4 (with custom `--color-accent` design tokens)
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Build Tool / Bundler:** Vite

---

## ⚙️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DevanshBehl/codenexusfrontend.git
   cd codenexusfrontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📂 Project Architecture

```
codenexusfrontend/
├── src/
│   ├── components/
│   │   ├── Interview/       # Interview IDE components
│   │   └── Landing/         # Dynamic landing page graphics
│   ├── pages/
│   │   ├── student/         # CodeArena & prep dashboards
│   │   ├── university/      # Campus placement operations
│   │   ├── company/         # Recruiter workflows
│   │   ├── Interview.tsx    # Live 3-column WebRTC IDE environment
│   │   └── Login | Signup   # Authentication workflows
│   ├── App.tsx              # Application routing root
│   ├── index.css            # Tailwind configuration and CSS variables
│   └── main.tsx             # React DOM entry point
├── package.json
└── vite.config.ts
```

---

<div align="center">
  <p><strong>YOU SHOWCASE THE SKILLS. WE PROVIDE THE PLATFORM.</strong></p>
  <p><i>© 2026 CodeNexus - All Rights Reserved</i></p>
</div>
