import { Request, Response, NextFunction } from "express";
import * as dashboardService from "./dashboard.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export const getStudentDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await dashboardService.getStudentDashboard(req.user!.id as string);
        res.status(200).json(new ApiResponse(200, data, "Student dashboard fetched"));
    } catch (e) {
        next(e);
    }
};

export const getCompanyDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await dashboardService.getCompanyDashboard(req.user!.id as string);
        res.status(200).json(new ApiResponse(200, data, "Company dashboard fetched"));
    } catch (e) {
        next(e);
    }
};

export const getUniversityDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await dashboardService.getUniversityDashboard(req.user!.id as string);
        res.status(200).json(new ApiResponse(200, data, "University dashboard fetched"));
    } catch (e) {
        next(e);
    }
};

export const getRecruiterDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await dashboardService.getRecruiterDashboard(req.user!.id as string);
        res.status(200).json(new ApiResponse(200, data, "Recruiter dashboard fetched"));
    } catch (e) {
        next(e);
    }
};
