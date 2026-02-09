import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../context/auth';
import { Link } from 'expo-router';

export default function LoginScreen() {
    const { signIn, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        await signIn(email, password);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>IslandFund 🌴</Text>
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Log In</Text>
                    )}
                </TouchableOpacity>

                {/* Quick Dev Helper: Pre-fill for demo */}
                <TouchableOpacity onPress={() => { setEmail('john@example.com'); setPassword('password123'); }}>
                    <Text style={styles.demoText}>Demo Autofill</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0f766e',
        textAlign: 'center',
        marginBottom: 40,
    },
    form: {
        gap: 16,
    },
    input: {
        height: 50,
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    button: {
        backgroundColor: '#0d9488',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    demoText: {
        marginTop: 16,
        textAlign: 'center',
        color: '#0d9488',
        textDecorationLine: 'underline',
    },
});
