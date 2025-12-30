import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { getApplicationStats, getApplications } from '@/services/jobApplication';
import { ApplicationStats, JobApplication, ApplicationStatus } from '@/types/jobApplication';
import { StatusConfig } from '@/constants';
import { Feather } from '@expo/vector-icons';
import { StatisticsCards } from '@/components/StatisticsCards';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!user) return;

    try {
      const [statsData, applicationsData] = await Promise.all([
        getApplicationStats(user.id),
        getApplications(user.id)
      ]);
      setStats(statsData);
      // Get 3 most recent applications
      setRecentApplications(applicationsData
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3)
      );
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={Colors.primary} />
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
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Section */}
        <View className="px-5 pt-4 pb-6 bg-white border-b border-gray-100">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-sm font-medium text-gray-500">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <TouchableOpacity
              className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Feather name="settings" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text className="text-3xl font-bold text-gray-900">
            Bonjour, {user?.name || 'Candidat'} 👋
          </Text>
          <Text className="text-base text-gray-600 mt-1">
            Voici un aperçu de vos candidatures
          </Text>
        </View>

        <View className="px-5 py-6">
          {/* Main Stats */}
          <StatisticsCards stats={stats} />

          {/* Status Distribution Section */}
          <View className="mt-8">
            <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Répartition des candidatures</Text>
            <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <View className="gap-4">
                {Object.values(ApplicationStatus).map((status) => {
                  const count = stats?.byStatus[status] || 0;
                  const total = stats?.total || 1; // Avoid division by zero
                  const percentage = (count / total) * 100;
                  const config = StatusConfig[status];

                  return (
                    <View key={status}>
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-sm font-medium text-gray-700">{config.label}</Text>
                        <Text className="text-sm font-bold text-gray-900">{count}</Text>
                      </View>
                      <View className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: config.color
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Recent Applications Section */}
          <View className="mt-8">
            <View className="flex-row justify-between items-center mb-4 px-1">
              <Text className="text-lg font-bold text-gray-900">Activités récentes</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/applications')}>
                <Text className="text-primary-500 font-semibold text-sm">Voir tout</Text>
              </TouchableOpacity>
            </View>

            {recentApplications.map((app) => (
              <TouchableOpacity
                key={app.id}
                className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row items-center"
                onPress={() => router.push(`/application/${app.id}`)}
              >
                <View className="h-12 w-12 rounded-xl bg-gray-50 items-center justify-center mr-4 border border-gray-100">
                  <Text className="text-lg font-bold text-gray-700">
                    {app.company.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-base mb-0.5">{app.title}</Text>
                  <Text className="text-gray-500 text-sm">{app.company}</Text>
                </View>
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: StatusConfig[app.status]?.color + '15' }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: StatusConfig[app.status]?.color }}
                  >
                    {StatusConfig[app.status]?.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="mt-2 bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 items-center"
              onPress={() => router.push('/application/new')}
            >
              <Feather name="plus" size={24} color={Colors.textSecondary} />
              <Text className="text-gray-500 font-medium mt-1">Nouvelle candidature</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
