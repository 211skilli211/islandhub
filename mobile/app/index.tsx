import { Redirect } from 'expo-router';

export default function Index() {
    // TODO: Check auth state. For now, redirect to Browse (tabs)
    return <Redirect href="/(tabs)/browse" />;
}
