import { z } from "zod";

export const createProjectSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        techStack: z.string().min(1, "Tech stack is required"),
        githubLink: z.string().url().optional().or(z.literal("")),
        liveLink: z.string().url().optional().or(z.literal("")),
    })
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>["body"];

export const updateProjectSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required").optional(),
        description: z.string().min(1, "Description is required").optional(),
        techStack: z.string().min(1, "Tech stack is required").optional(),
        githubLink: z.string().url().optional().or(z.literal("")),
        liveLink: z.string().url().optional().or(z.literal("")),
    })
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>["body"];
