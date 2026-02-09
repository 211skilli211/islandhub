import { createContext, useContext, useState, PropsWithChildren } from 'react';
import { useRouter, useSegments } from 'expo-router';
import api from '../../lib/api';

// Define the shape of the context
interface AuthContextType {
    user: any | null;
    token: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    signIn: async () => { },
    signOut: () => { },
    isLoading: false,
});

// Hook for easy access
export const useAuth = () => useContext(AuthContext);

// Provider Component
export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.ok) {
                setUser(response.data.user);
                setToken(response.data.token);
                api.setToken(response.data.token);
                // Navigate to tabs after successful login
                router.replace('/(tabs)/browse');
            } else {
                alert(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Check server connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = () => {
        setUser(null);
        setToken(null);
        router.replace('/(auth)/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, signIn, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
