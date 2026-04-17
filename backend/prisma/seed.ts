import { Role } from '../src/generated/prisma/client.js';
import { prisma } from '../src/lib/prisma.js';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

// =============================================================
// India-focused seed data: universities, companies, recruiters,
// students, contests, problems, applications, interviews,
// recordings, webinars, and mail. All credentials use the same
// password ("password123") so any seeded account can be logged in.
// =============================================================

const PASSWORD = 'password123';

const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function randomCnid(prefix: 'STU' | 'UNI' | 'COM' | 'REC'): string {
    let s = '';
    for (let i = 0; i < 6; i++) s += RANDOM_CHARS.charAt(Math.floor(Math.random() * RANDOM_CHARS.length));
    return `CN-${prefix}-${s}`;
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)] as T;
}

function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysFromNow(days: number, hour = 10, minute = 0): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d;
}

// ─────────────────────────── UNIVERSITIES ───────────────────────────
const UNIVERSITY_DEFS = [
    { name: 'IIT Delhi',           location: 'New Delhi, Delhi',          tier: 1, email: 'placement@iitd.ac.in' },
    { name: 'IIT Bombay',          location: 'Mumbai, Maharashtra',       tier: 1, email: 'placement@iitb.ac.in' },
    { name: 'IIT Madras',          location: 'Chennai, Tamil Nadu',       tier: 1, email: 'placement@iitm.ac.in' },
    { name: 'IIT Kanpur',          location: 'Kanpur, Uttar Pradesh',     tier: 1, email: 'placement@iitk.ac.in' },
    { name: 'IIT Kharagpur',       location: 'Kharagpur, West Bengal',    tier: 1, email: 'placement@iitkgp.ac.in' },
    { name: 'NIT Trichy',          location: 'Tiruchirappalli, Tamil Nadu', tier: 1, email: 'placement@nitt.edu' },
    { name: 'NIT Surathkal',       location: 'Mangalore, Karnataka',      tier: 1, email: 'placement@nitk.edu.in' },
    { name: 'BITS Pilani',         location: 'Pilani, Rajasthan',         tier: 1, email: 'placement@pilani.bits-pilani.ac.in' },
    { name: 'IIIT Hyderabad',      location: 'Hyderabad, Telangana',      tier: 1, email: 'placement@iiit.ac.in' },
    { name: 'Delhi Technological University', location: 'New Delhi, Delhi', tier: 2, email: 'placement@dtu.ac.in' },
    { name: 'VIT Vellore',         location: 'Vellore, Tamil Nadu',       tier: 2, email: 'placement@vit.ac.in' },
    { name: 'Manipal Institute of Technology', location: 'Manipal, Karnataka', tier: 2, email: 'placement@manipal.edu' },
];

// ─────────────────────────── COMPANIES ───────────────────────────
const COMPANY_DEFS = [
    { name: 'Google India',        domain: 'google.com',     industry: 'Technology',          description: 'Search, Cloud, AI — Bengaluru and Hyderabad campuses.' },
    { name: 'Microsoft India',     domain: 'microsoft.com',  industry: 'Technology',          description: 'Azure, M365, GitHub — Hyderabad development center.' },
    { name: 'Amazon India',        domain: 'amazon.in',      industry: 'E-commerce / Cloud',  description: 'AWS, Marketplace, Prime Video — Bengaluru and Chennai.' },
    { name: 'Flipkart',            domain: 'flipkart.com',   industry: 'E-commerce',          description: 'India\'s largest homegrown e-commerce platform — Bengaluru.' },
    { name: 'Razorpay',            domain: 'razorpay.com',   industry: 'Fintech',             description: 'Full-stack payments and banking infrastructure — Bengaluru.' },
    { name: 'Zerodha',             domain: 'zerodha.com',    industry: 'Fintech',             description: 'India\'s largest stock broker by volume — Bengaluru.' },
    { name: 'Swiggy',              domain: 'swiggy.in',      industry: 'Food Delivery',       description: 'On-demand food delivery and quick commerce — Bengaluru.' },
    { name: 'Zomato',              domain: 'zomato.com',     industry: 'Food Delivery',       description: 'Food delivery, dining, and Blinkit quick commerce — Gurugram.' },
    { name: 'Paytm',               domain: 'paytm.com',      industry: 'Fintech',             description: 'Payments, lending, and financial services — Noida.' },
    { name: 'TCS',                 domain: 'tcs.com',        industry: 'IT Services',         description: 'India\'s largest IT services firm — Mumbai HQ.' },
];

// ─────────────────────────── PEOPLE ───────────────────────────
const FIRST_NAMES_M = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Krishna', 'Ishaan', 'Rohan', 'Kabir', 'Aryan', 'Shaurya', 'Atharv', 'Dhruv', 'Yash', 'Karan', 'Rahul', 'Vikram', 'Aniket', 'Siddharth', 'Pranav', 'Nikhil', 'Harshit', 'Manish', 'Tanmay'];
const FIRST_NAMES_F = ['Saanvi', 'Aanya', 'Aadhya', 'Pari', 'Diya', 'Anika', 'Ananya', 'Priya', 'Sneha', 'Kavya', 'Meera', 'Ishita', 'Riya', 'Nisha', 'Pooja', 'Shreya', 'Tanvi', 'Neha', 'Divya', 'Bhumi', 'Aishwarya', 'Lakshmi', 'Radhika', 'Swati', 'Nandini'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Gupta', 'Reddy', 'Iyer', 'Nair', 'Singh', 'Kumar', 'Das', 'Joshi', 'Bose', 'Chatterjee', 'Mukherjee', 'Pillai', 'Menon', 'Rao', 'Mehta', 'Shah', 'Agarwal', 'Bhatia', 'Kapoor', 'Malhotra', 'Chowdhury', 'Saxena'];

const RECRUITER_FIRST = ['Priyanka', 'Ramesh', 'Anjali', 'Suresh', 'Deepak', 'Neha', 'Vikas', 'Pooja', 'Sandeep', 'Kavita', 'Manoj', 'Shilpa'];

const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering'];
const SPECIALIZATIONS = ['Full-Stack Development', 'Distributed Systems', 'Machine Learning', 'Cloud Infrastructure', 'Backend Engineering', 'Frontend Engineering', 'DevOps & SRE', 'Mobile Development', 'Data Engineering', 'Systems Programming'];

// ─────────────────────────── PROBLEMS ───────────────────────────
const PROBLEM_DEFS = [
    { title: 'Two Sum',              difficulty: 'EASY',   topic: 'Arrays',                points: 100, description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', constraints: '2 <= nums.length <= 10^4', tests: [{ input: '[2,7,11,15]\n9', output: '[0,1]' }, { input: '[3,2,4]\n6', output: '[1,2]' }] },
    { title: 'Valid Parentheses',    difficulty: 'EASY',   topic: 'Strings',               points: 100, description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.', constraints: '1 <= s.length <= 10^4', tests: [{ input: '"()"', output: 'true' }, { input: '"(]"', output: 'false' }] },
    { title: 'Reverse Linked List',  difficulty: 'EASY',   topic: 'Linked Lists',          points: 120, description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.', constraints: '0 <= Number of nodes <= 5000', tests: [{ input: '[1,2,3,4,5]', output: '[5,4,3,2,1]' }] },
    { title: 'Maximum Subarray',     difficulty: 'MEDIUM', topic: 'Dynamic Programming',   points: 200, description: 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.', constraints: '1 <= nums.length <= 10^5', tests: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6' }] },
    { title: 'Longest Substring Without Repeating Characters', difficulty: 'MEDIUM', topic: 'Strings', points: 220, description: 'Given a string s, find the length of the longest substring without repeating characters.', constraints: '0 <= s.length <= 5 * 10^4', tests: [{ input: '"abcabcbb"', output: '3' }, { input: '"bbbbb"', output: '1' }] },
    { title: 'Course Schedule',      difficulty: 'MEDIUM', topic: 'Graphs',                points: 250, description: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. Determine if you can finish all courses given the prerequisites.', constraints: '1 <= numCourses <= 2000', tests: [{ input: '2\n[[1,0]]', output: 'true' }, { input: '2\n[[1,0],[0,1]]', output: 'false' }] },
    { title: 'LRU Cache',            difficulty: 'MEDIUM', topic: 'Design',                points: 280, description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.', constraints: '1 <= capacity <= 3000', tests: [{ input: '["LRUCache","put","put","get","put","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2]]', output: '[null,null,null,1,null,-1]' }] },
    { title: 'Median of Two Sorted Arrays', difficulty: 'HARD', topic: 'Binary Search',    points: 400, description: 'Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays. Overall run time complexity should be O(log (m+n)).', constraints: '0 <= m, n <= 1000', tests: [{ input: '[1,3]\n[2]', output: '2.0' }, { input: '[1,2]\n[3,4]', output: '2.5' }] },
    { title: 'Word Ladder',          difficulty: 'HARD',   topic: 'Graphs',                points: 380, description: 'Given two words beginWord and endWord, and a dictionary wordList, return the length of the shortest transformation sequence.', constraints: '1 <= beginWord.length <= 10', tests: [{ input: '"hit"\n"cog"\n["hot","dot","dog","lot","log","cog"]', output: '5' }] },
    { title: 'Trapping Rain Water',  difficulty: 'HARD',   topic: 'Two Pointers',          points: 360, description: 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.', constraints: 'n == height.length', tests: [{ input: '[0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }] },
];

// ─────────────────────────── HELPERS ───────────────────────────
function slug(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function clearAll() {
    console.log('Clearing existing data...');
    await prisma.mailPermissionViolation.deleteMany();
    await prisma.mail.deleteMany();
    await prisma.webinarTargetUniversity.deleteMany();
    await prisma.webinar.deleteMany();
    await prisma.interviewRecording.deleteMany();
    await prisma.recording.deleteMany();
    await prisma.interview.deleteMany();
    await prisma.jobApplication.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.testCase.deleteMany();
    await prisma.problem.deleteMany();
    await prisma.contest.deleteMany();
    await prisma.project.deleteMany();
    await prisma.companyUniversity.deleteMany();
    await prisma.caRunResult.deleteMany();
    await prisma.caSubmissionSummary.deleteMany();
    await prisma.caSubmission.deleteMany();
    await prisma.caTestCase.deleteMany();
    await prisma.caProblem.deleteMany();
    await prisma.student.deleteMany();
    await prisma.recruiter.deleteMany();
    await prisma.company.deleteMany();
    await prisma.university.deleteMany();
    await prisma.user.deleteMany();
}

async function main() {
    console.log('Seeding CodeNexus with India-based data...');
    await clearAll();

    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    // ───── Universities ─────
    console.log('Creating universities...');
    const universities = [];
    for (const u of UNIVERSITY_DEFS) {
        const created = await prisma.user.create({
            data: {
                email: u.email,
                password: passwordHash,
                role: Role.UNIVERSITY,
                cnid: randomCnid('UNI'),
                universityProfile: { create: { name: u.name, location: u.location, tier: u.tier, status: 'ACTIVE' } },
            },
            include: { universityProfile: true },
        });
        universities.push({ user: created, profile: created.universityProfile! });
    }

    // ───── Companies + Recruiters ─────
    console.log('Creating companies and recruiters...');
    const companies = [];
    for (const c of COMPANY_DEFS) {
        const adminUser = await prisma.user.create({
            data: {
                email: `admin@${c.domain}`,
                password: passwordHash,
                role: Role.COMPANY_ADMIN,
                cnid: randomCnid('COM'),
                companyProfile: { create: { name: c.name, description: c.description, industry: c.industry } },
            },
            include: { companyProfile: true },
        });

        // 3 recruiters per company
        const recruiters = [];
        for (let i = 0; i < 3; i++) {
            const fn = pick(RECRUITER_FIRST);
            const ln = pick(LAST_NAMES);
            const r = await prisma.user.create({
                data: {
                    email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@${c.domain}`,
                    password: passwordHash,
                    role: Role.RECRUITER,
                    cnid: randomCnid('REC'),
                    recruiterProfile: { create: { companyId: adminUser.companyProfile!.id, name: `${fn} ${ln}` } },
                },
                include: { recruiterProfile: true },
            });
            recruiters.push({ user: r, profile: r.recruiterProfile! });
        }

        companies.push({ user: adminUser, profile: adminUser.companyProfile!, recruiters });
    }

    // ───── Company-University partnerships (all companies × all universities) ─────
    console.log('Creating company-university partnerships...');
    for (const c of companies) {
        for (const u of universities) {
            await prisma.companyUniversity.create({ data: { companyId: c.profile.id, universityId: u.profile.id } });
        }
    }

    // ───── Students (10 per university = 120 students) ─────
    console.log('Creating students...');
    const students: { user: any; profile: any; uniName: string }[] = [];
    let studentSerial = 1;
    for (const u of universities) {
        for (let i = 0; i < 10; i++) {
            const isFemale = Math.random() > 0.55;
            const fn = isFemale ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M);
            const ln = pick(LAST_NAMES);
            const branch = pick(BRANCHES);
            const cgpa = parseFloat((6.5 + Math.random() * 3.5).toFixed(2));
            const codeArenaScore = randomBetween(50, 2400);
            const status = Math.random() > 0.5 ? 'AVAILABLE' : 'AVAILABLE';
            const placedSoFar = students.filter(s => s.uniName === u.profile.name && s.profile.status === 'PLACED').length;
            const finalStatus = placedSoFar < 4 && Math.random() > 0.6 ? 'PLACED' : status;

            const uniSlug = slug(u.profile.name).slice(0, 12);
            const created = await prisma.user.create({
                data: {
                    email: `${fn.toLowerCase()}.${ln.toLowerCase()}${studentSerial}@${uniSlug}.edu.in`,
                    password: passwordHash,
                    role: Role.STUDENT,
                    cnid: randomCnid('STU'),
                    studentProfile: {
                        create: {
                            universityId: u.profile.id,
                            name: `${fn} ${ln}`,
                            age: randomBetween(19, 23),
                            phone: `+91${randomBetween(7000000000, 9999999999)}`,
                            branch,
                            cgpa,
                            specialization: pick(SPECIALIZATIONS),
                            gender: isFemale ? 'FEMALE' : 'MALE',
                            registrationNumber: `${u.profile.name.split(' ')[0]?.toUpperCase().slice(0,3)}${2022000 + studentSerial}`,
                            address: u.profile.location,
                            xPercentage: (78 + Math.random() * 18).toFixed(2),
                            xiiPercentage: (75 + Math.random() * 22).toFixed(2),
                            xSchool: 'Delhi Public School',
                            xiiSchool: 'Kendriya Vidyalaya',
                            status: finalStatus,
                            codeArenaScore,
                        },
                    },
                },
                include: { studentProfile: true },
            });
            students.push({ user: created, profile: created.studentProfile!, uniName: u.profile.name });
            studentSerial++;
        }
    }

    // ───── Projects (1-3 per student for first 60 students) ─────
    console.log('Creating projects...');
    const PROJECT_TEMPLATES = [
        { title: 'Real-time Chat Platform', description: 'Multi-room chat application with typing indicators, read receipts, and presence detection.', techStack: 'React, Node.js, Socket.io, PostgreSQL', github: 'chat-platform' },
        { title: 'E-commerce Microservices', description: 'Microservices-based marketplace with payment gateway integration via Razorpay.', techStack: 'Go, gRPC, PostgreSQL, Redis, Kafka', github: 'shopkart' },
        { title: 'ML-based Resume Screener', description: 'NLP pipeline that ranks resumes against a job description using transformer embeddings.', techStack: 'Python, FastAPI, HuggingFace, Postgres', github: 'resume-rank' },
        { title: 'Distributed URL Shortener', description: 'Sharded URL shortener handling 10K req/s using consistent hashing.', techStack: 'Java, Spring Boot, Redis, MySQL', github: 'cutly' },
        { title: 'College Bus Tracking App', description: 'Realtime GPS tracking for the campus bus service with ETA prediction.', techStack: 'Flutter, Firebase, Google Maps API', github: 'bustrack' },
        { title: 'Code Plagiarism Detector', description: 'Detects copy-paste in student submissions using AST-level similarity.', techStack: 'Python, Tree-sitter, FastAPI', github: 'plagcheck' },
    ];
    for (const s of students.slice(0, 60)) {
        const numProjects = randomBetween(1, 3);
        for (let i = 0; i < numProjects; i++) {
            const t = pick(PROJECT_TEMPLATES);
            await prisma.project.create({
                data: {
                    studentId: s.profile.id,
                    title: t.title,
                    description: t.description,
                    techStack: t.techStack,
                    githubLink: `https://github.com/${s.profile.name.split(' ')[0]?.toLowerCase()}/${t.github}`,
                },
            });
        }
    }

    // ───── Contests + Problems + TestCases ─────
    console.log('Creating contests, problems, and test cases...');
    const allProblemIds: string[] = [];
    for (let i = 0; i < companies.length; i++) {
        const c = companies[i]!;
        const numContests = randomBetween(1, 2);
        for (let n = 0; n < numContests; n++) {
            const dayOffset = randomBetween(-15, 30);
            const status = dayOffset < -1 ? 'COMPLETED' : dayOffset === 0 ? 'ACTIVE' : 'UPCOMING';
            const contest = await prisma.contest.create({
                data: {
                    companyId: c.profile.id,
                    title: `${c.profile.name} ${n === 0 ? 'Hiring Challenge' : 'Engineering Sprint'} ${new Date().getFullYear()}`,
                    description: `Competitive coding challenge by ${c.profile.name}. Top performers get fast-tracked to interviews.`,
                    date: daysFromNow(dayOffset, 14, 0),
                    durationMins: 120,
                    timeLimitMinutes: 30,
                    languages: ['C++', 'Java', 'Python', 'JavaScript'],
                    status,
                },
            });
            const numProblems = randomBetween(3, 5);
            const used = new Set<number>();
            for (let p = 0; p < numProblems; p++) {
                let idx = randomBetween(0, PROBLEM_DEFS.length - 1);
                while (used.has(idx)) idx = randomBetween(0, PROBLEM_DEFS.length - 1);
                used.add(idx);
                const def = PROBLEM_DEFS[idx]!;
                const prob = await prisma.problem.create({
                    data: {
                        contestId: contest.id,
                        title: def.title,
                        description: def.description,
                        difficulty: def.difficulty,
                        topic: def.topic,
                        points: def.points,
                        constraints: def.constraints,
                    },
                });
                allProblemIds.push(prob.id);
                for (let t = 0; t < def.tests.length; t++) {
                    const test = def.tests[t]!;
                    await prisma.testCase.create({
                        data: { problemId: prob.id, input: test.input, output: test.output, isHidden: t > 0 },
                    });
                }
            }
        }
    }

    // ───── Standalone Code Arena Problems (no contest) ─────
    console.log('Creating standalone Code Arena problems...');
    for (const def of PROBLEM_DEFS) {
        const standalone = await prisma.problem.create({
            data: {
                title: def.title,
                description: def.description,
                difficulty: def.difficulty,
                topic: def.topic,
                points: def.points,
                constraints: def.constraints,
            },
        });
        allProblemIds.push(standalone.id);
        for (let t = 0; t < def.tests.length; t++) {
            const test = def.tests[t]!;
            await prisma.testCase.create({
                data: { problemId: standalone.id, input: test.input, output: test.output, isHidden: t > 0 },
            });
        }
    }

    // ───── Submissions (random students attempting random problems) ─────
    console.log('Creating submissions...');
    const STATUSES = ['AC', 'AC', 'AC', 'WA', 'TLE', 'CE'];
    const LANGS = ['C++', 'Java', 'Python', 'JavaScript'];
    for (const s of students) {
        const attempts = randomBetween(0, 8);
        for (let i = 0; i < attempts; i++) {
            const probId = pick(allProblemIds);
            const status = pick(STATUSES);
            const total = randomBetween(2, 10);
            const passed = status === 'AC' ? total : randomBetween(0, total - 1);
            await prisma.submission.create({
                data: {
                    studentId: s.profile.id,
                    problemId: probId,
                    code: '// solution placeholder',
                    language: pick(LANGS),
                    passed,
                    total,
                    status,
                },
            });
        }
    }

    // ───── Job Applications ─────
    console.log('Creating job applications...');
    const APP_STATUSES = ['APPLIED', 'APPLIED', 'SHORTLISTED', 'INTERVIEWED', 'SELECTED', 'REJECTED'];
    for (const s of students) {
        const numApps = randomBetween(1, 4);
        const used = new Set<string>();
        for (let i = 0; i < numApps; i++) {
            const c = pick(companies);
            if (used.has(c.profile.id)) continue;
            used.add(c.profile.id);
            await prisma.jobApplication.create({
                data: {
                    studentId: s.profile.id,
                    companyId: c.profile.id,
                    status: pick(APP_STATUSES),
                },
            });
        }
    }

    // ───── Interviews + Recordings ─────
    console.log('Creating interviews and recordings...');
    const ROLES = ['SDE I', 'SDE II', 'Frontend Engineer', 'Backend Engineer', 'ML Engineer', 'Systems Engineer', 'Full Stack Engineer'];
    const INTERVIEW_TYPES = ['TECHNICAL', 'TECHNICAL', 'TECHNICAL', 'HR', 'SYSTEM_DESIGN'];
    for (const c of companies) {
        const numInterviews = randomBetween(4, 8);
        for (let i = 0; i < numInterviews; i++) {
            const recruiter = pick(c.recruiters);
            const student = pick(students);
            const dayOffset = randomBetween(-20, 14);
            const hour = randomBetween(10, 18);
            const isPast = dayOffset < 0;
            const status = isPast ? (Math.random() > 0.2 ? 'COMPLETED' : 'CANCELLED') : 'SCHEDULED';

            const interview = await prisma.interview.create({
                data: {
                    recruiterId: recruiter.profile.id,
                    studentId: student.profile.id,
                    role: pick(ROLES),
                    scheduledAt: daysFromNow(dayOffset, hour),
                    type: pick(INTERVIEW_TYPES),
                    status,
                },
            });

            if (status === 'COMPLETED') {
                const verdict = pick(['SELECTED', 'SELECTED', 'REJECTED', 'PENDING']);
                await prisma.recording.create({
                    data: {
                        interviewId: interview.id,
                        videoUrl: `https://recordings.codenexus.in/${interview.id}.mp4`,
                        durationStr: `${randomBetween(30, 60)} mins`,
                        rating: parseFloat((2.5 + Math.random() * 2.5).toFixed(1)),
                        verdict,
                        notes: verdict === 'SELECTED'
                            ? 'Strong problem-solving. Communicated thought process clearly. Identified edge cases up front.'
                            : verdict === 'REJECTED'
                            ? 'Struggled with the optimal approach. Could not finish coding within the time limit.'
                            : 'Reasonable performance — needs follow-up round to confirm fit.',
                    },
                });
            }
        }
    }

    // ───── Webinars ─────
    console.log('Creating webinars...');
    const WEBINAR_TOPICS = [
        { title: 'Life at {company}',                     agenda: 'Hear from current engineers about the work culture, growth paths, and day-to-day at {company}.' },
        { title: '{company} Pre-Placement Talk',          agenda: 'Roles, compensation bands, and the hiring process for the upcoming on-campus drive.' },
        { title: 'Building Scalable Systems at {company}', agenda: 'Engineering deep-dive into the architecture powering {company}\'s flagship product.' },
    ];
    for (const c of companies) {
        const numWebinars = randomBetween(1, 2);
        for (let i = 0; i < numWebinars; i++) {
            const topic = pick(WEBINAR_TOPICS);
            const dayOffset = randomBetween(-10, 21);
            const status = dayOffset < 0 ? 'COMPLETED' : 'UPCOMING';
            const webinar = await prisma.webinar.create({
                data: {
                    companyId: c.profile.id,
                    title: topic.title.replace('{company}', c.profile.name),
                    agenda: topic.agenda.replace('{company}', c.profile.name),
                    scheduledAt: daysFromNow(dayOffset, 16),
                    durationMins: 60,
                    meetingLink: `https://meet.codenexus.in/${randomUUID().slice(0, 8)}`,
                    status,
                },
            });
            // target 4-7 universities
            const shuffled = [...universities].sort(() => Math.random() - 0.5);
            const targetCount = randomBetween(4, 7);
            for (let u = 0; u < Math.min(targetCount, shuffled.length); u++) {
                await prisma.webinarTargetUniversity.create({
                    data: { webinarId: webinar.id, universityId: shuffled[u]!.profile.id },
                });
            }
        }
    }

    // ───── Mails (a handful of sample threads) ─────
    console.log('Creating sample mails...');
    for (let i = 0; i < 30; i++) {
        const sender = pick(universities).user;
        const recipient = pick(students).user;
        const threadId = randomUUID();
        await prisma.mail.create({
            data: {
                sender_cnid: sender.cnid!,
                recipient_cnid: recipient.cnid!,
                subject: 'Upcoming Placement Drive Notification',
                body: 'Dear student, please confirm your participation in the upcoming placement drive. Login to the portal to check the schedule.',
                thread_id: threadId,
                is_read: Math.random() > 0.4,
            },
        });
    }
    for (let i = 0; i < 20; i++) {
        const sender = pick(companies.flatMap(c => c.recruiters)).user;
        const recipient = pick(students).user;
        const threadId = randomUUID();
        await prisma.mail.create({
            data: {
                sender_cnid: sender.cnid!,
                recipient_cnid: recipient.cnid!,
                subject: 'Interview Scheduled',
                body: 'Your interview has been scheduled. Please join the meeting on time and have your laptop charged.',
                thread_id: threadId,
                is_read: Math.random() > 0.5,
            },
        });
    }

    // ───── Demo accounts (predictable login) ─────
    console.log('Creating demo accounts (predictable login)...');
    // demo student
    const demoStudent = await prisma.user.create({
        data: {
            email: 'student@demo.in',
            password: passwordHash,
            role: Role.STUDENT,
            cnid: randomCnid('STU'),
            studentProfile: {
                create: {
                    universityId: universities[0]!.profile.id,
                    name: 'Demo Student',
                    age: 21,
                    phone: '+919999999999',
                    branch: 'Computer Science',
                    cgpa: 9.1,
                    specialization: 'Full-Stack Development',
                    gender: 'MALE',
                    registrationNumber: 'DEMO2026001',
                    status: 'AVAILABLE',
                    codeArenaScore: 1845,
                },
            },
        },
    });
    // demo company
    await prisma.user.create({
        data: {
            email: 'company@demo.in',
            password: passwordHash,
            role: Role.COMPANY_ADMIN,
            cnid: randomCnid('COM'),
            companyProfile: { create: { name: 'Demo Tech Pvt. Ltd.', description: 'Demo company for testing.', industry: 'Technology' } },
        },
    });
    // demo university
    await prisma.user.create({
        data: {
            email: 'university@demo.in',
            password: passwordHash,
            role: Role.UNIVERSITY,
            cnid: randomCnid('UNI'),
            universityProfile: { create: { name: 'Demo Institute of Technology', location: 'Bengaluru, Karnataka', tier: 1, status: 'ACTIVE' } },
        },
    });
    // demo recruiter (attached to first company)
    await prisma.user.create({
        data: {
            email: 'recruiter@demo.in',
            password: passwordHash,
            role: Role.RECRUITER,
            cnid: randomCnid('REC'),
            recruiterProfile: { create: { companyId: companies[0]!.profile.id, name: 'Demo Recruiter' } },
        },
    });
    // touch demoStudent so the linter doesn't complain about unused
    void demoStudent;

    console.log('\nSeeding completed successfully.');
    console.log(`  Universities : ${universities.length}`);
    console.log(`  Companies    : ${companies.length}`);
    console.log(`  Recruiters   : ${companies.length * 3}`);
    console.log(`  Students     : ${students.length}`);
    console.log(`  Problems     : ${allProblemIds.length}`);
    console.log('\nDemo accounts (password = "password123"):');
    console.log('  student@demo.in     | STUDENT');
    console.log('  recruiter@demo.in   | RECRUITER');
    console.log('  company@demo.in     | COMPANY_ADMIN');
    console.log('  university@demo.in  | UNIVERSITY');
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
