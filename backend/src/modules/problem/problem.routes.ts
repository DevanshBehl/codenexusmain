import { RequestHandler, Router } from "express";
import * as problemController from "./problem.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createProblemSchema, updateProblemSchema, createSubmissionSchema } from "./problem.schema.js";

const router = Router();

// Public routes - list and get problems
router.get("/", problemController.getProblems as RequestHandler);
router.get("/:id", problemController.getProblemById as RequestHandler);

// Protected routes - create problem (COMPANY_ADMIN only)
router.post("/",
    authenticate as RequestHandler,
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    validate(createProblemSchema) as RequestHandler,
    problemController.createProblem as RequestHandler
);

router.put("/:id",
    authenticate as RequestHandler,
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    validate(updateProblemSchema) as RequestHandler,
    problemController.updateProblem as RequestHandler
);

router.delete("/:id",
    authenticate as RequestHandler,
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    problemController.deleteProblem as RequestHandler
);

// Submission routes (STUDENT only)
router.post("/:id/submissions",
    authenticate as RequestHandler,
    authorize(["STUDENT"]) as RequestHandler,
    validate(createSubmissionSchema) as RequestHandler,
    problemController.submitProblem as RequestHandler
);

router.get("/:id/submissions",
    authenticate as RequestHandler,
    authorize(["STUDENT"]) as RequestHandler,
    problemController.getSubmissions as RequestHandler
);

export default router;
