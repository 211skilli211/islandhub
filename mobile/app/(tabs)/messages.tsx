import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

// Hardcoded IP - same as profile
const API_BASE = 'http://192.168.1.122:5000/api';

export default function MessagesScreen() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && token) {
            fetchChats();
        }
    }, [user, token]);

    const fetchChats = async () => {
        setLoading(true);
        try {
            // Simplified fetch for mobile - we'll refine this as we port more Phase 5 logic
            const res = await fetch(`${API_BASE}/messages/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setChats(data);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <View style={[styles.center, { backgroundColor: 'white' }]}>
                    <Text style={styles.title}>Your Inbox</Text>
                    <Text style={styles.subtitle}>Log in to see your messages and chat with vendors.</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <Text style={styles.buttonText}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0d9488" />
                </View>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.conversation_id.toString()}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>💬</Text>
                            <Text style={styles.emptyText}>No messages yet.</Text>
                            <Text style={styles.emptySub}>Start a conversation from a listing page!</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.chatCard}
                            onPress={() => router.push(`/messages/${item.conversation_id}`)}
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{item.other_user_name?.charAt(0) || '?'}</Text>
                            </View>
                            <View style={styles.chatInfo}>
                                <View style={styles.chatHeader}>
                                    <Text style={styles.chatName}>{item.other_user_name}</Text>
                                    <Text style={styles.chatTime}>{new Date(item.last_message_at).toLocaleDateString()}</Text>
                                </View>
                                <Text style={styles.lastMessage} numberOfLines={1}>
                                    {item.last_message_text}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#0d9488',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
    listContent: {
        padding: 16,
    },
    chatCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#64748b',
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
    },
    chatTime: {
        fontSize: 12,
        color: '#94a3b8',
    },
    lastMessage: {
        fontSize: 14,
        color: '#64748b',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    }
});
