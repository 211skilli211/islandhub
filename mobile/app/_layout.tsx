import { Stack, useSegments, useRouter } from 'expo-router';
import '../global.css';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './context/auth';
import { useEffect } from 'react';

function InitialLayout() {
    const { user, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            // Redirect to login if user is not authenticated and not in auth screens
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            // Redirect to home if user is authenticated but trying to access auth screens
            router.replace('/(tabs)/browse');
        }
    }, [user, isLoading, segments]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="listings/[id]" />
            <Stack.Screen name="messages/[id]" />
            <Stack.Screen name="campaigns/[id]" />
        </Stack>
    );
}

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <InitialLayout />
                <StatusBar style="auto" />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
