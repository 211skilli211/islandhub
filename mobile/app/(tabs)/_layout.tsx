import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#0d9488',
            tabBarInactiveTintColor: '#94a3b8',
            tabBarStyle: {
                borderTopWidth: 1,
                borderTopColor: '#f1f5f9',
                height: 60,
                paddingBottom: 8,
            },
            tabBarLabelStyle: {
                fontWeight: 'bold',
                fontSize: 12,
            },
            headerShown: false,
        }}>
            <Tabs.Screen
                name="browse"
                options={{
                    title: 'Hub',
                    tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
