import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱  Seeding database...\n");

    // ── 0. Clean existing data ──
    console.log("🗑️   Cleaning existing data...");
    await prisma.mail.deleteMany();
    await prisma.mailPermissionViolation.deleteMany();
    await prisma.webinarTargetUniversity.deleteMany();
    await prisma.webinar.deleteMany();
    await prisma.recording.deleteMany();
    await prisma.interview.deleteMany();
    await prisma.jobApplication.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.testCase.deleteMany();
    await prisma.problem.deleteMany();
    await prisma.contest.deleteMany();
    await prisma.project.deleteMany();
    await prisma.companyUniversity.deleteMany();
    await prisma.recruiter.deleteMany();
    await prisma.student.deleteMany();
    await prisma.company.deleteMany();
    await prisma.university.deleteMany();
    await prisma.user.deleteMany();
    console.log("   ✅ Done\n");

    const PASSWORD = await bcrypt.hash("password123", 10);

    // ══════════════════════════════════════════════
    // 1. UNIVERSITY — VIT
    // ══════════════════════════════════════════════
    console.log("🏛️   Creating university...");
    const uniUser = await prisma.user.create({
        data: {
            email: "admin@vit.ac.in",
            password: PASSWORD,
            role: "UNIVERSITY",
            cnid: "CN-UNI-VITUNI",
        },
    });
    const vit = await prisma.university.create({
        data: {
            userId: uniUser.id,
            name: "VIT University",
            location: "Vellore, Tamil Nadu",
            tier: 1,
            status: "ACTIVE",
        },
    });
    console.log(`   ✅ VIT University (${vit.id})\n`);

    // ══════════════════════════════════════════════
    // 2. COMPANIES (2)
    // ══════════════════════════════════════════════
    console.log("🏢  Creating companies...");
    const companyData = [
        {
            email: "hr@google.com",
            name: "Google",
            description: "A multinational technology company specializing in search, cloud and AI.",
            industry: "Technology",
        },
        {
            email: "hr@microsoft.com",
            name: "Microsoft",
            description: "A multinational technology corporation producing software, hardware and cloud services.",
            industry: "Technology",
        },
    ];

    const companies: Awaited<ReturnType<typeof prisma.company.create>>[] = [];
    const companyCnids = ["CN-COM-GOOG01", "CN-COM-MSFTA1"];
    for (let i = 0; i < companyData.length; i++) {
        const c = companyData[i];
        const user = await prisma.user.create({
            data: { email: c.email, password: PASSWORD, role: "COMPANY_ADMIN", cnid: companyCnids[i] },
        });
        const company = await prisma.company.create({
            data: {
                userId: user.id,
                name: c.name,
                description: c.description,
                industry: c.industry,
            },
        });
        companies.push(company);
        console.log(`   ✅ ${c.name} (${company.id})`);
    }
    console.log();

    // ── Partner VIT with both companies ──
    for (const company of companies) {
        await prisma.companyUniversity.create({
            data: { companyId: company.id, universityId: vit.id },
        });
    }

    // ══════════════════════════════════════════════
    // 3. STUDENTS (4)
    // ══════════════════════════════════════════════
    console.log("👩‍🎓 Creating students...");
    const studentData = [
        {
            email: "devansh@vit.ac.in",
            name: "Devansh Behl",
            age: 20,
            phone: "+91 98765 43210",
            branch: "Computer Science",
            cgpa: 9.2,
            gender: "Male",
            registrationNumber: "21BCE0001",
            codeNexusId: "CNX-DEV-01",
            parentsName: "Mr. Behl",
            parentContactNo: "+91 98765 43211",
            parentEmail: "parent.behl@gmail.com",
            address: "Delhi, India",
            xSchool: "DPS Mathura Road",
            xPercentage: "95%",
            xiiSchool: "DPS Mathura Road",
            xiiPercentage: "96%",
            otherInfo: "Competitive programmer, Hackathon winner (SIH 2025), Full-stack developer",
            specialization: "AI/ML",
            codeArenaScore: 1840,
        },
        {
            email: "priya.sharma@vit.ac.in",
            name: "Priya Sharma",
            age: 21,
            phone: "+91 91234 56789",
            branch: "Computer Science",
            cgpa: 9.5,
            gender: "Female",
            registrationNumber: "21BCE0042",
            codeNexusId: "CNX-PRI-02",
            parentsName: "Mr. Rajesh Sharma",
            parentContactNo: "+91 91234 56780",
            parentEmail: "rsharma@gmail.com",
            address: "Jaipur, Rajasthan",
            xSchool: "Kendriya Vidyalaya Jaipur",
            xPercentage: "97%",
            xiiSchool: "Kendriya Vidyalaya Jaipur",
            xiiPercentage: "95%",
            otherInfo: "Google Summer of Code 2025, Open-source contributor, ACM ICPC Regionalist",
            specialization: "Systems",
            codeArenaScore: 2150,
        },
        {
            email: "arjun.mehta@vit.ac.in",
            name: "Arjun Mehta",
            age: 20,
            phone: "+91 87654 32109",
            branch: "Electronics & Communication",
            cgpa: 8.4,
            gender: "Male",
            registrationNumber: "21BEC0115",
            codeNexusId: "CNX-ARJ-03",
            parentsName: "Mrs. Sunita Mehta",
            parentContactNo: "+91 87654 32100",
            parentEmail: "sunita.mehta@yahoo.com",
            address: "Pune, Maharashtra",
            xSchool: "Bishop Cotton Boys' School",
            xPercentage: "89%",
            xiiSchool: "Bishop Cotton Boys' School",
            xiiPercentage: "87%",
            otherInfo: "IoT enthusiast, Built a smart campus monitoring system",
            specialization: "Embedded Systems",
            codeArenaScore: 1210,
        },
        {
            email: "sneha.reddy@vit.ac.in",
            name: "Sneha Reddy",
            age: 21,
            phone: "+91 76543 21098",
            branch: "Information Technology",
            cgpa: 8.9,
            gender: "Female",
            registrationNumber: "21BIT0203",
            codeNexusId: "CNX-SNE-04",
            parentsName: "Mr. Venkat Reddy",
            parentContactNo: "+91 76543 21000",
            parentEmail: "venkat.reddy@gmail.com",
            address: "Hyderabad, Telangana",
            xSchool: "Narayana School Hyderabad",
            xPercentage: "93%",
            xiiSchool: "Narayana Junior College",
            xiiPercentage: "91%",
            otherInfo: "Frontend specialist, UI/UX designer, Won national-level design hackathon",
            specialization: "Web Development",
            codeArenaScore: 1560,
        },
    ];

    const students: Awaited<ReturnType<typeof prisma.student.create>>[] = [];
    const studentCnids = ["CN-STU-DEVAN1", "CN-STU-PRIYA2", "CN-STU-ARJUN3", "CN-STU-SNEHA4"];
    for (let i = 0; i < studentData.length; i++) {
        const s = studentData[i];
        const user = await prisma.user.create({
            data: { email: s.email, password: PASSWORD, role: "STUDENT", cnid: studentCnids[i] },
        });
        const student = await prisma.student.create({
            data: {
                userId: user.id,
                universityId: vit.id,
                name: s.name,
                age: s.age,
                phone: s.phone,
                branch: s.branch,
                cgpa: s.cgpa,
                gender: s.gender,
                registrationNumber: s.registrationNumber,
                codeNexusId: studentCnids[i],
                parentsName: s.parentsName,
                parentContactNo: s.parentContactNo,
                parentEmail: s.parentEmail,
                address: s.address,
                xSchool: s.xSchool,
                xPercentage: s.xPercentage,
                xiiSchool: s.xiiSchool,
                xiiPercentage: s.xiiPercentage,
                otherInfo: s.otherInfo,
                specialization: s.specialization,
                codeArenaScore: s.codeArenaScore,
            },
        });
        students.push(student);
        console.log(`   ✅ ${s.name} (${student.id})`);
    }
    console.log();

    // ── Student Projects ──
    console.log("📦  Creating student projects...");
    await prisma.project.createMany({
        data: [
            {
                studentId: students[0]!.id,
                title: "CodeNexus Platform",
                description:
                    "A comprehensive platform designed for universities, companies, and students to streamline coding evaluations and simplify technical recruitment with real-time feedback and an interactive workspace.",
                techStack: "React, TypeScript, TailwindCSS, Express.js, PostgreSQL, Prisma",
                githubLink: "https://github.com/devansh/codenexus",
                liveLink: "https://codenexus.vercel.app",
            },
            {
                studentId: students[0]!.id,
                title: "AI Resume Parser",
                description:
                    "An NLP-powered tool that extracts structured data from resumes using transformer models, with 97% accuracy on multi-format documents.",
                techStack: "Python, FastAPI, spaCy, React, PostgreSQL",
                githubLink: "https://github.com/devansh/resume-parser",
            },
            {
                studentId: students[1]!.id,
                title: "Open-Source Kubernetes Dashboard",
                description:
                    "A lightweight Kubernetes management dashboard providing real-time cluster monitoring, pod management, and resource allocation views.",
                techStack: "Go, React, D3.js, Docker, Kubernetes",
                githubLink: "https://github.com/priya/k8s-dash",
                liveLink: "https://k8sdash.dev",
            },
            {
                studentId: students[3]!.id,
                title: "DesignFlow — Figma Plugin",
                description:
                    "A Figma plugin that automates design-to-code conversion for React components, supporting custom design tokens and responsive layouts.",
                techStack: "TypeScript, Figma API, React, Webpack",
                githubLink: "https://github.com/sneha/designflow",
            },
        ],
    });
    console.log("   ✅ 4 projects created\n");

    // ══════════════════════════════════════════════
    // 4. CODE ARENA PROBLEMS (25)
    // ══════════════════════════════════════════════
    console.log("🧩  Creating 25 Code Arena problems (3 test cases each)...");

    const problemsData: {
        title: string;
        description: string;
        difficulty: string;
        topic: string;
        points: number;
        constraints: string;
        testCases: { input: string; output: string; isHidden: boolean }[];
    }[] = [
        // ── EASY (8) ──
        {
            title: "Two Sum",
            topic: "Arrays",
            description:
                "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
            difficulty: "EASY",
            points: 100,
            constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
            testCases: [
                { input: "[2,7,11,15]\n9", output: "[0,1]", isHidden: false },
                { input: "[3,2,4]\n6", output: "[1,2]", isHidden: false },
                { input: "[3,3]\n6", output: "[0,1]", isHidden: true },
            ],
        },
        {
            title: "Valid Parentheses",
            topic: "Strings",
            description:
                "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
            difficulty: "EASY",
            points: 100,
            constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'",
            testCases: [
                { input: "()", output: "true", isHidden: false },
                { input: "()[]{}", output: "true", isHidden: false },
                { input: "(]", output: "false", isHidden: true },
            ],
        },
        {
            title: "Merge Two Sorted Lists",
            topic: "Linked Lists",
            description:
                "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.",
            difficulty: "EASY",
            points: 100,
            constraints: "The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100",
            testCases: [
                { input: "[1,2,4]\n[1,3,4]", output: "[1,1,2,3,4,4]", isHidden: false },
                { input: "[]\n[]", output: "[]", isHidden: false },
                { input: "[]\n[0]", output: "[0]", isHidden: true },
            ],
        },
        {
            title: "Best Time to Buy and Sell Stock",
            topic: "Arrays",
            description:
                "You are given an array `prices` where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve.",
            difficulty: "EASY",
            points: 100,
            constraints: "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
            testCases: [
                { input: "[7,1,5,3,6,4]", output: "5", isHidden: false },
                { input: "[7,6,4,3,1]", output: "0", isHidden: false },
                { input: "[2,4,1]", output: "2", isHidden: true },
            ],
        },
        {
            title: "Reverse Linked List",
            topic: "Linked Lists",
            description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
            difficulty: "EASY",
            points: 100,
            constraints: "The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000",
            testCases: [
                { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", isHidden: false },
                { input: "[1,2]", output: "[2,1]", isHidden: false },
                { input: "[]", output: "[]", isHidden: true },
            ],
        },
        {
            title: "Maximum Subarray",
            topic: "Dynamic Programming",
            description:
                "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
            difficulty: "EASY",
            points: 100,
            constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
            testCases: [
                { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", isHidden: false },
                { input: "[1]", output: "1", isHidden: false },
                { input: "[5,4,-1,7,8]", output: "23", isHidden: true },
            ],
        },
        {
            title: "Contains Duplicate",
            topic: "Arrays",
            description:
                "Given an integer array `nums`, return true if any value appears at least twice in the array, and return false if every element is distinct.",
            difficulty: "EASY",
            points: 100,
            constraints: "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
            testCases: [
                { input: "[1,2,3,1]", output: "true", isHidden: false },
                { input: "[1,2,3,4]", output: "false", isHidden: false },
                { input: "[1,1,1,3,3,4,3,2,4,2]", output: "true", isHidden: true },
            ],
        },
        {
            title: "Climbing Stairs",
            topic: "Dynamic Programming",
            description:
                "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
            difficulty: "EASY",
            points: 100,
            constraints: "1 <= n <= 45",
            testCases: [
                { input: "2", output: "2", isHidden: false },
                { input: "3", output: "3", isHidden: false },
                { input: "5", output: "8", isHidden: true },
            ],
        },

        // ── MEDIUM (10) ──
        {
            title: "Longest Substring Without Repeating Characters",
            topic: "Strings",
            description:
                "Given a string `s`, find the length of the longest substring without repeating characters.",
            difficulty: "MEDIUM",
            points: 200,
            constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
            testCases: [
                { input: "abcabcbb", output: "3", isHidden: false },
                { input: "bbbbb", output: "1", isHidden: false },
                { input: "pwwkew", output: "3", isHidden: true },
            ],
        },
        {
            title: "3Sum",
            topic: "Arrays",
            description:
                "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
            difficulty: "MEDIUM",
            points: 200,
            constraints: "3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5",
            testCases: [
                { input: "[-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", isHidden: false },
                { input: "[0,1,1]", output: "[]", isHidden: false },
                { input: "[0,0,0]", output: "[[0,0,0]]", isHidden: true },
            ],
        },
        {
            title: "Container With Most Water",
            topic: "Arrays",
            description:
                "You are given an integer array `height` of length n. There are n vertical lines drawn. Find two lines that together with the x-axis form a container, such that the container contains the most water.",
            difficulty: "MEDIUM",
            points: 200,
            constraints: "n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4",
            testCases: [
                { input: "[1,8,6,2,5,4,8,3,7]", output: "49", isHidden: false },
                { input: "[1,1]", output: "1", isHidden: false },
                { input: "[4,3,2,1,4]", output: "16", isHidden: true },
            ],
        },
        {
            title: "Longest Palindromic Substring",
            topic: "Strings",
            description: "Given a string `s`, return the longest palindromic substring in `s`.",
            difficulty: "MEDIUM",
            points: 200,
            constraints: "1 <= s.length <= 1000\ns consist of only digits and English letters.",
            testCases: [
                { input: "babad", output: "bab", isHidden: false },
                { input: "cbbd", output: "bb", isHidden: false },
                { input: "a", output: "a", isHidden: true },
            ],
        },
        {
            title: "Group Anagrams",
            topic: "Strings",
            description:
                "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
            difficulty: "MEDIUM",
            points: 200,
            constraints: '1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100\nstrs[i] consists of lowercase English letters.',
            testCases: [
                { input: '["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', isHidden: false },
                { input: '[""]', output: '[[""]]', isHidden: false },
                { input: '["a"]', output: '[["a"]]', isHidden: true },
            ],
        },
        {
            title: "Product of Array Except Self",
            topic: "Arrays",
            description:
                "Given an integer array `nums`, return an array `answer` such that answer[i] is equal to the product of all the elements of nums except nums[i]. You must write an algorithm that runs in O(n) time and without using the division operation.",
            difficulty: "MEDIUM",
            points: 200,
            constraints: "2 <= nums.length <= 10^5\n-30 <= nums[i] <= 30",
            testCases: [
                { input: "[1,2,3,4]", output: "[24,12,8,6]", isHidden: false },
                { input: "[-1,1,0,-3,3]", output: "[0,0,9,0,0]", isHidden: false },
                { input: "[2,3]", output: "[3,2]", isHidden: true },
            ],
        },
        {
            title: "Number of Islands",
            topic: "Graphs",
            description:
                'Given an m x n 2D binary grid `grid` which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
            difficulty: "MEDIUM",
            points: 200,
            constraints: "m == grid.length\nn == grid[i].length\n1 <= m, n <= 300",
            testCases: [
                { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: "1", isHidden: false },
                { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: "3", isHidden: false },
                { input: '[["1","0","1"],["0","1","0"],["1","0","1"]]', output: "5", isHidden: true },
            ],
        },
        {
            title: "Course Schedule",
            topic: "Graphs",
            description:
                "There are a total of `numCourses` courses you have to take, labeled from 0 to numCourses - 1. You are given an array `prerequisites` where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses.",
            difficulty: "MEDIUM",
            points: 200,
            constraints: "1 <= numCourses <= 2000\n0 <= prerequisites.length <= 5000",
            testCases: [
                { input: "2\n[[1,0]]", output: "true", isHidden: false },
                { input: "2\n[[1,0],[0,1]]", output: "false", isHidden: false },
                { input: "4\n[[1,0],[2,1],[3,2]]", output: "true", isHidden: true },
            ],
        },
        {
            title: "Word Search",
            topic: "Backtracking",
            description:
                "Given an m x n grid of characters `board` and a string `word`, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells.",
            difficulty: "MEDIUM",
            points: 200,
            constraints: "m == board.length\nn = board[i].length\n1 <= m, n <= 6\n1 <= word.length <= 15",
            testCases: [
                { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nABCCED', output: "true", isHidden: false },
                { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nSEE', output: "true", isHidden: false },
                { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nABCB', output: "false", isHidden: true },
            ],
        },

        // ── HARD (7) ──
        {
            title: "Median of Two Sorted Arrays",
            topic: "Arrays",
            description:
                "Given two sorted arrays `nums1` and `nums2` of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).",
            difficulty: "HARD",
            points: 350,
            constraints: "nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000",
            testCases: [
                { input: "[1,3]\n[2]", output: "2.00000", isHidden: false },
                { input: "[1,2]\n[3,4]", output: "2.50000", isHidden: false },
                { input: "[0,0]\n[0,0]", output: "0.00000", isHidden: true },
            ],
        },
        {
            title: "Regular Expression Matching",
            topic: "Dynamic Programming",
            description:
                "Given an input string `s` and a pattern `p`, implement regular expression matching with support for '.' and '*' where '.' matches any single character and '*' matches zero or more of the preceding element.",
            difficulty: "HARD",
            points: 350,
            constraints: "1 <= s.length <= 20\n1 <= p.length <= 20",
            testCases: [
                { input: "aa\na", output: "false", isHidden: false },
                { input: "aa\na*", output: "true", isHidden: false },
                { input: "ab\n.*", output: "true", isHidden: true },
            ],
        },
        {
            title: "Merge k Sorted Lists",
            topic: "Linked Lists",
            description:
                "You are given an array of `k` linked-lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
            difficulty: "HARD",
            points: 350,
            constraints: "k == lists.length\n0 <= k <= 10^4\n0 <= lists[i].length <= 500",
            testCases: [
                { input: "[[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]", isHidden: false },
                { input: "[]", output: "[]", isHidden: false },
                { input: "[[]]", output: "[]", isHidden: true },
            ],
        },
        {
            title: "Trapping Rain Water",
            topic: "Arrays",
            description:
                "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
            difficulty: "HARD",
            points: 350,
            constraints: "n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
            testCases: [
                { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", isHidden: false },
                { input: "[4,2,0,3,2,5]", output: "9", isHidden: false },
                { input: "[4,2,3]", output: "1", isHidden: true },
            ],
        },
        {
            title: "Minimum Window Substring",
            topic: "Strings",
            description:
                "Given two strings `s` and `t` of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
            difficulty: "HARD",
            points: 350,
            constraints: "m == s.length\nn == t.length\n1 <= m, n <= 10^5",
            testCases: [
                { input: "ADOBECODEBANC\nABC", output: "BANC", isHidden: false },
                { input: "a\na", output: "a", isHidden: false },
                { input: "a\naa", output: '""', isHidden: true },
            ],
        },
        {
            title: "Serialize and Deserialize Binary Tree",
            topic: "Trees",
            description:
                "Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work.",
            difficulty: "HARD",
            points: 350,
            constraints: "The number of nodes in the tree is in the range [0, 10^4].\n-1000 <= Node.val <= 1000",
            testCases: [
                { input: "[1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]", isHidden: false },
                { input: "[]", output: "[]", isHidden: false },
                { input: "[1]", output: "[1]", isHidden: true },
            ],
        },
        {
            title: "LRU Cache",
            topic: "Linked Lists",
            description:
                "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put operations in O(1) time complexity.",
            difficulty: "HARD",
            points: 350,
            constraints:
                "1 <= capacity <= 3000\n0 <= key <= 10^4\n0 <= value <= 10^5\nAt most 2 * 10^5 calls will be made to get and put.",
            testCases: [
                { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', output: "[null,null,null,1,null,-1,null,-1,3,4]", isHidden: false },
                { input: '["LRUCache","put","get"]\n[[1],[2,1],[2]]', output: "[null,null,1]", isHidden: false },
                { input: '["LRUCache","put","put","get","put","get"]\n[[2],[1,10],[2,20],[1],[3,30],[2]]', output: "[null,null,null,10,null,-1]", isHidden: true },
            ],
        },
    ];

    for (const p of problemsData) {
        await prisma.problem.create({
            data: {
                title: p.title,
                description: p.description,
                difficulty: p.difficulty,
                topic: p.topic,
                points: p.points,
                constraints: p.constraints,
                testCases: {
                    create: p.testCases,
                },
            },
        });
    }
    console.log("   ✅ 25 problems created (75 test cases total)\n");

    // ══════════════════════════════════════════════
    // 5. CONTEST (1 by Google)
    // ══════════════════════════════════════════════
    console.log("🏆  Creating a sample contest...");
    const contest = await prisma.contest.create({
        data: {
            companyId: companies[0]!.id,
            title: "Google Code Sprint 2026",
            description:
                "An intensive 2-hour coding sprint hosted by Google. Test your algorithmic skills against the best developers. Top performers will be fast-tracked to interviews.",
            date: new Date("2026-04-15T10:00:00Z"),
            durationMins: 120,
            timeLimitMinutes: 30,
            languages: ["C++", "Java", "Python", "JavaScript"],
            status: "UPCOMING",
            problems: {
                create: [
                    {
                        title: "Maximum Profit in Job Scheduling",
                        description:
                            "We have n jobs, where every job is scheduled to be done from startTime[i] to endTime[i], obtaining a profit of profit[i]. Return the maximum profit you can take such that there are no two jobs in the subset with overlapping time range.",
                        difficulty: "HARD",
                        points: 350,
                        constraints: "1 <= startTime.length == endTime.length == profit.length <= 5 * 10^4",
                        testCases: {
                            create: [
                                { input: "[1,2,3,3]\n[3,4,5,6]\n[50,10,40,70]", output: "120", isHidden: false },
                                { input: "[1,2,3,4,6]\n[3,5,10,6,9]\n[20,20,100,70,60]", output: "150", isHidden: false },
                                { input: "[1,1,1]\n[2,3,4]\n[5,6,4]", output: "6", isHidden: true },
                            ],
                        },
                    },
                    {
                        title: "Sliding Window Maximum",
                        description:
                            "You are given an array of integers `nums`, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Return the max sliding window.",
                        difficulty: "HARD",
                        points: 300,
                        constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4\n1 <= k <= nums.length",
                        testCases: {
                            create: [
                                { input: "[1,3,-1,-3,5,3,6,7]\n3", output: "[3,3,5,5,6,7]", isHidden: false },
                                { input: "[1]\n1", output: "[1]", isHidden: false },
                                { input: "[1,-1]\n1", output: "[1,-1]", isHidden: true },
                            ],
                        },
                    },
                ],
            },
        },
    });
    console.log(`   ✅ "${contest.title}" with 2 problems\n`);

    // ══════════════════════════════════════════════
    // 6. WEBINAR (1)
    // ══════════════════════════════════════════════
    console.log("📺  Creating a sample webinar...");
    const webinar = await prisma.webinar.create({
        data: {
            companyId: companies[0]!.id,
            title: "Google Cloud Platform — Career Opportunities",
            agenda:
                "Introduction to GCP infrastructure, hiring process overview for SDE and SRE roles, followed by a live Q&A with engineering leads. Open to all branches.",
            scheduledAt: new Date("2026-04-20T14:00:00Z"),
            durationMins: 60,
            meetingLink: "https://meet.google.com/abc-defg-hij",
            status: "UPCOMING",
            targetUniversities: {
                create: [{ universityId: vit.id }],
            },
        },
    });
    console.log(`   ✅ "${webinar.title}"\n`);

    // ══════════════════════════════════════════════
    // 7. SAMPLE MAILS
    // ══════════════════════════════════════════════
    console.log("📧  Creating sample mails...");

    const vitStudent1Cnid = students[0]!.codeNexusId!;
    const vitStudent2Cnid = students[1]!.codeNexusId!;
    const vitCnid = uniUser.cnid!;
    const googleCnid = "CN-COM-GOOG01";
    const microsoftCnid = "CN-COM-MSFTA1";

    const mailThread1 = crypto.randomUUID();
    const mailThread2 = crypto.randomUUID();

    await prisma.mail.createMany({
        data: [
            {
                sender_cnid: vitCnid,
                recipient_cnid: vitStudent1Cnid,
                subject: "Upcoming Amazon Drive - Important Details",
                body: "Dear students, please ensure your resumes are updated on the portal by 11:59 PM tonight. Late submissions will not be considered for the Amazon SDE I drive.\n\nBest,\nPlacement Cell",
                sent_at: new Date("2026-03-22T10:30:00Z"),
                is_read: false,
                thread_id: mailThread1,
            },
            {
                sender_cnid: googleCnid,
                recipient_cnid: vitCnid,
                subject: "Feedback regarding recent technical interviews",
                body: "Hello Placement Team,\n\nWe have evaluated the candidates from yesterday. Overall, performance was exceptional. We will send the final offers via the evaluations portal by EOD.\n\nRegards,\nJane (Google HR)",
                sent_at: new Date("2026-03-21T16:15:00Z"),
                is_read: true,
                thread_id: mailThread2,
            },
            {
                sender_cnid: googleCnid,
                recipient_cnid: vitStudent2Cnid,
                subject: "Re: Google Summer of Code 2026 Opportunity",
                body: "Hi Priya,\n\nYour application for GSoC 2026 has been shortlisted. We will schedule a technical interview next week. Please keep your GitHub profile updated with your latest contributions.\n\nBest,\nGoogle Open Source Team",
                sent_at: new Date("2026-03-20T09:00:00Z"),
                is_read: true,
                thread_id: mailThread2,
            },
            {
                sender_cnid: vitStudent2Cnid,
                recipient_cnid: vitCnid,
                subject: "Query regarding contest registration",
                body: "Hello Placement Team,\n\nI have a question about the Google Code Sprint 2026 - is there a specific eligibility criteria for the AI/ML specialization students?\n\nThanks,\nPriya Sharma",
                sent_at: new Date("2026-03-19T14:30:00Z"),
                is_read: true,
                thread_id: mailThread1,
            },
            {
                sender_cnid: microsoftCnid,
                recipient_cnid: vitStudent1Cnid,
                subject: "Microsoft Azure Certification Scholarship",
                body: "Dear Devansh,\n\nCongratulations on your outstanding performance in the Code Arena! We are pleased to offer you the Microsoft Azure Certification Scholarship. Please check your email for the detailed steps to avail it.\n\nBest,\nMicrosoft University Relations",
                sent_at: new Date("2026-03-18T11:00:00Z"),
                is_read: false,
                thread_id: crypto.randomUUID(),
            },
        ],
    });
    console.log("   ✅ 5 sample mails created\n");

    // ══════════════════════════════════════════════
    // DONE
    // ══════════════════════════════════════════════
    console.log("═══════════════════════════════════════");
    console.log("🎉  Seeding complete!\n");
    console.log("📋  Login credentials (password: password123):");
    console.log("   University: admin@vit.ac.in");
    console.log("   Company 1:  hr@google.com");
    console.log("   Company 2:  hr@microsoft.com");
    console.log("   Student 1:  devansh@vit.ac.in");
    console.log("   Student 2:  priya.sharma@vit.ac.in");
    console.log("   Student 3:  arjun.mehta@vit.ac.in");
    console.log("   Student 4:  sneha.reddy@vit.ac.in");
    console.log("═══════════════════════════════════════\n");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
