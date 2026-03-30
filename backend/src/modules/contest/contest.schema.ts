import { z } from "zod";

const testCaseSchema = z.object({
    input: z.string().min(1, "Input is required"),
    expectedOutput: z.string().min(1, "Expected output is required"),
});

const questionSchema = z.object({
    title: z.string().min(3, "Question title must be at least 3 characters"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
        message: "Difficulty must be EASY | MEDIUM | HARD"
    }),
    points: z.number().int().min(10).default(100),
    statement: z.string().min(10, "Problem statement must be at least 10 characters"),
    constraints: z.string().optional(),
    testCases: z.array(testCaseSchema).min(1, "At least one test case is required"),
});

export const createContestSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title must be at least 3 characters long"),
        description: z.string().optional(),
        scheduledDate: z.string().min(1, "Scheduled date is required"),
        durationMins: z.number().int().min(10, "Duration must be at least 10 minutes"),
        timeLimitMinutes: z.number().int().min(5).max(120).default(30),
        languages: z.array(z.string()).min(1, "At least one language is required"),
        questions: z.array(questionSchema).min(1, "At least one question is required"),
    })
});

export type CreateContestInput = z.infer<typeof createContestSchema>["body"];

export const updateContestSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title must be at least 3 characters long").optional(),
        description: z.string().optional(),
        scheduledDate: z.string().min(1, "Scheduled date is required").optional(),
        durationMins: z.number().int().min(10, "Duration must be at least 10 minutes").optional(),
        timeLimitMinutes: z.number().int().min(5).max(120).optional(),
        languages: z.array(z.string()).min(1, "At least one language is required").optional(),
        status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED"]).optional()
    })
});

export type UpdateContestInput = z.infer<typeof updateContestSchema>["body"];
