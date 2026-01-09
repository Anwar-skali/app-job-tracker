import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { UserRole } from '@/types';

export default function AdminLayout() {
    const { user, status } = useAuth();

    if (status === 'loading') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user || user.role !== UserRole.ADMIN) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Admin Dashboard', headerShown: true }} />
            <Stack.Screen name="users" options={{ title: 'Utilisateurs', headerShown: false }} />
            <Stack.Screen name="applications" options={{ title: 'Candidatures', headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: 'Paramètres', headerShown: true }} />
        </Stack>
    );
}
