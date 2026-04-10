import { Router, RequestHandler } from 'express';
import { getProblems, getProblemById } from './problems.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.get('/', authenticate as RequestHandler, getProblems as RequestHandler);
router.get('/:id', authenticate as RequestHandler, getProblemById as RequestHandler);

export default router;
