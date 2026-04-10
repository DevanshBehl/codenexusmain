import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ApiResponse } from '../../utils/api-response.js';

export async function getProblems(req: Request, res: Response, next: NextFunction) {
    try {
        const { difficulty, tags } = req.query;
        const cnid = req.user?.cnid;

        const where: any = { is_published: true };
        if (difficulty) where.difficulty = (difficulty as string).toUpperCase();
        if (tags) {
            const tagsArray = (tags as string).split(',');
            where.tags = { hasSome: tagsArray };
        }

        const problems = await prisma.caProblem.findMany({
            where,
            select: {
                id: true,
                title: true,
                slug: true,
                difficulty: true,
                tags: true,
                submissionSummaries: cnid ? {
                    where: { student_cnid: cnid },
                    select: { is_solved: true }
                } : false
            },
            orderBy: { created_at: 'desc' }
        });

        // Compute total submissions mapping
        const totals = await prisma.caSubmissionSummary.groupBy({
            by: ['problem_id'],
            _sum: { total_attempts: true }
        });
        
        const successTotals = await prisma.caSubmissionSummary.groupBy({
            by: ['problem_id'],
            where: { is_solved: true },
            _count: { student_cnid: true }
        });

        const mappedProblems = problems.map(p => {
            const attemptCount = totals.find(t => t.problem_id === p.id)?._sum.total_attempts || 0;
            const successCount = successTotals.find(t => t.problem_id === p.id)?._count.student_cnid || 0;
            
            return {
                id: p.id,
                title: p.title,
                slug: p.slug,
                difficulty: p.difficulty,
                tags: p.tags,
                is_solved: p.submissionSummaries?.[0]?.is_solved || false,
                acceptance_rate: attemptCount > 0 ? Math.round((successCount / attemptCount) * 100) : 0,
                total_solved: successCount
            }
        });

        res.status(200).json(new ApiResponse(200, mappedProblems, "Problems fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export async function getProblemById(req: Request, res: Response, next: NextFunction) {
    try {
        const problem = await prisma.caProblem.findUnique({
            where: { id: req.params.id as string },
            include: {
                testCases: {
                    where: { is_sample: true },
                    orderBy: { order_index: 'asc' },
                    select: {
                        id: true,
                        input: true,
                        expected_output: true,
                    }
                }
            }
        });

        if (!problem) {
            return res.status(404).json(new ApiResponse(404, null, "Problem not found"));
        }

        res.status(200).json(new ApiResponse(200, problem, "Problem fetched successfully"));
    } catch (e) {
        next(e);
    }
}
