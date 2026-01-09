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

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async () => {
    console.log('Signup button clicked');
    setError(null);

    if (!name.trim()) {
      setError('Veuillez entrer votre nom');
      return;
    }

    if (name.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return;
    }

    if (!email.trim()) {
      setError('Veuillez entrer votre email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email invalide');
      return;
    }

    if (!password) {
      setError('Veuillez entrer un mot de passe');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      console.log('Calling signup service...');
      await signup({ name: name.trim(), email: email.trim(), password });
      console.log('Signup successful, redirecting...');
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Signup error:', e);
      setError((e as Error).message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
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
        <View className="mb-8 items-center">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl bg-primary-50 shadow-sm shadow-primary-100">
            <Feather name="user-plus" size={36} color="#4F46E5" />
          </View>
          <Text className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">Inscription</Text>
          <Text className="text-center text-lg text-secondary-500">
            Rejoignez-nous dès maintenant
          </Text>
        </View>

        <View className="w-full">
          <View className="mb-5">
            <Text className="mb-2 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Nom complet</Text>
            <View className={`rounded-2xl border-2 bg-surface-light dark:bg-surface-dark ${error && !name ? 'border-red-500' : 'border-secondary-100 focus:border-primary-500'}`}>
              <TextInput
                placeholder="Jean Dupont"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                className="px-5 py-4 text-base text-gray-900 dark:text-white"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError(null);
                }}
                editable={!loading}
              />
            </View>
          </View>

          <View className="mb-5">
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

          <View className="mb-5">
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
            <Text className="mt-1.5 text-xs font-medium text-secondary-400">Minimum 6 caractères</Text>
          </View>

          <View className="mb-8">
            <Text className="mb-2 text-sm font-semibold text-secondary-700 dark:text-secondary-300">Confirmer le mot de passe</Text>
            <View className={`relative rounded-2xl border-2 bg-surface-light dark:bg-surface-dark ${error && !confirmPassword ? 'border-red-500' : 'border-secondary-100 focus:border-primary-500'}`}>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                className="px-5 py-4 pr-12 text-base text-gray-900 dark:text-white"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError(null);
                }}
                editable={!loading}
              />
              <Pressable
                className="absolute right-4 top-4 p-1"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#64748B" />
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
              <Text className="text-center text-lg font-bold text-white">S'inscrire</Text>
            )}
          </Pressable>

          <View className="flex-row justify-center items-center">
            <Text className="text-base text-secondary-600">Déjà un compte ? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-base font-bold text-primary-600">Se connecter</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
