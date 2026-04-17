import { RequestHandler, Router } from "express";
import * as dashboardController from "./dashboard.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate as RequestHandler);

router.get(
    "/student",
    authorize(["STUDENT"]) as RequestHandler,
    dashboardController.getStudentDashboard as RequestHandler
);

router.get(
    "/company",
    authorize(["COMPANY_ADMIN"]) as RequestHandler,
    dashboardController.getCompanyDashboard as RequestHandler
);

router.get(
    "/university",
    authorize(["UNIVERSITY"]) as RequestHandler,
    dashboardController.getUniversityDashboard as RequestHandler
);

router.get(
    "/recruiter",
    authorize(["RECRUITER"]) as RequestHandler,
    dashboardController.getRecruiterDashboard as RequestHandler
);

export default router;
