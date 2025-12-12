import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { createApplication } from '@/services/jobApplication';
import { ApplicationStatus, ContractType } from '@/types/jobApplication';
import { Colors } from '@/constants/colors';

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
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Titre du poste *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={text => setFormData({ ...formData, title: text })}
          placeholder="Ex: Développeur React Native"
        />

        <Text style={styles.label}>Entreprise *</Text>
        <TextInput
          style={styles.input}
          value={formData.company}
          onChangeText={text => setFormData({ ...formData, company: text })}
          placeholder="Ex: Tech Corp"
        />

        <Text style={styles.label}>Lieu *</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={text => setFormData({ ...formData, location: text })}
          placeholder="Ex: Paris, Remote"
        />

        <Text style={styles.label}>Lien de l'annonce</Text>
        <TextInput
          style={styles.input}
          value={formData.jobUrl}
          onChangeText={text => setFormData({ ...formData, jobUrl: text })}
          placeholder="https://..."
          keyboardType="url"
        />

        <Text style={styles.label}>Type de contrat</Text>
        <View style={styles.radioGroup}>
          {Object.values(ContractType).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.radioButton,
                formData.contractType === type && styles.radioButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, contractType: type })}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.contractType === type && styles.radioTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Date de candidature</Text>
        <TextInput
          style={styles.input}
          value={formData.applicationDate}
          onChangeText={text => setFormData({ ...formData, applicationDate: text })}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Statut</Text>
        <View style={styles.radioGroup}>
          {Object.values(ApplicationStatus).map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.radioButton,
                formData.status === status && styles.radioButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, status })}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.status === status && styles.radioTextActive,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={text => setFormData({ ...formData, notes: text })}
          placeholder="Notes supplémentaires..."
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Ajout en cours...' : 'Ajouter la candidature'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#f5f5f5',
  },
  radioButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radioText: {
    fontSize: 14,
    color: Colors.text,
  },
  radioTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});

