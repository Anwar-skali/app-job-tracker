import React from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { isDark, toggleTheme, theme } = useThemeStore();

  return (
    <ScrollView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="bg-white dark:bg-surface-dark px-5 py-6 mb-2 border-b border-secondary-100 dark:border-secondary-800">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</Text>
      </View>

      <View className="bg-white dark:bg-surface-dark px-5 py-5 border-b border-secondary-100 dark:border-secondary-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-secondary-50 dark:bg-secondary-800">
              <Feather name="moon" size={24} color={isDark ? '#4F46E5' : '#64748B'} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">Mode sombre</Text>
              <Text className="text-sm text-secondary-500">Activer le thème sombre</Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#E2E8F0', true: '#4F46E5' }}
            thumbColor="#fff"
            ios_backgroundColor="#E2E8F0"
          />
        </View>
      </View>

      <View className="mt-6 bg-white dark:bg-surface-dark px-5 py-6 border-y border-secondary-100 dark:border-secondary-800">
        <Text className="mb-6 text-xl font-bold text-gray-900 dark:text-white">À propos</Text>

        <View className="flex-row justify-between py-4 border-b border-secondary-100 dark:border-secondary-800">
          <Text className="text-base text-secondary-600 dark:text-secondary-400">Version</Text>
          <Text className="text-base font-bold text-gray-900 dark:text-white">1.0.0</Text>
        </View>

        <View className="flex-row justify-between py-4">
          <Text className="text-base text-secondary-600 dark:text-secondary-400">SDK Expo</Text>
          <Text className="text-base font-bold text-gray-900 dark:text-white">54</Text>
        </View>
      </View>
    </ScrollView>
  );
}
