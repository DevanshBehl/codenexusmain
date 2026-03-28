import { Router } from "express";
import * as contestController from "./contest.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createContestSchema } from "./contest.schema.js";

const router = Router();

router.use(authenticate);
router.post("/", authorize(["COMPANY"]), validate(createContestSchema), contestController.createcontest);

export default router;