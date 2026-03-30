import { RequestHandler, Router } from "express";
import * as projectController from "./project.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createProjectSchema, updateProjectSchema } from "./project.schema.js";

const router = Router();

// All routes require authentication + STUDENT role
router.use(authenticate as RequestHandler);
router.use(authorize(["STUDENT"]) as RequestHandler);

router.get("/", projectController.getMyProjects as RequestHandler);

router.post("/",
    validate(createProjectSchema) as RequestHandler,
    projectController.createProject as RequestHandler
);

router.put("/:id",
    validate(updateProjectSchema) as RequestHandler,
    projectController.updateProject as RequestHandler
);

router.delete("/:id", projectController.deleteProject as RequestHandler);

export default router;
