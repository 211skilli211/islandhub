import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Share } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth';
import { Ionicons } from '@expo/vector-icons';

// Hardcoded IP - same as others
const API_BASE = 'http://192.168.1.122:5000/api';

export default function ListingDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user, token } = useAuth();
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [contacting, setContacting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchListing();
        }
    }, [id]);

    const fetchListing = async () => {
        try {
            const res = await fetch(`${API_BASE}/listings/${id}`);
            const data = await res.json();
            setListing(data);
        } catch (error) {
            console.error('Error fetching listing:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMessageVendor = async () => {
        if (!user || !token) {
            Alert.alert('Login Required', 'Please log in to message this vendor.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log In', onPress: () => router.push('/(auth)/login') }
            ]);
            return;
        }

        if (user.id === listing.vendor_id) {
            Alert.alert('Note', "This is your own listing.");
            return;
        }

        setContacting(true);
        try {
            // Check for existing conversation or create new
            const res = await fetch(`${API_BASE}/messages/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipient_id: listing.vendor_id,
                    initial_text: `Hi! I'm interested in your listing: "${listing.title}"`
                })
            });

            const data = await res.json();
            if (res.ok) {
                router.push(`/messages/${data.conversation_id}`);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to start conversation');
        } finally {
            setContacting(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${listing.title} on IslandHub! ${listing.type === 'rental' ? 'Available for rent now.' : 'A must-see!'}`,
                url: `https://islandhub.com/listings/${id}` // Web link for preview
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0d9488" />
            </View>
        );
    }

    if (!listing) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Listing not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: '',
                    headerTransparent: true,
                    headerTintColor: '#0f172a',
                    headerRight: () => (
                        <TouchableOpacity onPress={handleShare} style={styles.circleButton}>
                            <Ionicons name="share-outline" size={22} color="#0f172a" />
                        </TouchableOpacity>
                    )
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.heroImage, { backgroundColor: listing.type === 'rental' ? '#f0fdfa' : '#f8fafc' }]}>
                    <Text style={styles.emoji}>
                        {listing.type === 'rental' ? '🏠' : listing.type === 'service' ? '🛠️' : '🏎️'}
                    </Text>
                    {listing.is_promoted && (
                        <View style={styles.promotedBadge}>
                            <Text style={styles.promotedText}>Featured</Text>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <View style={styles.metaRow}>
                        <Text style={styles.categoryBadge}>{listing.category || listing.type}</Text>
                        <Text style={styles.location}>📍 {listing.location || 'St. Kitts'}</Text>
                    </View>

                    <Text style={styles.title}>{listing.title}</Text>

                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>{listing.type === 'rental' ? 'Price per day' : 'Direct Booking'}</Text>
                        <Text style={styles.priceValue}>${Number(listing.price).toLocaleString()}</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{listing.description}</Text>

                    {listing.metadata && Object.keys(listing.metadata).length > 0 && (
                        <View style={styles.specsContainer}>
                            <Text style={styles.sectionTitle}>Specifications</Text>
                            <View style={styles.specsGrid}>
                                {Object.entries(listing.metadata).map(([key, value]) => {
                                    if (key === 'sub_type' || value === '') return null;
                                    return (
                                        <View key={key} style={styles.specItem}>
                                            <Text style={styles.specKey}>{key.replace(/_/g, ' ')}</Text>
                                            <Text style={styles.specValue}>
                                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    <View style={styles.vendorCard}>
                        <View style={styles.vendorInfo}>
                            <View style={styles.vendorAvatar}>
                                <Text style={styles.vendorAvatarText}>{listing.vendor_name?.charAt(0) || 'V'}</Text>
                            </View>
                            <View>
                                <Text style={styles.vendorName}>{listing.vendor_name || 'Verified Vendor'}</Text>
                                <Text style={styles.vendorSub}>IslandHub Pro Vendor</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            <View style={styles.stickyFooter}>
                <TouchableOpacity
                    style={styles.messageButton}
                    onPress={handleMessageVendor}
                    disabled={contacting}
                >
                    {contacting ? (
                        <ActivityIndicator color="#0d9488" />
                    ) : (
                        <>
                            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#0d9488" />
                            <Text style={styles.messageButtonText}>Message</Text>
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </View>
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
        padding: 40,
    },
    heroImage: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    emoji: {
        fontSize: 100,
    },
    promotedBadge: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#fbbf24',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    promotedText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#78350f',
        textTransform: 'uppercase',
    },
    content: {
        padding: 24,
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryBadge: {
        backgroundColor: '#ccfbf1',
        color: '#0f766e',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    location: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
    },
    priceLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    priceValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 24,
        marginBottom: 24,
    },
    specsContainer: {
        marginBottom: 24,
    },
    specsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    specItem: {
        width: '47%',
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    specKey: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    specValue: {
        fontSize: 14,
        color: '#0f172a',
        fontWeight: '700',
    },
    vendorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    vendorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vendorAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#0d9488',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    vendorAvatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    vendorName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
    },
    vendorSub: {
        fontSize: 12,
        color: '#64748b',
    },
    stickyFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 20,
        paddingBottom: 40,
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    messageButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#0d9488',
        borderRadius: 16,
        marginRight: 12,
        height: 56,
    },
    messageButtonText: {
        marginLeft: 8,
        color: '#0d9488',
        fontWeight: '800',
        fontSize: 16,
    },
    bookButton: {
        flex: 2,
        backgroundColor: '#0f172a',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
    },
    bookButtonText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 18,
    },
    circleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    errorText: {
        fontSize: 18,
        color: '#64748b',
        marginBottom: 20,
    },
    backButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#0d9488',
        borderRadius: 12,
    },
    backButtonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});
