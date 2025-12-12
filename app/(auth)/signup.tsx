import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils';
import { Colors } from '@/constants/colors';

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
      // Rediriger vers les tabs après inscription réussie
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
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>
            Créez votre compte pour commencer à suivre vos candidatures
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              placeholder="Jean Dupont"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="words"
              style={[styles.input, error && !name && styles.inputError]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError(null);
              }}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="exemple@email.com"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={[styles.input, error && !email && styles.inputError]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput, error && !password && styles.inputError]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(null);
                }}
                editable={!loading}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </Pressable>
            </View>
            <Text style={styles.hint}>Minimum 6 caractères</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                style={[styles.input, styles.passwordInput, error && !confirmPassword && styles.inputError]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError(null);
                }}
                editable={!loading}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </Pressable>
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSubmit}
            disabled={loading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.link}>Se connecter</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: Colors.error,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 16,
    padding: 4,
  },
  eyeText: {
    fontSize: 20,
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: Colors.error + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  error: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 50,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    cursor: 'pointer',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  link: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});

