import { z } from "zod";
export const createContestSchema = z.object({
    body: {
        title: z.string().min(3, "Title must be 3 characters long"),
        description: z.string().min(10, "Description must be 10 characters long"),
        startTime: z.string().datetime({ message: "Invalid date-time string" }),
        endTime: z.number().int().min(10, "End time must be 10 characters long"),

    }
})
export type createContestInput = z.infer<typeof createContestSchema>["body"]
