import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { createApplication } from '@/services/jobApplication';
import { ApplicationStatus, ContractType } from '@/types/jobApplication';
import { Feather } from '@expo/vector-icons';

export default function NewApplicationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobUrl: '',
    contractType: ContractType.CDI,
    applicationDate: new Date().toISOString().split('T')[0],
    status: ApplicationStatus.TO_APPLY,
    notes: '',
  });

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }

    if (!formData.title || !formData.company || !formData.location) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      await createApplication({
        ...formData,
        userId: user.id,
      });
      Alert.alert('Succès', 'Candidature ajoutée avec succès', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la candidature');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="p-5 pb-12">
        <View className="mb-6">
          <Text className="mb-2 text-sm font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wide">Titre du poste *</Text>
          <TextInput
            className="rounded-2xl border-2 border-secondary-100 dark:border-secondary-700 bg-white dark:bg-surface-dark px-5 py-4 text-base text-gray-900 dark:text-white focus:border-primary-500"
            placeholder="Ex: Développeur React Native"
            placeholderTextColor="#94A3B8"
            value={formData.title}
            onChangeText={text => setFormData({ ...formData, title: text })}
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-sm font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wide">Entreprise *</Text>
          <TextInput
            className="rounded-2xl border-2 border-secondary-100 dark:border-secondary-700 bg-white dark:bg-surface-dark px-5 py-4 text-base text-gray-900 dark:text-white focus:border-primary-500"
            placeholder="Ex: Tech Corp"
            placeholderTextColor="#94A3B8"
            value={formData.company}
            onChangeText={text => setFormData({ ...formData, company: text })}
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-sm font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wide">Lieu *</Text>
          <TextInput
            className="rounded-2xl border-2 border-secondary-100 dark:border-secondary-700 bg-white dark:bg-surface-dark px-5 py-4 text-base text-gray-900 dark:text-white focus:border-primary-500"
            placeholder="Ex: Paris, Remote"
            placeholderTextColor="#94A3B8"
            value={formData.location}
            onChangeText={text => setFormData({ ...formData, location: text })}
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-sm font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wide">Lien de l'annonce</Text>
          <TextInput
            className="rounded-2xl border-2 border-secondary-100 dark:border-secondary-700 bg-white dark:bg-surface-dark px-5 py-4 text-base text-gray-900 dark:text-white focus:border-primary-500"
            placeholder="https://..."
            placeholderTextColor="#94A3B8"
            keyboardType="url"
            value={formData.jobUrl}
            onChangeText={text => setFormData({ ...formData, jobUrl: text })}
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-sm font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wide">Type de contrat</Text>
          <View className="flex-row flex-wrap gap-3">
            {Object.values(ContractType).map(type => (
              <TouchableOpacity
                key={type}
                className={`rounded-full px-5 py-2.5 border ${formData.contractType === type
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white dark:bg-surface-dark border-secondary-200 dark:border-secondary-700'
                  }`}
                onPress={() => setFormData({ ...formData, contractType: type })}
              >
                <Text
                  className={`text-sm font-bold ${formData.contractType === type ? 'text-white' : 'text-secondary-600 dark:text-secondary-300'
                    }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-sm font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wide">Date de candidature</Text>
          <TextInput
            className="rounded-2xl border-2 border-secondary-100 dark:border-secondary-700 bg-white dark:bg-surface-dark px-5 py-4 text-base text-gray-900 dark:text-white focus:border-primary-500"
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            value={formData.applicationDate}
            onChangeText={text => setFormData({ ...formData, applicationDate: text })}
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-sm font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wide">Statut</Text>
          <View className="flex-row flex-wrap gap-2">
            {Object.values(ApplicationStatus).map(status => (
              <TouchableOpacity
                key={status}
                className={`rounded-full px-4 py-2 border ${formData.status === status
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white dark:bg-surface-dark border-secondary-200 dark:border-secondary-700'
                  }`}
                onPress={() => setFormData({ ...formData, status })}
              >
                <Text
                  className={`text-xs font-bold ${formData.status === status ? 'text-white' : 'text-secondary-600 dark:text-secondary-300'
                    }`}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-8">
          <Text className="mb-2 text-sm font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wide">Notes</Text>
          <TextInput
            className="rounded-2xl border-2 border-secondary-100 dark:border-secondary-700 bg-white dark:bg-surface-dark px-5 py-4 text-base text-gray-900 dark:text-white focus:border-primary-500 min-h-[120px]"
            placeholder="Notes supplémentaires..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={formData.notes}
            onChangeText={text => setFormData({ ...formData, notes: text })}
          />
        </View>

        <TouchableOpacity
          className={`rounded-2xl bg-primary-600 py-4 shadow-lg shadow-primary-500/30 active:bg-primary-700 ${loading ? 'opacity-70' : ''}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-lg font-bold text-white">
              Ajouter la candidature
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
