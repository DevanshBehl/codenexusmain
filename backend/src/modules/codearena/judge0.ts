import axios from 'axios';
import { ApiError } from '../../utils/api-error.js';
import { env } from '../../config/env.js';

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';
const AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN || '';

export const LANGUAGE_MAP: Record<string, number> = {
  python:     71,   // Python 3.8.1
  cpp:        54,   // C++ (GCC 9.2.0)
  java:       62,   // Java (OpenJDK 13.0.1)
  javascript: 63,   // Node.js (12.14.0)
  c:          50,   // C (GCC 9.2.0)
};

export const JUDGE0_STATUS = {
  IN_QUEUE:            1,
  PROCESSING:          2,
  ACCEPTED:            3,
  WRONG_ANSWER:        4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR:   6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE:  9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR:         11,
  MEMORY_LIMIT_EXCEEDED: 12,
};

function getHeaders() {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (AUTH_TOKEN) {
        headers['X-Auth-Token'] = AUTH_TOKEN;
    }
    return headers;
}

export async function submitToJudge0({ 
    code, 
    language_id, 
    stdin, 
    expected_output, 
    time_limit_ms, 
    memory_limit_mb 
}: {
    code: string;
    language_id: number;
    stdin?: string;
    expected_output?: string;
    time_limit_ms?: number;
    memory_limit_mb?: number;
}): Promise<string> {
    try {
        const payload: any = {
            source_code: Buffer.from(code).toString('base64'),
            language_id,
            base64_encoded: true,
            wait: false
        };

        if (stdin) payload.stdin = Buffer.from(stdin).toString('base64');
        if (expected_output) payload.expected_output = Buffer.from(expected_output).toString('base64');
        if (time_limit_ms) payload.cpu_time_limit = time_limit_ms / 1000; // Judge0 uses seconds
        if (memory_limit_mb) payload.memory_limit = memory_limit_mb * 1024; // Judge0 uses kilobytes

        const res = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`, payload, {
            headers: getHeaders()
        });

        if (!res.data.token) {
            throw new Error("No token returned from Judge0");
        }

        return res.data.token;
    } catch (err: any) {
        console.error("Judge0 Submission Error:", err.message);
        throw new ApiError(500, "Failed to submit code to execution engine");
    }
}

export async function pollJudge0(token: string, { maxAttempts = 20, intervalMs = 1000 } = {}): Promise<any> {
    let attempts = 0;
    while (attempts < maxAttempts) {
        try {
            const res = await axios.get(`${JUDGE0_URL}/submissions/${token}?base64_encoded=true&fields=status,stdout,stderr,time,memory,compile_output`, {
                headers: getHeaders()
            });

            const data = res.data;
            const statusId = data.status?.id;

            if (statusId !== JUDGE0_STATUS.IN_QUEUE && statusId !== JUDGE0_STATUS.PROCESSING) {
                // Decode base64 strings
                if (data.stdout) data.stdout = Buffer.from(data.stdout, 'base64').toString('utf-8');
                if (data.stderr) data.stderr = Buffer.from(data.stderr, 'base64').toString('utf-8');
                if (data.compile_output) data.compile_output = Buffer.from(data.compile_output, 'base64').toString('utf-8');
                
                return data;
            }
        } catch (err: any) {
            console.error("Judge0 polling error:", err.message);
            // Don't throw immediately, we might want to retry
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    // Timeout
    return {
        status: { id: JUDGE0_STATUS.TIME_LIMIT_EXCEEDED, description: 'Time Limit Exceeded' },
        time: null,
        memory: null
    };
}

export function determineVerdict(results: any[]) {
    if (!results || results.length === 0) return { verdict: 'runtime_error' };

    // Priority 1: Compilation Error
    if (results.some(r => r.status.id === JUDGE0_STATUS.COMPILATION_ERROR)) {
        return { 
            verdict: 'compile_error', 
            error: results.find(r => r.status.id === JUDGE0_STATUS.COMPILATION_ERROR)?.compile_output 
        };
    }

    // Priority 2: Runtime Error
    if (results.some(r => [7, 8, 9, 10, 11].includes(r.status.id))) {
        return { 
            verdict: 'runtime_error', 
            error: results.find(r => [7, 8, 9, 10, 11].includes(r.status.id))?.stderr 
        };
    }

    // Priority 3: Time Limit Exceeded
    if (results.some(r => r.status.id === JUDGE0_STATUS.TIME_LIMIT_EXCEEDED)) {
        return { verdict: 'time_limit_exceeded' };
    }

    // Priority 4: Memory Limit Exceeded
    if (results.some(r => r.status.id === JUDGE0_STATUS.MEMORY_LIMIT_EXCEEDED)) {
        return { verdict: 'memory_limit_exceeded' };
    }

    // Priority 5: Wrong Answer
    if (results.some(r => r.status.id === JUDGE0_STATUS.WRONG_ANSWER)) {
        return { verdict: 'wrong_answer' };
    }

    // Priority 6: All Accepted
    if (results.every(r => r.status.id === JUDGE0_STATUS.ACCEPTED)) {
        return { verdict: 'accepted' };
    }

    // Fallback
    return { verdict: 'runtime_error', error: "Unknown execution error" };
}
