import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Veuillez entrer votre email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email invalide');
      return;
    }

    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);
      const { user } = await login({ email, password });
      if (user.role === 'admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      setError((e as Error).message || 'Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-light dark:bg-background-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10 items-center">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl bg-primary-50 shadow-sm shadow-primary-100">
            <Feather name="briefcase" size={36} color="#4F46E5" />
          </View>
          <Text className="mb-3 text-4xl font-bold text-gray-900 dark:text-white">Connexion</Text>
          <Text className="text-center text-lg text-secondary-500">
            Connectez-vous pour gérer vos candidatures
          </Text>
        </View>

        <View className="w-full">
          <View className="mb-6">
            <Text className="mb-2 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Email</Text>
            <View className={`rounded-2xl border-2 bg-surface-light dark:bg-surface-dark ${error && !email ? 'border-red-500' : 'border-secondary-100 focus:border-primary-500'}`}>
              <TextInput
                placeholder="exemple@email.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                className="px-5 py-4 text-base text-gray-900 dark:text-white"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                editable={!loading}
              />
            </View>
          </View>

          <View className="mb-8">
            <Text className="mb-2 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Mot de passe</Text>
            <View className={`relative rounded-2xl border-2 bg-surface-light dark:bg-surface-dark ${error && !password ? 'border-red-500' : 'border-secondary-100 focus:border-primary-500'}`}>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                className="px-5 py-4 pr-12 text-base text-gray-900 dark:text-white"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(null);
                }}
                editable={!loading}
              />
              <Pressable
                className="absolute right-4 top-4 p-1"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#64748B" />
              </Pressable>
            </View>
          </View>

          {error ? (
            <View className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
              <Text className="text-center text-sm font-medium text-red-600">{error}</Text>
            </View>
          ) : null}

          <Pressable
            className={`mb-8 rounded-2xl bg-primary-600 py-5 shadow-lg shadow-primary-500/40 active:bg-primary-700 ${loading ? 'opacity-70' : ''}`}
            onPress={onSubmit}
            disabled={loading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-lg font-bold text-white">Se connecter</Text>
            )}
          </Pressable>

          <View className="flex-row justify-center items-center">
            <Text className="text-base text-secondary-600">Pas encore de compte ? </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text className="text-base font-bold text-primary-600">S'inscrire</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
