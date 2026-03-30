import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateCompanyInput, CreateStudentInput, CreateUniversityInput, UpdateStudentInput } from "./user.schema.js";

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
            age: data.age ?? null,
            phone: data.phone ?? null,
            branch: data.branch,
            cgpa: data.cgpa,
            specialization: data.specialization ?? null,
            gender: data.gender ?? null,
            registrationNumber: data.registrationNumber ?? null,
            codeNexusId: data.codeNexusId ?? null,
            parentsName: data.parentsName ?? null,
            parentContactNo: data.parentContactNo ?? null,
            parentEmail: data.parentEmail ?? null,
            address: data.address ?? null,
            xSchool: data.xSchool ?? null,
            xPercentage: data.xPercentage ?? null,
            xiiSchool: data.xiiSchool ?? null,
            xiiPercentage: data.xiiPercentage ?? null,
            otherInfo: data.otherInfo ?? null,
        }
    });
}

export const updateStudentProfile = async (userId: string, data: UpdateStudentInput) => {
    const existingProfile = await prisma.student.findUnique({
        where: { userId }
    });
    if (!existingProfile) {
        throw new ApiError(404, "Student profile not found. Create one first.");
    }

    // Build update data, only including fields that are defined (for exactOptionalPropertyTypes)
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.branch !== undefined) updateData.branch = data.branch;
    if (data.cgpa !== undefined) updateData.cgpa = data.cgpa;
    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNumber;
    if (data.parentsName !== undefined) updateData.parentsName = data.parentsName;
    if (data.parentContactNo !== undefined) updateData.parentContactNo = data.parentContactNo;
    if (data.parentEmail !== undefined) updateData.parentEmail = data.parentEmail;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.xSchool !== undefined) updateData.xSchool = data.xSchool;
    if (data.xPercentage !== undefined) updateData.xPercentage = data.xPercentage;
    if (data.xiiSchool !== undefined) updateData.xiiSchool = data.xiiSchool;
    if (data.xiiPercentage !== undefined) updateData.xiiPercentage = data.xiiPercentage;
    if (data.otherInfo !== undefined) updateData.otherInfo = data.otherInfo;

    return await prisma.student.update({
        where: { userId },
        data: updateData
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

export const getUniversities = async () => {
    return await prisma.university.findMany({
        select: {
            id: true,
            name: true,
        }
    });
}