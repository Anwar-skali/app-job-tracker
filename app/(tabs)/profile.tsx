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
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="bg-white dark:bg-surface-dark px-6 py-8 border-b border-secondary-100 dark:border-secondary-800">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-primary-50 dark:bg-primary-900/50 shadow-sm shadow-primary-100">
          <Feather name="user" size={48} color="#4F46E5" />
        </View>
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user?.name ?? 'Utilisateur'}</Text>
        <Text className="text-lg text-secondary-500">{user?.email ?? '-'}</Text>
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

      <View className="px-5 mt-8">
        <Pressable
          className="flex-row items-center justify-center rounded-2xl bg-red-500 py-5 shadow-lg shadow-red-500/30 active:bg-red-600"
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color="#fff" />
          <Text className="ml-2 text-lg font-semibold text-white">Se déconnecter</Text>
        </Pressable>
      </View>
    </View>
  );
}
