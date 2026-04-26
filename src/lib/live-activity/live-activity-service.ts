/**
 * Live Activity service for ShiftWell.
 *
 * Manages iOS Lock Screen / Dynamic Island Live Activities that show
 * the user's current and next plan block. Uses a native module bridge
 * pattern — the actual ActivityKit calls happen in Swift via
 * expo-apple-targets widget extension.
 *
 * Until the native widget extension is built (requires EAS + Apple
 * Developer enrollment), this module provides a safe no-op facade
 * that the React Native layer can call without crashing.
 *
 * Architecture:
 * - React Native calls startActivity/updateActivity/endActivity
 * - These bridge to a native module (ShiftWellLiveActivity)
 * - The native module manages ActivityKit lifecycle
 * - ContentState updates push to the Lock Screen widget
 */

import { Platform, NativeModules } from 'react-native';
import type {
  ShiftWellActivityAttributes,
  ShiftWellContentState,
} from './types';

const NativeLiveActivity = NativeModules.ShiftWellLiveActivity;

const isSupported =
  Platform.OS === 'ios' &&
  typeof NativeLiveActivity?.startActivity === 'function';

let activeActivityId: string | null = null;

export function isLiveActivitySupported(): boolean {
  return isSupported;
}

export function getActiveActivityId(): string | null {
  return activeActivityId;
}

export async function startActivity(
  attributes: ShiftWellActivityAttributes,
  initialState: ShiftWellContentState,
): Promise<string | null> {
  if (!isSupported) return null;

  try {
    const id = await NativeLiveActivity.startActivity(
      attributes,
      initialState,
    );
    activeActivityId = id;
    return id;
  } catch (e) {
    console.warn('[LiveActivity] Failed to start:', e);
    return null;
  }
}

export async function updateActivity(
  state: ShiftWellContentState,
): Promise<boolean> {
  if (!isSupported || !activeActivityId) return false;

  try {
    await NativeLiveActivity.updateActivity(activeActivityId, state);
    return true;
  } catch (e) {
    console.warn('[LiveActivity] Failed to update:', e);
    return false;
  }
}

export async function endActivity(): Promise<boolean> {
  if (!isSupported || !activeActivityId) return false;

  try {
    await NativeLiveActivity.endActivity(activeActivityId);
    activeActivityId = null;
    return true;
  } catch (e) {
    console.warn('[LiveActivity] Failed to end:', e);
    activeActivityId = null;
    return false;
  }
}
