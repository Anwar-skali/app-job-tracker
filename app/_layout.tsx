import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { useAuth } from '@/hooks/useAuth';

const NavigationGuard = ({ children }: { children: React.ReactNode }) => {
  const segments = useSegments();
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [segments, status, router]);

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationGuard>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </NavigationGuard>
    </AuthProvider>
  );
}

