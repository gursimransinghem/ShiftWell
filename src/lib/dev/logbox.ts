import { LogBox, Platform } from 'react-native';

if (__DEV__) {
  if (Platform.OS === 'web') {
    LogBox.ignoreAllLogs(true);
  } else {
    LogBox.ignoreLogs([
      '"shadow*" style props are deprecated. Use "boxShadow".',
      '"textShadow*" style props are deprecated. Use "textShadow".',
      'props.pointerEvents is deprecated. Use style.pointerEvents',
      '[expo-notifications] Listening to push token changes is not yet fully supported on web.',
      '[analytics] PostHog not ready',
    ]);
  }
}
