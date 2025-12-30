import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { status } = useAuth();

  // Attendre que l'auth soit déterminée
  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Rediriger selon le statut d'authentification
  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

