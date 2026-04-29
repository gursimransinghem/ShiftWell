import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
type SentryErrorEvent = Parameters<NonNullable<Parameters<typeof Sentry.init>[0]['beforeSend']>>[0];
type SentryBreadcrumb = Parameters<NonNullable<Parameters<typeof Sentry.init>[0]['beforeBreadcrumb']>>[0];

function getEnvironment(): string {
  if (__DEV__) return 'development';
  const channel = Constants.expoConfig?.extra?.releaseChannel as string | undefined;
  if (channel === 'staging') return 'staging';
  return 'production';
}

const PII_KEYS = ['email', 'name', 'username', 'phone', 'ip_address', 'address'];

function scrubObject(obj: Record<string, unknown>): Record<string, unknown> {
  const scrubbed: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase();
    scrubbed[key] = PII_KEYS.some((k) => lower.includes(k)) ? '[REDACTED]' : obj[key];
  }
  return scrubbed;
}

function scrubEvent(event: SentryErrorEvent): SentryErrorEvent | null {
  if (event.user) {
    event.user = { id: event.user.id };
  }
  if (event.request?.headers) {
    const h = { ...event.request.headers } as Record<string, string>;
    delete h['Authorization'];
    delete h['authorization'];
    delete h['Cookie'];
    delete h['cookie'];
    event.request.headers = h;
  }
  if (event.request?.data) {
    event.request.data = '[REDACTED]';
  }
  if (event.extra) {
    event.extra = scrubObject(event.extra as Record<string, unknown>);
  }
  return event;
}

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

export function initSentry(): void {
  Sentry.init({
    dsn: DSN,
    enabled: !__DEV__,
    environment: getEnvironment(),
    release: Constants.expoConfig?.version ?? 'unknown',
    dist: String(Constants.expoConfig?.runtimeVersion ?? 'unknown'),
    sendDefaultPii: false,
    attachStacktrace: true,
    tracesSampleRate: 0.2,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
    integrations: [navigationIntegration, Sentry.mobileReplayIntegration()],
    beforeSend: scrubEvent,
    beforeBreadcrumb(breadcrumb: SentryBreadcrumb) {
      if (breadcrumb.category === 'console') return null;
      return breadcrumb;
    },
  });
}

export { Sentry };
