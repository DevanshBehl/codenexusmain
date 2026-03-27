import { Request, response, NextFunction } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";
import { Role } from "../generated/prisma/enums.js";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new ApiError(401, "Unauthorized : Missing or invalid token")
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token as string, env.JWT_SECRET as string) as jwt.JwtPayload;
        req.user = {
            id: decoded.id as string,
            role: decoded.role as Role
        }
        next();
    } catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
            next(new ApiError(401, "Unauthorized: token expired"));
        } else if (e instanceof JsonWebTokenError) {
            next(new ApiError(401, "Unauthorized token"));
        } else {
            next(e);
        }
    }
};