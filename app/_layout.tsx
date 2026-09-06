// Root Layout — Codex by killarua
import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PuterProvider } from '@/contexts/PuterContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <PuterProvider>
          <StatusBar style="light" backgroundColor="#080808" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#080808' } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="file-viewer" options={{ headerShown: true, headerStyle: { backgroundColor: '#111111' }, headerTintColor: '#00ff88', headerTitle: 'File Viewer', headerTitleStyle: { color: '#f0f0f0' } }} />
          </Stack>
        </PuterProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
