import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateProjectInput, UpdateProjectInput } from "./project.schema.js";

export const createProject = async (userId: string, data: CreateProjectInput) => {
    const student = await prisma.student.findUnique({
        where: { userId }
    });
    if (!student) {
        throw new ApiError(403, "You must create a student profile before adding projects");
    }

    // Limit to 2 projects
    const existingCount = await prisma.project.count({
        where: { studentId: student.id }
    });
    if (existingCount >= 2) {
        throw new ApiError(400, "Maximum of 2 projects allowed");
    }

    return await prisma.project.create({
        data: {
            studentId: student.id,
            title: data.title,
            description: data.description,
            techStack: data.techStack,
            githubLink: data.githubLink || null,
            liveLink: data.liveLink || null,
        }
    });
}

export const getMyProjects = async (userId: string) => {
    const student = await prisma.student.findUnique({
        where: { userId }
    });
    if (!student) {
        throw new ApiError(404, "Student profile not found");
    }

    return await prisma.project.findMany({
        where: { studentId: student.id },
        orderBy: { id: 'asc' }
    });
}

export const deleteProject = async (userId: string, projectId: string) => {
    const student = await prisma.student.findUnique({
        where: { userId }
    });
    if (!student) {
        throw new ApiError(404, "Student profile not found");
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    if (project.studentId !== student.id) {
        throw new ApiError(403, "You can only delete your own projects");
    }

    return await prisma.project.delete({
        where: { id: projectId }
    });
}

export const updateProject = async (userId: string, projectId: string, data: UpdateProjectInput) => {
    const student = await prisma.student.findUnique({
        where: { userId }
    });
    if (!student) {
        throw new ApiError(404, "Student profile not found");
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    if (project.studentId !== student.id) {
        throw new ApiError(403, "You can only edit your own projects");
    }

    return await prisma.project.update({
        where: { id: projectId },
        data: {
            ...(data.title && { title: data.title }),
            ...(data.description && { description: data.description }),
            ...(data.techStack && { techStack: data.techStack }),
            ...(data.githubLink !== undefined && { githubLink: data.githubLink || null }),
            ...(data.liveLink !== undefined && { liveLink: data.liveLink || null }),
        }
    });
}
