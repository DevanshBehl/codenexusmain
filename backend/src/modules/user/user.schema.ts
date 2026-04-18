import { z } from "zod";

export const createStudentProfileSchema = z.object({
    body: z.object({
        universityId: z.string().uuid("Invalid University ID"),
        name: z.string().min(1, "Name is required"),
        age: z.number().int().optional(),
        phone: z.string().optional(),
        branch: z.string().min(2, "Branch is required"),
        cgpa: z.number().min(0).max(10, "CGPA must be between 0 and 10"),
        specialization: z.string().optional(),
        gender: z.string().optional(),
        registrationNumber: z.string().optional(),
        codeNexusId: z.string().optional(),
        parentsName: z.string().optional(),
        parentContactNo: z.string().optional(),
        parentEmail: z.string().email().optional().or(z.literal("")),
        address: z.string().optional(),
        xSchool: z.string().optional(),
        xPercentage: z.string().optional(),
        xiiSchool: z.string().optional(),
        xiiPercentage: z.string().optional(),
        otherInfo: z.string().optional(),
    })
});

export const updateStudentProfileSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        age: z.number().int().optional(),
        phone: z.string().optional(),
        branch: z.string().min(2).optional(),
        cgpa: z.number().min(0).max(10).optional(),
        specialization: z.string().optional(),
        gender: z.string().optional(),
        registrationNumber: z.string().optional(),
        parentsName: z.string().optional(),
        parentContactNo: z.string().optional(),
        parentEmail: z.string().email().optional().or(z.literal("")),
        address: z.string().optional(),
        xSchool: z.string().optional(),
        xPercentage: z.string().optional(),
        xiiSchool: z.string().optional(),
        xiiPercentage: z.string().optional(),
        otherInfo: z.string().optional(),
        avatarUrl: z.string().optional(),
    })
});

export const createCompanyProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Company name is required'),
        description: z.string().optional(),
        industry: z.string().optional(),
    }),
});

export const createUniversityProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'University name is required'),
        location: z.string().min(2, 'Location is required'),
        tier: z.number().int().min(1).max(3).default(3),
    }),
});

export type CreateStudentInput = z.infer<typeof createStudentProfileSchema>['body'];
export type UpdateStudentInput = z.infer<typeof updateStudentProfileSchema>['body'];
export type CreateCompanyInput = z.infer<typeof createCompanyProfileSchema>['body'];
export type CreateUniversityInput = z.infer<typeof createUniversityProfileSchema>['body'];