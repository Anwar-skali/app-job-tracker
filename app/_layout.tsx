import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { initDatabase } from '@/services/database';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import '@/config/nativewind'; // Configurer NativeWind en premier
import '../global.css';

const DatabaseInitializer = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setIsReady(true); // Continue anyway
      }
    };
    initialize();
  }, []);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <>{children}</>;
};

export default function RootLayout() {
  const { isDark } = useThemeStore();

  // Appliquer la classe dark sur le root element au montage et quand isDark change
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Appliquer manuellement la classe dark
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark]);

  return (
    <DatabaseInitializer>
      <AuthProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="application/new" options={{ title: 'Nouvelle candidature', presentation: 'modal' }} />
          <Stack.Screen name="application/[id]" options={{ title: 'Détails' }} />
          <Stack.Screen name="application/[id]/edit" options={{ title: 'Modifier' }} />
        </Stack>
      </AuthProvider>
    </DatabaseInitializer>
  );
}
