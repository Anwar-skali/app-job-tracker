import { useRouter } from 'expo-router';
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
  StyleSheet,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme'; // Assuming we can use rough theme values or hardcode for now

// Using hardcoded colors to match the design system for now to ensure stability
const COLORS = {
  primary50: '#EEF2FF',
  primary100: '#E0E7FF',
  primary400: '#818CF8',
  primary500: '#6366F1',
  primary600: '#4F46E5',
  primary700: '#4338CA',
  secondary100: '#F1F5F9',
  secondary300: '#CBD5E1',
  secondary400: '#94A3B8',
  secondary500: '#64748B',
  secondary600: '#475569',
  secondary700: '#334155',
  secondary800: '#1E293B',
  success500: '#22C55E',
  danger500: '#EF4444',
  danger50: '#FEF2F2',
  danger200: '#FECACA',
  danger600: '#DC2626',
  white: '#FFFFFF',
  gray900: '#0F172A',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#1E293B',
  bgLight: '#F8FAFC',
  bgDark: '#0F172A',
};

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
  const [role, setRole] = useState<'candidate' | 'admin'>('candidate');

  const onSubmit = async () => {
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
      await signup({ name: name.trim(), email: email.trim(), password, role });
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="user-plus" size={36} color={COLORS.primary600} />
          </View>
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>
            Rejoignez-nous dès maintenant
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.roleContainer}>
            <Pressable
              style={[
                styles.roleButton,
                role === 'candidate' && styles.roleButtonActive
              ]}
              onPress={() => setRole('candidate')}
            >
              <Text
                style={[
                  styles.roleText,
                  role === 'candidate' && styles.roleTextActive
                ]}
              >
                Utilisateur
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.roleButton,
                role === 'admin' && styles.roleButtonActive
              ]}
              onPress={() => setRole('admin')}
            >
              <Text
                style={[
                  styles.roleText,
                  role === 'admin' && styles.roleTextActive
                ]}
              >
                Administrateur
              </Text>
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <View style={[styles.inputContainer, error && !name && styles.inputError]}>
              <TextInput
                placeholder="Jean Dupont"
                placeholderTextColor={COLORS.secondary400}
                autoCapitalize="words"
                style={styles.input}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError(null);
                }}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, error && !email && styles.inputError]}>
              <TextInput
                placeholder="exemple@email.com"
                placeholderTextColor={COLORS.secondary400}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={[styles.inputContainer, error && !password && styles.inputError]}>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={COLORS.secondary400}
                secureTextEntry={!showPassword}
                style={[styles.input, { paddingRight: 50 }]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(null);
                }}
                editable={!loading}
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color={COLORS.secondary500} />
              </Pressable>
            </View>
            <Text style={styles.hint}>Minimum 6 caractères</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <View style={[styles.inputContainer, error && !confirmPassword && styles.inputError]}>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={COLORS.secondary400}
                secureTextEntry={!showConfirmPassword}
                style={[styles.input, { paddingRight: 50 }]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError(null);
                }}
                editable={!loading}
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={COLORS.secondary500} />
              </Pressable>
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>S'inscrire</Text>
            )}
          </Pressable>

          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Déjà un compte ? </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLinkAction}>Se connecter</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 24,
    height: 80,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: COLORS.primary50,
    // shadowing is harder in pure RN without elevation or specific shadow props, simplifying for stability
    borderWidth: 1,
    borderColor: COLORS.primary100,
  },
  title: {
    marginBottom: 12,
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 18,
    color: COLORS.secondary500,
  },
  form: {
    width: '100%',
  },
  roleContainer: {
    marginBottom: 24,
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary100,
    backgroundColor: COLORS.surfaceLight,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  roleButtonActive: {
    backgroundColor: COLORS.white,
    // Add shadow/elevation if needed
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roleText: {
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.secondary500,
  },
  roleTextActive: {
    color: COLORS.primary600,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary700,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.secondary100,
    backgroundColor: COLORS.surfaceLight,
  },
  inputError: {
    borderColor: COLORS.danger500,
  },
  input: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.gray900,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.secondary400,
  },
  errorContainer: {
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.danger200,
    backgroundColor: COLORS.danger50,
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.danger600,
  },
  submitButton: {
    marginBottom: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary600,
    paddingVertical: 20,
    elevation: 4,
    shadowColor: COLORS.primary500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 16,
    color: COLORS.secondary600,
  },
  loginLinkAction: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary600,
  },
});
