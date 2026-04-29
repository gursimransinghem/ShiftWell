import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useNavigationContainerRef } from 'expo-router';
import { format } from 'date-fns';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/components/useColorScheme';
import { AdaptiveColorProvider } from '@/src/components/providers/AdaptiveColorProvider';
import { useAuthStore } from '@/src/store/auth-store';
import { usePremiumStore } from '@/src/store/premium-store';
import { useScoreStore } from '@/src/store/score-store';
import { usePlanStore } from '@/src/store/plan-store';
import { useCalendarStore } from '@/src/lib/calendar/calendar-store';
import { registerCalendarBackgroundSync } from '@/src/lib/calendar/background-sync';
import { runCalendarSync } from '@/src/lib/calendar/calendar-service';
// Side-effect import: registers SHIFTWELL_CALENDAR_SYNC task via TaskManager.defineTask at module scope
import '@/src/lib/calendar/background-sync';
import { handleAppOpen, scheduleReengagementSequence } from '@/src/lib/growth/reengagement';
import { AnalyticsProvider } from '@/src/lib/analytics/posthog';
import { initSentry, navigationIntegration, Sentry } from '@/src/lib/monitoring/sentry';
import { ShiftWellErrorBoundary } from '@/src/components/ErrorBoundary';

initSentry();

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

function RootLayout() {
  const ref = useNavigationContainerRef();
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
      if (ref?.current) {
        navigationIntegration.registerNavigationContainer(ref);
      }
    }
  }, [loaded, ref]);

  if (!loaded) {
    return null;
  }

  return (
    <ShiftWellErrorBoundary section="root">
      <RootLayoutNav />
    </ShiftWellErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const checkSession = useAuthStore((s) => s.checkSession);
  const initializePremium = usePremiumStore((s) => s.initializePremium);
  const trialStartedAt = usePremiumStore((s) => s.trialStartedAt);
  const isInTrial = usePremiumStore((s) => s.isInTrial);
  const isPremium = usePremiumStore((s) => s.isPremium);

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
        // Finalize yesterday's score on app foreground (BUG-02)
        const today = format(new Date(), 'yyyy-MM-dd');
        const scoreState = useScoreStore.getState();
        const planState = usePlanStore.getState();
        const hasSleepBlock = planState.plan?.blocks?.some(
          (b) => b.type === 'main-sleep'
        ) ?? false;
        scoreState.finalizeDay(today, hasSleepBlock);
        // Re-engagement: cancel pending sequence and record open (GRO-03)
        handleAppOpen().catch(() => {});
      }
      if (lastState === 'active' && (next === 'background' || next === 'inactive')) {
        // Schedule re-engagement sequence when app goes to background (GRO-03)
        scheduleReengagementSequence().catch(() => {});
      }
      lastState = next;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    // Route to downgrade screen when trial has expired and user is not premium (BUG-03)
    if (trialStartedAt && !isInTrial && !isPremium) {
      router.replace('/downgrade');
    }
  }, [trialStartedAt, isInTrial, isPremium]);

  return (
    <AnalyticsProvider>
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
          <Stack.Screen name="downgrade" options={{ headerShown: false }} />
          <Stack.Screen
            name="autopilot-log"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </AdaptiveColorProvider>
    </ThemeProvider>
    </AnalyticsProvider>
  );
}
