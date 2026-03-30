import { RequestHandler, Router } from "express";
import * as applicationController from "./application.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { applyJobSchema, updateApplicationStatusSchema } from "./application.schema.js";

const router = Router();

router.use(authenticate as RequestHandler);

// View applications (all parties can see their relevant apps)
router.get("/", applicationController.getApplications as RequestHandler);
router.get("/:id", applicationController.getApplicationById as RequestHandler);

// Student applying
router.post("/",
    authorize(["STUDENT"]) as RequestHandler,
    validate(applyJobSchema) as RequestHandler,
    applicationController.applyJob as RequestHandler
);

// Recruiter/Admin updating status
router.put("/:id/status",
    authorize(["RECRUITER", "COMPANY_ADMIN"]) as RequestHandler,
    validate(updateApplicationStatusSchema) as RequestHandler,
    applicationController.updateApplicationStatus as RequestHandler
);

export default router;
