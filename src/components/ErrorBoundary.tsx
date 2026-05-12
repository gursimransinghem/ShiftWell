import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import * as Sentry from '@sentry/react-native';
import { BACKGROUND, TEXT, ACCENT, SEMANTIC } from '@/src/theme/colors';
import { useShiftsStore } from '@/src/store/shifts-store';

type BeforeCaptureScope = {
  setTag(key: string, value: string): void;
  setLevel(level: string): void;
};

interface FallbackProps {
  error: unknown;
  componentStack?: string;
  resetError: () => void;
}

function ErrorFallback({ error, resetError }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          The app ran into an unexpected issue. Your data is safe — this error
          has been reported automatically.
        </Text>
        {__DEV__ && (
          <Text style={styles.devError}>{message}</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={resetError} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

interface ShiftWellErrorBoundaryProps {
  children: React.ReactNode;
  section?: string;
}

export function ShiftWellErrorBoundary({
  children,
  section = 'unknown',
}: ShiftWellErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={(props: FallbackProps) => <ErrorFallback {...props} />}
      beforeCapture={(scope: BeforeCaptureScope) => {
        scope.setTag('boundary.section', section);
        scope.setTag('error.type', 'render_crash');
        scope.setLevel('fatal');

        // Attach non-PII shift context for debugging
        const shiftsState = useShiftsStore.getState();
        const shifts = shiftsState.shifts;
        const latestShiftType = shifts.length > 0
          ? shifts[shifts.length - 1]?.shiftType ?? 'unknown'
          : 'none';
        scope.setTag('shift.type', latestShiftType);
        scope.setTag('shift.count', String(shifts.length));
      }}
      onError={(error: unknown, componentStack: string | undefined) => {
        if (__DEV__) {
          console.error(`[ErrorBoundary:${section}]`, error);
          console.error('Component stack:', componentStack);
        }
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
    color: SEMANTIC.warning,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: TEXT.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  devError: {
    fontSize: 12,
    color: SEMANTIC.error,
    fontFamily: 'monospace',
    backgroundColor: BACKGROUND.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  button: {
    backgroundColor: ACCENT.purple,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: TEXT.onAccent,
    fontSize: 16,
    fontWeight: '600',
  },
});
