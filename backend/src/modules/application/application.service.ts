import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { ApplyJobInput, UpdateApplicationStatusInput } from "./application.schema.js";

export const applyJob = async (userId: string, data: ApplyJobInput) => {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw new ApiError(403, "Only students can apply");

    // Check if company exists
    const company = await prisma.company.findUnique({ where: { id: data.companyId } });
    if (!company) throw new ApiError(404, "Company not found");

    // Check if already applied
    const existing = await prisma.jobApplication.findFirst({
        where: { studentId: student.id, companyId: company.id }
    });
    if (existing) throw new ApiError(400, "You have already applied to this company");

    return await prisma.jobApplication.create({
        data: {
            studentId: student.id,
            companyId: company.id,
            status: "APPLIED"
        }
    });
}

export const getApplications = async (userId: string, role: string) => {
    let where: any = {};

    if (role === "STUDENT") {
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) throw new ApiError(404, "Student profile not found");
        where.studentId = student.id;
    } else if (role === "COMPANY_ADMIN") {
        const company = await prisma.company.findUnique({ where: { userId } });
        if (!company) throw new ApiError(403, "Not authorized");
        where.companyId = company.id;
    } else if (role === "RECRUITER") {
        const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
        if (!recruiter) throw new ApiError(403, "Not authorized");
        where.companyId = recruiter.companyId;
    }

    return await prisma.jobApplication.findMany({
        where,
        include: {
            student: { select: { id: true, name: true, branch: true, cgpa: true } },
            company: { select: { id: true, name: true, industry: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export const getApplicationById = async (userId: string, role: string, id: string) => {
    const application = await prisma.jobApplication.findUnique({
        where: { id },
        include: {
            student: { select: { id: true, name: true, branch: true, cgpa: true } },
            company: { select: { id: true, name: true, industry: true } }
        }
    });
    if (!application) throw new ApiError(404, "Application not found");

    if (role === "STUDENT" && application.student.name /* Need proper auth check instead of proxy */) {
        // student checking their own logic
    }
    return application;
}

export const updateApplicationStatus = async (userId: string, role: string, id: string, data: UpdateApplicationStatusInput) => {
    const application = await prisma.jobApplication.findUnique({ where: { id } });
    if (!application) throw new ApiError(404, "Application not found");

    if (role === "COMPANY_ADMIN") {
        const company = await prisma.company.findUnique({ where: { userId } });
        if (!company || application.companyId !== company.id) throw new ApiError(403, "Not authorized");
    } else if (role === "RECRUITER") {
        const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
        if (!recruiter || application.companyId !== recruiter.companyId) throw new ApiError(403, "Not authorized");
    } else {
        throw new ApiError(403, "Only recruiters and company admins can update status");
    }

    return await prisma.jobApplication.update({
        where: { id },
        data: { status: data.status }
    });
}
