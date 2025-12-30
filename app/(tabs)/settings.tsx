import React from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { isDark, toggleTheme, theme } = useThemeStore();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-4 mb-2 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">Apparence</Text>
      </View>

      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Feather name="moon" size={20} color={isDark ? '#2563EB' : '#6B7280'} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">Mode sombre</Text>
              <Text className="text-sm text-gray-600">Activer le thème sombre</Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View className="mt-4 bg-white px-4 py-4 border-b border-gray-200">
        <Text className="mb-4 text-xl font-bold text-gray-900">À propos</Text>

        <View className="flex-row justify-between py-3 border-b border-gray-100">
          <Text className="text-base text-gray-600">Version</Text>
          <Text className="text-base font-semibold text-gray-900">1.0.0</Text>
        </View>

        <View className="flex-row justify-between py-3">
          <Text className="text-base text-gray-600">SDK Expo</Text>
          <Text className="text-base font-semibold text-gray-900">54</Text>
        </View>
      </View>

      <View className="mt-4 bg-white px-4 py-4 border-b border-gray-200 mb-8">
        <Text className="mb-4 text-xl font-bold text-red-600">Zone Danger</Text>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3"
          onPress={() => {
            // Importer AsyncStorage ici pour éviter les bugs si non utilisé
            const { Platform, Alert } = require('react-native');

            if (Platform.OS === 'web') {
              if (window.confirm('Voulez-vous vraiment TOUT effacer ? Cette action est irréversible.')) {
                require('@react-native-async-storage/async-storage').default.clear().then(() => {
                  window.alert('Données effacées. L\'application va redémarrer.');
                  window.location.reload();
                });
              }
            } else {
              Alert.alert(
                'Effacer les données',
                'Voulez-vous vraiment TOUT effacer ? Cette action est irréversible.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Effacer tout',
                    style: 'destructive',
                    onPress: async () => {
                      // TODO: Implémenter clear pour SQLite si nécessaire
                      // Pour l'instant on suppose que c'est surtout pour le dev web
                    }
                  }
                ]
              );
            }
          }}
        >
          <View className="flex-row items-center">
            <Feather name="trash-2" size={20} color="#EF4444" />
            <Text className="ml-3 text-base font-semibold text-red-600">Réinitialiser les données</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
