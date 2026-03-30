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
export interface UserProfile {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    profile: any;
}

export const userApi = {
    getMe: () => api.get<UserProfile>('/user/me'),
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
    status: string;
    company: {
        name: string;
        industry: string | null;
    };
    _count: {
        problems: number;
    };
}

export const contestApi = {
    getAll: () => api.get<ContestListItem[]>('/contests', false),
    getById: (id: string) => api.get<any>(`/contests/${id}`, false),
    create: (data: any) => api.post('/contests', data),
};

// ─── Problem APIs ───
export interface ProblemListItem {
    id: string;
    title: string;
    difficulty: string;
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
