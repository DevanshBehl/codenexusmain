import { Request, Response, NextFunction } from "express";
import * as contestService from "./contest.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export const createcontest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const contestData = req.body;
        const newContest = await contestService.createContest(userId as string, contestData);
        res.status(201).json(new ApiResponse(201, newContest, "Contest created successfully"));
    } catch (e) {
        next(e)
    }
}

export const getContests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contests = await contestService.getContests();
        res.status(200).json(new ApiResponse(200, contests, "Contests fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const getContestById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contest = await contestService.getContestById(req.params.id as string);
        res.status(200).json(new ApiResponse(200, contest, "Contest fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const registerStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const reg = await contestService.registerStudent(userId as string, req.params.id as string);
        res.status(201).json(new ApiResponse(201, reg, "Registered for contest successfully"));
    } catch (e) {
        next(e);
    }
}

export const getRegistrations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const regs = await contestService.getRegistrations(req.params.id as string);
        res.status(200).json(new ApiResponse(200, regs, "Registrations fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const getContestLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCnid = req.user?.cnid;
        const leaderboard = await contestService.getContestLeaderboard(req.params.id as string, userCnid);
        res.status(200).json(new ApiResponse(200, leaderboard, "Contest leaderboard fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const updateContest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const contest = await contestService.updateContest(userId as string, req.params.id as string, req.body);
        res.status(200).json(new ApiResponse(200, contest, "Contest updated successfully"));
    } catch (e) {
        next(e);
    }
}

export const deleteContest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        await contestService.deleteContest(userId as string, req.params.id as string);
        res.status(200).json(new ApiResponse(200, null, "Contest deleted successfully"));
    } catch (e) {
        next(e);
    }
}