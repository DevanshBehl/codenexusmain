import { Request, Response, NextFunction } from "express";
import * as userService from "./user.services.js";
import { ApiResponse } from "../../utils/api-response.js";
import { NestedBoolFilter } from "../../generated/prisma/commonInputTypes.js";

export const setupStudentProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profile = await userService.createStudentProfile(req.user!.id as string, req.body);
        res.status(200).json(new ApiResponse(200, profile, "Profile created suucessfully"))
    } catch (e) {
        next(e);
    }
}

export const setupCompanyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profile = await userService.createCompanyProfile(req.user!.id as string, req.body);
        res.status(200).json(new ApiResponse(200, profile, "Profile created successfully"));
    } catch (e) {
        next(e)
    }
}

export const setupUniversityProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profile = await userService.createUniversityProfile(req.user!.id as string, req.body);
        res.status(200).json(new ApiResponse(200, profile, "Profile created successfully"));
    } catch (e) {
        next(e)
    }
}