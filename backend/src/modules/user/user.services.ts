import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateCompanyInput, CreateStudentInput, CreateUniversityInput } from "./user.schema.js";

export const getMyProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            studentProfile: true,
            universityProfile: true,
            companyProfile: true,
            recruiterProfile: true
        }
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    // Return user with the relevant profile attached
    const profile = user.studentProfile || user.universityProfile || user.companyProfile || user.recruiterProfile || null;
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile
    };
}

export const createStudentProfile = async (userId: string, data: CreateStudentInput) => {
    // Check if a student profile already exists for this user
    const existingProfile = await prisma.student.findUnique({
        where: { userId }
    });
    if (existingProfile) {
        throw new ApiError(400, "Student profile already exists");
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

export const updateStudentProfile = async (userId: string, data: Partial<CreateStudentInput>) => {
    const existingProfile = await prisma.student.findUnique({
        where: { userId }
    });
    if (!existingProfile) {
        throw new ApiError(404, "Student profile not found. Create one first.");
    }
    return await prisma.student.update({
        where: { userId },
        data: {
            name: data.name ?? undefined,
            branch: data.branch ?? undefined,
            cgpa: data.cgpa ?? undefined,
            specialization: data.specialization ?? undefined,
            gender: data.gender ?? undefined
        }
    });
}

export const createCompanyProfile = async (userId: string, data: CreateCompanyInput) => {
    const existingProfile = await prisma.company.findUnique({
        where: { userId }
    });
    if (existingProfile) {
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
    const existingProfile = await prisma.university.findUnique({
        where: { userId }
    });
    if (existingProfile) {
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