import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, deleteAccount } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        try {
          await logout();
          router.replace('/(auth)/login');
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
        }
      }
    } else {
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnecter',
            style: 'destructive',
            onPress: async () => {
              try {
                await logout();
                router.replace('/(auth)/login');
              } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
              }
            }
          },
        ]
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (Platform.OS === 'web') {
      if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues.')) {
        try {
          await deleteAccount();
          router.replace('/(auth)/login');
        } catch (error) {
          alert('Impossible de supprimer le compte');
        }
      }
    } else {
      Alert.alert(
        'Supprimer mon compte',
        'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteAccount();
                router.replace('/(auth)/login');
              } catch (error) {
                Alert.alert('Erreur', 'Impossible de supprimer le compte');
              }
            }
          },
        ]
      );
    }
  };

  const openEditModal = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPassword('');
    setConfirmPassword('');
    setModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Erreur', 'Le nom et l\'email sont requis');
      return;
    }

    if (password && password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      const updates: any = { name, email };
      if (password) {
        updates.password = password;
      }

      await updateProfile(updates);
      setModalVisible(false);
      Alert.alert('Succès', 'Profil mis à jour');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="bg-white dark:bg-surface-dark px-6 py-8 border-b border-secondary-100 dark:border-secondary-800">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-primary-50 dark:bg-primary-900/50 shadow-sm shadow-primary-100">
          <Feather name="user" size={48} color="#4F46E5" />
        </View>
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user?.name ?? 'Utilisateur'}</Text>
        <Text className="text-lg text-secondary-500">{user?.email ?? '-'}</Text>

        <Pressable
          className="mt-4 flex-row items-center self-start rounded-full bg-secondary-100 dark:bg-secondary-800 px-4 py-2"
          onPress={openEditModal}
        >
          <Feather name="edit-2" size={16} color="#64748B" />
          <Text className="ml-2 font-medium text-secondary-700 dark:text-secondary-300">Modifier le profil</Text>
        </Pressable>
      </View>

      <View className="mt-6 mx-5 rounded-3xl bg-white dark:bg-surface-dark p-6 shadow-sm shadow-secondary-200 dark:shadow-none border border-secondary-100 dark:border-secondary-800">
        <View className="mb-5 pb-5 border-b border-secondary-100 dark:border-secondary-800">
          <Text className="mb-1 text-xs font-bold text-secondary-400 uppercase tracking-widest">Nom</Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name ?? 'Inconnu'}</Text>
        </View>
        <View>
          <Text className="mb-1 text-xs font-bold text-secondary-400 uppercase tracking-widest">Email</Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">{user?.email ?? '-'}</Text>
        </View>
      </View>

      <View className="px-5 mt-8 mb-10 gap-4">
        <Pressable
          className="flex-row items-center justify-center rounded-2xl bg-secondary-100 dark:bg-secondary-800 py-4 active:bg-secondary-200"
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color="#64748B" />
          <Text className="ml-2 text-lg font-semibold text-secondary-700 dark:text-secondary-300">Se déconnecter</Text>
        </Pressable>

        <Pressable
          className="flex-row items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 py-4 active:bg-red-100"
          onPress={handleDeleteAccount}
        >
          <Feather name="trash-2" size={20} color="#EF4444" />
          <Text className="ml-2 text-lg font-semibold text-red-600 dark:text-red-400">Supprimer mon compte</Text>
        </Pressable>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-surface-dark rounded-t-3xl p-6 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">Modifier le profil</Text>
              <Pressable onPress={() => setModalVisible(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Feather name="x" size={24} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">Nom complet</Text>
                <TextInput
                  className="rounded-xl bg-secondary-50 dark:bg-secondary-800 px-4 py-3 text-base text-gray-900 dark:text-white border border-secondary-200 dark:border-secondary-700"
                  value={name}
                  onChangeText={setName}
                  placeholder="Votre nom"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">Email</Text>
                <TextInput
                  className="rounded-xl bg-secondary-50 dark:bg-secondary-800 px-4 py-3 text-base text-gray-900 dark:text-white border border-secondary-200 dark:border-secondary-700"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre@email.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-4 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                <Text className="mb-4 text-base font-semibold text-primary-600 dark:text-primary-400">Modifier le mot de passe (optionnel)</Text>

                <Text className="mb-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">Nouveau mot de passe</Text>
                <TextInput
                  className="rounded-xl bg-secondary-50 dark:bg-secondary-800 px-4 py-3 text-base text-gray-900 dark:text-white border border-secondary-200 dark:border-secondary-700 mb-4"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                />

                <Text className="mb-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">Confirmer le mot de passe</Text>
                <TextInput
                  className="rounded-xl bg-secondary-50 dark:bg-secondary-800 px-4 py-3 text-base text-gray-900 dark:text-white border border-secondary-200 dark:border-secondary-700"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="********"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                />
              </View>

              <Pressable
                className={`mt-4 rounded-xl bg-primary-600 py-4 shadow-lg shadow-primary-600/30 active:bg-primary-700 ${loading ? 'opacity-70' : ''}`}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                <Text className="text-center text-lg font-bold text-white">
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
