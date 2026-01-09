import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getAllUsers } from '@/services/userService';
import { getApplicationStatsGlobal } from '@/services/jobApplication';
import { ApplicationStats } from '@/types/jobApplication';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userCount, setUserCount] = useState(0);
    const [stats, setStats] = useState<ApplicationStats | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [users, appStats] = await Promise.all([
                getAllUsers(),
                getApplicationStatsGlobal()
            ]);
            setUserCount(users.length);
            setStats(appStats);
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <ScrollView
            className="flex-1 bg-background-light dark:bg-background-dark"
            contentContainerClassName="p-6"
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        >
            <View className="mb-8">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tableau de bord Admin
                </Text>
                <Text className="text-secondary-500">
                    Vue d'ensemble du système
                </Text>
            </View>

            <View className="flex-row flex-wrap justify-between">
                {/* KPI: Total Users */}
                <Pressable
                    className="mb-4 w-[48%] rounded-2xl bg-surface-light p-4 shadow-sm dark:bg-surface-dark"
                    onPress={() => router.push('/(admin)/users')}
                >
                    <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Feather name="users" size={20} color="#2563EB" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userCount}
                    </Text>
                    <Text className="text-sm text-secondary-500">Utilisateurs</Text>
                </Pressable>

                {/* KPI: Total Applications */}
                <Pressable
                    className="mb-4 w-[48%] rounded-2xl bg-surface-light p-4 shadow-sm dark:bg-surface-dark"
                    onPress={() => router.push('/(admin)/applications')}
                >
                    <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                        <Feather name="file-text" size={20} color="#9333EA" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats?.total || 0}
                    </Text>
                    <Text className="text-sm text-secondary-500">Candidatures</Text>
                </Pressable>

                {/* KPI: Interviews */}
                <View className="mb-4 w-[48%] rounded-2xl bg-surface-light p-4 shadow-sm dark:bg-surface-dark">
                    <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                        <Feather name="calendar" size={20} color="#EA580C" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats?.interviews || 0}
                    </Text>
                    <Text className="text-sm text-secondary-500">Entretiens</Text>
                </View>

                {/* KPI: Success Rate */}
                <View className="mb-4 w-[48%] rounded-2xl bg-surface-light p-4 shadow-sm dark:bg-surface-dark">
                    <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <Feather name="trending-up" size={20} color="#16A34A" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats?.successRate || 0}%
                    </Text>
                    <Text className="text-sm text-secondary-500">Taux de succès</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <Text className="mb-4 mt-4 text-lg font-bold text-gray-900 dark:text-white">
                Accès rapide
            </Text>

            <View className="gap-4">
                <Pressable
                    className="flex-row items-center rounded-2xl bg-surface-light p-4 shadow-sm active:bg-gray-50 dark:bg-surface-dark dark:active:bg-secondary-800"
                    onPress={() => router.push('/(admin)/users')}
                >
                    <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                        <Feather name="users" size={24} color="#4F46E5" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-semibold text-gray-900 dark:text-white">Gérer les utilisateurs</Text>
                        <Text className="text-sm text-secondary-500">Comptes, rôles et statuts</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#94A3B8" />
                </Pressable>

                <Pressable
                    className="flex-row items-center rounded-2xl bg-surface-light p-4 shadow-sm active:bg-gray-50 dark:bg-surface-dark dark:active:bg-secondary-800"
                    onPress={() => router.push('/(admin)/applications')}
                >
                    <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                        <Feather name="list" size={24} color="#4F46E5" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-semibold text-gray-900 dark:text-white">Toutes les candidatures</Text>
                        <Text className="text-sm text-secondary-500">Vue globale et filtres</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#94A3B8" />
                </Pressable>
            </View>
        </ScrollView>
    );
}
