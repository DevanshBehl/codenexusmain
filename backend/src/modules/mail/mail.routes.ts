import { RequestHandler, Router } from "express";
import * as mailController from "./mail.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

router.post("/send",
    authenticate as RequestHandler,
    validate(mailController.sendMailSchema) as RequestHandler,
    mailController.sendMail as RequestHandler
);

export default router;
