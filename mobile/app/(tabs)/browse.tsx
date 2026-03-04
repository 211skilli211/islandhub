import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../lib/api';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'all', label: 'All', icon: 'grid-outline' },
    { id: 'rental', label: 'Rentals', icon: 'home-outline' },
    { id: 'service', label: 'Services', icon: 'construct-outline' },
    { id: 'product', label: 'Products', icon: 'cart-outline' },
    { id: 'campaign', label: 'Causes', icon: 'heart-outline' },
];

export default function BrowseScreen() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchListings = useCallback(async (isRefreshing = false) => {
        if (!isRefreshing && listings.length === 0) setLoading(true);
        try {
            let path = `/listings?admin=true`;
            if (activeTab !== 'all') path += `&type=${activeTab}`;
            if (searchTerm) path += `&search=${encodeURIComponent(searchTerm)}`;

            const response = await api.get(path);
            if (response.ok) {
                setListings(response.data);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, activeTab]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchListings();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, activeTab, fetchListings]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchListings(true);
    };

    const renderHeader = () => (
        <View className="px-6 py-4 bg-white">
            <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-3xl font-black text-slate-900 tracking-tighter">Island Hub</Text>
                    <Text className="text-slate-500 font-medium tracking-tight">St. Kitts & Nevis Marketplace</Text>
                </View>
                <TouchableOpacity className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center">
                    <Ionicons name="notifications-outline" size={24} color="#1e293b" />
                    <View className="absolute top-3 right-3 w-3 h-3 bg-teal-500 rounded-full border-2 border-white" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-slate-100 rounded-2xl px-4 py-3 border border-slate-200">
                <Ionicons name="search" size={20} color="#64748b" />
                <TextInput
                    className="flex-1 ml-3 text-slate-900 font-semibold"
                    placeholder="Search anything..."
                    placeholderTextColor="#94a3b8"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                {searchTerm.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchTerm('')}>
                        <Ionicons name="close-circle" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Category Tabs */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={CATEGORIES}
                keyExtractor={(item) => item.id}
                className="mt-6 -mx-6"
                contentContainerStyle={{ paddingHorizontal: 24 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => setActiveTab(item.id)}
                        className={`mr-3 px-6 py-3 rounded-2xl flex-row items-center border ${activeTab === item.id
                                ? 'bg-teal-600 border-teal-600 shadow-md shadow-teal-600/30'
                                : 'bg-white border-slate-200'
                            }`}
                    >
                        <Ionicons
                            name={item.icon as any}
                            size={18}
                            color={activeTab === item.id ? 'white' : '#64748b'}
                        />
                        <Text className={`ml-2 font-bold ${activeTab === item.id ? 'text-white' : 'text-slate-600'}`}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    const renderListingItem = ({ item }: { item: any }) => (
        <Link href={`/listings/${item.id}`} asChild>
            <TouchableOpacity className="bg-white rounded-[32px] mb-6 shadow-sm border border-slate-100 overflow-hidden mx-6">
                <View className="relative h-48 bg-slate-100 items-center justify-center">
                    <Text className="text-6xl opacity-20">
                        {item.type === 'campaign' ? '❤️' : item.type === 'rental' ? '🏠' : '🛠️'}
                    </Text>

                    {item.is_promoted && (
                        <View className="absolute top-4 left-4 bg-amber-400 px-3 py-1 rounded-full flex-row items-center shadow-sm">
                            <Ionicons name="sparkles" size={12} color="#92400e" className="mr-1" />
                            <Text className="text-[10px] font-black text-amber-900 uppercase">Featured</Text>
                        </View>
                    )}

                    <View className="absolute bottom-4 right-4 bg-white/90 px-3 py-1.5 rounded-2xl shadow-sm backdrop-blur-md">
                        <Text className="text-teal-700 font-bold">
                            {item.type === 'campaign' ? 'CAUSE' : item.type.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View className="p-5">
                    <Text className="text-slate-900 text-xl font-bold tracking-tight mb-1" numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View className="flex-row justify-between items-center mt-2">
                        <View>
                            <Text className="text-teal-600 text-xs font-black uppercase tracking-widest">
                                {item.category || 'General'}
                            </Text>
                            <Text className="text-slate-900 text-lg font-black mt-0.5">
                                {item.type === 'campaign'
                                    ? `$${Number(item.goal_amount).toLocaleString()} Goal`
                                    : `$${Number(item.price).toLocaleString()}`}
                            </Text>
                        </View>
                        <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <FlatList
                data={listings}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                renderItem={renderListingItem}
                onRefresh={onRefresh}
                refreshing={refreshing}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={
                    !loading ? (
                        <View className="items-center justify-center py-20 px-10">
                            <View className="w-24 h-24 bg-slate-50 rounded-full items-center justify-center mb-6">
                                <Ionicons name="search-outline" size={48} color="#cbd5e1" />
                            </View>
                            <Text className="text-2xl font-black text-slate-900 text-center mb-2">No results found</Text>
                            <Text className="text-slate-500 text-center text-lg px-6 leading-6">
                                We couldn't find anything matching "{searchTerm}". Try another search!
                            </Text>
                        </View>
                    ) : null
                }
            />
            {loading && listings.length === 0 && (
                <View className="absolute inset-0 bg-white/50 items-center justify-center">
                    <ActivityIndicator size="large" color="#0d9488" />
                </View>
            )}
        </SafeAreaView>
    );
}

