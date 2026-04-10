import { Router, RequestHandler } from 'express';
import { runCode, submitCode, getSubmission, getSubmissions } from './submissions.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { runCodeSchema, submitCodeSchema } from './codearena.schema.js';
import { rateLimiter } from './rateLimiter.js';

const router = Router();

router.post('/run', 
    authenticate as RequestHandler,
    authorize(['STUDENT']) as RequestHandler,
    rateLimiter('codearena_run', 30, 60),
    validate(runCodeSchema) as RequestHandler,
    runCode as RequestHandler
);

router.post('/submit', 
    authenticate as RequestHandler,
    authorize(['STUDENT']) as RequestHandler,
    rateLimiter('codearena_submit', 10, 60),
    validate(submitCodeSchema) as RequestHandler,
    submitCode as RequestHandler
);

router.get('/', authenticate as RequestHandler, getSubmissions as RequestHandler);
router.get('/:id', authenticate as RequestHandler, getSubmission as RequestHandler);

export default router;
