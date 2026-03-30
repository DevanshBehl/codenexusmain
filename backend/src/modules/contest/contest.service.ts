import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateContestInput } from "./contest.schema.js";

export const createContest = async (userId: string, data: CreateContestInput) => {
    const company = await prisma.company.findUnique({
        where: {
            userId: userId
        }
    })
    if (!company) {
        throw new ApiError(403, "You must create a company profile before creating a contest");
    }
    return await prisma.contest.create({
        data: {
            companyId: company.id,
            title: data.title,
            description: data.description ?? null,
            date: new Date(data.date),
            durationMins: data.durationMins,
        }
    })
}

export const getContests = async () => {
    return await prisma.contest.findMany({
        include: {
            company: {
                select: {
                    name: true,
                    industry: true
                }
            },
            _count: {
                select: { problems: true }
            }
        },
        orderBy: { date: 'desc' }
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
                    _count: { select: { testCases: true } }
                }
            }
        }
    });
    if (!contest) {
        throw new ApiError(404, "Contest not found");
    }
    return contest;
}