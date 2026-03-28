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
            title: data.title ?? null,
            description: data.description,
            date: new Date(data.date),
            durationMins: data.durationMins,

        }
    })
}