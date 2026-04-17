import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateContestInput, UpdateContestInput } from "./contest.schema.js";
import * as leaderboardService from "../codearena/leaderboard.service.js";

export const createContest = async (userId: string, data: CreateContestInput) => {
    const company = await prisma.company.findUnique({
        where: { userId }
    });
    if (!company) {
        throw new ApiError(403, "You must create a company profile before creating a contest");
    }

    // Parse the duration string (e.g. "2 hours") into minutes
    let durationMins = data.durationMins;
    if (!durationMins) {
        durationMins = 120; // Default 2 hours
    }

    // Create the contest with nested problems and test cases in a single transaction
    return await prisma.contest.create({
        data: {
            companyId: company.id,
            title: data.title,
            description: data.description ?? null,
            date: new Date(data.scheduledDate),
            durationMins: durationMins,
            timeLimitMinutes: data.timeLimitMinutes ?? 30,
            languages: data.languages,
            problems: {
                create: data.questions.map(q => ({
                    title: q.title,
                    description: q.statement,
                    difficulty: q.difficulty,
                    points: q.points ?? 100,
                    constraints: q.constraints ?? null,
                    testCases: {
                        create: q.testCases.map(tc => ({
                            input: tc.input,
                            output: tc.expectedOutput,
                            isHidden: false,
                        }))
                    }
                }))
            }
        },
        include: {
            problems: {
                include: { testCases: true }
            }
        }
    });
}

export const getContests = async () => {
    const contests = await prisma.contest.findMany({
        include: {
            company: {
                select: {
                    name: true,
                    industry: true
                }
            },
            _count: {
                select: { problems: true, registrations: true }
            }
        },
        orderBy: { date: 'desc' }
    });

    const now = new Date();
    return contests.map((c: any) => {
        let status = 'UPCOMING';
        const contestStart = new Date(c.date);
        const contestEnd = new Date(contestStart.getTime() + c.durationMins * 60000);
        
        if (now >= contestStart && now <= contestEnd) {
            status = 'ONGOING';
        } else if (now > contestEnd) {
            status = 'ENDED';
        }
        
        return { ...c, status };
    });
}

export const getContestById = async (id: string) => {
    const contest = await prisma.contest.findUnique({
        where: { id },
        include: {
            company: {
                select: { name: true, industry: true }
            },
            problems: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    points: true,
                    constraints: true,
                    description: true,
                    _count: { select: { testCases: true } }
                }
            }
        }
    });
    if (!contest) {
        throw new ApiError(404, "Contest not found");
    }

    const now = new Date();
    let status = 'UPCOMING';
    const contestStart = new Date(contest.date);
    const contestEnd = new Date(contestStart.getTime() + contest.durationMins * 60000);
    
    if (now >= contestStart && now <= contestEnd) {
        status = 'ONGOING';
    } else if (now > contestEnd) {
        status = 'ENDED';
    }

    return { ...contest, status };
}

export const registerStudent = async (userId: string, contestId: string) => {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw new ApiError(403, "Only students can register for contests");

    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new ApiError(404, "Contest not found");

    const existing = await prisma.contestRegistration.findFirst({
        where: { studentId: student.id, contestId }
    });
    if (existing) throw new ApiError(400, "Already registered for this contest");

    return await prisma.contestRegistration.create({
        data: {
            studentId: student.id,
            contestId
        }
    });
}

export const getRegistrations = async (contestId: string) => {
    return await prisma.contestRegistration.findMany({
        where: { contestId },
        include: {
            student: {
                select: { name: true, branch: true, cgpa: true, _count: { select: { submissions: true } } }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export const updateContest = async (userId: string, id: string, data: UpdateContestInput) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(403, "Only verified companies can modify contests");

    const contest = await prisma.contest.findUnique({ where: { id } });
    if (!contest) throw new ApiError(404, "Contest not found");

    if (contest.companyId !== company.id) {
        throw new ApiError(403, "You can't modify someone else's contest");
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.scheduledDate !== undefined) updateData.date = new Date(data.scheduledDate);
    if (data.durationMins !== undefined) updateData.durationMins = data.durationMins;
    if (data.timeLimitMinutes !== undefined) updateData.timeLimitMinutes = data.timeLimitMinutes;
    if (data.languages !== undefined) updateData.languages = data.languages;
    if (data.status !== undefined) updateData.status = data.status;

    return await prisma.contest.update({
        where: { id },
        data: updateData
    });
}

export const deleteContest = async (userId: string, id: string) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(403, "Only verified companies can delete contests");

    const contest = await prisma.contest.findUnique({ where: { id } });
    if (!contest) throw new ApiError(404, "Contest not found");

    if (contest.companyId !== company.id) {
        throw new ApiError(403, "You can't delete someone else's contest");
    }

    await prisma.contest.delete({ where: { id } });
    return { success: true };
}

export const getContestLeaderboard = async (contestId: string, userCnid?: string) => {
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new ApiError(404, "Contest not found");

    const result = await leaderboardService.getContestLeaderboard(contestId, 50);

    if (result.rankings.length === 0) {
        const submissions = await prisma.submission.findMany({
            where: { problem: { contestId } },
            include: {
                student: { include: { user: { select: { cnid: true } } } }
            }
        });

        const userStats = new Map<string, { cnid: string; solved: number; wrong: number; firstSolve: Date | null }>();
        for (const s of submissions) {
            const cnid = s.student.user?.cnid;
            if (!cnid) continue;
            if (!userStats.has(cnid)) {
                userStats.set(cnid, { cnid, solved: 0, wrong: 0, firstSolve: null });
            }
            const stats = userStats.get(cnid)!;
            if (s.status === 'AC') {
                stats.solved++;
                if (!stats.firstSolve || new Date(s.createdAt) < stats.firstSolve) {
                    stats.firstSolve = new Date(s.createdAt);
                }
            } else if (s.status !== 'pending') {
                stats.wrong++;
            }
        }

        const contestStart = new Date(contest.date);
        for (const [cnid, stats] of userStats.entries()) {
            const timeTaken = stats.firstSolve
                ? (stats.firstSolve.getTime() - contestStart.getTime()) / 60000
                : 0;
            await leaderboardService.updateContestLeaderboard(
                contestId,
                cnid,
                stats.solved,
                stats.wrong,
                timeTaken
            );
        }

        const refreshedResult = await leaderboardService.getContestLeaderboard(contestId, 50);
        
        const cnids = refreshedResult.rankings.map(r => r.cnid);
        const users = await prisma.user.findMany({
            where: { cnid: { in: cnids } },
            include: { studentProfile: { select: { name: true } } }
        });
        const nameMap = new Map<string, string>();
        for (const u of users) {
            if (u.cnid && u.studentProfile?.name) {
                nameMap.set(u.cnid, u.studentProfile.name);
            }
        }

        const rankedWithNames = refreshedResult.rankings.map(r => ({
            ...r,
            displayName: nameMap.get(r.cnid) || r.cnid
        }));

        let myRank = null;
        if (userCnid) {
            myRank = await leaderboardService.getUserContestRank(contestId, userCnid);
        }

        return {
            rankings: rankedWithNames,
            myRank,
            totalParticipants: refreshedResult.totalParticipants
        };
    }

    const cnids = result.rankings.map(r => r.cnid);
    const users = await prisma.user.findMany({
        where: { cnid: { in: cnids } },
        include: { studentProfile: { select: { name: true } } }
    });
    const nameMap = new Map<string, string>();
    for (const u of users) {
        if (u.cnid && u.studentProfile?.name) {
            nameMap.set(u.cnid, u.studentProfile.name);
        }
    }

    const rankedWithNames = result.rankings.map(r => ({
        ...r,
        displayName: nameMap.get(r.cnid) || r.cnid
    }));

    let myRank = null;
    if (userCnid) {
        myRank = await leaderboardService.getUserContestRank(contestId, userCnid);
    }

    return {
        rankings: rankedWithNames,
        myRank,
        totalParticipants: result.totalParticipants
    };
}