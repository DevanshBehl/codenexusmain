import { z } from "zod";

export const scheduleInterviewSchema = z.object({
    body: z.object({
        recruiterId: z.string().optional(),
        studentId: z.string().uuid("Invalid student ID"),
        role: z.string().min(1, "Role is required"),
        scheduledDate: z.string().min(1, "Scheduled date is required"),
        scheduledTime: z.string().min(1, "Scheduled time is required"),
        type: z.enum(["TECHNICAL", "HR", "SYSTEM_DESIGN"], {
            message: "Type must be TECHNICAL | HR | SYSTEM_DESIGN"
        })
    })
});

export const updateInterviewSchema = z.object({
    body: z.object({
        role: z.string().optional(),
        scheduledDate: z.string().optional(),
        scheduledTime: z.string().optional(),
        type: z.enum(["TECHNICAL", "HR", "SYSTEM_DESIGN"]).optional(),
        status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional()
    })
});

export const saveRecordingSchema = z.object({
    body: z.object({
        videoUrl: z.string().url("Must be a valid URL"),
        durationStr: z.string().min(1, "Duration string is required"),
        rating: z.number().min(0).max(5).optional(),
        verdict: z.enum(["SELECTED", "REJECTED", "PENDING"]).optional(),
        notes: z.string().optional()
    })
});

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>["body"];
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>["body"];
export type SaveRecordingInput = z.infer<typeof saveRecordingSchema>["body"];
