import { z } from "zod";

const testCaseSchema = z.object({
    input: z.string().min(1, "Input Cannot be empty"),
    output: z.string().min(1, "Output cannot be empty").optional(),
    expectedOutput: z.string().min(1, "Expected output cannot be empty").optional(),
    isHidden: z.boolean().default(false)
}).refine(
    data => data.output || data.expectedOutput,
    { message: "Either output or expectedOutput must be provided" }
);

export const createProblemSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title must be at least 3 characters long"),
        description: z.string().min(10, "Description must be at least 10 characters long"),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
            message: "Difficulty must be EASY | MEDIUM | HARD"
        }),
        points: z.number().int().min(10).default(100),
        constraints: z.string().optional(),
        contestId: z.string().uuid().optional(),
        testCases: z.array(testCaseSchema).min(1, "You must provide atleast one test case")
    })
})

export const updateProblemSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title must be at least 3 characters long").optional(),
        description: z.string().min(10, "Description must be at least 10 characters long").optional(),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
        topic: z.string().optional(),
        points: z.number().int().min(10).optional(),
        constraints: z.string().optional(),
        testCases: z.array(testCaseSchema).optional()
    })
})

export const createSubmissionSchema = z.object({
    body: z.object({
        code: z.string().min(1, "Code cannot be empty"),
        language: z.string().min(1, "Language must be specified"),
    })
})

export type CreateProblemInput = z.infer<typeof createProblemSchema>["body"];
export type UpdateProblemInput = z.infer<typeof updateProblemSchema>["body"];
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>["body"];