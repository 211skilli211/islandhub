import { createContext, useContext, useState, PropsWithChildren, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import api from '../../lib/api';
import * as SecureStore from 'expo-secure-store';

// Define the shape of the context
interface AuthContextType {
    user: any | null;
    token: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (name: string, email: string, password: string, role: string) => Promise<boolean>;
    signOut: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    signIn: async () => { },
    signUp: async () => false,
    signOut: () => { },
    isLoading: false,
});

// Hook for easy access
export const useAuth = () => useContext(AuthContext);

// Provider Component
export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Load token on boot
        const loadToken = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync('user_token');
                const storedUser = await SecureStore.getItemAsync('user_data');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    api.setToken(storedToken);
                }
            } catch (error) {
                console.error('Failed to load auth data', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadToken();
    }, []);

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.ok) {
                const { user: userData, token: userToken } = response.data;
                setUser(userData);
                setToken(userToken);
                api.setToken(userToken);

                // Persist
                await SecureStore.setItemAsync('user_token', userToken);
                await SecureStore.setItemAsync('user_data', JSON.stringify(userData));

                // Navigate to tabs after successful login
                router.replace('/(tabs)/browse');
            } else {
                throw new Error(response.data?.message || 'Login failed');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            alert(error.message || 'An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (name: string, email: string, password: string, role: string) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/register', { name, email, password, role });

            if (response.ok) {
                const { user: userData, token: userToken } = response.data;
                setUser(userData);
                setToken(userToken);
                api.setToken(userToken);

                // Persist
                await SecureStore.setItemAsync('user_token', userToken);
                await SecureStore.setItemAsync('user_data', JSON.stringify(userData));

                return true;
            }
            return false;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        setUser(null);
        setToken(null);
        api.setToken(null);

        // Remove persist
        await SecureStore.deleteItemAsync('user_token');
        await SecureStore.deleteItemAsync('user_data');

        router.replace('/(auth)/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, signIn, signUp, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
