import { z } from "zod";

export const applyJobSchema = z.object({
    body: z.object({
        companyId: z.string().uuid("Invalid company ID")
    })
});

export const updateApplicationStatusSchema = z.object({
    body: z.object({
        status: z.enum(["APPLIED", "SHORTLISTED", "INTERVIEWED", "SELECTED", "REJECTED"], {
            message: "Invalid status state"
        })
    })
});

export type ApplyJobInput = z.infer<typeof applyJobSchema>["body"];
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>["body"];
