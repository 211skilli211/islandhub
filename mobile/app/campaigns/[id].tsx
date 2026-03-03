import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/auth';

// Using the same LAN IP as Browse Screen
const API_BASE = 'http://192.168.1.122:5000/api';

export default function CampaignDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [campaign, setCampaign] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [signingUp, setSigningUp] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            // 1. Fetch Campaign Details
            const campaignRes = await fetch(`${API_BASE}/campaigns/${id}`);
            const campaignData = await campaignRes.json();
            setCampaign(campaignData);

            // 2. Fetch Campaign Events
            const eventsRes = await fetch(`${API_BASE}/events/campaign/${id}`);
            const eventsData = await eventsRes.json();
            if (Array.isArray(eventsData)) {
                setEvents(eventsData);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (eventId: number) => {
        if (!user) {
            alert('Please log in to sign up!');
            router.push('/(auth)/login');
            return;
        }

        setSigningUp(eventId);
        try {
            const response = await fetch(`${API_BASE}/events/${eventId}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            });

            if (response.ok) {
                alert('Successfully signed up! 🎉');
            } else {
                const err = await response.json();
                alert(err.message || 'Signup failed');
            }
        } catch (error) {
            console.error(error);
            alert('Network error during signup');
        } finally {
            setSigningUp(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0d9488" />
            </View>
        );
    }

    if (!campaign) {
        return (
            <View style={styles.center}>
                <Text>Campaign not found</Text>
            </View>
        );
    }

    const progress = Math.min((Number(campaign.current_amount) / Number(campaign.goal_amount)) * 100, 100);

    return (
        <>
            <Stack.Screen options={{ title: campaign.title, headerBackTitle: 'Back' }} />
            <ScrollView style={styles.container}>
                {/* Placeholder Image */}
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.emoji}>🏝️</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.category}>{campaign.category}</Text>
                    <Text style={styles.title}>{campaign.title}</Text>

                    <View style={styles.progressContainer}>
                        <Text style={styles.amount}>${Number(campaign.current_amount).toLocaleString()} raised</Text>
                        <Text style={styles.goal}>of ${Number(campaign.goal_amount).toLocaleString()}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.percentage}>{Math.round(progress)}% Funded</Text>

                    <Text style={styles.sectionHeader}>About</Text>
                    <Text style={styles.description}>{campaign.description}</Text>

                    {/* Events Section */}
                    {events.length > 0 && (
                        <View style={styles.eventsSection}>
                            <Text style={styles.sectionHeader}>Upcoming Events & Volunteering</Text>
                            {events.map((event) => (
                                <View key={event.event_id} style={styles.eventCard}>
                                    <Text style={styles.eventTitle}>📅 {event.title}</Text>
                                    <Text style={styles.eventDetail}>Type: {event.event_type}</Text>
                                    <Text style={styles.eventDetail}>When: {new Date(event.start_time).toLocaleDateString()} @ {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    <Text style={styles.eventDetail}>Where: {event.location}</Text>
                                    <TouchableOpacity
                                        style={[styles.signupButton, signingUp === event.event_id && styles.disabledButton]}
                                        onPress={() => handleSignup(event.event_id)}
                                        disabled={signingUp === event.event_id}
                                    >
                                        <Text style={styles.signupButtonText}>
                                            {signingUp === event.event_id ? 'Signing up...' : 'Sign Up'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    <TouchableOpacity style={styles.donateButton}>
                        <Text style={styles.donateButtonText}>Donate Now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholder: {
        height: 200,
        backgroundColor: '#ccfbf1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 64,
    },
    content: {
        padding: 20,
    },
    category: {
        color: '#0d9488',
        fontWeight: '600',
        textTransform: 'uppercase',
        fontSize: 12,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    amount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f766e',
        marginRight: 8,
    },
    goal: {
        fontSize: 14,
        color: '#6b7280',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#ccfbf1',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#0d9488',
    },
    percentage: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 8,
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        marginBottom: 24,
    },
    eventsSection: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#f0fdfa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccfbf1'
    },
    eventCard: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f766e',
        marginBottom: 4,
    },
    eventDetail: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 2,
    },
    signupButton: {
        marginTop: 8,
        backgroundColor: '#cffafe',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    signupButtonText: {
        color: '#0e7490',
        fontWeight: '600',
        fontSize: 14,
    },
    donateButton: {
        backgroundColor: '#0d9488',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    donateButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
});
