import { redis } from '../codearena/leaderboard.service.js';
import { getIo } from '../../socket/socket.js';

const PERCENTILE_KEY_PREFIX = 'percentile:contest:';
const USER_TC_HASH_PREFIX = 'percentile:tc:';
const MAX_PENALTY = 1e10;
// 4 problems × 100 test cases each = theoretical max; real contests are smaller
const SCORE_TC_MULTIPLIER = 1e10;

function contestKey(contestId: string): string {
    return `${PERCENTILE_KEY_PREFIX}${contestId}`;
}

function userTcHashKey(contestId: string): string {
    return `${USER_TC_HASH_PREFIX}${contestId}`;
}

/**
 * Compute the composite sorted-set score.
 * Higher is better: more TCs passed dominates; for equal TCs, less penalty wins.
 */
function compositeScore(testCasesPassed: number, penaltyMs: number): number {
    return (testCasesPassed * SCORE_TC_MULTIPLIER) + (MAX_PENALTY - penaltyMs);
}

/**
 * Called once per submission after Judge0 finishes.
 * Atomically updates the user's total passed test-case count and
 * recalculates their composite score in the sorted set.
 *
 * Returns the user's new percentile.
 */
export async function updatePercentileScore(
    contestId: string,
    cnid: string,
    newTestCasesPassed: number,
    contestStartMs: number
): Promise<{ percentile: number; totalParticipants: number }> {
    const zKey = contestKey(contestId);
    const hKey = userTcHashKey(contestId);

    // Accumulate total test cases passed across all problems for this user
    const updatedTotal = await redis.hincrby(hKey, cnid, newTestCasesPassed);

    const penaltyMs = Date.now() - contestStartMs;
    const score = compositeScore(updatedTotal, penaltyMs);

    await redis.zadd(zKey, score, cnid);

    return computePercentile(contestId, cnid);
}

/**
 * Read-only percentile lookup — used by the REST endpoint and socket polling.
 */
export async function computePercentile(
    contestId: string,
    cnid: string
): Promise<{ percentile: number; totalParticipants: number }> {
    const zKey = contestKey(contestId);

    const pipeline = redis.pipeline();
    pipeline.zrevrank(zKey, cnid);
    pipeline.zcard(zKey);
    const results = await pipeline.exec();

    const rank: number | null = results![0][1] as number | null;
    const total: number = results![1][1] as number;

    if (rank === null || total <= 1) {
        return { percentile: 100, totalParticipants: total };
    }

    // rank 0 = best → ahead of (total-1-rank) people out of (total-1)
    const percentile = Math.round(((total - 1 - rank) / (total - 1)) * 10000) / 100;
    return { percentile: Math.max(0, percentile), totalParticipants: total };
}

/**
 * Push updated percentile to the student's socket in real time.
 */
export function pushPercentileToClient(
    contestId: string,
    cnid: string,
    percentile: number,
    totalParticipants: number
): void {
    const io = getIo();
    if (!io) return;
    io.to(`contest-live:${contestId}:${cnid}`).emit('percentile-update', {
        percentile,
        totalParticipants,
        timestamp: Date.now(),
    });
}

/**
 * Register a participant in the sorted set with score 0 (no test cases passed).
 * Called when a student joins the contest socket room.
 */
export async function registerParticipant(
    contestId: string,
    cnid: string
): Promise<void> {
    const zKey = contestKey(contestId);
    // NX = only add if not already present; don't reset a returning user's score
    await redis.zadd(zKey, 'NX', 0, cnid);
}

/**
 * Get the full leaderboard (only exposed after contest ends).
 */
export async function getFullPercentileLeaderboard(
    contestId: string
): Promise<Array<{ cnid: string; testCasesPassed: number; rank: number }>> {
    const zKey = contestKey(contestId);
    const hKey = userTcHashKey(contestId);

    const members = await redis.zrevrange(zKey, 0, -1);
    const entries: Array<{ cnid: string; testCasesPassed: number; rank: number }> = [];

    if (members.length === 0) return entries;

    const pipeline = redis.pipeline();
    for (const cnid of members) {
        pipeline.hget(hKey, cnid);
    }
    const tcResults = await pipeline.exec();

    for (let i = 0; i < members.length; i++) {
        entries.push({
            cnid: members[i],
            testCasesPassed: parseInt(tcResults![i][1] as string) || 0,
            rank: i + 1,
        });
    }

    return entries;
}

/**
 * Cleanup keys for a finished contest (optional; call from a cron or manually).
 */
export async function cleanupContest(contestId: string): Promise<void> {
    await redis.del(contestKey(contestId));
    await redis.del(userTcHashKey(contestId));
}
