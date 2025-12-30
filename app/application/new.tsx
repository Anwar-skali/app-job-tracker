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
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="mb-5">
          <Text className="mb-2 text-sm font-semibold text-gray-700">Titre du poste *</Text>
          <TextInput
            className="rounded-xl border-2 border-gray-200 bg-white px-4 py-4 text-base text-gray-900"
            placeholder="Ex: Développeur React Native"
            placeholderTextColor="#9CA3AF"
            value={formData.title}
            onChangeText={text => setFormData({ ...formData, title: text })}
          />
        </View>

        <View className="mb-5">
          <Text className="mb-2 text-sm font-semibold text-gray-700">Entreprise *</Text>
          <TextInput
            className="rounded-xl border-2 border-gray-200 bg-white px-4 py-4 text-base text-gray-900"
            placeholder="Ex: Tech Corp"
            placeholderTextColor="#9CA3AF"
            value={formData.company}
            onChangeText={text => setFormData({ ...formData, company: text })}
          />
        </View>

        <View className="mb-5">
          <Text className="mb-2 text-sm font-semibold text-gray-700">Lieu *</Text>
          <TextInput
            className="rounded-xl border-2 border-gray-200 bg-white px-4 py-4 text-base text-gray-900"
            placeholder="Ex: Paris, Remote"
            placeholderTextColor="#9CA3AF"
            value={formData.location}
            onChangeText={text => setFormData({ ...formData, location: text })}
          />
        </View>

        <View className="mb-5">
          <Text className="mb-2 text-sm font-semibold text-gray-700">Lien de l'annonce</Text>
          <TextInput
            className="rounded-xl border-2 border-gray-200 bg-white px-4 py-4 text-base text-gray-900"
            placeholder="https://..."
            placeholderTextColor="#9CA3AF"
            keyboardType="url"
            value={formData.jobUrl}
            onChangeText={text => setFormData({ ...formData, jobUrl: text })}
          />
        </View>

        <View className="mb-5">
          <Text className="mb-2 text-sm font-semibold text-gray-700">Type de contrat</Text>
          <View className="flex-row flex-wrap gap-2">
            {Object.values(ContractType).map(type => (
              <TouchableOpacity
                key={type}
                className={`rounded-full px-4 py-2 border-2 ${
                  formData.contractType === type
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-200'
                }`}
                onPress={() => setFormData({ ...formData, contractType: type })}
              >
                <Text
                  className={`text-sm font-medium ${
                    formData.contractType === type ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-5">
          <Text className="mb-2 text-sm font-semibold text-gray-700">Date de candidature</Text>
          <TextInput
            className="rounded-xl border-2 border-gray-200 bg-white px-4 py-4 text-base text-gray-900"
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            value={formData.applicationDate}
            onChangeText={text => setFormData({ ...formData, applicationDate: text })}
          />
        </View>

        <View className="mb-5">
          <Text className="mb-2 text-sm font-semibold text-gray-700">Statut</Text>
          <View className="flex-row flex-wrap gap-2">
            {Object.values(ApplicationStatus).map(status => (
              <TouchableOpacity
                key={status}
                className={`rounded-full px-4 py-2 border-2 ${
                  formData.status === status
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-200'
                }`}
                onPress={() => setFormData({ ...formData, status })}
              >
                <Text
                  className={`text-sm font-medium ${
                    formData.status === status ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-sm font-semibold text-gray-700">Notes</Text>
          <TextInput
            className="rounded-xl border-2 border-gray-200 bg-white px-4 py-4 text-base text-gray-900 min-h-[100px]"
            placeholder="Notes supplémentaires..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={formData.notes}
            onChangeText={text => setFormData({ ...formData, notes: text })}
          />
        </View>

        <TouchableOpacity
          className={`rounded-xl bg-primary-500 py-4 shadow-lg shadow-primary-500/30 ${loading ? 'opacity-60' : ''}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-base font-semibold text-white">
              Ajouter la candidature
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
