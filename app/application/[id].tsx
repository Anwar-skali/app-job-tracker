import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { getApplicationById, deleteApplication } from '@/services/jobApplication';
import { JobApplication } from '@/types/jobApplication';
import { StatusConfig, ContractTypeLabels } from '@/constants';
import { Feather } from '@expo/vector-icons';

export default function ApplicationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplication();
  }, [id, user]);

  const loadApplication = async () => {
    if (!user || !id) return;

    try {
      setLoading(true);
      const data = await getApplicationById(id, user.id);
      if (!data) {
        Alert.alert('Erreur', 'Candidature non trouvée');
        router.back();
        return;
      }
      setApplication(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la candidature');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!user || !application) return;

    Alert.alert(
      'Supprimer',
      'Êtes-vous sûr de vouloir supprimer cette candidature ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteApplication(application.id, user.id);
              router.back();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la candidature');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-background-dark">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!application) {
    return null;
  }

  const statusConfig = StatusConfig[application.status];

  return (
    <ScrollView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="bg-white dark:bg-surface-dark px-5 py-6 border-b border-secondary-100 dark:border-secondary-800">
        <View className="mb-4 flex-row items-start justify-between">
          <View className="flex-1 mr-4">
            <Text className="mb-2 text-2xl font-bold text-gray-900 dark:text-white leading-tight">{application.title}</Text>
            <Text className="text-lg font-medium text-secondary-500">{application.company}</Text>
          </View>
          <View
            className="rounded-full px-4 py-2"
            style={{ backgroundColor: statusConfig.color + '20' }}
          >
            <Text
              className="text-sm font-bold"
              style={{ color: statusConfig.color }}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </View>

      <View className="bg-white dark:bg-surface-dark px-5 py-6 mb-3 border-b border-secondary-100 dark:border-secondary-800">
        <Text className="mb-5 text-xl font-bold text-gray-900 dark:text-white">Informations</Text>
        <View className="mb-4 flex-row border-b border-secondary-50 dark:border-secondary-800/50 pb-4 last:border-0 last:pb-0">
          <Text className="w-36 text-base font-medium text-secondary-500">Lieu :</Text>
          <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">{application.location}</Text>
        </View>
        <View className="mb-4 flex-row border-b border-secondary-50 dark:border-secondary-800/50 pb-4 last:border-0 last:pb-0">
          <Text className="w-36 text-base font-medium text-secondary-500">Type de contrat :</Text>
          <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">
            {ContractTypeLabels[application.contractType]}
          </Text>
        </View>
        <View className="mb-4 flex-row border-b border-secondary-50 dark:border-secondary-800/50 pb-4 last:border-0 last:pb-0">
          <Text className="w-36 text-base font-medium text-secondary-500">Date :</Text>
          <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">
            {new Date(application.applicationDate).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        {application.jobUrl && (
          <View className="mb-4 flex-row">
            <Text className="w-36 text-base font-medium text-secondary-500">Annonce :</Text>
            <Text className="flex-1 text-base font-semibold text-primary-600 dark:text-primary-400" numberOfLines={1}>
              {application.jobUrl}
            </Text>
          </View>
        )}
      </View>

      {application.notes && (
        <View className="bg-white dark:bg-surface-dark px-5 py-6 mb-3 border-b border-secondary-100 dark:border-secondary-800">
          <Text className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Notes</Text>
          <Text className="text-base leading-7 text-secondary-700 dark:text-secondary-300">{application.notes}</Text>
        </View>
      )}

      {application.documents && application.documents.length > 0 && (
        <View className="bg-white dark:bg-surface-dark px-5 py-6 mb-3 border-b border-secondary-100 dark:border-secondary-800">
          <Text className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Documents joints</Text>
          {application.documents.map((doc, index) => (
            <View key={index} className="mb-3 flex-row items-center bg-secondary-50 dark:bg-secondary-800/50 p-3 rounded-xl border border-secondary-100 dark:border-secondary-700">
              <Feather name="file-text" size={20} color="#4F46E5" />
              <Text className="ml-3 text-base font-medium text-secondary-700 dark:text-secondary-300">{doc}</Text>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row gap-4 px-5 py-8 pb-12">
        <TouchableOpacity
          className="flex-1 rounded-2xl bg-primary-600 py-4 shadow-lg shadow-primary-600/30 active:bg-primary-700"
          onPress={() => router.push(`/application/${application.id}/edit` as any)}
        >
          <Text className="text-center text-lg font-bold text-white">Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 rounded-2xl bg-red-500 py-4 shadow-lg shadow-red-500/30 active:bg-red-600"
          onPress={handleDelete}
        >
          <Text className="text-center text-lg font-bold text-white">Supprimer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
