import Redis from 'ioredis';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError } from '../../utils/api-error.js';
import { env } from '../../config/env.js';

import IORedis from 'ioredis';

// Reuse existing Redis instance from environment variables
const redis = new (IORedis as any)({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

redis.on('error', (err: any) => {
    console.error('Rate Limiter Redis Error:', err.message);
});

export const rateLimiter = (keyPrefix: string, limit: number, windowSeconds: number): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user's IP or CNID
            const identifier = req.user?.cnid || req.ip;
            const redisKey = `rate_limit:${keyPrefix}:${identifier}`;

            const requests = await redis.incr(redisKey);

            if (requests === 1) {
                await redis.expire(redisKey, windowSeconds);
            }

            if (requests > limit) {
                const ttl = await redis.ttl(redisKey);
                res.status(429).json({
                    success: false,
                    message: "Too many requests",
                    error: "Too many requests",
                    retry_after_seconds: ttl
                });
                return;
            }

            next();
        } catch (error) {
            console.error("Rate limiter error, bypassing:", error);
            next(); // bypass on redis error to not break the app
        }
    };
};
