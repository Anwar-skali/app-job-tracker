import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { getApplicationStats } from '@/services/jobApplication';
import { ApplicationStats, ApplicationStatus } from '@/types/jobApplication';
import { StatusConfig } from '@/constants';
import { Feather } from '@expo/vector-icons';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getApplicationStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Aucune donnée disponible</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="px-5 pt-8 pb-6">
        <Text className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</Text>
        <Text className="text-base text-secondary-500">Vue d'ensemble de vos candidatures</Text>
      </View>

      {/* Statistiques principales */}
      <View className="flex-row gap-4 px-5 mb-6">
        <View className="flex-1 rounded-3xl bg-white dark:bg-surface-dark p-5 shadow-sm shadow-secondary-200 dark:shadow-none border border-secondary-100 dark:border-secondary-800">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/50">
            <Feather name="briefcase" size={24} color="#4F46E5" />
          </View>
          <Text className="mb-1 text-3xl font-bold text-primary-600 dark:text-primary-400">{stats.total}</Text>
          <Text className="text-xs font-medium text-secondary-500">Total candidatures</Text>
        </View>
        <View className="flex-1 rounded-3xl bg-white dark:bg-surface-dark p-5 shadow-sm shadow-secondary-200 dark:shadow-none border border-secondary-100 dark:border-secondary-800">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/50">
            <Feather name="users" size={24} color="#9333EA" />
          </View>
          <Text className="mb-1 text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.interviews}</Text>
          <Text className="text-xs font-medium text-secondary-500">Entretiens</Text>
        </View>
        <View className="flex-1 rounded-3xl bg-white dark:bg-surface-dark p-5 shadow-sm shadow-secondary-200 dark:shadow-none border border-secondary-100 dark:border-secondary-800">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-900/50">
            <Feather name="trending-up" size={24} color="#10B981" />
          </View>
          <Text className="mb-1 text-3xl font-bold text-green-600 dark:text-green-400">{stats.successRate.toFixed(0)}%</Text>
          <Text className="text-xs font-medium text-secondary-500">Réussite</Text>
        </View>
      </View>

      {/* Répartition par statut */}
      <View className="mx-5 mb-6 rounded-3xl bg-white dark:bg-surface-dark p-6 shadow-sm shadow-secondary-200 dark:shadow-none border border-secondary-100 dark:border-secondary-800">
        <Text className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Répartition par statut</Text>
        {Object.entries(stats.byStatus).map(([status, count]) => {
          const statusConfig = StatusConfig[status as ApplicationStatus];
          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

          return (
            <View key={status} className="mb-5 flex-row items-center last:mb-0">
              <View className="mr-3 flex-row items-center w-32">
                <View
                  className="mr-3 h-3 w-3 rounded-full shadow-sm"
                  style={{ backgroundColor: statusConfig.color }}
                />
                <Text className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{statusConfig.label}</Text>
              </View>
              <View className="flex-1 h-2.5 rounded-full bg-secondary-100 dark:bg-secondary-800 overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: statusConfig.color,
                  }}
                />
              </View>
              <Text className="ml-4 text-sm font-bold text-gray-900 dark:text-white w-8 text-right">{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Évolution dans le temps */}
      {stats.evolution.length > 0 && (
        <View className="mx-5 mb-6 rounded-3xl bg-white dark:bg-surface-dark p-6 shadow-sm shadow-secondary-200 dark:shadow-none border border-secondary-100 dark:border-secondary-800">
          <Text className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Activité récente</Text>
          <View className="flex-row items-end justify-between h-40 py-2">
            {stats.evolution.map((item, index) => {
              const maxCount = Math.max(...stats.evolution.map(e => e.count));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

              return (
                <View key={index} className="flex-1 items-center mx-1">
                  <View
                    className="w-full rounded-t-xl bg-primary-500 dark:bg-primary-600 mb-2 opacity-90"
                    style={{ height: `${Math.max(15, height)}%` }}
                  />
                  <Text className="text-xs font-medium text-secondary-500 dark:text-secondary-400 text-center">
                    {new Date(item.date + '-01').toLocaleDateString('fr-FR', {
                      month: 'short',
                    })}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Actions rapides */}
      <View className="px-5 pb-10 gap-4">
        <TouchableOpacity
          className="rounded-2xl bg-primary-600 py-4 shadow-lg shadow-primary-500/30 active:bg-primary-700"
          onPress={() => router.push('/application/new' as any)}
        >
          <Text className="text-center text-lg font-bold text-white">Nouvelle candidature</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-2xl border-2 border-secondary-200 dark:border-secondary-700 bg-transparent py-4 active:bg-secondary-50 dark:active:bg-secondary-800"
          onPress={() => router.push('/(tabs)/applications' as any)}
        >
          <Text className="text-center text-lg font-bold text-secondary-700 dark:text-secondary-300">Voir tout l'historique</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
