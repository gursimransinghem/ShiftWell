import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/components/useColorScheme';
import { AdaptiveColorProvider } from '@/src/components/providers/AdaptiveColorProvider';
import { useAuthStore } from '@/src/store/auth-store';
import { usePremiumStore } from '@/src/store/premium-store';
import { useCalendarStore } from '@/src/lib/calendar/calendar-store';
import { registerCalendarBackgroundSync } from '@/src/lib/calendar/background-sync';
import { runCalendarSync } from '@/src/lib/calendar/calendar-service';
// Side-effect import: registers SHIFTWELL_CALENDAR_SYNC task via TaskManager.defineTask at module scope
import '@/src/lib/calendar/background-sync';

// Register foreground notification handler — SDK 55 API (shouldShowBanner replaces shouldShowAlert)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const checkSession = useAuthStore((s) => s.checkSession);
  const initializePremium = usePremiumStore((s) => s.initializePremium);

  useEffect(() => {
    // Restore auth session and initialize premium status on cold launch
    checkSession();
    initializePremium();

    // Configure Google Sign-In with calendar scopes
    // Safe to call before sign-in — just sets up the client configuration
    GoogleSignin.configure({
      scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });

    // Calendar sync on app open (D-14)
    const calState = useCalendarStore.getState();
    if (calState.appleConnected || calState.googleConnected) {
      registerCalendarBackgroundSync().catch(() => {});
      runCalendarSync().catch(() => {});
    }

    let lastState: AppStateStatus = AppState.currentState;
    const sub = AppState.addEventListener('change', (next) => {
      if (lastState !== 'active' && next === 'active') {
        const s = useCalendarStore.getState();
        if (s.appleConnected || s.googleConnected) {
          runCalendarSync().catch(() => {});
        }
      }
      lastState = next;
    });
    return () => sub.remove();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AdaptiveColorProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="paywall"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="add-shift"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="import"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </AdaptiveColorProvider>
    </ThemeProvider>
  );
}
