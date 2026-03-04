import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/auth';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'buyer' | 'vendor'>('buyer');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Missing Fields', 'Please fill in all fields to create your account.');
            return;
        }

        setLoading(true);
        try {
            const success = await signUp(name, email, password, role);
            if (success) {
                Alert.alert('Success!', 'Your account has been created. Welcome to the Hub!', [
                    { text: 'Let\'s Go', onPress: () => router.replace('/(tabs)/browse') }
                ]);
            } else {
                Alert.alert('Registration Failed', 'Could not create account. Email might already be in use.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center mb-8 border border-slate-100"
                    >
                        <Ionicons name="chevron-back" size={24} color="#0f172a" />
                    </TouchableOpacity>

                    <View className="mb-10">
                        <Text className="text-4xl font-black text-slate-900 tracking-tight mb-2">Create Account</Text>
                        <Text className="text-slate-500 text-lg font-medium leading-6">
                            Join the #1 island marketplace and connect with the community.
                        </Text>
                    </View>

                    <View className="space-y-4">
                        {/* Name Input */}
                        <View>
                            <Text className="text-slate-900 font-bold ml-1 mb-2">Full Name</Text>
                            <View className="flex-row items-center bg-slate-50 rounded-2xl border border-slate-100 px-4 h-16 shadow-sm">
                                <Ionicons name="person-outline" size={20} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 ml-3 text-slate-900 text-base font-medium"
                                    placeholder="Enter your name"
                                    placeholderTextColor="#94a3b8"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View>
                            <Text className="text-slate-900 font-bold ml-1 mb-2">Email Address</Text>
                            <View className="flex-row items-center bg-slate-50 rounded-2xl border border-slate-100 px-4 h-16 shadow-sm">
                                <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 ml-3 text-slate-900 text-base font-medium"
                                    placeholder="your@email.com"
                                    placeholderTextColor="#94a3b8"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        {/* Role Selector */}
                        <View>
                            <Text className="text-slate-900 font-bold ml-1 mb-2">I want to...</Text>
                            <View className="flex-row space-x-3">
                                <TouchableOpacity
                                    onPress={() => setRole('buyer')}
                                    className={`flex-1 h-14 rounded-2xl border-2 items-center justify-center flex-row ${role === 'buyer' ? 'bg-teal-600 border-teal-600' : 'bg-transparent border-slate-100'}`}
                                >
                                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-2 ${role === 'buyer' ? 'bg-white border-white' : 'border-slate-300'}`}>
                                        {role === 'buyer' && <View className="w-2 h-2 rounded-full bg-teal-600" />}
                                    </View>
                                    <Text className={`font-bold ${role === 'buyer' ? 'text-white' : 'text-slate-500'}`}>Browse</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setRole('vendor')}
                                    className={`flex-1 h-14 rounded-2xl border-2 items-center justify-center flex-row ${role === 'vendor' ? 'bg-teal-600 border-teal-600' : 'bg-transparent border-slate-100'}`}
                                >
                                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-2 ${role === 'vendor' ? 'bg-white border-white' : 'border-slate-300'}`}>
                                        {role === 'vendor' && <View className="w-2 h-2 rounded-full bg-teal-600" />}
                                    </View>
                                    <Text className={`font-bold ${role === 'vendor' ? 'text-white' : 'text-slate-500'}`}>Host/Sell</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Password Input */}
                        <View>
                            <Text className="text-slate-900 font-bold ml-1 mb-2">Password</Text>
                            <View className="flex-row items-center bg-slate-50 rounded-2xl border border-slate-100 px-4 h-16 shadow-sm">
                                <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 ml-3 text-slate-900 text-base font-medium"
                                    placeholder="••••••••"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`w-full h-16 rounded-[24px] items-center justify-center mt-12 shadow-xl shadow-teal-600/30 ${loading ? 'bg-teal-800' : 'bg-teal-600'}`}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-black tracking-tight">Create My Island ID</Text>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-10">
                        <Text className="text-slate-500 font-medium text-base">Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-teal-600 font-black text-base">Log In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    <View className="h-10" />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
