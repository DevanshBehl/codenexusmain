import { Request, Response, NextFunction } from "express";
import * as evaluationService from "./evaluation.service.js";
import { ApiResponse } from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";
import { submitEvaluationSchema } from "./evaluation.schema.js";
import { z } from "zod";

export const getCompanyEvaluations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.query;
        const data = await evaluationService.getCompanyEvaluations(
            req.user!.id as string,
            status as string | undefined
        );
        res.status(200).json(new ApiResponse(200, data, "Evaluations fetched"));
    } catch (e) {
        next(e);
    }
};

export const getEvaluationDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await evaluationService.getEvaluationDetail(
            req.user!.id as string,
            req.params.interviewId
        );
        res.status(200).json(new ApiResponse(200, data, "Evaluation detail fetched"));
    } catch (e) {
        next(e);
    }
};

export const submitEvaluation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = submitEvaluationSchema.safeParse(req.body);
        if (!result.success) {
            throw new ApiError(400, result.error.message);
        }
        const data = await evaluationService.submitEvaluation(
            req.user!.id as string,
            req.params.interviewId,
            result.data
        );
        res.status(200).json(new ApiResponse(200, data, "Evaluation submitted"));
    } catch (e) {
        next(e);
    }
};