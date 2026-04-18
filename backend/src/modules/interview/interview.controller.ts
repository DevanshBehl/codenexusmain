import { Request, Response, NextFunction } from "express";
import * as interviewService from "./interview.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export const scheduleInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const interview = await interviewService.scheduleInterview(userId as string, role as string, req.body);
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

export const joinInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const result = await interviewService.joinInterview(userId as string, role as string, req.params.id as string);
        res.status(200).json(new ApiResponse(200, result, "Interview joined successfully"));
    } catch (e) {
        next(e);
    }
}

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const students = await interviewService.getStudentsForScheduling(userId as string, role as string);
        res.status(200).json(new ApiResponse(200, students, "Students fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const getCompanyRecruiters = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const recruiters = await interviewService.getCompanyRecruiters(userId as string);
        res.status(200).json(new ApiResponse(200, recruiters, "Recruiters fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const getServerRecording = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const status = await interviewService.getServerRecordingStatus(userId as string, role as string, req.params.id as string);
        res.status(200).json(new ApiResponse(200, status, "Recording status fetched"));
    } catch (e) {
        next(e);
    }
}

export const downloadServerRecording = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const download = req.query.download !== 'false';
        const result = await interviewService.downloadServerRecording(userId as string, role as string, req.params.id as string);

        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', download ? `attachment; filename="${result.fileName}"` : `inline; filename="${result.fileName}"`);
        if (result.fileSize) {
            res.setHeader('Content-Length', result.fileSize);
        }

        res.download(result.filePath, result.fileName, (err) => {
            if (err && !res.headersSent) {
                next(err);
            }
        });
    } catch (e) {
        next(e);
    }
}

export const getTimestamps = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const timestamps = await interviewService.getTimestamps(userId as string, role as string, req.params.id as string);
        res.status(200).json(new ApiResponse(200, timestamps, "Timestamps fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const messages = await interviewService.getMessages(userId as string, role as string, req.params.id as string);
        res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));
    } catch (e) {
        next(e);
    }
}
