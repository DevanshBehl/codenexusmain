import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.js";
import { env } from "../config/env.js";

export const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let errors: any[] = [];
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    }
    res.status(statusCode).json({
        success: false,
        message,
        errors,
        stack: env.NODE_ENV === "development" ? err.stack : undefined
    })
}