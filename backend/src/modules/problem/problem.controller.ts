import { Request, Response, NextFunction } from "express";
import * as problemService from "./problem.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export const createProblem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const problem = await problemService.createProblem(userId as string, req.body);
        res.status(201).json(new ApiResponse(201, problem, "Problem created successfully"));
    } catch (e) {
        next(e);
    }
}

export const getProblems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { difficulty, page, limit } = req.query;
        const result = await problemService.getProblems(
            difficulty as string | undefined,
            page ? parseInt(page as string) : 1,
            limit ? parseInt(limit as string) : 20
        );
        res.status(200).json(new ApiResponse(200, result, "Problems fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const getProblemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const problem = await problemService.getProblemById(req.params.id as string);
        res.status(200).json(new ApiResponse(200, problem, "Problem fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const updateProblem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const problem = await problemService.updateProblem(userId as string, req.params.id as string, req.body);
        res.status(200).json(new ApiResponse(200, problem, "Problem updated successfully"));
    } catch (e) {
        next(e);
    }
}

export const deleteProblem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        await problemService.deleteProblem(userId as string, req.params.id as string);
        res.status(200).json(new ApiResponse(200, null, "Problem deleted successfully"));
    } catch (e) {
        next(e);
    }
}

export const submitProblem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const submission = await problemService.createSubmission(userId as string, req.params.id as string, req.body);
        res.status(201).json(new ApiResponse(201, submission, "Submission received successfully"));
    } catch (e) {
        next(e);
    }
}

export const getSubmissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const submissions = await problemService.getSubmissions(userId as string, req.params.id as string);
        res.status(200).json(new ApiResponse(200, submissions, "Submissions fetched successfully"));
    } catch (e) {
        next(e);
    }
}
