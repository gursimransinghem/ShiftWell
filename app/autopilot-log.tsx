/**
 * Autopilot Log screen route
 *
 * Registered as a modal in the root Stack so it slides up from the bottom.
 * Access:
 *   - Today screen "Autopilot On" chip tap
 *   - Settings > Autopilot > View History
 *
 * Phase 34 (30-Day Autopilot)
 */

import { router } from 'expo-router';
import { TransparencyLogScreen } from '@/src/screens/TransparencyLogScreen';

export default function AutopilotLogRoute() {
  return <TransparencyLogScreen onClose={() => router.back()} />;
}
