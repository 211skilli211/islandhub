import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../lib/api';
const CACHE_KEY = 'islandhub_browse_cache';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: 'grid' },
    { id: 'rental', label: 'Rentals', icon: 'car' },
    { id: 'service', label: 'Services', icon: 'briefcase' },
    { id: 'product', label: 'Products', icon: 'cart' },
    { id: 'campaign', label: 'Causes', icon: 'heart' },
];

export default function BrowseScreen() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCache();
    }, []);

    const loadCache = async () => {
        try {
            const cached = await AsyncStorage.getItem(CACHE_KEY);
            if (cached) {
                setListings(JSON.parse(cached));
                setLoading(false);
            }
        } catch (e) {
            console.error('Failed to load cache', e);
        }
    };

    const fetchListings = async () => {
        if (!searchTerm) setLoading(listings.length === 0);
        try {
            let path = `/listings?admin=true`;
            if (activeTab !== 'all') {
                path += `&type=${activeTab}`;
            }
            if (searchTerm) {
                path += `&search=${encodeURIComponent(searchTerm)}`;
            }

            const response = await api.get(path);

            if (response.ok) {
                setListings(response.data);

                // Save to cache for 'all' tab and no search
                if (activeTab === 'all' && !searchTerm) {
                    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(response.data));
                }
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchListings();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, activeTab]);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Discovery Hub</Text>
                <Text style={styles.subHeader}>St. Kitts & Nevis Marketplace</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#94a3b8" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search anything..."
                    placeholderTextColor="#94a3b8"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            <View style={styles.tabContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIES}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setActiveTab(item.id)}
                            style={[styles.tab, activeTab === item.id && styles.activeTab]}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={18}
                                color={activeTab === item.id ? '#fff' : '#64748b'}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={[styles.tabText, activeTab === item.id && styles.activeTabText]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                />
            </View>

            {loading && listings.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0d9488" />
                </View>
            ) : (
                <FlatList
                    data={listings}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Link href={`/listings/${item.id}`} asChild>
                            <TouchableOpacity style={styles.card}>
                                <View style={styles.imagePlaceholder}>
                                    <Text style={styles.emoji}>
                                        {item.type === 'campaign' ? '❤️' : item.type === 'rental' ? '🏠' : '🛠️'}
                                    </Text>
                                    {item.is_promoted && (
                                        <View style={styles.promotedBadge}>
                                            <Text style={styles.promotedText}>Featured</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.content}>
                                    <Text style={styles.category}>{item.category || item.type}</Text>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <View style={styles.footer}>
                                        <Text style={styles.price}>
                                            {item.type === 'campaign'
                                                ? `Goal: $${Number(item.goal_amount).toLocaleString()}`
                                                : `$${Number(item.price).toLocaleString()}`}
                                        </Text>
                                        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>🏝️</Text>
                            <Text style={styles.emptyText}>No matches found.</Text>
                            <Text style={styles.emptySubText}>Try adjusting your filters or search terms.</Text>
                        </View>
                    }
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
    headerContainer: {
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        paddingBottom: 20,
    },
    header: {
        fontSize: 32,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -1,
    },
    subHeader: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginTop: -15,
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 56,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#0f172a',
        marginLeft: 10,
        fontWeight: '600',
    },
    tabContainer: {
        marginTop: 20,
        marginBottom: 10,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        marginRight: 8,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    activeTab: {
        backgroundColor: '#0f172a',
        borderColor: '#0f172a',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#64748b',
    },
    activeTabText: {
        color: 'white',
    },
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    imagePlaceholder: {
        height: 160,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    emoji: {
        fontSize: 48,
    },
    promotedBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#fbbf24',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    promotedText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#78350f',
        textTransform: 'uppercase',
    },
    content: {
        padding: 16,
    },
    category: {
        fontSize: 10,
        fontWeight: '900',
        color: '#0d9488',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 8,
    } as any, // Temporary fix for h3 style object
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0f172a',
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 4,
    },
    emptySubText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
    },
});

