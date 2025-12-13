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
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!application) {
    return null;
  }

  const statusConfig = StatusConfig[application.status];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="mb-2 text-2xl font-bold text-gray-900">{application.title}</Text>
            <Text className="text-lg text-gray-600">{application.company}</Text>
          </View>
          <View
            className="rounded-full px-4 py-2"
            style={{ backgroundColor: statusConfig.color + '20' }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: statusConfig.color }}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </View>

      <View className="bg-white px-4 py-5 mb-2 border-b border-gray-200">
        <Text className="mb-4 text-lg font-bold text-gray-900">Informations</Text>
        <View className="mb-3 flex-row">
          <Text className="w-32 text-base text-gray-600">Lieu :</Text>
          <Text className="flex-1 text-base text-gray-900">{application.location}</Text>
        </View>
        <View className="mb-3 flex-row">
          <Text className="w-32 text-base text-gray-600">Type de contrat :</Text>
          <Text className="flex-1 text-base text-gray-900">
            {ContractTypeLabels[application.contractType]}
          </Text>
        </View>
        <View className="mb-3 flex-row">
          <Text className="w-32 text-base text-gray-600">Date de candidature :</Text>
          <Text className="flex-1 text-base text-gray-900">
            {new Date(application.applicationDate).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        {application.jobUrl && (
          <View className="mb-3 flex-row">
            <Text className="w-32 text-base text-gray-600">Lien de l'annonce :</Text>
            <Text className="flex-1 text-base text-primary-500" numberOfLines={1}>
              {application.jobUrl}
            </Text>
          </View>
        )}
      </View>

      {application.notes && (
        <View className="bg-white px-4 py-5 mb-2 border-b border-gray-200">
          <Text className="mb-3 text-lg font-bold text-gray-900">Notes</Text>
          <Text className="text-base leading-6 text-gray-900">{application.notes}</Text>
        </View>
      )}

      {application.documents && application.documents.length > 0 && (
        <View className="bg-white px-4 py-5 mb-2 border-b border-gray-200">
          <Text className="mb-3 text-lg font-bold text-gray-900">Documents joints</Text>
          {application.documents.map((doc, index) => (
            <View key={index} className="mb-2 flex-row items-center">
              <Feather name="file" size={18} color="#2563EB" />
              <Text className="ml-2 text-base text-primary-500">{doc}</Text>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row gap-3 px-4 py-6">
        <TouchableOpacity
          className="flex-1 rounded-xl bg-primary-500 py-4 shadow-lg shadow-primary-500/30"
          onPress={() => router.push(`/application/${application.id}/edit` as any)}
        >
          <Text className="text-center text-base font-semibold text-white">Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 rounded-xl bg-red-500 py-4 shadow-lg"
          onPress={handleDelete}
        >
          <Text className="text-center text-base font-semibold text-white">Supprimer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
