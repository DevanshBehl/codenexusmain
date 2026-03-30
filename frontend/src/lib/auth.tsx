import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, userApi, type AuthUser, type LoginPayload, type SignupPayload, ApiRequestError } from './api';

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginPayload) => Promise<void>;
    signup: (data: SignupPayload) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('cn_token');
        const storedUser = localStorage.getItem('cn_user');
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('cn_token');
                localStorage.removeItem('cn_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (data: LoginPayload) => {
        const res = await authApi.login(data);
        const { user: loggedInUser, token: jwt } = res.data;
        setUser(loggedInUser);
        setToken(jwt);
        localStorage.setItem('cn_token', jwt);
        localStorage.setItem('cn_user', JSON.stringify(loggedInUser));
    };

    const signup = async (data: SignupPayload) => {
        await authApi.signup(data);
        // Auto-login after signup
        await login({ email: data.email, password: data.password });
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('cn_token');
        localStorage.removeItem('cn_user');
    };

    const refreshUser = async () => {
        try {
            const res = await userApi.getMe();
            const profileData = res.data;
            setUser({
                id: profileData.id,
                email: profileData.email,
                role: profileData.role,
            });
            localStorage.setItem('cn_user', JSON.stringify({
                id: profileData.id,
                email: profileData.email,
                role: profileData.role,
            }));
        } catch (e) {
            if (e instanceof ApiRequestError && e.statusCode === 401) {
                logout();
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token && !!user,
                login,
                signup,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}

// Role-based route guard helper
export function getRoleDashboard(role: string): string {
    switch (role) {
        case 'STUDENT': return '/student/dashboard';
        case 'UNIVERSITY': return '/university/dashboard';
        case 'COMPANY_ADMIN': return '/company/dashboard';
        case 'RECRUITER': return '/recruiter/dashboard';
        default: return '/login';
    }
}
