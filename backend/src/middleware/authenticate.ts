import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

interface JwtPayload {
    id: string;
    role: string;
    cnid?: string;
}

export const authenticate: RequestHandler = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new ApiError(401, 'Unauthorized: Missing or invalid token');
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token as string, env.JWT_SECRET as string) as JwtPayload;

        req.user = {
            id: decoded.id as string,
            role: String(decoded.role),
            cnid: decoded.cnid as string,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(new ApiError(401, 'Unauthorized: Token has expired'));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError(401, 'Unauthorized: Invalid token'));
        } else {
            next(error);
        }
    }
};