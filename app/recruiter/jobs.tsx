import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { getJobsByRecruiter, deleteJob, hasApplications, toggleJobArchive } from '@/services/jobService';
import { getApplicationsByRecruiter } from '@/services/jobApplication';
import { Job } from '@/types/job';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function RecruiterJobsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { canCreateJob } = usePermissions();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!canCreateJob) {
      Alert.alert('Accès refusé', 'Seuls les recruteurs peuvent voir leurs offres.');
      router.back();
    }
  }, [canCreateJob]);

  const loadJobs = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getJobsByRecruiter(user.id);
      // Enrichir avec le nombre de candidatures pour chaque offre
      const jobsWithStats = await Promise.all(
        data.map(async (job) => {
          const applications = await getApplicationsByRecruiter(user.id);
          const jobApplications = applications.filter(app => app.jobId === job.id);
          return {
            ...job,
            applicationCount: jobApplications.length,
          };
        })
      );
      // Filtrer selon showArchived
      const filtered = showArchived 
        ? jobsWithStats 
        : jobsWithStats.filter(job => !job.archived);
      setJobs(filtered);
    } catch (error) {
      console.error('Error loading recruiter jobs:', error);
      Alert.alert('Erreur', 'Impossible de charger les offres.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [loadJobs])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const handleJobPress = (job: Job) => {
    router.push(`/job/${job.id}`);
  };

  const handleDelete = async (job: Job, event: any) => {
    event?.stopPropagation();
    if (!user) return;

    // Vérifier si l'offre a des candidatures
    const hasApps = await hasApplications(job.id);
    
    if (hasApps) {
      Alert.alert(
        'Impossible de supprimer',
        'Cette offre a des candidatures en cours. Vous ne pouvez pas la supprimer.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Supprimer l\'offre',
      `Êtes-vous sûr de vouloir supprimer l'offre "${job.title}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteJob(job.id, user.id);
              if (success) {
                Alert.alert('Succès', 'Offre supprimée avec succès');
                loadJobs(); // Recharger la liste
              } else {
                Alert.alert('Erreur', 'Impossible de supprimer l\'offre');
              }
            } catch (error) {
              console.error('Error deleting job:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression');
            }
          },
        },
      ]
    );
  };

  const handleArchive = async (job: Job, event: any) => {
    event?.stopPropagation();
    if (!user) return;

    const action = job.archived ? 'désarchiver' : 'archiver';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} l'offre`,
      `Êtes-vous sûr de vouloir ${action} l'offre "${job.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              const success = await toggleJobArchive(job.id, user.id, !job.archived);
              if (success) {
                Alert.alert('Succès', `Offre ${action}ée avec succès`);
                loadJobs();
              } else {
                Alert.alert('Erreur', `Impossible de ${action} l'offre`);
              }
            } catch (error) {
              console.error('Error toggling archive:', error);
              Alert.alert('Erreur', 'Une erreur est survenue');
            }
          },
        },
      ]
    );
  };

  const renderJobItem = ({ item }: { item: Job & { applicationCount?: number } }) => (
    <TouchableOpacity
      className="bg-white p-5 rounded-3xl mb-3 shadow-medium border border-gray-100 active:scale-[0.98]"
      onPress={() => handleJobPress(item)}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Text className="font-bold text-gray-900 text-base mb-1.5">{item.title}</Text>
          <Text className="text-gray-600 text-sm font-medium mb-2">{item.company}</Text>
          <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full self-start">
            <Feather name="map-pin" size={14} color="#6B7280" />
            <Text className="text-gray-600 text-xs ml-1.5 font-medium">{item.location}</Text>
          </View>
        </View>
        {item.applicationCount !== undefined && (
          <View className="bg-gradient-to-br from-primary-500 to-primary-600 px-4 py-2 rounded-full shadow-primary">
            <Text className="text-white text-xs font-bold">
              {item.applicationCount} candidature{item.applicationCount > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <View className="flex-row items-center">
          <Feather name="calendar" size={12} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs ml-1.5 font-medium">
            Publié le {new Date(item.postedDate).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => router.push(`/recruiter/applications?jobId=${item.id}`)}
            className="flex-row items-center bg-primary-50 px-3 py-1.5 rounded-full active:bg-primary-100"
            activeOpacity={0.7}
          >
            <Text className="text-primary-600 text-xs font-bold mr-1.5">Candidatures</Text>
            <Feather name="chevron-right" size={14} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => handleArchive(item, e)}
            className={`px-3 py-1.5 rounded-full active:opacity-80 ${
              item.archived ? 'bg-yellow-50' : 'bg-gray-50'
            }`}
            activeOpacity={0.7}
          >
            <Feather 
              name={item.archived ? 'archive' : 'archive'} 
              size={14} 
              color={item.archived ? '#F59E0B' : '#6B7280'} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => handleDelete(item, e)}
            className="bg-red-50 px-3 py-1.5 rounded-full active:bg-red-100"
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="mt-4 text-gray-600">Chargement des offres...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{ 
          title: 'Mes offres',
          headerRight: () => (
            <View className="flex-row items-center mr-2">
              <TouchableOpacity
                onPress={() => setShowArchived(!showArchived)}
                className="mr-3"
              >
                <Feather 
                  name={showArchived ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={showArchived ? Colors.primary : '#6B7280'} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/job/new')}
              >
                <Feather name="plus" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      {/* Filter Toggle */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setShowArchived(!showArchived)}
          className="flex-row items-center justify-between"
        >
          <Text className="text-base font-semibold text-gray-900">
            {showArchived ? 'Afficher toutes les offres' : 'Afficher les offres archivées'}
          </Text>
          <Feather 
            name={showArchived ? 'eye-off' : 'archive'} 
            size={20} 
            color={Colors.primary} 
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJobItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-8">
            <Feather name="briefcase" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-base text-gray-500 text-center">
              Vous n'avez pas encore créé d'offres d'emploi.
            </Text>
            <TouchableOpacity
              className="mt-6 bg-primary-500 px-6 py-3 rounded-xl"
              onPress={() => router.push('/job/new')}
            >
              <Text className="text-white font-semibold">Créer ma première offre</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

