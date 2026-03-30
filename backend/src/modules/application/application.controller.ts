import { Request, Response, NextFunction } from "express";
import * as applicationService from "./application.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export const applyJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const application = await applicationService.applyJob(userId as string, req.body);
        res.status(201).json(new ApiResponse(201, application, "Application submitted successfully"));
    } catch (e) {
        next(e);
    }
}

export const getApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const applications = await applicationService.getApplications(userId as string, role as string);
        res.status(200).json(new ApiResponse(200, applications, "Applications fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const getApplicationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const application = await applicationService.getApplicationById(userId as string, role as string, req.params.id as string);
        res.status(200).json(new ApiResponse(200, application, "Application fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const application = await applicationService.updateApplicationStatus(userId as string, role as string, req.params.id as string, req.body);
        res.status(200).json(new ApiResponse(200, application, "Application status updated successfully"));
    } catch (e) {
        next(e);
    }
}
