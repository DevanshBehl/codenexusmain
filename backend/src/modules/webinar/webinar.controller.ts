import { Request, Response, NextFunction } from "express";
import * as webinarService from "./webinar.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export const createWebinar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const webinar = await webinarService.createWebinar(userId as string, req.body);
        res.status(201).json(new ApiResponse(201, webinar, "Webinar scheduled successfully"));
    } catch (e) {
        next(e);
    }
}

export const getWebinars = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // If the user is authenticated, optionally filter by their company
        const companyUserId = req.user?.id as string | undefined;
        const webinars = await webinarService.getWebinars(companyUserId);
        res.status(200).json(new ApiResponse(200, webinars, "Webinars fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const getAllWebinars = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const webinars = await webinarService.getWebinars();
        res.status(200).json(new ApiResponse(200, webinars, "Webinars fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const getWebinarById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const webinar = await webinarService.getWebinarById(req.params.id as string);
        res.status(200).json(new ApiResponse(200, webinar, "Webinar fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const updateWebinar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const webinar = await webinarService.updateWebinar(userId as string, req.params.id as string, req.body);
        res.status(200).json(new ApiResponse(200, webinar, "Webinar updated successfully"));
    } catch (e) {
        next(e);
    }
}

export const deleteWebinar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        await webinarService.deleteWebinar(userId as string, req.params.id as string);
        res.status(200).json(new ApiResponse(200, null, "Webinar deleted successfully"));
    } catch (e) {
        next(e);
    }
}
