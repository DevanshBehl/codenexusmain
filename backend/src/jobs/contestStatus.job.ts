import { prisma } from "../../lib/prisma.js";

const INTERVAL_MS = 60_000;

let intervalId: NodeJS.Timeout | null = null;

export function startContestStatusJob(): void {
    if (intervalId) {
        console.log('[ContestStatus] Job already running');
        return;
    }

    console.log('[ContestStatus] Starting contest status auto-flip job');
    
    const runJob = async (): Promise<void> => {
        try {
            const now = new Date();
            
            const upcomingToOngoing = await prisma.contest.updateMany({
                where: {
                    status: 'UPCOMING',
                    date: { lte: now }
                },
                data: { status: 'ACTIVE' }
            });

            if (upcomingToOngoing.count > 0) {
                console.log(`[ContestStatus] Fliped ${upcomingToOngoing.count} UPCOMING → ACTIVE`);
            }

            const ongoingToEnded = await prisma.contest.updateMany({
                where: {
                    status: 'ACTIVE',
                    date: {
                        lte: new Date(now.getTime() - 2 * 60 * 1000)
                    }
                },
                data: { status: 'COMPLETED' }
            });

            const endedViaDuration = await prisma.contest.updateMany({
                where: {
                    status: 'ACTIVE'
                },
                data: {
                    status: 'COMPLETED'
                }
            });

            const activeContests = await prisma.contest.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true, date: true, durationMins: true }
            });

            for (const contest of activeContests) {
                const contestEnd = new Date(new Date(contest.date).getTime() + contest.durationMins * 60_000);
                if (now >= contestEnd) {
                    await prisma.contest.update({
                        where: { id: contest.id },
                        data: { status: 'COMPLETED' }
                    });
                    console.log(`[ContestStatus] Contest ${contest.id} ACTIVE → COMPLETED (duration expired)`);
                }
            }

        } catch (error) {
            console.error('[ContestStatus] Error running job:', error);
        }
    };

    runJob().catch(console.error);
    intervalId = setInterval(() => {
        runJob().catch(console.error);
    }, INTERVAL_MS);
    
    console.log(`[ContestStatus] Job scheduled to run every ${INTERVAL_MS / 1000}s`);
}

export function stopContestStatusJob(): void {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('[ContestStatus] Job stopped');
    }
}