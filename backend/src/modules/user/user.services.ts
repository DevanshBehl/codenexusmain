import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateCompanyInput, CreateStudentInput, CreateUniversityInput } from "./user.schema.js";

export const createStudentProfile = async (userId: string, data: CreateStudentInput) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    if (existingUser) {
        throw new ApiError(400, "Student profile already exists")
    }
    return await prisma.student.create({
        data: {
            userId: userId,
            universityId: data.universityId,
            name: data.name,
            branch: data.branch,
            cgpa: data.cgpa,
            specialization: data.specialization ?? null,
            gender: data.gender ?? null
        }
    });
}
export const createCompanyProfile = async (userId: string, data: CreateCompanyInput) => {
    const existingUser = await prisma.user.findUnique({
        where: { id: userId }
    })
    if (existingUser) {
        throw new ApiError(400, "Company profile already exists");
    }
    return await prisma.company.create({
        data: {
            userId: userId,
            name: data.name,
            description: data.description ?? null,
            industry: data.industry ?? null
        }
    })
}

export const createUniversityProfile = async (userId: string, data: CreateUniversityInput) => {
    const existingUser = await prisma.user.findUnique({
        where: { id: userId }
    })
    if (existingUser) {
        throw new ApiError(400, "University profile already exists");
    }
    return await prisma.university.create({
        data: {
            userId: userId,
            name: data.name,
            location: data.location,
            tier: data.tier
        }
    })
} 