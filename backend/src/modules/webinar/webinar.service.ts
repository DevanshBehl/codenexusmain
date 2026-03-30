import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateWebinarInput, UpdateWebinarInput } from "./webinar.schema.js";

export const createWebinar = async (userId: string, data: CreateWebinarInput) => {
    const company = await prisma.company.findUnique({
        where: { userId }
    });
    if (!company) {
        throw new ApiError(403, "You must create a company profile before scheduling a webinar");
    }

    // Combine date + time into a single DateTime
    const scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}:00`);

    return await prisma.webinar.create({
        data: {
            companyId: company.id,
            title: data.title,
            agenda: data.agenda,
            scheduledAt,
            durationMins: data.durationMins ?? 60,
            meetingLink: data.meetingLink,
            targetUniversities: {
                create: data.targetUniversityIds.map(uniId => ({
                    universityId: uniId,
                }))
            }
        },
        include: {
            targetUniversities: {
                include: {
                    university: { select: { id: true, name: true, location: true } }
                }
            }
        }
    });
}

export const getWebinars = async (companyUserId?: string) => {
    const where: any = {};
    if (companyUserId) {
        const company = await prisma.company.findUnique({ where: { userId: companyUserId } });
        if (company) {
            where.companyId = company.id;
        }
    }

    return await prisma.webinar.findMany({
        where,
        include: {
            company: { select: { name: true, industry: true } },
            targetUniversities: {
                include: {
                    university: { select: { id: true, name: true } }
                }
            }
        },
        orderBy: { scheduledAt: 'desc' }
    });
}

export const getWebinarById = async (id: string) => {
    const webinar = await prisma.webinar.findUnique({
        where: { id },
        include: {
            company: { select: { name: true, industry: true } },
            targetUniversities: {
                include: {
                    university: { select: { id: true, name: true, location: true } }
                }
            }
        }
    });
    if (!webinar) {
        throw new ApiError(404, "Webinar not found");
    }
    return webinar;
}

export const updateWebinar = async (userId: string, id: string, data: UpdateWebinarInput) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(403, "Only verified companies can modify webinars");

    const webinar = await prisma.webinar.findUnique({ where: { id } });
    if (!webinar) throw new ApiError(404, "Webinar not found");

    if (webinar.companyId !== company.id) throw new ApiError(403, "You can't modify someone else's webinar");

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.agenda !== undefined) updateData.agenda = data.agenda;
    if (data.durationMins !== undefined) updateData.durationMins = data.durationMins;
    if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.scheduledDate || data.scheduledTime) {
        // Find existing date/time pieces if only one is updated to reconstruct
        // For simplicity, we assume either both are updated, or if only one is provided we skip the reconstruction for this stub unless both are provided
        if (data.scheduledDate && data.scheduledTime) {
            updateData.scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}:00`);
        }
    }

    if (data.targetUniversityIds) {
        updateData.targetUniversities = {
            deleteMany: {},
            create: data.targetUniversityIds.map(uniId => ({
                universityId: uniId,
            }))
        };
    }

    return await prisma.webinar.update({
        where: { id },
        data: updateData,
        include: { targetUniversities: true }
    });
}

export const deleteWebinar = async (userId: string, id: string) => {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new ApiError(403, "Only verified companies can delete webinars");

    const webinar = await prisma.webinar.findUnique({ where: { id } });
    if (!webinar) throw new ApiError(404, "Webinar not found");

    if (webinar.companyId !== company.id) throw new ApiError(403, "You can't delete someone else's webinar");

    await prisma.webinar.delete({ where: { id } });
    return { success: true };
}
