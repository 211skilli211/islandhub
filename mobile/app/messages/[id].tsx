import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/auth';
import { Ionicons } from '@expo/vector-icons';

// Hardcoded IP - same as others
const API_BASE = 'http://192.168.1.122:5000/api';

export default function ChatScreen() {
    const { id: conversationId } = useLocalSearchParams();
    const { user, token } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState<any>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (conversationId && token) {
            fetchMessages();
            // Polling for demo purposes - Phase 5 uses WebSockets but for mobile parity we'll start simple
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [conversationId, token]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_BASE}/messages/${conversationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setMessages(data.messages || []);
            setOtherUser(data.other_user);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch(`${API_BASE}/messages/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    recipient_id: otherUser?.user_id,
                    text: newMessage.trim()
                })
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages();
                // Scroll to bottom
                setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0d9488" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <Stack.Screen
                options={{
                    title: otherUser?.name || 'Chat',
                    headerShown: true,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: 'white' },
                    headerTitleStyle: { fontWeight: '900', color: '#0f172a' }
                }}
            />

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.message_id.toString()}
                renderItem={({ item }) => {
                    const isMe = item.sender_id === user?.id;
                    return (
                        <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
                            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                                {item.text}
                            </Text>
                            <Text style={[styles.timeText, isMe ? styles.myTime : styles.theirTime]}>
                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    );
                }}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, !newMessage.trim() && styles.disabledSend]}
                    onPress={sendMessage}
                    disabled={!newMessage.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Ionicons name="send" size={20} color="white" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#0d9488',
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    myMessageText: {
        color: 'white',
        fontWeight: '500',
    },
    theirMessageText: {
        color: '#0f172a',
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
    },
    myTime: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'right',
    },
    theirTime: {
        color: '#94a3b8',
    },
    inputArea: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
        color: '#0f172a',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#0d9488',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    disabledSend: {
        backgroundColor: '#cbd5e1',
    }
});
