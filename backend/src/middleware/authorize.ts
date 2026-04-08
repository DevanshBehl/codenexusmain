import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError } from '../utils/api-error.js';

export const authorize = (allowedRoles: string[]): RequestHandler => {
    return (req, res, next) => {

        // Ensure the authenticate middleware ran first
        if (!req.user) {
            return next(new ApiError(401, 'Unauthorized: User not authenticated'));
        }

        const userRole = req.user.role as string;
        const isAllowed = allowedRoles.some(role => role === userRole);

        if (!isAllowed) {
            return next(new ApiError(403, 'Forbidden: You do not have permission to perform this action'));
        }

        next();
    };
};