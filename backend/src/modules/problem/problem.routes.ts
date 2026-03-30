import { RequestHandler, Router } from "express";
import * as problemController from "./problem.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createProblemSchema } from "./problem.schema.js";

const router = Router();

// Public routes - list and get problems
router.get("/", problemController.getProblems as RequestHandler);
router.get("/:id", problemController.getProblemById as RequestHandler);

// Protected routes - create problem (COMPANY_ADMIN only)
router.post("/",
    authenticate as RequestHandler,
    authorize(["COMPANY"]) as RequestHandler,
    validate(createProblemSchema) as RequestHandler,
    problemController.createProblem as RequestHandler
);

export default router;
