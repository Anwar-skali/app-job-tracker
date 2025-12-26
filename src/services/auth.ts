import type { Credentials, SignupPayload, AuthTokens } from '@/types/auth';
import type { User } from '@/types';
import { saveToken, deleteToken, getToken } from './storage';

const mockUser: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
};

const createTokens = (email: string): AuthTokens => ({
  accessToken: `access-${email}-${Date.now()}`,
  refreshToken: `refresh-${email}-${Date.now()}`,
});

export const login = async (credentials: Credentials): Promise<{ user: User; tokens: AuthTokens }> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const tokens = createTokens(credentials.email);
  await saveToken(tokens.accessToken);
  return {
    user: { ...mockUser, email: credentials.email },
    tokens,
  };
};

export const signup = async (payload: SignupPayload): Promise<{ user: User; tokens: AuthTokens }> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const tokens = createTokens(payload.email);
  await saveToken(tokens.accessToken);
  return {
    user: { id: String(Date.now()), name: payload.name, email: payload.email },
    tokens,
  };
};

export const logout = async () => {
  await deleteToken();
};

export const restoreSession = async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) return null;
  return { ...mockUser, id: token, email: mockUser.email };
};

