import { RequestHandler, Router } from "express";
import * as interviewController from "./interview.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { scheduleInterviewSchema, updateInterviewSchema, saveRecordingSchema } from "./interview.schema.js";

const router = Router();

// All routes require authentication
router.use(authenticate as RequestHandler);

// View interviews (any authenticated user can see their own)
router.get("/", interviewController.getInterviews as RequestHandler);

// Get company recruiters (COMPANY_ADMIN only)
router.get("/company-recruiters",
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    interviewController.getCompanyRecruiters as RequestHandler
);

// Get students for scheduling (RECRUITER and COMPANY_ADMIN)
router.get("/students",
    authorize(["RECRUITER", "COMPANY_ADMIN"]) as RequestHandler,
    interviewController.getStudents as RequestHandler
);

router.get("/:id", interviewController.getInterviewById as RequestHandler);
router.get("/:id/join", interviewController.joinInterview as RequestHandler);

// Schedule an interview (RECRUITER, COMPANY_ADMIN)
router.post("/",
    authorize(["RECRUITER", "COMPANY_ADMIN"]) as RequestHandler,
    validate(scheduleInterviewSchema) as RequestHandler,
    interviewController.scheduleInterview as RequestHandler
);

// Update/Cancel an interview (RECRUITER only)
router.put("/:id",
    authorize(["RECRUITER"]) as RequestHandler,
    validate(updateInterviewSchema) as RequestHandler,
    interviewController.updateInterview as RequestHandler
);

router.delete("/:id",
    authorize(["RECRUITER"]) as RequestHandler,
    interviewController.deleteInterview as RequestHandler
);

// Save/Update recording mapping (RECRUITER only)
router.post("/:id/recording",
    authorize(["RECRUITER"]) as RequestHandler,
    validate(saveRecordingSchema) as RequestHandler,
    interviewController.saveRecording as RequestHandler
);

// Server-side recording endpoints (RECRUITER and COMPANY_ADMIN only)
router.get("/:id/recording",
    authorize(["RECRUITER", "COMPANY_ADMIN"]) as RequestHandler,
    interviewController.getServerRecording as RequestHandler
);

router.get("/:id/recording/download",
    authorize(["RECRUITER", "COMPANY_ADMIN"]) as RequestHandler,
    interviewController.downloadServerRecording as RequestHandler
);

export default router;
