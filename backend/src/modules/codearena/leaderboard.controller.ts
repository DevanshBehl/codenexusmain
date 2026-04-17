import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ApiResponse } from '../../utils/api-response.js';
import * as leaderboardService from './leaderboard.service.js';

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 100, 100);
        const leaderboard = await leaderboardService.getGlobalLeaderboard(limit);

        if (leaderboard.length === 0) {
            const summaries = await prisma.caSubmissionSummary.groupBy({
                by: ['student_cnid'],
                where: { is_solved: true },
                _count: { problem_id: true }
            });

            if (summaries.length > 0) {
                for (const s of summaries) {
                    await leaderboardService.updateGlobalLeaderboard(
                        s.student_cnid,
                        s._count.problem_id
                    );
                }
                const refreshedLeaderboard = await leaderboardService.getGlobalLeaderboard(limit);
                const rankedData = refreshedLeaderboard.map((d, i) => ({ rank: i + 1, ...d }));
                return res.status(200).json(new ApiResponse(200, rankedData, "Leaderboard fetched"));
            }
            return res.status(200).json(new ApiResponse(200, [], "Leaderboard is empty"));
        }

        const studentCnids = leaderboard.map(e => e.cnid);
        const students = await prisma.user.findMany({
            where: { cnid: { in: studentCnids } },
            include: { studentProfile: { select: { name: true } } }
        });

        const nameMap = new Map<string, string>();
        for (const s of students) {
            if (s.cnid && s.studentProfile?.name) {
                nameMap.set(s.cnid, s.studentProfile.name);
            }
        }

        const rankedData = leaderboard.map((d, i) => ({
            rank: i + 1,
            cnid: d.cnid,
            user: nameMap.get(d.cnid) || d.displayName,
            solved: d.solved,
            score: d.score,
            tier: d.tier
        }));

        const cnid = req.user?.cnid;
        let myRank: { rank: number; tier: string; score: number } | null = null;
        if (cnid) {
            const userRank = await leaderboardService.getUserGlobalRank(cnid);
            if (userRank) {
                const userSummary = await prisma.caSubmissionSummary.findMany({
                    where: { student_cnid: cnid, is_solved: true }
                });
                const solvedCount = userSummary.length;
                const score = leaderboardService.calculateGlobalScore(solvedCount);
                myRank = {
                    rank: userRank,
                    tier: leaderboardService.determineTier(score),
                    score
                };
            }
        }

        return res.status(200).json(new ApiResponse(200, {
            rankings: rankedData,
            myRank
        }, "Leaderboard fetched"));
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
        const score = leaderboardService.calculateGlobalScore(solvedCount);

        const userRank = await leaderboardService.getUserGlobalRank(cnid);

        const recentSubmissions = await prisma.caSubmission.findMany({
            where: { student_cnid: cnid },
            orderBy: { submitted_at: 'desc' },
            take: 5,
            include: { problem: { select: { title: true } } }
        });

        return res.status(200).json(new ApiResponse(200, {
            totalEasy, totalMedium, totalHard,
            solvedEasy, solvedMedium, solvedHard,
            solvedCount,
            score,
            tier: leaderboardService.determineTier(score),
            globalRank: userRank,
            recentSubmissions
        }, "Profile stats fetched"));

    } catch (e) {
        next(e);
    }
}