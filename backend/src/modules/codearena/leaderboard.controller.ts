import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ApiResponse } from '../../utils/api-response.js';
import IORedis from 'ioredis';

const redis = new (IORedis as any)({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

function calculateScore(solvedCount: number) {
    // simplified scoring mechanism: 100 points per solved problem
    return solvedCount * 100;
}

function determineTier(score: number) {
    if (score >= 15000) return 'Grandmaster';
    if (score >= 12000) return 'Master';
    if (score >= 10000) return 'Candidate Master';
    if (score >= 8000) return 'Expert';
    if (score >= 5000) return 'Specialist';
    return 'Pupil';
}

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
        const CACHE_KEY = 'codearena_leaderboard';
        
        // Try getting from cache
        const cached = await redis.get(CACHE_KEY);
        if (cached) {
            return res.status(200).json(new ApiResponse(200, JSON.parse(cached), "Leaderboard fetched from cache"));
        }

        // Aggregate from database
        const summaries = await prisma.caSubmissionSummary.groupBy({
            by: ['student_cnid'],
            where: { is_solved: true },
            _count: { problem_id: true }
        });

        const studentCnids = summaries.map(s => s.student_cnid);
        
        // Fetch user data
        const students = await prisma.student.findMany({
            where: { user: { cnid: { in: studentCnids } } },
            include: { user: { select: { cnid: true } } }
        });

        const leaderboardMap = new Map();
        for (const s of students) {
            if (s.user?.cnid) {
                leaderboardMap.set(s.user.cnid, s.name || 'Unknown User');
            }
        }

        const leaderboardData = summaries.map(s => {
            const solved = s._count.problem_id;
            const score = calculateScore(solved);
            return {
                cnid: s.student_cnid,
                user: leaderboardMap.get(s.student_cnid) || 'Unknown User',
                solved,
                score,
                tier: determineTier(score)
            };
        });

        // Sort descending by score
        leaderboardData.sort((a, b) => b.score - a.score);

        // Assign ranks
        const rankedData = leaderboardData.map((d, i) => ({ rank: i + 1, ...d })).slice(0, 100);

        // Set cache for 60 seconds
        await redis.setex(CACHE_KEY, 60, JSON.stringify(rankedData));

        res.status(200).json(new ApiResponse(200, rankedData, "Leaderboard fetched and cached"));
    } catch (e) {
        next(e);
    }
}

export async function getProfileStats(req: Request, res: Response, next: NextFunction) {
    try {
        const cnid = req.user?.cnid;
        if (!cnid) {
            return res.status(403).json(new ApiResponse(403, null, "Not authorized"));
        }

        const totals = await prisma.caProblem.groupBy({
            by: ['difficulty'],
            _count: { id: true }
        });

        const solved = await prisma.caSubmissionSummary.findMany({
            where: { student_cnid: cnid, is_solved: true },
            include: { problem: { select: { difficulty: true } } }
        });

        const totalEasy = totals.find(t => t.difficulty === 'EASY')?._count.id || 0;
        const totalMedium = totals.find(t => t.difficulty === 'MEDIUM')?._count.id || 0;
        const totalHard = totals.find(t => t.difficulty === 'HARD')?._count.id || 0;

        let solvedEasy = 0, solvedMedium = 0, solvedHard = 0;
        for (const s of solved) {
            if (s.problem.difficulty === 'EASY') solvedEasy++;
            if (s.problem.difficulty === 'MEDIUM') solvedMedium++;
            if (s.problem.difficulty === 'HARD') solvedHard++;
        }

        const solvedCount = solved.length;
        const score = calculateScore(solvedCount);
        
        const recentSubmissions = await prisma.caSubmission.findMany({
            where: { student_cnid: cnid },
            orderBy: { submitted_at: 'desc' },
            take: 5,
            include: { problem: { select: { title: true } } }
        });

        res.status(200).json(new ApiResponse(200, {
            totalEasy, totalMedium, totalHard,
            solvedEasy, solvedMedium, solvedHard,
            score, tier: determineTier(score),
            recentSubmissions
        }, "Profile stats fetched"));

    } catch (e) {
        next(e);
    }
}
