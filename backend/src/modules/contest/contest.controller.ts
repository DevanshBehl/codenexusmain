import { Request, Response, NextFunction } from "express";
import * as contestService from "./contest.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export const createcontest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const contestData = req.body;
        const newContest = await contestService.createContest(userId as string, contestData);
        res.status(201).json(new ApiResponse(201, newContest, "Contest created successflly"));
    } catch (e) {
        next(e)
    }

}