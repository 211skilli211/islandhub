import { create } from 'zustand';
import api from './api';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar_url?: string;
    cover_photo_url?: string;
    vehicle_type?: string;
    is_verified_driver?: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
    refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
    // Initialize from localStorage
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    // Listen for storage changes (logout from other tabs)
    if (typeof window !== 'undefined') {
        window.addEventListener('storage', (e) => {
            if (e.key === 'token' && !e.newValue) {
                // Token was removed, logout this tab too
                set({ token: null, user: null, isAuthenticated: false });
            }
        });
    }

    return {
        user: storedUser ? JSON.parse(storedUser) : null,
        token: storedToken,
        isAuthenticated: !!storedToken,
        login: (token, user) => {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            set({ token, user, isAuthenticated: true });
        },
        logout: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ token: null, user: null, isAuthenticated: false });
            // Trigger storage event for other tabs
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'token',
                oldValue: storedToken,
                newValue: null,
                url: window.location.href
            }));
        },
        setUser: (user) => {
            localStorage.setItem('user', JSON.stringify(user));
            set({ user });
        },
        refreshUser: async () => {
            try {
                const response = await api.get('/users/me');
                if (response.data) {
                    localStorage.setItem('user', JSON.stringify(response.data));
                    set({ user: response.data, isAuthenticated: true });
                }
            } catch (error) {
                console.error('Failed to refresh user', error);
                // If it fails with 401, we might want to logout
                if ((error as any).response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    set({ user: null, token: null, isAuthenticated: false });
                }
            }
        },
    };
});

export const registerUser = async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};
