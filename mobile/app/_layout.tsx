import { Stack } from 'expo-router';
import '../global.css';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/auth';

export default function Layout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="listings/[id]" />
                <Stack.Screen name="messages/[id]" />
                <Stack.Screen name="campaigns/[id]" />
            </Stack>
            <StatusBar style="auto" />
        </AuthProvider>
    );
}
