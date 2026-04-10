import { z } from "zod";

export const createCaProblemSchema = z.object({
    body: z.object({
        title: z.string().min(1),
        description: z.string(),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
        tags: z.array(z.string()).optional(),
        constraints: z.string().optional(),
        inputFormat: z.string().optional(),
        outputFormat: z.string().optional(),
        timeLimitMs: z.number().optional(),
        memoryLimitMb: z.number().optional(),
        testCases: z.array(z.object({
            input: z.string(),
            expectedOutput: z.string(),
            isSample: z.boolean().optional(),
            orderIndex: z.number().optional()
        }))
    })
});

export const updateCaProblemSchema = z.object({
    body: z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
        tags: z.array(z.string()).optional(),
        constraints: z.string().optional(),
        inputFormat: z.string().optional(),
        outputFormat: z.string().optional(),
        timeLimitMs: z.number().optional(),
        memoryLimitMb: z.number().optional(),
        isPublished: z.boolean().optional(),
        testCases: z.array(z.object({
            input: z.string(),
            expectedOutput: z.string(),
            isSample: z.boolean().optional(),
            orderIndex: z.number().optional()
        })).optional()
    })
});

export const runCodeSchema = z.object({
    body: z.object({
        problemId: z.string().uuid(),
        language: z.string(),
        code: z.string(),
        customInput: z.string().optional()
    })
});

export const submitCodeSchema = z.object({
    body: z.object({
        problemId: z.string().uuid(),
        language: z.string(),
        code: z.string()
    })
});
