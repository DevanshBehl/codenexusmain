import { RequestHandler, Router } from "express";
import * as contestController from "./contest.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createContestSchema, updateContestSchema } from "./contest.schema.js";

const router = Router();

// Public routes - list and get contests
router.get("/", contestController.getContests as RequestHandler);
router.get("/:id", contestController.getContestById as RequestHandler);

// Protected routes - register for contest (STUDENT only)
router.post("/:id/register",
    authenticate as RequestHandler,
    authorize(["STUDENT"]) as RequestHandler,
    contestController.registerStudent as RequestHandler
);

router.get("/:id/registrations",
    authenticate as RequestHandler,
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    contestController.getRegistrations as RequestHandler
);

router.get("/:id/leaderboard", contestController.getContestLeaderboard as RequestHandler);

router.get("/:id/percentile",
    authenticate as RequestHandler,
    authorize(["STUDENT"]) as RequestHandler,
    contestController.getMyPercentile as RequestHandler
);

router.get("/:id/percentile-leaderboard",
    contestController.getPercentileLeaderboard as RequestHandler
);

// Protected routes - create contest (COMPANY_ADMIN only)
router.post("/",
    authenticate as RequestHandler,
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    validate(createContestSchema) as RequestHandler,
    contestController.createcontest as RequestHandler
);

router.put("/:id",
    authenticate as RequestHandler,
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    validate(updateContestSchema) as RequestHandler,
    contestController.updateContest as RequestHandler
);

router.delete("/:id",
    authenticate as RequestHandler,
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    contestController.deleteContest as RequestHandler
);

export default router;