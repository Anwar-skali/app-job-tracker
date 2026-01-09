import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { getApplicationById, updateApplication } from '@/services/jobApplication';
import { JobApplication, ApplicationStatus, ContractType } from '@/types/jobApplication';

export default function EditApplicationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<JobApplication>>({});

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
      setFormData({
        title: data.title,
        company: data.company,
        location: data.location,
        jobUrl: data.jobUrl || '',
        contractType: data.contractType,
        applicationDate: data.applicationDate.split('T')[0],
        status: data.status,
        notes: data.notes || '',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la candidature');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !id) return;

    if (!formData.title || !formData.company || !formData.location) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSaving(true);
      await updateApplication(id, formData, user.id);
      Alert.alert('Succès', 'Candidature modifiée avec succès', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier la candidature');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="p-5 pb-10">
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
          className={`rounded-2xl bg-primary-600 py-4 shadow-lg shadow-primary-500/30 active:bg-primary-700 ${saving ? 'opacity-70' : ''}`}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-lg font-bold text-white">
              Enregistrer les modifications
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
