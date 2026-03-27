import { Request, response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { Role } from "../generated/prisma/enums.js";
export const authorize = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized : User not authenticated"))
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new ApiError(403, "Forbidden : You do not have permission to perform this action"));
        }

        next();
    }
}