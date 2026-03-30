import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateProblemInput, UpdateProblemInput, CreateSubmissionInput } from "./problem.schema.js";

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
            points: data.points ?? 100,
            constraints: data.constraints ?? null,
            contestId: data.contestId ?? null,
            testCases: {
                create: data.testCases.map(tc => ({
                    input: tc.input,
                    output: tc.output || tc.expectedOutput || "",
                    isHidden: tc.isHidden ?? false
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
                points: true,
                topic: true,
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

export const updateProblem = async (userId: string, id: string, data: UpdateProblemInput) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(403, "Only verified companies can modify problems");

    const problem = await prisma.problem.findUnique({
        where: { id },
        include: { contest: true }
    });
    if (!problem) throw new ApiError(404, "Problem not found");

    if (problem.contest && problem.contest.companyId !== company.id) {
        throw new ApiError(403, "You can't modify problems from someone else's contest");
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.topic !== undefined) updateData.topic = data.topic;
    if (data.points !== undefined) updateData.points = data.points;
    if (data.constraints !== undefined) updateData.constraints = data.constraints;

    if (data.testCases) {
        updateData.testCases = {
            deleteMany: {},
            create: data.testCases.map(tc => ({
                input: tc.input,
                output: tc.output || tc.expectedOutput || "",
                isHidden: tc.isHidden ?? false
            }))
        };
    }

    return await prisma.problem.update({
        where: { id },
        data: updateData,
        include: { testCases: true }
    });
}

export const deleteProblem = async (userId: string, id: string) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(403, "Only verified companies can delete problems");

    const problem = await prisma.problem.findUnique({
        where: { id },
        include: { contest: true }
    });
    if (!problem) throw new ApiError(404, "Problem not found");

    if (problem.contest && problem.contest.companyId !== company.id) {
        throw new ApiError(403, "You can't delete problems from someone else's contest");
    }

    await prisma.problem.delete({ where: { id } });
    return { success: true };
}

export const createSubmission = async (userId: string, problemId: string, data: CreateSubmissionInput) => {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw new ApiError(403, "Only students can submit code");

    const problem = await prisma.problem.findUnique({ 
        where: { id: problemId },
        include: { _count: { select: { testCases: true } } }
    });
    if (!problem) throw new ApiError(404, "Problem not found");

    // "Paused Functioning": We stub the execution and just save the pending submission record.
    return await prisma.submission.create({
        data: {
            studentId: student.id,
            problemId: problem.id,
            code: data.code,
            language: data.language,
            passed: 0,
            total: problem._count.testCases,
            status: "PENDING"
        }
    });
}

export const getSubmissions = async (userId: string, problemId: string) => {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw new ApiError(403, "Only students can fetch their submissions");

    return await prisma.submission.findMany({
        where: { 
            studentId: student.id,
            problemId
        },
        orderBy: { createdAt: 'desc' }
    });
}