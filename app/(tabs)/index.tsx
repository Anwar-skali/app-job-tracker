import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Colors } from '@/constants/colors';
import { getApplicationStats, getApplications } from '@/services/jobApplication';
import { ApplicationStats, JobApplication, ApplicationStatus } from '@/types/jobApplication';
import { StatusConfig } from '@/constants';
import { Feather } from '@expo/vector-icons';
import { StatisticsCards } from '@/components/StatisticsCards';
import { RecruiterStatsSection } from '@/components/RecruiterStatsSection';
import { RecruiterAdvancedStats } from '@/components/RecruiterAdvancedStats';
import { EvolutionChart } from '@/components/EvolutionChart';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { canCreateApplication, canCreateJob, canManageApplications, isAdmin, canManageUsers } = usePermissions();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!user) return;

    try {
      // Only load stats and applications for candidates
      if (canCreateApplication) {
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
      } else {
        // For recruiters, just set loading to false
        setStats(null);
        setRecentApplications([]);
      }
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
    }, [user, canCreateApplication])
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

  if (!stats && canCreateApplication) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Aucune donnée disponible</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-gray-50 to-white">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Section with Gradient */}
        <View className="px-5 pt-12 pb-8 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-medium text-primary-100">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <TouchableOpacity
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center border border-white/30"
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Feather name="settings" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text className="text-3xl font-bold text-white mb-1">
            Bonjour, {user?.name || 'Candidat'} 👋
          </Text>
          <Text className="text-base text-primary-100">
            Voici un aperçu de vos candidatures
          </Text>
        </View>

        <View className="px-5 py-6 -mt-6">
          {/* Main Stats - Only for candidates */}
          {canCreateApplication && stats && <StatisticsCards stats={stats} />}

          {/* Status Distribution Section - Only for candidates */}
          {canCreateApplication && (
            <View className="mt-6">
              <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Répartition des candidatures</Text>
            <View className="bg-white p-5 rounded-3xl shadow-medium border border-gray-100">
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
          )}

          {/* Recent Applications Section - Only for candidates */}
          {canCreateApplication && (
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
                className="bg-white p-4 rounded-3xl mb-3 shadow-soft border border-gray-100 flex-row items-center active:scale-[0.98] transition-transform"
                onPress={() => router.push(`/application/${app.id}`)}
                activeOpacity={0.7}
              >
                <View className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 items-center justify-center mr-4 border border-primary-200 shadow-soft">
                  <Text className="text-xl font-bold text-primary-700">
                    {app.company.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-base mb-0.5">{app.title}</Text>
                  <Text className="text-gray-500 text-sm">{app.company}</Text>
                </View>
                <View
                  className="px-3 py-1.5 rounded-full shadow-soft"
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

            {canCreateApplication && (
              <TouchableOpacity
                className="mt-2 bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-2xl border-2 border-dashed border-primary-300 items-center active:scale-[0.98]"
                onPress={() => router.push('/application/new')}
                activeOpacity={0.8}
              >
                <View className="h-12 w-12 rounded-full bg-primary-500 items-center justify-center mb-2 shadow-primary">
                  <Feather name="plus" size={24} color="#FFFFFF" />
                </View>
                <Text className="text-primary-700 font-semibold text-base">Nouvelle candidature</Text>
              </TouchableOpacity>
            )}
          </View>
          )}

          {/* Recruiter Dashboard Section */}
          {(canCreateJob || canManageApplications) && (
            <View className="mt-8">
              <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Tableau de bord recruteur</Text>
              
              {/* Recruiter Stats Cards */}
              <RecruiterStatsSection userId={user?.id || ''} />
              
              {/* Advanced Stats for Recruiters */}
              {user?.id && <RecruiterAdvancedStats userId={user.id} />}
            </View>
          )}

          {/* Admin Actions Section */}
          {isAdmin && (
            <View className="mt-8">
              <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Administration</Text>
              
              <TouchableOpacity
                className="bg-gradient-to-r from-purple-500 to-purple-600 p-5 rounded-3xl mb-3 shadow-lg border border-purple-400 flex-row items-center active:scale-[0.98]"
                onPress={() => router.push('/admin/dashboard')}
                activeOpacity={0.8}
              >
                <View className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center mr-4">
                  <Feather name="shield" size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-white text-base mb-1">Dashboard Admin</Text>
                  <Text className="text-purple-100 text-sm">Gérer la plateforme</Text>
                </View>
                <View className="h-8 w-8 rounded-full bg-white/20 items-center justify-center">
                  <Feather name="chevron-right" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Recruiter Actions Section */}
          {(canCreateJob || canManageApplications) && !isAdmin && (
            <View className="mt-8">
              <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Actions recruteur</Text>
              
              {canCreateJob && (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#fff',
                    padding: 20,
                    borderRadius: 24,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                  }}
                  onPress={() => {
                    console.log('Button pressed - Navigating to /job/new');
                    try {
                      router.push('/job/new');
                      console.log('Navigation called successfully');
                    } catch (error) {
                      console.error('Navigation error:', error);
                      Alert.alert('Erreur', 'Impossible de naviguer vers la création d\'offre');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{
                    height: 56,
                    width: 56,
                    borderRadius: 16,
                    backgroundColor: '#3B82F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 4,
                  }}>
                    <Feather name="briefcase" size={24} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', color: '#1F2937', fontSize: 16, marginBottom: 2 }}>Créer une offre</Text>
                    <Text style={{ color: '#6B7280', fontSize: 14 }}>Publier une nouvelle offre d'emploi</Text>
                  </View>
                  <View style={{
                    height: 32,
                    width: 32,
                    borderRadius: 16,
                    backgroundColor: '#EFF6FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Feather name="chevron-right" size={18} color="#3B82F6" />
                  </View>
                </TouchableOpacity>
              )}

              {canManageApplications && (
                <>
                  <TouchableOpacity
                    className="bg-white p-5 rounded-3xl mb-3 shadow-medium border border-gray-100 flex-row items-center active:scale-[0.98]"
                    onPress={() => router.push('/recruiter/applications')}
                    activeOpacity={0.8}
                  >
                    <View className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center mr-4 shadow-lg" style={{ shadowColor: '#2563EB', shadowOpacity: 0.3 }}>
                      <Feather name="inbox" size={24} color="#FFFFFF" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900 text-base mb-1">Candidatures reçues</Text>
                      <Text className="text-gray-500 text-sm">Voir et gérer les candidatures</Text>
                    </View>
                    <View className="h-8 w-8 rounded-full bg-blue-50 items-center justify-center">
                      <Feather name="chevron-right" size={18} color="#2563EB" />
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="bg-white p-5 rounded-3xl mb-3 shadow-medium border border-gray-100 flex-row items-center active:scale-[0.98]"
                    onPress={() => router.push('/recruiter/jobs')}
                    activeOpacity={0.8}
                  >
                    <View className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 items-center justify-center mr-4 shadow-lg" style={{ shadowColor: '#6366F1', shadowOpacity: 0.3 }}>
                      <Feather name="list" size={24} color="#FFFFFF" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900 text-base mb-1">Mes offres</Text>
                      <Text className="text-gray-500 text-sm">Voir toutes mes offres d'emploi</Text>
                    </View>
                    <View className="h-8 w-8 rounded-full bg-indigo-50 items-center justify-center">
                      <Feather name="chevron-right" size={18} color="#6366F1" />
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
