import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import {
  getApplications,
  deleteApplication,
  filterApplications,
} from '@/services/jobApplication';
import { JobApplication, ApplicationFilters, ApplicationStatus, ContractType } from '@/types/jobApplication';
import { StatusConfig, ContractTypeLabels } from '@/constants';
import { Feather } from '@expo/vector-icons';

export default function ApplicationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | undefined>();
  const [filterContractType, setFilterContractType] = useState<ContractType | undefined>();
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (params.success === 'true') {
      setShowSuccess(true);
      // Cacher le message après 3 secondes
      const timer = setTimeout(() => {
        setShowSuccess(false);
        router.setParams({ success: undefined });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [params.success]);

  useEffect(() => {
    loadApplications();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [applications, searchQuery, filterStatus, filterContractType]);

  const loadApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getApplications(user.id);
      setApplications(data.sort((a, b) =>
        new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
      ));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les candidatures');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    if (!user) return;

    const filters: ApplicationFilters = {
      searchQuery: searchQuery || undefined,
      status: filterStatus,
      contractType: filterContractType,
    };

    const filtered = await filterApplications(user.id, filters);
    setFilteredApplications(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    // Suppression immédiate sans confirmation "fluide"
    try {
      await deleteApplication(id, user.id);
      loadApplications();
      // Sur web, on pourrait ajouter un petit toast non bloquant ici si on avait une lib de toast
    } catch (error) {
      console.error('Erreur suppression:', error);
      // En cas d'erreur seulement on affiche une alerte
      if (Platform.OS === 'web') {
        window.alert('Impossible de supprimer la candidature');
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer la candidature');
      }
    }
  };

  const renderApplication = ({ item }: { item: JobApplication }) => {
    const statusConfig = StatusConfig[item.status];

    return (
      <TouchableOpacity
        className="mb-3 rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
        onPress={() => router.push(`/application/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <Text className="mb-1 text-lg font-bold text-gray-900">{item.title}</Text>
            <Text className="text-base text-gray-600">{item.company}</Text>
          </View>
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: statusConfig.color + '20' }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: statusConfig.color }}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>
        <View className="mb-2 flex-row items-center gap-4">
          <View className="flex-row items-center">
            <Feather name="map-pin" size={14} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">{item.location}</Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="briefcase" size={14} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">
              {ContractTypeLabels[item.contractType]}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Feather name="calendar" size={14} color="#6B7280" />
            <Text className="ml-1 text-xs text-gray-500">
              {new Date(item.applicationDate).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <TouchableOpacity
            className="p-2"
            onPress={() => handleDelete(item.id)}
          >
            <Feather name="trash-2" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {showSuccess && (
        <View className="bg-green-500 px-4 py-3 flex-row items-center justify-center animate-bounce">
          <Feather name="check-circle" size={20} color="#fff" />
          <Text className="ml-2 text-white font-bold">Candidature ajoutée avec succès !</Text>
        </View>
      )}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="relative">
          <Feather name="search" size={20} color="#9CA3AF" className="absolute left-3 top-3.5 z-10" />
          <TextInput
            className="rounded-xl border-2 border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-base text-gray-900"
            placeholder="Rechercher par titre ou entreprise..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2 px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity
          className={`rounded-full px-4 py-2 border-2 ${!filterStatus
            ? 'bg-primary-500 border-primary-500'
            : 'bg-white border-gray-200'
            }`}
          onPress={() => setFilterStatus(undefined)}
        >
          <Text
            className={`text-sm font-medium ${!filterStatus ? 'text-white' : 'text-gray-700'
              }`}
          >
            Tous
          </Text>
        </TouchableOpacity>
        {Object.values(ApplicationStatus).map(status => (
          <TouchableOpacity
            key={status}
            className={`rounded-full px-4 py-2 border-2 ${filterStatus === status
              ? 'bg-primary-500 border-primary-500'
              : 'bg-white border-gray-200'
              }`}
            onPress={() => setFilterStatus(filterStatus === status ? undefined : status)}
          >
            <Text
              className={`text-sm font-medium ${filterStatus === status ? 'text-white' : 'text-gray-700'
                }`}
            >
              {StatusConfig[status].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredApplications}
        renderItem={renderApplication}
        keyExtractor={item => item.id}
        contentContainerClassName="p-4"
        ListEmptyComponent={
          <View className="py-12 items-center">
            <Feather name="inbox" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-base text-gray-500">Aucune candidature trouvée</Text>
          </View>
        }
      />

      <TouchableOpacity
        className="absolute right-4 bottom-4 h-14 w-14 items-center justify-center rounded-full bg-primary-500 shadow-lg shadow-primary-500/30"
        onPress={() => router.push('/application/new' as any)}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
