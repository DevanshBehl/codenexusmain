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
    private isRefreshing = false;
    private refreshSubscribers: ((token: string) => void)[] = [];

    private getToken(): string | null {
        return localStorage.getItem('cn_token');
    }

    private getRefreshToken(): string | null {
        return localStorage.getItem('cn_refresh_token');
    }

    private setTokens(accessToken: string, refreshToken: string) {
        localStorage.setItem('cn_token', accessToken);
        localStorage.setItem('cn_refresh_token', refreshToken);
    }

    private subscribeTokenRefresh(callback: (token: string) => void) {
        this.refreshSubscribers.push(callback);
    }

    private onTokenRefreshed(token: string) {
        this.refreshSubscribers.forEach(cb => cb(token));
        this.refreshSubscribers = [];
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

        if (!response.ok && response.status === 401 && requiresAuth) {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                window.location.href = '/login';
                throw new ApiRequestError('Session expired', 401);
            }

            if (this.isRefreshing) {
                // Queue this request until the in-flight refresh resolves
                const newToken = await new Promise<string>((resolve, reject) => {
                    this.subscribeTokenRefresh((token) => resolve(token));
                    setTimeout(() => reject(new ApiRequestError('Token refresh timeout', 401)), 10000);
                });
                const retryResponse = await fetch(`${API_BASE}${path}`, {
                    ...config,
                    headers: { ...headers, Authorization: `Bearer ${newToken}` },
                });
                const retryJson = await retryResponse.json();
                if (!retryResponse.ok) {
                    throw new ApiRequestError(retryJson.message || 'Something went wrong', retryResponse.status, retryJson.errors);
                }
                return retryJson as ApiResponse<T>;
            }

            this.isRefreshing = true;
            try {
                const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });

                if (refreshResponse.ok) {
                    const refreshJson = await refreshResponse.json();
                    this.setTokens(refreshJson.data.token, refreshJson.data.refreshToken);
                    this.onTokenRefreshed(refreshJson.data.token);
                    this.isRefreshing = false;

                    const retryResponse = await fetch(`${API_BASE}${path}`, {
                        ...config,
                        headers: { ...headers, Authorization: `Bearer ${refreshJson.data.token}` },
                    });
                    const retryJson = await retryResponse.json();
                    if (!retryResponse.ok) {
                        throw new ApiRequestError(
                            retryJson.message || 'Something went wrong',
                            retryResponse.status,
                            retryJson.errors
                        );
                    }
                    return retryJson as ApiResponse<T>;
                } else {
                    this.isRefreshing = false;
                    this.refreshSubscribers = [];
                    localStorage.removeItem('cn_token');
                    localStorage.removeItem('cn_refresh_token');
                    localStorage.removeItem('cn_user');
                    window.location.href = '/login';
                    throw new ApiRequestError('Session expired', 401);
                }
            } catch (e) {
                this.isRefreshing = false;
                throw e;
            }
        }

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
    cnid?: string;
}

export interface LoginResponse {
    user: AuthUser;
    token: string;
    refreshToken: string;
}

export interface RefreshResponse {
    token: string;
    refreshToken: string;
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
    refresh: (refreshToken: string) =>
        api.post<RefreshResponse>('/auth/refresh', { refreshToken }, false),
    logout: () =>
        api.post('/auth/logout', { refreshToken: localStorage.getItem('cn_refresh_token') }),
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
    avatarUrl: string | null;
}

export interface UserProfile {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    profile: StudentProfileData | any;
}

export interface PublicProfile {
    id: string;
    cnid: string;
    role: string;
    createdAt: string;
    profile: any;
    stats: {
        codeArenaScore: number | null;
        problemsSolved: number;
    };
}

export const userApi = {
    getMe: () => api.get<UserProfile>('/user/me'),
    getUniversities: () => api.get<{id: string, name: string}[]>('/user/universities'),
    createStudentProfile: (data: any) => api.post('/user/profile/student', data),
    updateStudentProfile: (data: any) => api.patch('/user/profile/student', data),
    createCompanyProfile: (data: any) => api.post('/user/profile/company', data),
    createUniversityProfile: (data: any) => api.post('/user/profile/university', data),
    getPublicProfile: (cnid: string) => api.get<PublicProfile>(`/user/${cnid}/profile`, false),
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
    register: (contestId: string) => api.post(`/contests/${contestId}/register`, {}),
    getRegistrations: (contestId: string) => api.get<any[]>(`/contests/${contestId}/registrations`),
    getLeaderboard: (contestId: string) => api.get<any>(`/contests/${contestId}/leaderboard`),
    getMyPercentile: (contestId: string) => api.get<{ percentile: number; totalParticipants: number }>(`/contests/${contestId}/percentile`),
    getPercentileLeaderboard: (contestId: string) => api.get<any[]>(`/contests/${contestId}/percentile-leaderboard`),
};

export interface EvaluationCandidate {
    id: string;
    student: string;
    university: string;
    recruiter: string;
    role: string;
    date: string;
    duration: string;
    rating: number;
    notes: string;
    evaluatorNote?: string;
    status: 'PENDING' | 'SELECTED' | 'REJECTED' | 'HOLD';
    questions: {
        title: string;
        testCasesPassed: number;
        totalTestCases: number;
        codeSubmission: string;
        language?: string;
    }[];
    technicalScore?: number;
    communicationScore?: number;
    cultureScore?: number;
}

export interface SubmitEvaluationPayload {
    verdict: 'SELECTED' | 'REJECTED' | 'HOLD';
    notes?: string;
    rating?: number;
    technicalScore?: number;
    communicationScore?: number;
    cultureScore?: number;
}

export const evaluationApi = {
    getCompanyEvaluations: (status?: string) => {
        const qs = status ? `?status=${status}` : '';
        return api.get<EvaluationCandidate[]>(`/evaluations/company${qs}`);
    },
    getEvaluationDetail: (interviewId: string) =>
        api.get<EvaluationCandidate>(`/evaluations/company/${interviewId}`),
    submitEvaluation: (interviewId: string, data: SubmitEvaluationPayload) =>
        api.patch(`/evaluations/${interviewId}`, data),
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
    imageUrl: string | null;
}

export interface CreateProjectPayload {
    title: string;
    description: string;
    techStack: string;
    githubLink?: string;
    liveLink?: string;
    imageUrl?: string;
}

export const uploadApi = {
    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("cn_token");
        const response = await fetch("/api/v1/uploads/avatar", {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });
        const json = await response.json();
        if (!response.ok) {
            throw new ApiRequestError(json.message || "Upload failed", response.status);
        }
        return json as ApiResponse<{ avatarUrl: string }>;
    },
    uploadProjectImage: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("cn_token");
        const response = await fetch("/api/v1/uploads/project-image", {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });
        const json = await response.json();
        if (!response.ok) {
            throw new ApiRequestError(json.message || "Upload failed", response.status);
        }
        return json as ApiResponse<{ imageUrl: string }>;
    },
};

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

export interface WebinarAttendee {
    id: string;
    webinarId: string;
    userId: string;
    role: string;
    joinedAt: string;
    leftAt: string | null;
    hasPermissionToSpeak: boolean;
}

export interface WebinarMessage {
    id: string;
    webinarId: string;
    senderId: string;
    senderName: string;
    content: string;
    isQuestion: boolean;
    createdAt: string;
}

export const webinarApi = {
    getAll: () => api.get<WebinarItem[]>('/webinars', false),
    getMyList: () => api.get<WebinarItem[]>('/webinars/my/list'),
    getById: (id: string) => api.get<WebinarItem>(`/webinars/${id}`, false),
    create: (data: CreateWebinarPayload) => api.post<WebinarItem>('/webinars', data),
    getAttendees: (webinarId: string) => api.get<WebinarAttendee[]>(`/webinars/${webinarId}/attendees`),
    joinWebinar: (webinarId: string, role?: string) => api.post<WebinarAttendee>(`/webinars/${webinarId}/join`, { role }),
    leaveWebinar: (webinarId: string) => api.post<WebinarAttendee>(`/webinars/${webinarId}/leave`, {}),
    getMessages: (webinarId: string) => api.get<WebinarMessage[]>(`/webinars/${webinarId}/messages`),
    postMessage: (webinarId: string, senderName: string, content: string, isQuestion?: boolean) =>
        api.post<WebinarMessage>(`/webinars/${webinarId}/messages`, { senderName, content, isQuestion }),
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
    getMessages: (id: string) => api.get<any[]>(`/interviews/${id}/messages`),
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
    getTimestamps: (id: string) => api.get<{ id: string; offsetMs: number; type: string; label: string }[]>(`/interviews/${id}/timestamps`),
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
    getSubmissions: (problemId?: string, page?: number, limit?: number) => {
        const params = new URLSearchParams();
        if (problemId) params.append('problemId', problemId);
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        const qs = params.toString() ? `?${params.toString()}` : '';
        return api.get(`/codearena/submissions${qs}`);
    },

    getLeaderboard: () => api.get(`/codearena/leaderboard`),
    getProfileStats: () => api.get(`/codearena/leaderboard/profile`),
};

// ==========================================
// Dashboard API
// ==========================================
export interface StudentDashboardData {
    profile: {
        name: string;
        branch: string;
        cgpa: number;
        university: string;
        codeArenaScore: number;
        status: string;
    };
    stats: {
        problemsSolved: number;
        totalSubmissions: number;
        accuracy: number;
        globalRank: number;
        streak: number;
        applications: number;
    };
    upcomingContests: {
        id: string;
        title: string;
        company: string;
        date: string;
        durationMins: number;
        problems: number;
        status: string;
    }[];
    upcomingInterviews: {
        id: string;
        role: string;
        type: string;
        scheduledAt: string;
        company: string;
        recruiter: string;
    }[];
    upcomingWebinars: {
        id: string;
        title: string;
        company: string;
        scheduledAt: string;
        durationMins: number;
    }[];
}

export interface CompanyDashboardData {
    profile: {
        name: string;
        industry: string | null;
        description: string | null;
    };
    stats: {
        partnerUniversities: number;
        totalStudentsReach: number;
        activeContests: number;
        totalContests: number;
        scheduledInterviews: number;
        completedInterviews: number;
        recruiters: number;
    };
    partnerUniversities: {
        id: string;
        name: string;
        location: string;
        tier: number;
        studentCount: number;
    }[];
    candidates: {
        id: string;
        name: string;
        branch: string;
        cgpa: number;
        university: string;
        problemsSolved: number;
        status: string;
    }[];
    recentContests: {
        id: string;
        title: string;
        date: string;
        durationMins: number;
        status: string;
        problems: number;
    }[];
    scheduledInterviews: {
        id: string;
        role: string;
        type: string;
        scheduledAt: string;
        student: string;
        studentBranch: string;
        studentUniversity: string;
        recruiter: string;
    }[];
}

export interface UniversityDashboardData {
    profile: { name: string; location: string; tier: number };
    stats: {
        totalStudents: number;
        placedStudents: number;
        availableStudents: number;
        placementRate: number;
        partnerCompanies: number;
        upcomingDrives: number;
    };
    students: {
        id: string;
        name: string;
        branch: string;
        cgpa: number;
        codeArenaScore: number;
        status: string;
        applications: number;
        problemsSolved: number;
    }[];
    topStudents: {
        id: string;
        name: string;
        branch: string;
        cgpa: number;
        codeArenaScore: number;
    }[];
    recentDrives: {
        id: string;
        title: string;
        company: string;
        date: string;
        problems: number;
        status: string;
    }[];
    upcomingWebinars: {
        id: string;
        title: string;
        company: string;
        scheduledAt: string;
        durationMins: number;
    }[];
}

export interface RecruiterDashboardData {
    profile: { name: string; company: string };
    stats: {
        totalInterviews: number;
        scheduledInterviews: number;
        completedInterviews: number;
        recordings: number;
    };
    scheduledInterviews: {
        id: string;
        role: string;
        type: string;
        scheduledAt: string;
        student: {
            id: string;
            name: string;
            branch: string;
            cgpa: number;
            specialization: string | null;
            university: string;
            projects: {
                id: string;
                title: string;
                description: string;
                techStack: string;
                githubLink: string | null;
                liveLink: string | null;
            }[];
            solvedProblems: { title: string; difficulty: string; topic: string }[];
        };
    }[];
    recordings: {
        id: string;
        recordingId: string;
        role: string;
        type: string;
        scheduledAt: string;
        videoUrl: string | null;
        duration: string | null;
        rating: number;
        verdict: string;
        notes: string | null;
        student: {
            id: string;
            name: string;
            branch: string;
            cgpa: number;
            university: string;
            solvedProblems: { title: string; difficulty: string; topic: string }[];
        };
    }[];
}

export const dashboardApi = {
    student: () => api.get<StudentDashboardData>('/dashboard/student'),
    company: () => api.get<CompanyDashboardData>('/dashboard/company'),
    university: () => api.get<UniversityDashboardData>('/dashboard/university'),
    recruiter: () => api.get<RecruiterDashboardData>('/dashboard/recruiter'),
};
