import { RequestHandler, Router } from "express";
import * as contestController from "./contest.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createContestSchema } from "./contest.schema.js";

const router = Router();

// Public routes - list and get contests
router.get("/", contestController.getContests as RequestHandler);
router.get("/:id", contestController.getContestById as RequestHandler);

// Protected routes - create contest (COMPANY_ADMIN only)
router.post("/",
    authenticate as RequestHandler,
    authorize(["COMPANY"]) as RequestHandler,
    validate(createContestSchema) as RequestHandler,
    contestController.createcontest as RequestHandler
);

export default router;