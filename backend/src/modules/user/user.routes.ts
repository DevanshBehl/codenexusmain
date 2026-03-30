import { RequestHandler, Router } from "express";
import * as userController from "./user.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

import {
    createStundetProfileSchema,
    updateStudentProfileSchema,
    createCompanyProfileSchema,
    createUniversityProfileSchema
} from "./user.schema.js";

const router = Router();

router.use(authenticate as RequestHandler);

// Get current user profile
router.get("/me", userController.getMe as RequestHandler);

// Get all universities
router.get("/universities", userController.getUniversities as RequestHandler);

// Student profile
router.post("/profile/student", authorize(['STUDENT']) as RequestHandler,
    validate(createStundetProfileSchema) as RequestHandler,
    userController.setupStudentProfile as RequestHandler
)
router.patch("/profile/student", authorize(['STUDENT']) as RequestHandler,
    validate(updateStudentProfileSchema) as RequestHandler,
    userController.updateStudentProfile as RequestHandler
)

// Company profile
router.post("/profile/company", authorize(['COMPANY_ADMIN']) as RequestHandler,
    validate(createCompanyProfileSchema) as RequestHandler,
    userController.setupCompanyProfile as RequestHandler
)

// University profile
router.post("/profile/university", authorize(['UNIVERSITY']) as RequestHandler,
    validate(createUniversityProfileSchema) as RequestHandler,
    userController.setupUniversityProfile as RequestHandler
)

export default router;