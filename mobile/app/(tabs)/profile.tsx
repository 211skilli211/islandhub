import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import api from '../../lib/api';

const TIER_STYLES: Record<string, any> = {
    vip: { color: '#8b5cf6', bg: '#f5f3ff', icon: '💎' },
    premium: { color: '#0ea5e9', bg: '#f0f9ff', icon: '✨' },
    enterprise: { color: '#f59e0b', bg: '#fffbeb', icon: '🏢' },
    basic: { color: '#64748b', bg: '#f1f5f9', icon: '📦' }
};

export default function ProfileScreen() {
    const { user, token, signOut } = useAuth();
    const router = useRouter();
    const [listings, setListings] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && token) {
            fetchVendorData();
        }
    }, [user, token]);

    const fetchVendorData = async () => {
        setLoading(true);
        try {
            // Fetch vendor's listings
            const listingsRes = await api.get(`/listings/vendor/${user.id}`);
            if (listingsRes.ok) setListings(listingsRes.data);

            // Fetch vendor stats (ROI Analytics)
            const statsRes = await api.get(`/analytics/vendor/${user.id}`);
            if (statsRes.ok) setStats(statsRes.data);

            // Fetch user subscription tier (new)
            const endpoint = user.role === 'vendor' ? '/vendor-subscriptions/my'
                : user.role === 'buyer' ? '/customer-subscriptions/my'
                    : '/campaign-creator-subscriptions/my';

            const subRes = await api.get(endpoint);
            if (subRes.ok) setSubscription(subRes.data);

        } catch (error) {
            console.error('Error fetching vendor data', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <View style={styles.center}>
                    <Text style={styles.title}>Welcome back 🏝️</Text>
                    <Text style={styles.subtitle}>Log in to manage your Hub presence and view analytics.</Text>
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
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user.name?.charAt(0)}</Text>
                </View>
                <View style={styles.headerInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.greeting}>{user.name}</Text>
                        {subscription?.tier && (
                            <View style={[styles.tierBadge, { backgroundColor: TIER_STYLES[subscription.tier.toLowerCase()]?.bg || '#f1f5f9' }]}>
                                <Text style={[styles.tierText, { color: TIER_STYLES[subscription.tier.toLowerCase()]?.color || '#64748b' }]}>
                                    {TIER_STYLES[subscription.tier.toLowerCase()]?.icon} {subscription.tier.toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.email}>{user.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user.role || 'Member'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                    <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                </TouchableOpacity>
            </View>

            {subscription && (
                <View style={styles.subscriptionBanner}>
                    <View style={styles.subInfo}>
                        <Text style={styles.subTitle}>Active Subscription</Text>
                        <Text style={styles.subStatus}>
                            {subscription.status === 'active' ? '✅ Active' : '⏳ Processing'} • Ends {new Date(subscription.current_period_end).toLocaleDateString()}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.manageButton}>
                        <Text style={styles.manageButtonText}>Manage</Text>
                    </TouchableOpacity>
                </View>
            )}

            {user.role === 'vendor' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Performance Overview</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>Views</Text>
                            <Text style={styles.statValue}>{stats?.total_views || 0}</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>Revenue</Text>
                            <Text style={styles.statValue}>${stats?.total_revenue || 0}</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>Credits</Text>
                            <Text style={styles.statValue}>{stats?.promotion_credits || 0}</Text>
                        </View>
                    </View>
                </View>
            )}

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {user.role === 'vendor' ? 'My Active Hub Listings' : 'Recent Bookings'}
                    </Text>
                    <TouchableOpacity onPress={() => fetchVendorData()}>
                        <Ionicons name="refresh" size={20} color="#0d9488" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator color="#0d9488" size="large" style={{ marginTop: 20 }} />
                ) : (
                    listings.length > 0 ? (
                        listings.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.cardTitle}>{item.title}</Text>
                                        <Text style={styles.cardCategory}>{item.category || item.type}</Text>
                                    </View>
                                    <Text style={styles.cardPrice}>${Number(item.price).toLocaleString()}</Text>
                                </View>
                                <View style={styles.cardFooter}>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>{item.status || 'Active'}</Text>
                                    </View>
                                    <View style={styles.cardStats}>
                                        <Ionicons name="eye-outline" size={14} color="#64748b" />
                                        <Text style={styles.cardStatsText}>{item.views || 0} views</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📦</Text>
                            <Text style={styles.emptyText}>No listings yet.</Text>
                            <TouchableOpacity style={styles.createButton}>
                                <Text style={styles.createButtonText}>List Something New</Text>
                            </TouchableOpacity>
                        </View>
                    )
                )}
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
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
        backgroundColor: 'white',
        minHeight: 600,
    },
    header: {
        backgroundColor: 'white',
        padding: 24,
        paddingTop: 80,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#0d9488',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: 'white',
        fontSize: 28,
        fontWeight: '900',
    },
    headerInfo: {
        flex: 1,
    },
    greeting: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    email: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 6,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 20,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    logoutButton: {
        padding: 8,
    },
    section: {
        padding: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '700',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
    },
    cardCategory: {
        fontSize: 12,
        color: '#0d9488',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0f172a',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    statusBadge: {
        backgroundColor: '#f0fdfa',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        color: '#0f766e',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    cardStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardStatsText: {
        fontSize: 12,
        color: '#64748b',
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'white',
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#f1f5f9',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748b',
        marginBottom: 16,
    },
    createButton: {
        backgroundColor: '#0d9488',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    createButtonText: {
        color: 'white',
        fontWeight: '800',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 32,
    },
    button: {
        backgroundColor: '#0d9488',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
    tierBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    tierText: {
        fontSize: 10,
        fontWeight: '900',
    },
    subscriptionBanner: {
        backgroundColor: 'white',
        marginHorizontal: 24,
        marginTop: -20,
        padding: 20,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    subInfo: {
        flex: 1,
    },
    subTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 2,
    },
    subStatus: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
    },
    manageButton: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    manageButtonText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0f172a',
    }
});
