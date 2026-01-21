import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="code/[id]"
          options={{
            title: 'コーデ詳細',
            headerBackTitle: '戻る',
          }}
        />
      </Stack>
    </>
  );
}
