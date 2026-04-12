import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#14b8a6', // Teal 500
            tabBarInactiveTintColor: '#94a3b8', // Slate 400
            tabBarStyle: {
                position: 'absolute',
                borderTopWidth: 0,
                elevation: 0,
                height: Platform.OS === 'ios' ? 88 : 68,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                paddingBottom: Platform.OS === 'ios' ? 30 : 12,
                paddingTop: 12,
            },
            tabBarBackground: () => (
                <View
                    style={{ flex: 1, backgroundColor: 'white' }}
                    className="border-t border-slate-100"
                />
            ),
            tabBarLabelStyle: {
                fontWeight: '800',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginTop: 4,
            },
            headerShown: false,
        }}>
            <Tabs.Screen
                name="browse"
                options={{
                    title: 'Hub',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={22} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Island ID',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
