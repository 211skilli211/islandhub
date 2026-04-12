
// Centralized API utility for the mobile application
const BASE_URL = 'http://192.168.1.122:5001/api';

export interface ApiResponse<T = any> {
    data: T;
    ok: boolean;
    status: number;
    message?: string;
}

class Api {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
    }

    async request<T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

        const headers = new Headers(options.headers);
        headers.set('Content-Type', 'application/json');

        if (this.token) {
            headers.set('Authorization', `Bearer ${this.token}`);
        }

        try {
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();

            return {
                data,
                ok: response.ok,
                status: response.status,
                message: data.message
            };
        } catch (error) {
            console.error(`API Error (${path}):`, error);
            return {
                data: null as any,
                ok: false,
                status: 500,
                message: 'Network error or server unreachable'
            };
        }
    }

    get<T = any>(path: string, options: RequestInit = {}) {
        return this.request<T>(path, { ...options, method: 'GET' });
    }

    post<T = any>(path: string, body: any, options: RequestInit = {}) {
        return this.request<T>(path, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    put<T = any>(path: string, body: any, options: RequestInit = {}) {
        return this.request<T>(path, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    patch<T = any>(path: string, body: any, options: RequestInit = {}) {
        return this.request<T>(path, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }

    delete<T = any>(path: string, options: RequestInit = {}) {
        return this.request<T>(path, { ...options, method: 'DELETE' });
    }
}

export const api = new Api();
export default api;
