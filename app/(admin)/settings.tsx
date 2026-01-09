import { View, Text, Switch, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
    const { logout, user } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnecter',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    }
                },
            ]
        );
    };

    return (
        <ScrollView className="flex-1 bg-background-light p-4 dark:bg-background-dark">
            <View className="mb-6 items-center">
                <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                    <Feather name="shield" size={40} color="#4F46E5" />
                </View>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</Text>
                <Text className="text-secondary-500">{user?.email}</Text>
                <View className="mt-2 rounded-full bg-purple-100 px-3 py-1">
                    <Text className="text-xs font-bold text-purple-700">Administrateur</Text>
                </View>
            </View>

            <View className="mb-6 rounded-2xl bg-surface-light p-4 shadow-sm dark:bg-surface-dark">
                <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Système</Text>

                <View className="mb-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Feather name="bell" size={20} color="#64748B" />
                        <Text className="ml-3 text-base text-gray-900 dark:text-white">Notifications système</Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: '#CBD5E1', true: '#4F46E5' }}
                    />
                </View>

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Feather name="tool" size={20} color="#64748B" />
                        <Text className="ml-3 text-base text-gray-900 dark:text-white">Mode maintenance</Text>
                    </View>
                    <Switch
                        value={maintenanceMode}
                        onValueChange={setMaintenanceMode}
                        trackColor={{ false: '#CBD5E1', true: '#4F46E5' }}
                    />
                </View>
            </View>

            <View className="mb-6 rounded-2xl bg-surface-light p-4 shadow-sm dark:bg-surface-dark">
                <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Configuration</Text>

                <Pressable className="mb-4 flex-row items-center justify-between py-2">
                    <View className="flex-row items-center">
                        <Feather name="list" size={20} color="#64748B" />
                        <Text className="ml-3 text-base text-gray-900 dark:text-white">Gérer les statuts</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#94A3B8" />
                </Pressable>

                <Pressable className="flex-row items-center justify-between py-2">
                    <View className="flex-row items-center">
                        <Feather name="lock" size={20} color="#64748B" />
                        <Text className="ml-3 text-base text-gray-900 dark:text-white">Sécurité & Règles</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#94A3B8" />
                </Pressable>
            </View>

            <Pressable
                className="mb-8 flex-row items-center justify-center rounded-2xl bg-red-50 p-4 active:bg-red-100"
                onPress={handleLogout}
            >
                <Feather name="log-out" size={20} color="#EF4444" />
                <Text className="ml-2 font-bold text-red-600">Se déconnecter</Text>
            </Pressable>

            {/* Developer Tools */}
            <View className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <Text className="mb-4 text-xs font-bold text-secondary-400 uppercase tracking-widest text-center">Zone Développeur</Text>
                <Pressable
                    className="flex-row items-center justify-center rounded-xl bg-white dark:bg-gray-700 py-3 border border-gray-200 dark:border-gray-600 active:bg-gray-100 dark:active:bg-gray-600"
                    onPress={async () => {
                        try {
                            const { seedDatabase } = await import('@/services/seed');
                            await seedDatabase();
                            Alert.alert('Succès', 'Base de données initialisée avec succès !');
                        } catch (e) {
                            Alert.alert('Erreur', 'Erreur lors de l\'initialisation');
                            console.error(e);
                        }
                    }}
                >
                    <Feather name="database" size={18} color="#64748B" />
                    <Text className="ml-2 text-sm font-medium text-secondary-600 dark:text-secondary-300">Remplir la base de données (Seed)</Text>
                </Pressable>
            </View>

            <Text className="text-center text-xs text-secondary-400">
                Job Tracker Admin v1.0.0
            </Text>
        </ScrollView>
    );
}
