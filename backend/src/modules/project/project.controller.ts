import { Request, Response, NextFunction } from "express";
import * as projectService from "./project.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const project = await projectService.createProject(userId as string, req.body);
        res.status(201).json(new ApiResponse(201, project, "Project created successfully"));
    } catch (e) {
        next(e);
    }
}

export const getMyProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const projects = await projectService.getMyProjects(userId as string);
        res.status(200).json(new ApiResponse(200, projects, "Projects fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        await projectService.deleteProject(userId as string, req.params.id as string);
        res.status(200).json(new ApiResponse(200, null, "Project deleted successfully"));
    } catch (e) {
        next(e);
    }
}

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const project = await projectService.updateProject(userId as string, req.params.id as string, req.body);
        res.status(200).json(new ApiResponse(200, project, "Project updated successfully"));
    } catch (e) {
        next(e);
    }
}
