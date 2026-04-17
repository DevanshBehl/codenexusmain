import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";

// ============================================================================
// STUDENT DASHBOARD
// ============================================================================
export const getStudentDashboard = async (userId: string) => {
    const student = await prisma.student.findUnique({
        where: { userId },
        include: {
            university: { select: { name: true, location: true } },
        },
    });
    if (!student) throw new ApiError(404, "Student profile not found");

    const submissions = await prisma.submission.findMany({
        where: { studentId: student.id },
        select: { id: true, status: true, problemId: true, createdAt: true },
    });
    const solvedProblemIds = new Set(
        submissions.filter((s) => s.status === "AC").map((s) => s.problemId)
    );
    const acceptedCount = submissions.filter((s) => s.status === "AC").length;
    const accuracy =
        submissions.length > 0
            ? Math.round((acceptedCount / submissions.length) * 100)
            : 0;

    // Global rank by codeArenaScore
    const higher = await prisma.student.count({
        where: { codeArenaScore: { gt: student.codeArenaScore } },
    });
    const globalRank = higher + 1;

    const now = new Date();
    const upcomingContests = await prisma.contest.findMany({
        where: { date: { gte: now }, status: { in: ["UPCOMING", "ACTIVE"] } },
        orderBy: { date: "asc" },
        take: 5,
        include: {
            company: { select: { name: true } },
            problems: { select: { id: true } },
        },
    });

    const upcomingInterviews = await prisma.interview.findMany({
        where: { studentId: student.id, scheduledAt: { gte: now }, status: "SCHEDULED" },
        orderBy: { scheduledAt: "asc" },
        take: 5,
        include: {
            recruiter: { select: { name: true, company: { select: { name: true } } } },
        },
    });

    const upcomingWebinars = await prisma.webinar.findMany({
        where: {
            scheduledAt: { gte: now },
            status: "UPCOMING",
            targetUniversities: { some: { universityId: student.universityId } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
        include: { company: { select: { name: true } } },
    });

    const applications = await prisma.jobApplication.count({
        where: { studentId: student.id },
    });

    // crude streak = distinct recent submission days consecutive up to today
    const recentDays = new Set<string>();
    submissions.forEach((s) => {
        recentDays.add(s.createdAt.toISOString().slice(0, 10));
    });
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (recentDays.has(key)) streak++;
        else if (i > 0) break;
    }

    return {
        profile: {
            name: student.name,
            branch: student.branch,
            cgpa: student.cgpa,
            university: student.university.name,
            codeArenaScore: student.codeArenaScore,
            status: student.status,
        },
        stats: {
            problemsSolved: solvedProblemIds.size,
            totalSubmissions: submissions.length,
            accuracy,
            globalRank,
            streak,
            applications,
        },
        upcomingContests: upcomingContests.map((c) => ({
            id: c.id,
            title: c.title,
            company: c.company.name,
            date: c.date,
            durationMins: c.durationMins,
            problems: c.problems.length,
            status: c.status,
        })),
        upcomingInterviews: upcomingInterviews.map((i) => ({
            id: i.id,
            role: i.role,
            type: i.type,
            scheduledAt: i.scheduledAt,
            company: i.recruiter.company.name,
            recruiter: i.recruiter.name,
        })),
        upcomingWebinars: upcomingWebinars.map((w) => ({
            id: w.id,
            title: w.title,
            company: w.company.name,
            scheduledAt: w.scheduledAt,
            durationMins: w.durationMins,
        })),
    };
};

// ============================================================================
// COMPANY DASHBOARD
// ============================================================================
export const getCompanyDashboard = async (userId: string) => {
    const company = await prisma.company.findUnique({
        where: { userId },
        include: {
            recruiters: { select: { id: true } },
        },
    });
    if (!company) throw new ApiError(404, "Company profile not found");

    const partnerUniversities = await prisma.companyUniversity.findMany({
        where: { companyId: company.id },
        include: {
            university: {
                select: {
                    id: true,
                    name: true,
                    location: true,
                    tier: true,
                    students: { select: { id: true } },
                },
            },
        },
    });

    const recruiterIds = company.recruiters.map((r) => r.id);
    const interviews = await prisma.interview.findMany({
        where: { recruiterId: { in: recruiterIds } },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    branch: true,
                    cgpa: true,
                    university: { select: { name: true } },
                },
            },
            recruiter: { select: { name: true } },
            recording: true,
        },
        orderBy: { scheduledAt: "desc" },
    });

    const now = new Date();
    const scheduled = interviews.filter(
        (i) => i.status === "SCHEDULED" && i.scheduledAt >= now
    );
    const completed = interviews.filter(
        (i) => i.status === "COMPLETED" || i.recording
    );

    const contests = await prisma.contest.findMany({
        where: { companyId: company.id },
        include: {
            problems: { select: { id: true } },
            _count: { select: { problems: true } },
        },
        orderBy: { date: "desc" },
        take: 10,
    });

    // Unique candidates who took any contest for this company
    const candidates = await prisma.student.findMany({
        where: {
            submissions: {
                some: {
                    problem: { contest: { companyId: company.id } },
                },
            },
        },
        include: {
            university: { select: { name: true } },
            submissions: {
                where: { problem: { contest: { companyId: company.id } } },
                select: { status: true, problemId: true },
            },
        },
        take: 20,
    });

    return {
        profile: {
            name: company.name,
            industry: company.industry,
            description: company.description,
        },
        stats: {
            partnerUniversities: partnerUniversities.length,
            totalStudentsReach: partnerUniversities.reduce(
                (acc, pu) => acc + pu.university.students.length,
                0
            ),
            activeContests: contests.filter((c) => c.status === "ACTIVE").length,
            totalContests: contests.length,
            scheduledInterviews: scheduled.length,
            completedInterviews: completed.length,
            recruiters: company.recruiters.length,
        },
        partnerUniversities: partnerUniversities.map((pu) => ({
            id: pu.university.id,
            name: pu.university.name,
            location: pu.university.location,
            tier: pu.university.tier,
            studentCount: pu.university.students.length,
        })),
        candidates: candidates.map((c) => {
            const solved = new Set(
                c.submissions.filter((s) => s.status === "AC").map((s) => s.problemId)
            ).size;
            return {
                id: c.id,
                name: c.name,
                branch: c.branch,
                cgpa: c.cgpa,
                university: c.university.name,
                problemsSolved: solved,
                status: c.status,
            };
        }),
        recentContests: contests.map((c) => ({
            id: c.id,
            title: c.title,
            date: c.date,
            durationMins: c.durationMins,
            status: c.status,
            problems: c.problems.length,
        })),
        scheduledInterviews: scheduled.slice(0, 10).map((i) => ({
            id: i.id,
            role: i.role,
            type: i.type,
            scheduledAt: i.scheduledAt,
            student: i.student.name,
            studentBranch: i.student.branch,
            studentUniversity: i.student.university.name,
            recruiter: i.recruiter.name,
        })),
    };
};

// ============================================================================
// UNIVERSITY DASHBOARD
// ============================================================================
export const getUniversityDashboard = async (userId: string) => {
    const university = await prisma.university.findUnique({
        where: { userId },
    });
    if (!university) throw new ApiError(404, "University profile not found");

    const students = await prisma.student.findMany({
        where: { universityId: university.id },
        include: {
            applications: { select: { status: true, companyId: true } },
            submissions: { select: { status: true, problemId: true } },
        },
    });

    const placed = students.filter((s) => s.status === "PLACED").length;
    const available = students.filter((s) => s.status === "AVAILABLE").length;

    const partnerCompanies = await prisma.companyUniversity.count({
        where: { universityId: university.id },
    });

    const now = new Date();
    const upcomingWebinars = await prisma.webinar.findMany({
        where: {
            scheduledAt: { gte: now },
            targetUniversities: { some: { universityId: university.id } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 10,
        include: { company: { select: { name: true } } },
    });

    // Recent drives = contests from partner companies
    const recentDrives = await prisma.contest.findMany({
        where: {
            company: {
                partnerUniversities: {
                    some: { universityId: university.id },
                },
            },
        },
        orderBy: { date: "desc" },
        take: 10,
        include: {
            company: { select: { name: true } },
            problems: { select: { id: true } },
        },
    });

    // Top students by codeArenaScore
    const topStudents = [...students]
        .sort((a, b) => b.codeArenaScore - a.codeArenaScore)
        .slice(0, 10);

    return {
        profile: {
            name: university.name,
            location: university.location,
            tier: university.tier,
        },
        stats: {
            totalStudents: students.length,
            placedStudents: placed,
            availableStudents: available,
            placementRate:
                students.length > 0 ? Math.round((placed / students.length) * 100) : 0,
            partnerCompanies,
            upcomingDrives: upcomingWebinars.length,
        },
        students: students.map((s) => ({
            id: s.id,
            name: s.name,
            branch: s.branch,
            cgpa: s.cgpa,
            codeArenaScore: s.codeArenaScore,
            status: s.status,
            applications: s.applications.length,
            problemsSolved: new Set(
                s.submissions.filter((sub) => sub.status === "AC").map((sub) => sub.problemId)
            ).size,
        })),
        topStudents: topStudents.map((s) => ({
            id: s.id,
            name: s.name,
            branch: s.branch,
            cgpa: s.cgpa,
            codeArenaScore: s.codeArenaScore,
        })),
        recentDrives: recentDrives.map((d) => ({
            id: d.id,
            title: d.title,
            company: d.company.name,
            date: d.date,
            problems: d.problems.length,
            status: d.status,
        })),
        upcomingWebinars: upcomingWebinars.map((w) => ({
            id: w.id,
            title: w.title,
            company: w.company.name,
            scheduledAt: w.scheduledAt,
            durationMins: w.durationMins,
        })),
    };
};

// ============================================================================
// RECRUITER DASHBOARD
// ============================================================================
export const getRecruiterDashboard = async (userId: string) => {
    const recruiter = await prisma.recruiter.findUnique({
        where: { userId },
        include: { company: { select: { id: true, name: true } } },
    });
    if (!recruiter) throw new ApiError(404, "Recruiter profile not found");

    const now = new Date();
    const interviews = await prisma.interview.findMany({
        where: { recruiterId: recruiter.id },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    branch: true,
                    cgpa: true,
                    specialization: true,
                    university: { select: { name: true } },
                    projects: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            techStack: true,
                            githubLink: true,
                            liveLink: true,
                        },
                    },
                    submissions: {
                        where: { status: "AC" },
                        select: {
                            problemId: true,
                            problem: {
                                select: {
                                    title: true,
                                    difficulty: true,
                                    topic: true,
                                },
                            },
                        },
                        distinct: ["problemId"],
                        take: 20,
                    },
                },
            },
            recording: true,
            interviewRecording: true,
        },
        orderBy: { scheduledAt: "desc" },
    });

    const scheduled = interviews.filter(
        (i) => i.status === "SCHEDULED" && i.scheduledAt >= now
    );
    const past = interviews.filter(
        (i) => i.status === "COMPLETED" || i.recording || i.scheduledAt < now
    );

    return {
        profile: {
            name: recruiter.name,
            company: recruiter.company.name,
        },
        stats: {
            totalInterviews: interviews.length,
            scheduledInterviews: scheduled.length,
            completedInterviews: past.length,
            recordings: interviews.filter((i) => i.recording).length,
        },
        scheduledInterviews: scheduled.map((i) => ({
            id: i.id,
            role: i.role,
            type: i.type,
            scheduledAt: i.scheduledAt,
            student: {
                id: i.student.id,
                name: i.student.name,
                branch: i.student.branch,
                cgpa: i.student.cgpa,
                specialization: i.student.specialization,
                university: i.student.university.name,
                projects: i.student.projects,
                solvedProblems: i.student.submissions.map((s) => ({
                    title: s.problem.title,
                    difficulty: s.problem.difficulty,
                    topic: s.problem.topic,
                })),
            },
        })),
        recordings: past
            .filter((i) => i.recording)
            .map((i) => ({
                id: i.id,
                recordingId: i.recording!.id,
                role: i.role,
                type: i.type,
                scheduledAt: i.scheduledAt,
                videoUrl: i.recording!.videoUrl,
                duration: i.recording!.durationStr,
                rating: i.recording!.rating,
                verdict: i.recording!.verdict,
                notes: i.recording!.notes,
                student: {
                    id: i.student.id,
                    name: i.student.name,
                    branch: i.student.branch,
                    cgpa: i.student.cgpa,
                    university: i.student.university.name,
                    solvedProblems: i.student.submissions.map((s) => ({
                        title: s.problem.title,
                        difficulty: s.problem.difficulty,
                        topic: s.problem.topic,
                    })),
                },
            })),
    };
};
