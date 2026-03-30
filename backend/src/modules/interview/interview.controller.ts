import { Request, Response, NextFunction } from "express";
import * as interviewService from "./interview.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export const scheduleInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const interview = await interviewService.scheduleInterview(userId as string, req.body);
        res.status(201).json(new ApiResponse(201, interview, "Interview scheduled successfully"));
    } catch (e) {
        next(e);
    }
}

export const getInterviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const interviews = await interviewService.getInterviews(userId as string, role as string);
        res.status(200).json(new ApiResponse(200, interviews, "Interviews fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const getInterviewById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const interview = await interviewService.getInterviewById(req.params.id as string);
        res.status(200).json(new ApiResponse(200, interview, "Interview fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const updateInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const interview = await interviewService.updateInterview(userId as string, role as string, req.params.id as string, req.body);
        res.status(200).json(new ApiResponse(200, interview, "Interview updated successfully"));
    } catch (e) {
        next(e);
    }
}

export const deleteInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        await interviewService.deleteInterview(userId as string, role as string, req.params.id as string);
        res.status(200).json(new ApiResponse(200, null, "Interview deleted successfully"));
    } catch (e) {
        next(e);
    }
}

export const saveRecording = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const recording = await interviewService.saveRecording(userId as string, role as string, req.params.id as string, req.body);
        res.status(200).json(new ApiResponse(200, recording, "Recording saved successfully"));
    } catch (e) {
        next(e);
    }
}
