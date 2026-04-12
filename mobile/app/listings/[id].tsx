import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Share, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../lib/api';

const { width } = Dimensions.get('window');

export default function ListingDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user, token } = useAuth();
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [contacting, setContacting] = useState(false);

    const fetchListing = useCallback(async () => {
        try {
            const response = await api.get(`/listings/${id}`);
            if (response.ok) {
                setListing(response.data);
            }
        } catch (error) {
            console.error('Error fetching listing:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchListing();
    }, [id, fetchListing]);

    const handleMessageVendor = async () => {
        if (!user || !token) {
            Alert.alert('Login Required', 'Please log in to message this vendor.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log In', onPress: () => router.push('/(auth)/login') }
            ]);
            return;
        }

        if (user.id === listing.vendor_id) {
            Alert.alert('Project Owner', "This is your own hub listing.");
            return;
        }

        setContacting(true);
        try {
            const res = await api.post(`/messages/conversations`, {
                recipient_id: listing.vendor_id,
                initial_text: `Hi! I'm interested in "${listing.title}"`
            });

            if (res.ok) {
                router.push(`/messages/${res.data.conversation_id}`);
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
                message: `Check out ${listing.title} on Island Hub!`,
                url: `https://islandhub.com/listings/${id}`
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#0d9488" />
            </View>
        );
    }

    if (!listing) {
        return (
            <View className="flex-1 items-center justify-center bg-white px-10">
                <Ionicons name="alert-circle-outline" size={64} color="#cbd5e1" />
                <Text className="text-xl font-bold text-slate-900 mt-4 text-center">Listing not found</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 bg-teal-600 px-8 py-3 rounded-2xl"
                >
                    <Text className="text-white font-bold text-base">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen
                options={{
                    title: '',
                    headerTransparent: true,
                    headerTintColor: '#0f172a',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-white/90 rounded-full items-center justify-center ml-2 shadow-sm border border-slate-100"
                        >
                            <Ionicons name="chevron-back" size={24} color="#0f172a" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleShare}
                            className="w-10 h-10 bg-white/90 rounded-full items-center justify-center mr-2 shadow-sm border border-slate-100"
                        >
                            <Ionicons name="share-social-outline" size={20} color="#0f172a" />
                        </TouchableOpacity>
                    )
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Visual Header */}
                <View className="relative h-[380px] bg-slate-100 items-center justify-center">
                    <Text className="text-[120px] opacity-20">
                        {listing.type === 'campaign' ? '❤️' : listing.type === 'rental' ? '🏠' : '🛠️'}
                    </Text>

                    {listing.is_promoted && (
                        <View className="absolute bottom-12 left-6 bg-amber-400 px-4 py-2 rounded-2xl shadow-lg shadow-amber-900/10 flex-row items-center">
                            <Ionicons name="sparkles" size={16} color="#92400e" className="mr-2" />
                            <Text className="text-xs font-black text-amber-900 uppercase">Featured Listing</Text>
                        </View>
                    )}

                    <View className="absolute bottom-12 right-6 bg-white/80 px-4 py-2 rounded-2xl backdrop-blur-md">
                        <Text className="text-teal-700 font-extrabold text-xs uppercase tracking-widest leading-none">
                            {listing.type}
                        </Text>
                    </View>
                </View>

                {/* Main Content Area */}
                <View className="px-6 pb-32 -mt-8 bg-white rounded-t-[40px] shadow-2xl shadow-slate-900/20">
                    <View className="w-12 h-1 bg-slate-100 self-center rounded-full mt-3 mb-6" />

                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 mr-4">
                            <Text className="text-teal-600 font-black uppercase text-xs tracking-widest mb-1">
                                {listing.category || 'Island Service'}
                            </Text>
                            <Text className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                                {listing.title}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-slate-900 text-3xl font-black">
                                ${Number(listing.price).toLocaleString()}
                            </Text>
                            <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-tighter">
                                {listing.type === 'rental' ? 'Per Night' : 'Project Rate'}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mb-8 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <Ionicons name="location-outline" size={16} color="#0d9488" />
                        <Text className="ml-2 text-slate-600 font-bold text-sm">
                            {listing.location || 'St. Kitts & Nevis'}
                        </Text>
                    </View>

                    <Text className="text-lg font-black text-slate-900 mb-3">About this Listing</Text>
                    <Text className="text-slate-500 text-base font-medium leading-[26px] mb-8">
                        {listing.description}
                    </Text>

                    {/* Specs Grid */}
                    {listing.metadata && Object.keys(listing.metadata).length > 0 && (
                        <View className="mb-10">
                            <Text className="text-lg font-black text-slate-900 mb-4">Details & Features</Text>
                            <View className="flex-row flex-wrap -mx-2">
                                {Object.entries(listing.metadata).map(([key, value]) => {
                                    if (key === 'sub_type' || !value) return null;
                                    return (
                                        <View key={key} className="w-1/2 px-2 mb-4">
                                            <View className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                    {key.replace(/_/g, ' ')}
                                                </Text>
                                                <Text className="text-slate-900 font-bold text-sm">
                                                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Host Card */}
                    <View className="bg-slate-900 p-6 rounded-[32px] flex-row items-center shadow-lg shadow-slate-900/20">
                        <View className="w-14 h-14 bg-teal-500 rounded-[20px] items-center justify-center mr-4">
                            <Text className="text-white text-xl font-black">
                                {listing.vendor_name?.charAt(0) || 'V'}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-black text-lg">{listing.vendor_name || 'Verified Vendor'}</Text>
                            <Text className="text-teal-400/80 font-bold text-xs uppercase tracking-widest">
                                Trusted Island Provider
                            </Text>
                        </View>
                        <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/20">
                            <Ionicons name="star" size={16} color="#fcd34d" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Floating Footer */}
            <View className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-white/80 border-t border-slate-100 flex-row space-x-4 backdrop-blur-xl">
                <TouchableOpacity
                    onPress={handleMessageVendor}
                    disabled={contacting}
                    className="flex-1 h-16 bg-white border-2 border-slate-900 rounded-3xl flex-row items-center justify-center"
                >
                    {contacting ? (
                        <ActivityIndicator color="#0f172a" />
                    ) : (
                        <>
                            <Ionicons name="chatbubble-outline" size={24} color="#0f172a" />
                            <Text className="ml-2 text-slate-900 text-lg font-black">Inquire</Text>
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity className="flex-[2] h-16 bg-teal-600 rounded-3xl items-center justify-center shadow-lg shadow-teal-600/30">
                    <Text className="text-white text-xl font-black tracking-tight">
                        Book Now
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
