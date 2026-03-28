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
        throw new ApiError(403, "Only Verified Comapnies can create problem");
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
        if (contest.id !== company.id) {
            throw new ApiError(403, "You can't add problem in someone else contest");
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