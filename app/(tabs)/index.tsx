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
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 pt-6 pb-4">
        <Text className="mb-2 text-3xl font-bold text-gray-900">Dashboard</Text>
        <Text className="text-gray-600">Vue d'ensemble de vos candidatures</Text>
      </View>

      {/* Statistiques principales */}
      <View className="flex-row gap-3 px-4 mb-4">
        <View className="flex-1 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <View className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
            <Feather name="briefcase" size={20} color="#2563EB" />
          </View>
          <Text className="mb-1 text-3xl font-bold text-primary-500">{stats.total}</Text>
          <Text className="text-xs text-gray-600">Total candidatures</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <View className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
            <Feather name="users" size={20} color="#9333EA" />
          </View>
          <Text className="mb-1 text-3xl font-bold text-purple-600">{stats.interviews}</Text>
          <Text className="text-xs text-gray-600">Entretiens</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <View className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <Feather name="trending-up" size={20} color="#10B981" />
          </View>
          <Text className="mb-1 text-3xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</Text>
          <Text className="text-xs text-gray-600">Taux de réussite</Text>
        </View>
      </View>

      {/* Répartition par statut */}
      <View className="mx-4 mb-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <Text className="mb-4 text-xl font-bold text-gray-900">Répartition par statut</Text>
        {Object.entries(stats.byStatus).map(([status, count]) => {
          const statusConfig = StatusConfig[status as ApplicationStatus];
          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

          return (
            <View key={status} className="mb-4 flex-row items-center">
              <View className="mr-3 flex-row items-center w-28">
                <View
                  className="mr-2 h-3 w-3 rounded-full"
                  style={{ backgroundColor: statusConfig.color }}
                />
                <Text className="text-sm text-gray-700">{statusConfig.label}</Text>
              </View>
              <View className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: statusConfig.color,
                  }}
                />
              </View>
              <Text className="ml-3 text-sm font-semibold text-gray-900 w-8 text-right">{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Évolution dans le temps */}
      {stats.evolution.length > 0 && (
        <View className="mx-4 mb-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <Text className="mb-4 text-xl font-bold text-gray-900">Évolution</Text>
          <View className="flex-row items-end justify-around h-32 py-4">
            {stats.evolution.map((item, index) => {
              const maxCount = Math.max(...stats.evolution.map(e => e.count));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              
              return (
                <View key={index} className="flex-1 items-center">
                  <Text className="mb-2 text-xs text-gray-600 text-center">
                    {new Date(item.date + '-01').toLocaleDateString('fr-FR', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  <View
                    className="w-4/5 rounded-t-lg bg-primary-500 mb-1"
                    style={{ height: Math.max(20, height) }}
                  />
                  <Text className="text-xs font-semibold text-gray-900">{item.count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Actions rapides */}
      <View className="px-4 pb-6 gap-3">
        <TouchableOpacity
          className="rounded-xl border-2 border-gray-200 bg-white py-4"
          onPress={() => router.push('/(tabs)/applications' as any)}
        >
          <Text className="text-center text-base font-semibold text-gray-900">Voir toutes les candidatures</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="rounded-xl bg-primary-500 py-4 shadow-lg shadow-primary-500/30"
          onPress={() => router.push('/application/new' as any)}
        >
          <Text className="text-center text-base font-semibold text-white">Ajouter une candidature</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
