import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { ScheduleInterviewInput, UpdateInterviewInput, SaveRecordingInput } from "./interview.schema.js";

export const scheduleInterview = async (userId: string, role: string, data: ScheduleInterviewInput) => {
    let recruiterId = "";

    if (role === "COMPANY_ADMIN") {
        if (!data.recruiterId) throw new ApiError(400, "Recruiter ID is required when scheduling as a company");
        const company = await prisma.company.findUnique({ where: { userId } });
        if (!company) throw new ApiError(403, "Company not found");

        const recruiter = await prisma.recruiter.findUnique({ where: { id: data.recruiterId } });
        if (!recruiter || recruiter.companyId !== company.id) {
            throw new ApiError(403, "Recruiter not found or does not belong to your company");
        }
        recruiterId = recruiter.id;
    } else if (role === "RECRUITER") {
        const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
        if (!recruiter) throw new ApiError(403, "Only recruiters can schedule interviews");
        recruiterId = recruiter.id;
    } else {
        throw new ApiError(403, "Not authorized to schedule interviews");
    }

    const scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}:00`);

    return await prisma.interview.create({
        data: {
            recruiterId,
            studentId: data.studentId,
            role: data.role,
            scheduledAt,
            type: data.type,
            status: "SCHEDULED"
        },
        include: {
            student: { select: { name: true, branch: true } }
        }
    });
}

export const getInterviews = async (userId: string, role: string) => {
    let where: any = {};
    if (role === "STUDENT") {
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) throw new ApiError(404, "Student profile not found");
        where.studentId = student.id;
    } else if (role === "RECRUITER" || role === "COMPANY_ADMIN") {
        const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
        if (!recruiter) {
            // Might be company admin checking globally
            const company = await prisma.company.findUnique({ where: { userId } });
            if (!company) throw new ApiError(403, "Not authorized");
            where.recruiter = { companyId: company.id };
        } else {
            where.recruiterId = recruiter.id;
        }
    }

    return await prisma.interview.findMany({
        where,
        include: {
            student: { select: { id: true, name: true, branch: true, cgpa: true } },
            recruiter: { select: { name: true, company: { select: { name: true } } } },
            recording: true
        },
        orderBy: { scheduledAt: 'desc' }
    });
}

export const getInterviewById = async (id: string) => {
    const interview = await prisma.interview.findUnique({
        where: { id },
        include: {
            student: { select: { id: true, name: true, branch: true, cgpa: true } },
            recruiter: { select: { name: true, company: { select: { name: true } } } },
            recording: true
        }
    });
    if (!interview) throw new ApiError(404, "Interview not found");
    return interview;
}

export const updateInterview = async (userId: string, userRole: string, id: string, data: UpdateInterviewInput) => {
    const interview = await prisma.interview.findUnique({ where: { id }, include: { recruiter: true } });
    if (!interview) throw new ApiError(404, "Interview not found");

    if (userRole === "RECRUITER") {
        const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
        if (!recruiter || recruiter.id !== interview.recruiterId) {
            throw new ApiError(403, "You can only update your own interviews");
        }
    }

    const updateData: any = {};
    if (data.role) updateData.role = data.role;
    if (data.type) updateData.type = data.type;
    if (data.status) updateData.status = data.status;

    if (data.scheduledDate || data.scheduledTime) {
        if (data.scheduledDate && data.scheduledTime) {
            updateData.scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}:00`);
        }
    }

    return await prisma.interview.update({
        where: { id },
        data: updateData
    });
}

export const deleteInterview = async (userId: string, userRole: string, id: string) => {
    const interview = await prisma.interview.findUnique({ where: { id }, include: { recruiter: true } });
    if (!interview) throw new ApiError(404, "Interview not found");

    if (userRole === "RECRUITER") {
        const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
        if (!recruiter || recruiter.id !== interview.recruiterId) {
            throw new ApiError(403, "You can only delete your own interviews");
        }
    }

    await prisma.interview.delete({ where: { id } });
    return { success: true };
}

export const saveRecording = async (userId: string, userRole: string, interviewId: string, data: SaveRecordingInput) => {
    const interview = await prisma.interview.findUnique({ where: { id: interviewId }, include: { recruiter: true, recording: true } });
    if (!interview) throw new ApiError(404, "Interview not found");

    if (userRole === "RECRUITER") {
        const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
        if (!recruiter || recruiter.id !== interview.recruiterId) {
            throw new ApiError(403, "Not authorized");
        }
    }

    if (interview.recording) {
        return await prisma.recording.update({
            where: { interviewId },
            data: {
                videoUrl: data.videoUrl,
                durationStr: data.durationStr,
                rating: data.rating ?? interview.recording.rating,
                verdict: data.verdict ?? interview.recording.verdict,
                notes: data.notes ?? interview.recording.notes
            }
        });
    } else {
        return await prisma.recording.create({
            data: {
                interviewId,
                videoUrl: data.videoUrl,
                durationStr: data.durationStr,
                rating: data.rating ?? 0.0,
                verdict: data.verdict ?? "PENDING",
                notes: data.notes || null
            }
        });
    }
}

export const joinInterview = async (userId: string, userRole: string, id: string) => {
    const interview = await prisma.interview.findUnique({
        where: { id },
        include: {
            student: { select: { userId: true, name: true } },
            recruiter: { select: { userId: true, name: true } },
        }
    });

    if (!interview) throw new ApiError(404, "Interview not found");

    if (userRole === "STUDENT" && interview.student.userId !== userId) {
        throw new ApiError(403, "You are not authorized to join this interview");
    }

    if (userRole === "RECRUITER" && interview.recruiter.userId !== userId) {
        throw new ApiError(403, "You are not authorized to join this interview");
    }

    return { success: true };
}

export const getStudentsForScheduling = async (userId: string, role: string) => {
    if (role !== "COMPANY_ADMIN" && role !== "RECRUITER") {
        throw new ApiError(403, "Not authorized to access students");
    }

    // For simplicity, returning all available students
    return await prisma.student.findMany({
        where: { status: "AVAILABLE" },
        select: {
            id: true,
            name: true,
            branch: true,
            cgpa: true,
            university: { select: { name: true } }
        }
    });
}

export const getCompanyRecruiters = async (userId: string) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(404, "Company not found");

    return await prisma.recruiter.findMany({
        where: { companyId: company.id },
        select: {
            id: true,
            name: true,
            user: {
                select: { email: true }
            }
        }
    });
}
