import Queue from 'bull';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { submitToJudge0, pollJudge0, determineVerdict, LANGUAGE_MAP } from './judge0.js';
import { getIo } from '../../socket/socket.js';
import * as leaderboardService from './leaderboard.service.js';

const queueOpts = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
};

export const submissionQueue = new Queue('codearena:submissions', queueOpts);

export function initSubmissionWorker() {
    submissionQueue.process(Number(process.env.BULL_CONCURRENCY || 5), async (job: any) => {
        const { submissionId, isContestSubmission } = job.data;
        if (!submissionId) return;

        try {
            let submission: any;
            let problem: any;
            let testCases: any[];

            if (isContestSubmission) {
                // Contest system models
                submission = await prisma.submission.findUnique({
                    where: { id: submissionId },
                    include: { problem: { include: { testCases: { orderBy: { id: 'asc' } } } } }
                });
                problem = submission?.problem;
                testCases = problem?.testCases?.map((tc: any) => ({
                    input: tc.input,
                    expected_output: tc.output,
                })) || [];
            } else {
                // CodeArena system models
                submission = await prisma.caSubmission.findUnique({
                    where: { id: submissionId },
                    include: { problem: { include: { testCases: { orderBy: { order_index: 'asc' } } } } }
                });
                problem = submission?.problem;
                testCases = problem?.testCases || [];
            }

            if (!submission || !problem) {
                console.error(`Submission ${submissionId} not found`);
                return;
            }

            // 1.5. Lock submissions after contest ends (contest submissions only)
            if (isContestSubmission) {
                const contest = await prisma.contest.findUnique({
                    where: { id: submission.problem?.contestId },
                    select: { status: true, date: true, durationMins: true }
                });
                if (contest) {
                    const contestEnd = new Date(new Date(contest.date).getTime() + contest.durationMins * 60_000);
                    if (contest.status === 'COMPLETED' || new Date() >= contestEnd) {
                        await prisma.submission.update({
                            where: { id: submissionId },
                            data: { status: 'locked' }
                        });
                        console.log(`Submission ${submissionId} locked - contest ended`);
                        return;
                    }
                }
            }

            // 2. Set to Processing
            if (isContestSubmission) {
                await prisma.submission.update({
                    where: { id: submissionId },
                    data: { status: 'processing' }
                });
            } else {
                await prisma.caSubmission.update({
                    where: { id: submissionId },
                    data: { status: 'processing' }
                });
            }

            const ioClient = getIo();
            if(ioClient) ioClient.to(`submission:${submissionId}`).emit('submission_status', { status: 'processing' });

            // 3. Submit all test cases to Judge0
            const languageId = LANGUAGE_MAP[submission.language] || LANGUAGE_MAP['python'];
            const tokens: string[] = [];

            for (const tc of testCases) {
                const token = await submitToJudge0({
                    code: submission.code,
                    language_id: Number(languageId) || 71,
                    stdin: tc.input,
                    expected_output: tc.expected_output,
                    time_limit_ms: problem.time_limit_ms || 2000,
                    memory_limit_mb: problem.memory_limit_mb || 256
                });
                tokens.push(token);
            }

            // Save tokens if it's CaSubmission
            if (!isContestSubmission) {
                await prisma.caSubmission.update({
                    where: { id: submissionId },
                    data: { judge0_tokens: tokens }
                });
            }

            // 4. Poll results
            const results = [];
            let timeUsed = 0;
            let memoryUsed = 0;
            let passed = 0;

            for (let i = 0; i < tokens.length; i++) {
                const result = await pollJudge0(tokens[i] as string);
                results.push(result);
                
                if (result.status?.id === 3) passed++; // 3 = Accepted
                if (result.time) timeUsed = Math.max(timeUsed, parseFloat(result.time) * 1000);
                if (result.memory) memoryUsed = Math.max(memoryUsed, result.memory);
            }

            // 5. Aggregate Verdict
            const { verdict, error } = determineVerdict(results);

            // 6. Update Submission Final Status
            if (isContestSubmission) {
                await prisma.submission.update({
                    where: { id: submissionId },
                    data: {
                        status: verdict,
                        passed: passed,
                        total: tokens.length,
                    }
                });
            } else {
                await prisma.caSubmission.update({
                    where: { id: submissionId },
                    data: {
                        status: verdict,
                        test_cases_passed: passed,
                        test_cases_total: tokens.length,
                        time_taken_ms: Math.round(timeUsed),
                        memory_used_kb: Math.round(memoryUsed),
                        error_message: error || null
                    }
                });
            }

            // 7. Update User's Profile Summary
            // 7. Update User's Profile Summary (CodeArena only)
            if (!isContestSubmission && submission.student_cnid) {
                const isSolved = verdict === 'accepted';
                const summary = await prisma.caSubmissionSummary.findUnique({
                    where: {
                        student_cnid_problem_id: {
                            student_cnid: submission.student_cnid,
                            problem_id: submission.problem_id
                        }
                    }
                });

                if (summary) {
                    await prisma.caSubmissionSummary.update({
                        where: {
                            student_cnid_problem_id: {
                                student_cnid: submission.student_cnid,
                                problem_id: submission.problem_id
                            }
                        },
                        data: {
                            is_solved: summary.is_solved || isSolved,
                            best_time_ms: isSolved ? Math.min(summary.best_time_ms || Infinity, Math.round(timeUsed)) : summary.best_time_ms,
                            total_attempts: { increment: 1 },
                            last_submitted_at: new Date()
                        }
                    });
                } else {
                    await prisma.caSubmissionSummary.create({
                        data: {
                            student_cnid: submission.student_cnid,
                            problem_id: submission.problem_id,
                            is_solved: isSolved,
                            best_time_ms: isSolved ? Math.round(timeUsed) : null,
                            total_attempts: 1,
                            last_submitted_at: new Date()
                        }
                    });
                }
            }

            // 8. Update Global Leaderboard (CodeArena only)
            if (!isContestSubmission && submission.student_cnid && verdict === 'accepted') {
                const solvedCount = await prisma.caSubmissionSummary.count({
                    where: { student_cnid: submission.student_cnid, is_solved: true }
                });
                await leaderboardService.updateGlobalLeaderboard(submission.student_cnid, solvedCount);
            }

            // 9. Update Contest Leaderboard (contest submissions only)
            if (isContestSubmission && verdict === 'accepted') {
                const problem = await prisma.problem.findUnique({
                    where: { id: submission.problemId },
                    include: { contest: true }
                });
                if (problem?.contest) {
                    const contest = problem.contest;
                    const student = await prisma.student.findUnique({
                        where: { id: submission.studentId }
                    });
                    if (student?.user?.cnid) {
                        const submissions = await prisma.submission.findMany({
                            where: {
                                studentId: submission.studentId,
                                problem: { contestId: contest.id }
                            }
                        });
                        const solvedCount = submissions.filter(s => s.status === 'AC').length;
                        const wrongAttempts = submissions.filter(s => s.status !== 'AC' && s.status !== 'pending').length;
                        const contestStart = new Date(contest.date);
                        const latestAccept = submissions
                            .filter(s => s.status === 'AC')
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                            .pop();
                        const timeTakenMinutes = latestAccept
                            ? (new Date(latestAccept.createdAt).getTime() - contestStart.getTime()) / 60000
                            : 0;

                        await leaderboardService.updateContestLeaderboard(
                            contest.id,
                            student.user.cnid,
                            solvedCount,
                            wrongAttempts,
                            timeTakenMinutes
                        );
                    }
                }
            }

            // 10. Emit final result via WebSockets
            const ioClient2 = getIo();
            if (ioClient2) {
                ioClient2.to(`submission:${submissionId}`).emit('submission_result', {
                    status: verdict,
                    passed,
                    total: tokens.length,
                    time_ms: Math.round(timeUsed),
                    memory_kb: Math.round(memoryUsed),
                    error_message: error || null
                });
            }

        } catch (error: any) {
            console.error(`Error processing submission ${job.data.submissionId}:`, error);
            if (job.data.isContestSubmission) {
                await prisma.submission.update({
                    where: { id: job.data.submissionId },
                    data: { status: 'runtime_error' }
                });
            } else {
                await prisma.caSubmission.update({
                    where: { id: job.data.submissionId },
                    data: { status: 'runtime_error', error_message: 'Internal processing error' }
                });
            }
            const ioClient3 = getIo();
            if (ioClient3) ioClient3.to(`submission:${job.data.submissionId}`).emit('submission_result', {
                status: 'runtime_error',
                error_message: 'Internal processing error'
            });
        }
    });

    console.log('[CodeArena] Submission worker initialized');
}
