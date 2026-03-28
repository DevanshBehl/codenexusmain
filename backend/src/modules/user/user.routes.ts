import { RequestHandler, Router } from "express";
import * as userController from "./user.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

import {
    createStundetProfileSchema,
    createCompanyProfileSchema,
    createUniversityProfileSchema
} from "./user.schema.js";

const router = Router();

router.use(authenticate as RequestHandler);

router.post("/profile/student", authorize(['STUDENT']) as RequestHandler,
    validate(createStundetProfileSchema) as RequestHandler,
    userController.setupStudentProfile as RequestHandler
)
router.post("/profile/company", authorize(['COMPANY']) as RequestHandler,
    validate(createCompanyProfileSchema) as RequestHandler,
    userController.setupCompanyProfile as RequestHandler
)
router.post("/profile/university", authorize(['UNIVERSITY']) as RequestHandler,
    validate(createUniversityProfileSchema) as RequestHandler,
    userController.setupUniversityProfile as RequestHandler
)
export default router;