import type { Credentials, SignupPayload, AuthTokens } from '@/types/auth';
import type { User } from '@/types';
import { UserRole } from '@/types';
import { saveToken, deleteToken, getToken } from './storage';
import { createUser, getUserByEmail, getUserById } from './userService';

const createTokens = (email: string): AuthTokens => ({
  accessToken: `access-${email}-${Date.now()}`,
  refreshToken: `refresh-${email}-${Date.now()}`,
});

// Simple password hash (in production, use a proper hashing library like bcrypt)
const hashPassword = (password: string): string => {
  // Simple hash for demo - in production use proper hashing
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

export const login = async (credentials: Credentials): Promise<{ user: User; tokens: AuthTokens }> => {
  const userData = await getUserByEmail(credentials.email);
  
  if (!userData) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Vérifier le mot de passe (simple hash comparison)
  const hashedPassword = hashPassword(credentials.password);
  if (userData.password !== hashedPassword) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const tokens = createTokens(credentials.email);
  await saveToken(tokens.accessToken);
  
  const user: User = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
  };

  return { user, tokens };
};

export const signup = async (payload: SignupPayload): Promise<{ user: User; tokens: AuthTokens }> => {
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await getUserByEmail(payload.email);
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }

  const userId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const hashedPassword = hashPassword(payload.password);
  
  const user = await createUser({
    id: userId,
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
    role: payload.role === 'recruiter' ? UserRole.RECRUITER : UserRole.CANDIDATE,
  });

  const tokens = createTokens(payload.email);
  await saveToken(tokens.accessToken);
  
  return { user, tokens };
};

export const logout = async () => {
  await deleteToken();
};

export const restoreSession = async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) return null;
  
  // Extraire l'email du token (format: access-email-timestamp)
  const parts = token.split('-');
  if (parts.length < 3) return null;
  
  const email = parts[1];
  const userData = await getUserByEmail(email);
  
  if (!userData) return null;
  
  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
  };
};

