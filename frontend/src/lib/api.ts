const API_BASE = '/api/v1';

interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    data: T;
    message: string;
}

interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: { field: string; message: string }[];
    stack?: string;
}

class ApiClient {
    private getToken(): string | null {
        return localStorage.getItem('cn_token');
    }

    private async request<T>(
        method: string,
        path: string,
        body?: unknown,
        requiresAuth: boolean = true
    ): Promise<ApiResponse<T>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (requiresAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const config: RequestInit = {
            method,
            headers,
        };

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE}${path}`, config);

        const json = await response.json();

        if (!response.ok) {
            const error = json as ApiErrorResponse;
            throw new ApiRequestError(
                error.message || 'Something went wrong',
                response.status,
                error.errors
            );
        }

        return json as ApiResponse<T>;
    }

    async get<T>(path: string, requiresAuth = true): Promise<ApiResponse<T>> {
        return this.request<T>('GET', path, undefined, requiresAuth);
    }

    async post<T>(path: string, body: unknown, requiresAuth = true): Promise<ApiResponse<T>> {
        return this.request<T>('POST', path, body, requiresAuth);
    }

    async patch<T>(path: string, body: unknown, requiresAuth = true): Promise<ApiResponse<T>> {
        return this.request<T>('PATCH', path, body, requiresAuth);
    }

    async del<T>(path: string, requiresAuth = true): Promise<ApiResponse<T>> {
        return this.request<T>('DELETE', path, undefined, requiresAuth);
    }
}

export class ApiRequestError extends Error {
    public statusCode: number;
    public errors?: { field: string; message: string }[];

    constructor(message: string, statusCode: number, errors?: { field: string; message: string }[]) {
        super(message);
        this.name = 'ApiRequestError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

export const api = new ApiClient();

// ─── Auth APIs ───
export interface LoginPayload {
    email: string;
    password: string;
}

export interface SignupPayload {
    email: string;
    password: string;
    role: string;
}

export interface AuthUser {
    id: string;
    email: string;
    role: string;
}

export interface LoginResponse {
    user: AuthUser;
    token: string;
}

export interface SignupResponse {
    id: string;
    email: string;
    role: string;
    createdAt: string;
}

export const authApi = {
    login: (data: LoginPayload) =>
        api.post<LoginResponse>('/auth/login', data, false),
    signup: (data: SignupPayload) =>
        api.post<SignupResponse>('/auth/signup', data, false),
};

// ─── User APIs ───
export interface StudentProfileData {
    id: string;
    userId: string;
    universityId: string;
    name: string;
    age: number | null;
    phone: string | null;
    branch: string;
    cgpa: number;
    specialization: string | null;
    gender: string | null;
    registrationNumber: string | null;
    codeNexusId: string | null;
    parentsName: string | null;
    parentContactNo: string | null;
    parentEmail: string | null;
    address: string | null;
    xSchool: string | null;
    xPercentage: string | null;
    xiiSchool: string | null;
    xiiPercentage: string | null;
    otherInfo: string | null;
    status: string;
    codeArenaScore: number;
}

export interface UserProfile {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    profile: StudentProfileData | any;
}

export const userApi = {
    getMe: () => api.get<UserProfile>('/user/me'),
    getUniversities: () => api.get<{id: string, name: string}[]>('/user/universities'),
    createStudentProfile: (data: any) => api.post('/user/profile/student', data),
    updateStudentProfile: (data: any) => api.patch('/user/profile/student', data),
    createCompanyProfile: (data: any) => api.post('/user/profile/company', data),
    createUniversityProfile: (data: any) => api.post('/user/profile/university', data),
};

// ─── Contest APIs ───
export interface ContestListItem {
    id: string;
    title: string;
    description: string | null;
    date: string;
    durationMins: number;
    timeLimitMinutes: number;
    languages: string[];
    status: string;
    company: {
        name: string;
        industry: string | null;
    };
    _count: {
        problems: number;
    };
}

export interface CreateContestPayload {
    title: string;
    description?: string;
    scheduledDate: string;
    durationMins: number;
    timeLimitMinutes: number;
    languages: string[];
    questions: {
        title: string;
        difficulty: 'EASY' | 'MEDIUM' | 'HARD';
        points: number;
        statement: string;
        constraints?: string;
        testCases: { input: string; expectedOutput: string }[];
    }[];
}

export const contestApi = {
    getAll: () => api.get<ContestListItem[]>('/contests', false),
    getById: (id: string) => api.get<any>(`/contests/${id}`, false),
    create: (data: CreateContestPayload) => api.post('/contests', data),
};

// ─── Problem APIs ───
export interface ProblemListItem {
    id: string;
    title: string;
    difficulty: string;
    points: number;
    contestId: string | null;
    _count: {
        testCases: number;
        submissions: number;
    };
}

export interface ProblemsResponse {
    problems: ProblemListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const problemApi = {
    getAll: (params?: { difficulty?: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams();
        if (params?.difficulty) query.set('difficulty', params.difficulty);
        if (params?.page) query.set('page', params.page.toString());
        if (params?.limit) query.set('limit', params.limit.toString());
        const qs = query.toString();
        return api.get<ProblemsResponse>(`/problems${qs ? `?${qs}` : ''}`, false);
    },
    getById: (id: string) => api.get<any>(`/problems/${id}`, false),
    create: (data: any) => api.post('/problems', data),
};

// ─── Project APIs ───
export interface ProjectItem {
    id: string;
    studentId: string;
    title: string;
    description: string;
    techStack: string;
    githubLink: string | null;
    liveLink: string | null;
}

export interface CreateProjectPayload {
    title: string;
    description: string;
    techStack: string;
    githubLink?: string;
    liveLink?: string;
}

export const projectApi = {
    getMyProjects: () => api.get<ProjectItem[]>('/projects'),
    create: (data: CreateProjectPayload) => api.post<ProjectItem>('/projects', data),
    delete: (id: string) => api.del(`/projects/${id}`),
};

// ─── Webinar APIs ───
export interface WebinarItem {
    id: string;
    title: string;
    agenda: string;
    scheduledAt: string;
    durationMins: number;
    meetingLink: string;
    status: string;
    company: {
        name: string;
        industry: string | null;
    };
    targetUniversities: {
        university: { id: string; name: string };
    }[];
}

export interface CreateWebinarPayload {
    title: string;
    agenda: string;
    scheduledDate: string;
    scheduledTime: string;
    durationMins: number;
    meetingLink: string;
    targetUniversityIds: string[];
}

export const webinarApi = {
    getAll: () => api.get<WebinarItem[]>('/webinars', false),
    getById: (id: string) => api.get<WebinarItem>(`/webinars/${id}`, false),
    create: (data: CreateWebinarPayload) => api.post<WebinarItem>('/webinars', data),
};

// ─── Mail APIs ───
export interface MailItem {
    id: string;
    sender_cnid: string;
    sender_name: string;
    recipient_cnid: string;
    recipient_name: string;
    subject: string;
    body: string;
    sent_at: string;
    is_read: boolean;
    thread_id: string;
    parent_mail_id: string | null;
}

export interface MailListResponse {
    mails: MailItem[];
    total: number;
    page: number;
    limit: number;
}

export interface RecipientSearchResult {
    cnid: string;
    displayName: string;
    role: string;
}

export interface SendMailPayload {
    recipient_cnid: string;
    subject: string;
    body: string;
    parent_mail_id?: string;
}

export const mailApi = {
    getInbox: (page?: number, limit?: number) => {
        const query = new URLSearchParams();
        if (page) query.set('page', page.toString());
        if (limit) query.set('limit', limit.toString());
        const qs = query.toString();
        return api.get<MailListResponse>(`/mail/inbox${qs ? `?${qs}` : ''}`);
    },
    getSent: (page?: number, limit?: number) => {
        const query = new URLSearchParams();
        if (page) query.set('page', page.toString());
        if (limit) query.set('limit', limit.toString());
        const qs = query.toString();
        return api.get<MailListResponse>(`/mail/sent${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => api.get<MailItem>(`/mail/${id}`),
    getThread: (threadId: string) => api.get<MailItem[]>(`/mail/thread/${threadId}`),
    send: (data: SendMailPayload) => api.post<MailItem>('/mail/send', data),
    markAsRead: (id: string) => api.patch(`/mail/${id}/read`, {}),
    delete: (id: string) => api.del(`/mail/${id}`),
    getUnreadCount: () => api.get<{ unread_count: number }>('/mail/unread-count'),
    searchRecipients: (q: string) => api.get<RecipientSearchResult[]>(`/mail/search-recipients?q=${encodeURIComponent(q)}`),
};

// ─── Interview APIs ───
export interface InterviewItem {
    id: string;
    recruiterId: string;
    studentId: string;
    role: string;
    scheduledAt: string;
    type: 'TECHNICAL' | 'HR' | 'SYSTEM_DESIGN';
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
    student: { id: string; name: string; branch: string; cgpa: number };
    recruiter: { name: string; company: { name: string } };
    recording?: any;
}

export interface ScheduleInterviewPayload {
    studentId: string;
    recruiterId?: string;
    role: string;
    scheduledDate: string;
    scheduledTime: string;
    type: 'TECHNICAL' | 'HR' | 'SYSTEM_DESIGN';
}

export const interviewApi = {
    getAll: () => api.get<InterviewItem[]>('/interviews'),
    getById: (id: string) => api.get<InterviewItem>(`/interviews/${id}`),
    schedule: (data: ScheduleInterviewPayload) => api.post<InterviewItem>('/interviews', data),
    update: (id: string, data: any) => api.patch<InterviewItem>(`/interviews/${id}`, data),
    delete: (id: string) => api.del(`/interviews/${id}`),
    join: (id: string) => api.get<{ success: boolean }>(`/interviews/${id}/join`),
    saveRecording: (id: string, data: any) => api.post(`/interviews/${id}/recording`, data),
    getStudents: () => api.get<any[]>('/interviews/students'),
    getCompanyRecruiters: () => api.get<any[]>('/interviews/company-recruiters'),
    getRecordingStatus: (id: string) => api.get<{ status: string; started_at: string; completed_at: string; duration_seconds: number; file_size_bytes: number }>(`/interviews/${id}/recording`),
    getRecordingStreamUrl: (id: string) => `${import.meta.env.VITE_API_URL}/interviews/${id}/recording/download?download=false`,
    getRecordingBlobUrl: async (id: string): Promise<string> => {
        const token = localStorage.getItem('cn_token');
        const response = await fetch(`/api/v1/interviews/${id}/recording/download?download=false`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch recording');
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    },
};

// ==========================================
// Code Arena API
// ==========================================
export const codeArenaApi = {
    getProblems: (difficulty?: string, tags?: string) => {
        let qs = '';
        if (difficulty || tags) {
            const params = new URLSearchParams();
            if (difficulty) params.append('difficulty', difficulty);
            if (tags) params.append('tags', tags);
            qs = `?${params.toString()}`;
        }
        return api.get(`/codearena/problems${qs}`);
    },
    getProblem: (id: string) => api.get(`/codearena/problems/${id}`),
    
    runCode: (problemId: string, language: string, code: string, customInput?: string) => 
        api.post(`/codearena/submissions/run`, { problemId, language, code, customInput }),
        
    submitCode: (problemId: string, language: string, code: string) => 
        api.post(`/codearena/submissions/submit`, { problemId, language, code }),
        
    getSubmission: (id: string) => api.get(`/codearena/submissions/${id}`),
    getSubmissions: (problemId?: string) => {
        const params = problemId ? `?problemId=${problemId}` : '';
        return api.get(`/codearena/submissions${params}`);
    },

    getLeaderboard: () => api.get(`/codearena/leaderboard`),
    getProfileStats: () => api.get(`/codearena/leaderboard/profile`),
};
