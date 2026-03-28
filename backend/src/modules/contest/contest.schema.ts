import { z } from "zod";
export const createContestSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title must be 3 characters long"),
        description: z.string().min(10, "Description must be 10 characters long"),
        startTime: z.string().datetime({ message: "Invalid date-time string" }),
        date: z.string().datetime(),
        durationMins: z.number().int().min(10, 'Duration must be at least 10 minutes')
    })
})
export type CreateContestInput = z.infer<typeof createContestSchema>["body"]
