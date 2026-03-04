import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../context/auth';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const { signIn, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        await signIn(email, password);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                    <View className="flex-1 justify-center px-8 py-12">
                        {/* Hero Section */}
                        <View className="items-center mb-12">
                            <View className="w-20 h-20 bg-teal-500 rounded-3xl items-center justify-center shadow-xl shadow-teal-500/50 mb-6">
                                <Ionicons name="leaf" size={40} color="white" />
                            </View>
                            <Text className="text-4xl font-bold text-slate-900 tracking-tight">Island Hub</Text>
                            <Text className="text-slate-500 text-lg mt-2">Connecting St. Kitts & Nevis</Text>
                        </View>

                        {/* Form Section */}
                        <View className="space-y-4">
                            <View>
                                <Text className="text-slate-700 font-semibold mb-2 ml-1">Email Address</Text>
                                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm focus:border-teal-500">
                                    <Ionicons name="mail-outline" size={20} color="#64748b" className="mr-3" />
                                    <TextInput
                                        className="flex-1 text-slate-900 text-base"
                                        placeholder="your@email.com"
                                        placeholderTextColor="#94a3b8"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                            </View>

                            <View className="mt-4">
                                <Text className="text-slate-700 font-semibold mb-2 ml-1">Password</Text>
                                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm focus:border-teal-500">
                                    <Ionicons name="lock-closed-outline" size={20} color="#64748b" className="mr-3" />
                                    <TextInput
                                        className="flex-1 text-slate-900 text-base"
                                        placeholder="••••••••"
                                        placeholderTextColor="#94a3b8"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748b" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity className="items-end mt-2">
                                <Text className="text-teal-600 font-medium">Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`mt-8 h-16 rounded-2xl flex-row items-center justify-center shadow-lg ${isLoading ? 'bg-slate-400' : 'bg-teal-600 shadow-teal-600/30'}`}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white text-lg font-bold mr-2">Sign In</Text>
                                        <Ionicons name="arrow-forward" size={20} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Footer Section */}
                        <View className="flex-row justify-center mt-10">
                            <Text className="text-slate-500">Don't have an account? </Text>
                            <Link href="/(auth)/register" asChild>
                                <TouchableOpacity>
                                    <Text className="text-teal-600 font-bold">Create Account</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>

                        {/* Quick Dev Helper */}
                        <TouchableOpacity
                            className="mt-12 py-3 border border-dashed border-teal-200 rounded-xl"
                            onPress={() => { setEmail('john@example.com'); setPassword('password123'); }}
                        >
                            <Text className="text-teal-500 text-center font-medium">Quick Demo Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
