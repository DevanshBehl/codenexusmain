import IORedis from 'ioredis';

const redis = new (IORedis as any)({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

const GLOBAL_LEADERBOARD_KEY = 'leaderboard:global';
const CONTEST_LEADERBOARD_PREFIX = 'leaderboard:contest:';
const CACHE_PREFIX = 'lb_cache:';
const CACHE_TTL = 60;

export interface LeaderboardEntry {
    cnid: string;
    displayName: string;
    solved: number;
    score: number;
    tier: string;
}

export interface ContestLeaderboardEntry {
    cnid: string;
    displayName: string;
    rank: number;
    score: number;
    problemsSolved: number;
    wrongAttempts: number;
    timeTaken: number;
}

function determineTier(score: number): string {
    if (score >= 15000) return 'Grandmaster';
    if (score >= 12000) return 'Master';
    if (score >= 10000) return 'Candidate Master';
    if (score >= 8000) return 'Expert';
    if (score >= 5000) return 'Specialist';
    return 'Pupil';
}

export function calculateGlobalScore(solvedCount: number): number {
    return solvedCount * 100;
}

export function calculateContestScore(
    problemsSolved: number,
    wrongAttempts: number,
    timeTakenMinutes: number
): number {
    return (problemsSolved * 10000) - (wrongAttempts * 50) - Math.floor(timeTakenMinutes);
}

export async function updateGlobalLeaderboard(
    cnid: string,
    solvedCount: number
): Promise<void> {
    const score = calculateGlobalScore(solvedCount);
    await redis.zadd(GLOBAL_LEADERBOARD_KEY, score, cnid);
    await redis.del(`${CACHE_PREFIX}global`);
}

export async function updateContestLeaderboard(
    contestId: string,
    cnid: string,
    problemsSolved: number,
    wrongAttempts: number,
    timeTakenMinutes: number
): Promise<void> {
    const score = calculateContestScore(problemsSolved, wrongAttempts, timeTakenMinutes);
    const key = `${CONTEST_LEADERBOARD_PREFIX}${contestId}`;
    await redis.zadd(key, score, cnid);
    await redis.del(`${CACHE_PREFIX}contest:${contestId}`);
}

export async function getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const cacheKey = `${CACHE_PREFIX}global`;
    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const results = await redis.zrevrange(GLOBAL_LEADERBOARD_KEY, 0, limit - 1, 'WITHSCORES');
    const entries: LeaderboardEntry[] = [];

    for (let i = 0; i < results.length; i += 2) {
        const cnid = results[i];
        const score = parseInt(results[i + 1]);
        entries.push({
            cnid,
            displayName: cnid,
            solved: Math.floor(score / 100),
            score,
            tier: determineTier(score)
        });
    }

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(entries));
    return entries;
}

export async function getContestLeaderboard(
    contestId: string,
    limit: number = 50
): Promise<{ rankings: ContestLeaderboardEntry[], myRank: number | null, totalParticipants: number }> {
    const cacheKey = `${CACHE_PREFIX}contest:${contestId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const key = `${CONTEST_LEADERBOARD_PREFIX}${contestId}`;
    const results = await redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');
    const total = await redis.zcard(key);

    const rankings: ContestLeaderboardEntry[] = [];
    for (let i = 0; i < results.length; i += 2) {
        const cnid = results[i];
        const score = parseFloat(results[i + 1]);
        const problemsSolved = Math.floor(score / 10000);
        const wrongAttempts = Math.floor((10000 * problemsSolved - score) / 50);

        rankings.push({
            cnid,
            displayName: cnid,
            rank: (i / 2) + 1,
            score,
            problemsSolved,
            wrongAttempts,
            timeTaken: 0
        });
    }

    const result = { rankings, myRank: null, totalParticipants: total };
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
}

export async function getUserGlobalRank(cnid: string): Promise<number | null> {
    const rank = await redis.zrevrank(GLOBAL_LEADERBOARD_KEY, cnid);
    return rank !== null ? rank + 1 : null;
}

export async function getUserContestRank(contestId: string, cnid: string): Promise<number | null> {
    const key = `${CONTEST_LEADERBOARD_PREFIX}${contestId}`;
    const rank = await redis.zrevrank(key, cnid);
    return rank !== null ? rank + 1 : null;
}

export { redis };