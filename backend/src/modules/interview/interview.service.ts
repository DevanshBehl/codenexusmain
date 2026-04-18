import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { ScheduleInterviewInput, UpdateInterviewInput, SaveRecordingInput } from "./interview.schema.js";
import { getRecordingStatus, stopRecording } from "../../lib/recording.manager.js";
import fs from "fs";

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
            recording: true,
            interviewRecording: true
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
            recording: true,
            interviewRecording: true
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
    const interview = await prisma.interview.findUnique({ where: { id: interviewId }, include: { recruiter: true, recording: true, interviewRecording: true } });
    if (!interview) throw new ApiError(404, "Interview not found");

    if (userRole === "RECRUITER") {
        const recruiter = await prisma.recruiter.findUnique({ where: { userId } });
        if (!recruiter || recruiter.id !== interview.recruiterId) {
            throw new ApiError(403, "Not authorized");
        }
    }

    // Stop recording if still active
    await stopRecording(interviewId);

    const serverRecording = await prisma.interviewRecording.findUnique({
        where: { interview_id: interviewId },
    });

    const updateData: any = {
        rating: data.rating ?? interview.recording?.rating ?? 0.0,
        verdict: data.verdict ?? interview.recording?.verdict ?? "PENDING",
        notes: data.notes ?? interview.recording?.notes,
    };

    if (data.videoUrl) {
        updateData.videoUrl = data.videoUrl;
    }

    if (data.durationStr) {
        updateData.durationStr = data.durationStr;
    }

    if (interview.recording) {
        return await prisma.recording.update({
            where: { interviewId },
            data: updateData,
        });
    } else {
        const createData: any = {
            interviewId,
            rating: data.rating ?? 0.0,
            verdict: data.verdict ?? "PENDING",
            notes: data.notes || null,
        };

        if (data.videoUrl) {
            createData.videoUrl = data.videoUrl;
        }

        if (data.durationStr) {
            createData.durationStr = data.durationStr;
        }

        return await prisma.recording.create({
            data: createData,
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

export const getServerRecordingStatus = async (userId: string, userRole: string, interviewId: string) => {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
            recruiter: { include: { user: true } },
            student: { include: { user: true } },
        },
    });

    if (!interview) throw new ApiError(404, "Interview not found");

    const isRecruiter = userRole === "RECRUITER" && interview.recruiter.userId === userId;
    const isCompanyAdmin = userRole === "COMPANY_ADMIN";
    const isStudent = userRole === "STUDENT" && interview.student.userId === userId;

    if (!isRecruiter && !isCompanyAdmin && !isStudent) {
        throw new ApiError(403, "Not authorized to access this recording");
    }

    if (isStudent) {
        throw new ApiError(403, "Students cannot access server recordings");
    }

    const status = await getRecordingStatus(interviewId);

    return {
        status: status.status,
        started_at: status.started_at,
        completed_at: status.completed_at,
        duration_seconds: status.duration_seconds,
        file_size_bytes: status.file_size_bytes,
    };
};

export const downloadServerRecording = async (userId: string, userRole: string, interviewId: string) => {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
            recruiter: { include: { user: true } },
            student: { include: { user: true } },
        },
    });

    if (!interview) throw new ApiError(404, "Interview not found");

    const isRecruiter = userRole === "RECRUITER" && interview.recruiter.userId === userId;
    const isCompanyAdmin = userRole === "COMPANY_ADMIN";

    if (!isRecruiter && !isCompanyAdmin) {
        throw new ApiError(403, "Only recruiter or company admin can download recordings");
    }

    const recording = await prisma.interviewRecording.findUnique({
        where: { interview_id: interviewId },
    });

    if (!recording) throw new ApiError(404, "Recording not found");
    if (recording.status !== "completed") throw new ApiError(400, "Recording not ready for download");
    if (!recording.file_path) throw new ApiError(404, "Recording file path not found");

    if (!fs.existsSync(recording.file_path)) {
        throw new ApiError(404, "Recording file not found on disk");
    }

    const fileName = `interview-${interviewId}-${new Date().toISOString().split('T')[0]}.mp4`;

    return {
        filePath: recording.file_path,
        fileName,
        fileSize: recording.file_size_bytes ? Number(recording.file_size_bytes) : undefined,
    };
};

export const getTimestamps = async (userId: string, role: string, interviewId: string) => {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: { student: true, recruiter: true },
    });
    if (!interview) throw new ApiError(404, "Interview not found");

    if (role === 'STUDENT' && interview.student.userId !== userId) {
        throw new ApiError(403, "Not authorized");
    }
    if (role === 'RECRUITER' && interview.recruiter.userId !== userId) {
        throw new ApiError(403, "Not authorized");
    }

    return prisma.recordingTimestamp.findMany({
        where: { interviewId },
        orderBy: { offsetMs: 'asc' },
    });
};

export const getMessages = async (userId: string, role: string, interviewId: string) => {
    // Check access
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
            student: true,
            recruiter: true
        }
    });

    if (!interview) throw new ApiError(404, "Interview not found");

    if (role === 'STUDENT' && interview.student.userId !== userId) {
        throw new ApiError(403, "You can only view chat for your own interviews");
    }

    if (role === 'RECRUITER' && interview.recruiter.userId !== userId) {
        throw new ApiError(403, "You can only view chat for your own interviews");
    }

    const messages = await prisma.interviewMessage.findMany({
        where: { interviewId },
        include: {
            sender: {
                select: {
                    cnid: true,
                    studentProfile: { select: { name: true } },
                    recruiterProfile: { select: { name: true } },
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    return messages.map(msg => {
        const senderName = msg.sender?.studentProfile?.name
            || msg.sender?.recruiterProfile?.name
            || msg.sender?.cnid
            || 'Unknown';
        return {
            id: msg.id,
            text: msg.content,
            senderName,
            timestamp: msg.createdAt
        };
    });
};
