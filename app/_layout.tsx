import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="job/[id]"
          options={{
            title: 'Job Details',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="applications/index"
          options={{
            title: 'My Applications',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="applications/[id]"
          options={{
            title: 'Application Details',
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}

