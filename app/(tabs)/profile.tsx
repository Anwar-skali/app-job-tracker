import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Rediriger vers la page de login après la déconnexion
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-8 border-b border-gray-200">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary-100">
          <Feather name="user" size={40} color="#2563EB" />
        </View>
        <Text className="text-2xl font-bold text-gray-900">{user?.name ?? 'Utilisateur'}</Text>
        <Text className="text-gray-600">{user?.email ?? '-'}</Text>
      </View>

      <View className="mt-4 mx-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <View className="mb-4 pb-4 border-b border-gray-100">
          <Text className="mb-1 text-xs text-gray-500 uppercase tracking-wide">Nom</Text>
          <Text className="text-base font-semibold text-gray-900">{user?.name ?? 'Inconnu'}</Text>
        </View>
        <View>
          <Text className="mb-1 text-xs text-gray-500 uppercase tracking-wide">Email</Text>
          <Text className="text-base font-semibold text-gray-900">{user?.email ?? '-'}</Text>
        </View>
      </View>

      <View className="px-4 mt-6">
        <Pressable
          className="flex-row items-center justify-center rounded-xl bg-red-500 py-4 shadow-lg"
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color="#fff" />
          <Text className="ml-2 text-base font-semibold text-white">Se déconnecter</Text>
        </Pressable>
      </View>
    </View>
  );
}
