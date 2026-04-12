import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useAuth } from '../context/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../lib/api';

const TIER_STYLES: Record<string, any> = {
    vip: { color: '#8b5cf6', bg: '#f5f3ff', icon: 'diamond-outline' },
    premium: { color: '#0ea5e9', bg: '#f0f9ff', icon: 'sparkles-outline' },
    enterprise: { color: '#f59e0b', bg: '#fffbeb', icon: 'business-outline' },
    basic: { color: '#64748b', bg: '#f1f5f9', icon: 'cube-outline' }
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
            const listingsRes = await api.get(`/listings/vendor/${user.id}`);
            if (listingsRes.ok) setListings(listingsRes.data);

            const statsRes = await api.get(`/analytics/vendor/${user.id}`);
            if (statsRes.ok) setStats(statsRes.data);

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
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-10">
                <View className="w-20 h-20 bg-teal-50 rounded-3xl items-center justify-center mb-6">
                    <Ionicons name="person-outline" size={40} color="#0d9488" />
                </View>
                <Text className="text-3xl font-black text-slate-900 text-center mb-2">Join the Hub</Text>
                <Text className="text-slate-500 text-center text-lg mb-10 leading-6">
                    Log in to manage your presence, view analytics, and connect with the island.
                </Text>
                <TouchableOpacity
                    className="w-full bg-teal-600 h-16 rounded-2xl items-center justify-center shadow-lg shadow-teal-600/30"
                    onPress={() => router.push('/(auth)/login')}
                >
                    <Text className="text-white text-lg font-bold">Sign In to Continue</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const tierStyle = subscription?.tier ? TIER_STYLES[subscription.tier.toLowerCase()] : TIER_STYLES.basic;

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View className="bg-white px-6 pt-8 pb-10 rounded-b-[40px] shadow-sm border-b border-slate-100">
                    <View className="flex-row justify-between items-start mb-6">
                        <View className="w-20 h-20 bg-teal-600 rounded-[28px] items-center justify-center shadow-lg shadow-teal-600/40">
                            <Text className="text-white text-3xl font-black">{user.name?.charAt(0)}</Text>
                        </View>
                        <TouchableOpacity
                            className="p-3 bg-red-50 rounded-2xl"
                            onPress={signOut}
                        >
                            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>

                    <View>
                        <View className="flex-row items-center space-x-2">
                            <Text className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</Text>
                        </View>
                        <Text className="text-slate-500 text-base font-medium mb-4">{user.email}</Text>

                        <View className="flex-row items-center space-x-2">
                            <View className="bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                                <Text className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
                                    {user.role || 'Member'}
                                </Text>
                            </View>
                            {subscription?.tier && (
                                <View
                                    className="px-3 py-1.5 rounded-full flex-row items-center border"
                                    style={{ backgroundColor: tierStyle.bg, borderColor: tierStyle.color + '20' }}
                                >
                                    <Ionicons name={tierStyle.icon} size={12} color={tierStyle.color} />
                                    <Text
                                        className="ml-1 text-[10px] font-black uppercase tracking-widest"
                                        style={{ color: tierStyle.color }}
                                    >
                                        {subscription.tier}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Subscription Card */}
                {subscription && (
                    <View className="mx-6 -mt-6 bg-teal-900 p-6 rounded-[32px] shadow-xl shadow-teal-900/30 flex-row items-center justify-between">
                        <View>
                            <Text className="text-teal-400 text-xs font-black uppercase tracking-widest mb-1">Active Plan</Text>
                            <Text className="text-white text-lg font-bold">
                                {subscription.status === 'active' ? 'Full Access Active' : 'Pending Verification'}
                            </Text>
                            <Text className="text-teal-200/60 text-xs mt-1">
                                Ends {new Date(subscription.current_period_end).toLocaleDateString()}
                            </Text>
                        </View>
                        <TouchableOpacity className="bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                            <Text className="text-white font-bold text-xs uppercase">Manage</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Stats Section */}
                {user.role === 'vendor' && (
                    <View className="px-6 mt-8">
                        <Text className="text-slate-900 text-xl font-black tracking-tight mb-4">Channel Performance</Text>
                        <View className="flex-row space-x-3">
                            <View className="flex-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                <View className="w-10 h-10 bg-indigo-50 rounded-2xl items-center justify-center mb-3">
                                    <Ionicons name="eye-outline" size={20} color="#6366f1" />
                                </View>
                                <Text className="text-slate-500 text-xs font-bold uppercase mb-0.5">Views</Text>
                                <Text className="text-slate-900 text-2xl font-black">{stats?.total_views || 0}</Text>
                            </View>
                            <View className="flex-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                <View className="w-10 h-10 bg-emerald-50 rounded-2xl items-center justify-center mb-3">
                                    <Ionicons name="card-outline" size={20} color="#10b981" />
                                </View>
                                <Text className="text-slate-500 text-xs font-bold uppercase mb-0.5">Earnings</Text>
                                <Text className="text-slate-900 text-2xl font-black">${stats?.total_revenue || 0}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Listings Section */}
                <View className="px-6 mt-8">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-slate-900 text-xl font-black tracking-tight">
                            {user.role === 'vendor' ? 'My Hub Listings' : 'Recent Experience'}
                        </Text>
                        <TouchableOpacity
                            onPress={fetchVendorData}
                            className="bg-slate-100 p-2 rounded-xl"
                        >
                            <Ionicons name="refresh" size={18} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator color="#0d9488" size="large" className="mt-4" />
                    ) : (
                        listings.length > 0 ? (
                            listings.map((item) => (
                                <TouchableOpacity key={item.id} className="bg-white p-4 rounded-3xl mb-4 border border-slate-100 shadow-sm flex-row items-center">
                                    <View className="w-14 h-14 bg-slate-50 rounded-2xl items-center justify-center mr-4">
                                        <Text className="text-2xl">
                                            {item.type === 'campaign' ? '❤️' : item.type === 'rental' ? '🏠' : '🛠️'}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 font-bold text-base" numberOfLines={1}>{item.title}</Text>
                                        <View className="flex-row items-center mt-1">
                                            <Text className="text-teal-600 text-[10px] font-black uppercase tracking-widest">{item.category || item.type}</Text>
                                            <View className="w-1 h-1 bg-slate-300 rounded-full mx-2" />
                                            <Text className="text-slate-500 text-xs font-bold">${Number(item.price).toLocaleString()}</Text>
                                        </View>
                                    </View>
                                    <View className="bg-slate-50 px-3 py-1.5 rounded-xl flex-row items-center">
                                        <Ionicons name="stats-chart-outline" size={12} color="#64748b" />
                                        <Text className="ml-1 text-slate-500 text-[10px] font-black">{item.views || 0}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View className="bg-white border-2 border-dashed border-slate-200 p-10 rounded-[32px] items-center">
                                <Ionicons name="cloud-upload-outline" size={48} color="#cbd5e1" />
                                <Text className="text-slate-400 font-bold text-center mt-4 mb-6">You haven't listed anything on the hub yet.</Text>
                                <TouchableOpacity className="bg-teal-600 px-8 py-3 rounded-2xl shadow-md shadow-teal-600/20">
                                    <Text className="text-white font-bold">Start Listing</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    )}
                </View>
                <View className="h-24" />
            </ScrollView>
        </SafeAreaView>
    );
}
