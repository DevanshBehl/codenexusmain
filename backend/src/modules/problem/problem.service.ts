import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateProblemInput } from "./problem.schema.js";

export const createProblem = async (userId: string, data: CreateProblemInput) => {
    const company = await prisma.company.findUnique({
        where: {
            userId: userId
        }
    })
    if (!company) {
        throw new ApiError(403, "Only verified companies can create problems");
    }

    if (data.contestId) {
        const contest = await prisma.contest.findUnique({
            where: {
                id: data.contestId
            }
        })
        if (!contest) {
            throw new ApiError(404, "Contest not found");
        }
        if (contest.companyId !== company.id) {
            throw new ApiError(403, "You can't add problems to someone else's contest");
        }
    }

    return await prisma.problem.create({
        data: {
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            contestId: data.contestId ?? null,
            testCases: {
                create: data.testCases.map(tc => ({
                    input: tc.input,
                    output: tc.output,
                    isHidden: tc.isHidden
                }))
            }
        },
        include: {
            testCases: true
        }
    })
}

export const getProblems = async (difficulty?: string, page: number = 1, limit: number = 20) => {
    const where: any = {};
    if (difficulty) {
        where.difficulty = difficulty;
    }
    const skip = (page - 1) * limit;

    const [problems, total] = await Promise.all([
        prisma.problem.findMany({
            where,
            select: {
                id: true,
                title: true,
                difficulty: true,
                contestId: true,
                _count: {
                    select: {
                        testCases: true,
                        submissions: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { title: 'asc' }
        }),
        prisma.problem.count({ where })
    ]);

    return {
        problems,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

export const getProblemById = async (id: string) => {
    const problem = await prisma.problem.findUnique({
        where: { id },
        include: {
            testCases: {
                where: { isHidden: false },
                select: {
                    id: true,
                    input: true,
                    output: true
                }
            },
            contest: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    });
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }
    return problem;
}