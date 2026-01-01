import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getJobById as getMockJobById } from '@/services/job';
import { getJobById, deleteJob, hasApplications } from '@/services/jobService';
import { Job, JobType } from '@/types/job';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isRecruiter } = usePermissions();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Essayer d'abord de récupérer depuis la base de données (offres créées par recruteurs)
      let data = await getJobById(id);
      
      // Si pas trouvé, essayer les offres mockées
      if (!data) {
        try {
          data = await getMockJobById(id);
        } catch (e) {
          // Ignorer l'erreur si l'offre n'existe pas dans les mockées non plus
        }
      }
      
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'offre');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!job) return;
    
    // Navigate to application form with pre-filled data
    router.push({
      pathname: '/application/new',
      params: {
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        jobUrl: job.jobUrl || '',
      }
    });
  };

  const handleShare = async () => {
    if (!job) return;
    try {
      await Share.share({
        message: `Regarde cette offre d'emploi : ${job.title} chez ${job.company}\n${job.jobUrl}`,
        url: job.jobUrl,
        title: job.title,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!job || !user) return;

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
                Alert.alert('Succès', 'Offre supprimée avec succès', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Text className="text-lg text-gray-600 mb-4">Offre non trouvée</Text>
        <TouchableOpacity
          className="bg-primary-500 px-6 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          headerTitle: "",
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/80 rounded-full items-center justify-center ml-2 shadow-sm"
            >
              <Feather name="arrow-left" size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleShare}
              className="w-10 h-10 bg-white/80 rounded-full items-center justify-center mr-2 shadow-sm"
            >
              <Feather name="share" size={20} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Image Pattern */}
        <View className="h-48 bg-primary-500 w-full relative">
          <View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
        </View>

        <View className="px-5 -mt-12">
          {/* Company Logo / Placeholder */}
          <View className="w-24 h-24 bg-white rounded-2xl shadow-md items-center justify-center mb-4">
            <Text className="text-3xl font-bold text-primary-500">
              {job.company.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-1">{job.title}</Text>
          <Text className="text-lg text-gray-600 font-medium mb-4">{job.company}</Text>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 mb-6">
            <View className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full">
              <Feather name="map-pin" size={14} color={Colors.primary} />
              <Text className="ml-1.5 text-blue-700 text-sm font-medium">{job.location}</Text>
            </View>
            <View className="flex-row items-center bg-purple-50 px-3 py-1.5 rounded-full">
              <Feather name="briefcase" size={14} color="#9333ea" />
              <Text className="ml-1.5 text-purple-700 text-sm font-medium">{job.type}</Text>
            </View>
            {job.salary && (
              <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full">
                <Feather name="dollar-sign" size={14} color="#16a34a" />
                <Text className="ml-1.5 text-green-700 text-sm font-medium">{job.salary}</Text>
              </View>
            )}
            {job.remote && (
              <View className="flex-row items-center bg-orange-50 px-3 py-1.5 rounded-full">
                <Feather name="home" size={14} color="#ea580c" />
                <Text className="ml-1.5 text-orange-700 text-sm font-medium">Remote</Text>
              </View>
            )}
          </View>

          {/* Section: Description */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Description du poste</Text>
            <Text className="text-gray-600 leading-6">{job.description}</Text>
          </View>

          {/* Section: Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">Prérequis</Text>
              <View className="gap-2">
                {job.requirements.map((req, index) => (
                  <View key={index} className="flex-row items-start">
                    <View className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 mr-3" />
                    <Text className="flex-1 text-gray-600 leading-6">{req}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Section: Metadata */}
          <View className="border-t border-gray-200 pt-4 mt-2">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-500">Source</Text>
              <Text className="text-gray-900 font-medium">{job.source}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Publié le</Text>
              <Text className="text-gray-900 font-medium">
                {new Date(job.postedDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Action - Only show for candidates */}
      {!isRecruiter && (
        <View 
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <TouchableOpacity
            className="w-full bg-primary-500 py-4 rounded-xl items-center shadow-lg shadow-primary-500/30 active:opacity-90"
            onPress={handleApply}
          >
            <Text className="text-white text-base font-bold">Postuler maintenant</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Footer Action for Recruiters - Show edit/delete if it's their job */}
      {isRecruiter && job && job.recruiterId === user?.id && (
        <View 
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="flex-row gap-2 mb-2">
            <TouchableOpacity
              className="flex-1 bg-blue-500 py-3 rounded-xl items-center shadow-lg active:opacity-90"
              onPress={() => router.push(`/job/${job.id}/edit`)}
            >
              <Text className="text-white text-sm font-bold">Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-primary-500 py-3 rounded-xl items-center shadow-lg shadow-primary-500/30 active:opacity-90"
              onPress={() => router.push(`/recruiter/applications?jobId=${job.id}`)}
            >
              <Text className="text-white text-sm font-bold">Candidatures</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-green-500 py-3 rounded-xl items-center shadow-lg active:opacity-90"
              onPress={() => {
                router.push({
                  pathname: '/job/new',
                  params: {
                    duplicate: 'true',
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    type: job.type,
                    description: job.description || '',
                    salary: job.salary || '',
                    jobUrl: job.jobUrl || '',
                    remote: job.remote ? 'true' : 'false',
                    requirements: job.requirements ? JSON.stringify(job.requirements) : '',
                  }
                });
              }}
            >
              <Text className="text-white text-sm font-bold">Dupliquer</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="bg-red-500 py-3 rounded-xl items-center shadow-lg active:opacity-90"
            onPress={handleDelete}
          >
            <View className="flex-row items-center">
              <Feather name="trash-2" size={18} color="#FFFFFF" />
              <Text className="ml-2 text-white text-sm font-bold">Supprimer l'offre</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
