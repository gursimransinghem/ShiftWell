/**
 * ShiftWell Referral System
 *
 * Generates shareable referral URLs, stores inbound referral codes on install,
 * and credits referring users via Supabase (client-side logic only — table
 * creation is backend responsibility).
 *
 * URL format: https://shiftwell.app/r/{userId}
 */

import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Base URL for referral deep links */
export const REFERRAL_BASE_URL = 'https://shiftwell.app/r';

/** AsyncStorage key for persisting the inbound referral code */
const REFERRAL_CODE_KEY = 'shiftwell:referral-code';

// ---------------------------------------------------------------------------
// URL generation
// ---------------------------------------------------------------------------

/**
 * Build a shareable referral URL for the given user.
 *
 * @param userId - The referring user's ID
 * @returns Full referral URL string
 */
export function buildReferralUrl(userId: string): string {
  return `${REFERRAL_BASE_URL}/${userId}`;
}

/**
 * Parse a referral code from an inbound deep-link URL.
 *
 * @param url - Raw deep-link URL (e.g. "https://shiftwell.app/r/abc123")
 * @returns The referral code (userId segment) or null if URL is not a referral link
 */
export function parseReferralCode(url: string): string | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    // Expect /r/{code}
    if (parts.length >= 2 && parts[0] === 'r') {
      return parts[1];
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

/**
 * Persist an inbound referral code (called when the app opens via referral link).
 * Only stores the code once — first write wins.
 *
 * @param code - The referral code to store
 */
export async function storeReferralCode(code: string): Promise<void> {
  const existing = await AsyncStorage.getItem(REFERRAL_CODE_KEY);
  if (existing) return; // First write wins
  await AsyncStorage.setItem(REFERRAL_CODE_KEY, code);
}

/**
 * Retrieve the stored inbound referral code, if any.
 *
 * @returns Referral code string or null
 */
export async function getStoredReferralCode(): Promise<string | null> {
  return AsyncStorage.getItem(REFERRAL_CODE_KEY);
}

// ---------------------------------------------------------------------------
// Supabase credit (client-side logic)
// ---------------------------------------------------------------------------

export interface ReferralRecord {
  referrerId: string;
  referredUserId: string;
  createdAt: string;
}

/**
 * Build a referral record to be written to the `referrals` table.
 * Actual Supabase insert is handled by the caller so this module stays
 * testable without a live DB connection.
 *
 * @param referrerId   - The user who shared the referral link
 * @param referredUserId - The newly registered user
 * @returns ReferralRecord ready for insert
 */
export function buildReferralRecord(
  referrerId: string,
  referredUserId: string,
): ReferralRecord {
  return {
    referrerId,
    referredUserId,
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Share sheet
// ---------------------------------------------------------------------------

/**
 * Open the native share sheet with the referral link for the given user.
 *
 * @param userId - The referring user's ID
 * @returns Whether the share was completed (dismissed = false)
 */
export async function shareReferralLink(userId: string): Promise<boolean> {
  const url = buildReferralUrl(userId);
  const message = `Join me on ShiftWell — the circadian sleep optimizer built for shift workers. Use my link to get started: ${url}`;

  const result = await Share.share({ message, url });

  // React Native Share returns action 'sharedAction' or 'dismissedAction'
  return (result as { action: string }).action === 'sharedAction';
}
