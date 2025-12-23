import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
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
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | undefined>();
  const [filterContractType, setFilterContractType] = useState<ContractType | undefined>();
  const [loading, setLoading] = useState(true);

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

  const handleDelete = (id: string) => {
    Alert.alert(
      'Supprimer',
      'Êtes-vous sûr de vouloir supprimer cette candidature ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await deleteApplication(id, user.id);
              loadApplications();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la candidature');
            }
          },
        },
      ]
    );
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
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="bg-white dark:bg-surface-dark px-5 py-4 border-b border-secondary-100 dark:border-secondary-800">
        <View className="relative">
          <Feather name="search" size={20} color="#94A3B8" className="absolute left-4 top-4 z-10" />
          <TextInput
            className="rounded-2xl border-2 border-secondary-100 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/50 pl-12 pr-4 py-3.5 text-base text-gray-900 dark:text-white focus:border-primary-500"
            placeholder="Rechercher..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2 px-5 py-3 bg-white dark:bg-surface-dark border-b border-secondary-100 dark:border-secondary-800">
        <TouchableOpacity
          className={`rounded-full px-4 py-2 border ${!filterStatus
              ? 'bg-primary-600 border-primary-600'
              : 'bg-white dark:bg-transparent border-secondary-200 dark:border-secondary-700'
            }`}
          onPress={() => setFilterStatus(undefined)}
        >
          <Text
            className={`text-sm font-semibold ${!filterStatus ? 'text-white' : 'text-secondary-600 dark:text-secondary-300'
              }`}
          >
            Tous
          </Text>
        </TouchableOpacity>
        {Object.values(ApplicationStatus).map(status => (
          <TouchableOpacity
            key={status}
            className={`rounded-full px-4 py-2 border ${filterStatus === status
                ? 'bg-primary-600 border-primary-600'
                : 'bg-white dark:bg-transparent border-secondary-200 dark:border-secondary-700'
              }`}
            onPress={() => setFilterStatus(filterStatus === status ? undefined : status)}
          >
            <Text
              className={`text-sm font-semibold ${filterStatus === status ? 'text-white' : 'text-secondary-600 dark:text-secondary-300'
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
        contentContainerClassName="p-5 pb-24"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="py-20 items-center px-6">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-800">
              <Feather name="inbox" size={40} color="#94A3B8" />
            </View>
            <Text className="text-xl font-bold text-secondary-900 dark:text-white text-center">Aucune candidature</Text>
            <Text className="mt-2 text-center text-secondary-500 text-base">
              Commencez par ajouter votre première candidature
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        className="absolute right-5 bottom-5 h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/40 active:bg-primary-700"
        onPress={() => router.push('/application/new' as any)}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
