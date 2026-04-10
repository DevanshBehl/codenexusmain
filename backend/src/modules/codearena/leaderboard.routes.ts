import { Router, RequestHandler } from 'express';
import { getLeaderboard, getProfileStats } from './leaderboard.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.get('/', getLeaderboard as RequestHandler);
router.get('/profile', authenticate as RequestHandler, getProfileStats as RequestHandler);

export default router;
