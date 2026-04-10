import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ApiResponse } from '../../utils/api-response.js';
import { submitToJudge0, pollJudge0, determineVerdict, LANGUAGE_MAP } from './judge0.js';
import { submissionQueue } from './submissionQueue.js';
import { ApiError } from '../../utils/api-error.js';

export async function runCode(req: Request, res: Response, next: NextFunction) {
    try {
        const { problemId, language, code, customInput } = req.body;
        const cnid = req.user?.cnid;

        const problem = await prisma.caProblem.findUnique({
            where: { id: problemId },
            include: { testCases: { where: { is_sample: true }, orderBy: { order_index: 'asc' } } }
        });

        if (!problem) throw new ApiError(404, "Problem not found");

        const languageId = LANGUAGE_MAP[language];
        if (!languageId) throw new ApiError(400, "Unsupported language");

        const testCasesToRun = customInput 
            ? [{ input: customInput, expected_output: '' }]
            : problem.testCases;

        if (testCasesToRun.length === 0) throw new ApiError(400, "No custom input or sample test cases provided");

        const tokens = [];
        for (const tc of testCasesToRun) {
            const token = await submitToJudge0({
                code,
                language_id: languageId,
                stdin: tc.input,
                expected_output: tc.expected_output,
                time_limit_ms: problem.time_limit_ms,
                memory_limit_mb: problem.memory_limit_mb
            });
            tokens.push(token);
        }

        const results = [];
        let timeUsed = 0;
        let memoryUsed = 0;

        for (const t of tokens) {
            const result = await pollJudge0(t);
            results.push(result);
            if (result.time) timeUsed = Math.max(timeUsed, parseFloat(result.time) * 1000);
            if (result.memory) memoryUsed = Math.max(memoryUsed, result.memory);
        }

        const { verdict, error } = determineVerdict(results);

        // Save run result asynchronously
        if (cnid) {
            prisma.caRunResult.create({
                data: {
                    problem_id: problemId,
                    student_cnid: cnid,
                    language,
                    code,
                    custom_input: customInput,
                    status: verdict,
                    time_ms: Math.round(timeUsed),
                    memory_kb: Math.round(memoryUsed)
                }
            }).catch(e => console.error("Failed to save run result", e));
        }

        res.status(200).json(new ApiResponse(200, {
            verdict,
            error_message: error,
            time_ms: Math.round(timeUsed),
            memory_kb: Math.round(memoryUsed),
            results: results.map((r, i) => ({
                status: r.status?.description,
                time: r.time,
                memory: r.memory,
                stdout: r.stdout,
                stderr: r.stderr,
                expected: testCasesToRun[i]?.expected_output,
                compile_output: r.compile_output
            }))
        }, "Code run completed"));
    } catch (e) {
        next(e);
    }
}

export async function submitCode(req: Request, res: Response, next: NextFunction) {
    try {
        const { problemId, language, code } = req.body;
        const cnid = req.user?.cnid;

        if (!cnid) throw new ApiError(403, "Only students can submit code");

        const problem = await prisma.caProblem.findUnique({
            where: { id: problemId }
        });

        if (!problem) throw new ApiError(404, "Problem not found");

        const submission = await prisma.caSubmission.create({
            data: {
                student_cnid: cnid,
                problem_id: problemId,
                language,
                code,
                status: 'pending'
            }
        });

        await submissionQueue.add({ submissionId: submission.id });

        res.status(202).json(new ApiResponse(202, { submissionId: submission.id }, "Submission queued"));
    } catch (e) {
        next(e);
    }
}

export async function getSubmission(req: Request, res: Response, next: NextFunction) {
    try {
        const submission = await prisma.caSubmission.findUnique({
            where: { id: req.params.id as string }
        });

        if (!submission) throw new ApiError(404, "Submission not found");

        res.status(200).json(new ApiResponse(200, submission, "Submission fetched successfully"));
    } catch (e) {
        next(e);
    }
}

export async function getSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
        const { problemId } = req.query;
        const cnid = req.user?.cnid;

        if (!cnid) throw new ApiError(403, "Not authorized");

        const where: any = { student_cnid: cnid };
        if (problemId) where.problem_id = problemId;

        const submissions = await prisma.caSubmission.findMany({
            where,
            orderBy: { submitted_at: 'desc' },
            include: { problem: { select: { title: true } } }
        });

        res.status(200).json(new ApiResponse(200, submissions, "Submissions fetched successfully"));
    } catch (e) {
        next(e);
    }
}
