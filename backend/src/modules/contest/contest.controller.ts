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