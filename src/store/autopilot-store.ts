/**
 * Autopilot Store — Phase 34 (30-Day Autopilot)
 *
 * Standalone Zustand store for the autopilot feature. Tracks:
 *   - Eligibility and enabled state
 *   - Full transparency log of every autonomous decision
 *
 * This complements plan-store.ts (which has a lighter-weight AutopilotState
 * for real-time autopilot gating). This store is the source of truth for
 * the Settings > Autopilot > View History screen.
 *
 * Log cap: 100 entries (oldest trimmed when exceeded).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from '@/src/lib/persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransparencyLogEntryType =
  | 'activation'
  | 'plan_change'
  | 'user_disabled'
  | 'bounds_rejection';

export interface TransparencyLogEntry {
  /** nanoid-style unique identifier */
  id: string;
  /** ISO timestamp when this entry was created */
  timestamp: string;
  type: TransparencyLogEntryType;
  /** Human-readable explanation of what happened */
  description: string;
  /** Present when type='plan_change' or type='bounds_rejection' */
  proposedChange?: {
    field: string;
    from: string;
    to: string;
  };
  /** Present when type='bounds_rejection' */
  boundsViolations?: string[];
  /** Whether the change was applied (false for rejections and disable events) */
  accepted: boolean;
}

export interface AutopilotState {
  enabled: boolean;
  eligible: boolean;
  activatedAt: string | null;
  transparencyLog: TransparencyLogEntry[];

  /** Append a decision to the transparency log (auto-trims to 100 entries) */
  logDecision: (entry: Omit<TransparencyLogEntry, 'id' | 'timestamp'>) => void;
  /** Opt in to autopilot */
  enable: () => void;
  /** Opt out of autopilot — appends a user_disabled log entry */
  disable: () => void;
  /** Called by useAdaptivePlan to refresh eligibility on each run */
  checkEligibility: (installedAt: string, scoreCount: number) => void;
  /** Dismiss activation card for 7 days without enabling */
  dismissCard: () => void;
  /** ISO timestamp when the activation card was last dismissed */
  cardDismissedAt: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_LOG_ENTRIES = 100;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a simple unique ID without an external dependency.
 * Combines timestamp + random suffix for sufficient collision resistance.
 */
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAutopilotStore = create<AutopilotState>()(
  persist(
    (set, get) => ({
      enabled: false,
      eligible: false,
      activatedAt: null,
      transparencyLog: [],
      cardDismissedAt: null,

      logDecision: (entry) => {
        const newEntry: TransparencyLogEntry = {
          ...entry,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        const current = get().transparencyLog;
        const updated = [...current, newEntry];
        // Trim oldest entries when exceeding cap
        const trimmed = updated.length > MAX_LOG_ENTRIES
          ? updated.slice(updated.length - MAX_LOG_ENTRIES)
          : updated;
        set({ transparencyLog: trimmed });
      },

      enable: () => {
        const { enabled, logDecision } = get();
        if (enabled) return; // idempotent
        const now = new Date().toISOString();
        set({ enabled: true, activatedAt: now });
        logDecision({
          type: 'activation',
          description: 'Autopilot enabled — ShiftWell will now make small, science-backed adjustments automatically',
          accepted: true,
        });
      },

      disable: () => {
        const { logDecision } = get();
        set({ enabled: false });
        logDecision({
          type: 'user_disabled',
          description: 'User disabled autopilot',
          accepted: false,
        });
      },

      checkEligibility: (installedAt, scoreCount) => {
        // Import inline to avoid circular dependency issues at module load time
        const { isEligibleForAutopilot } = require('../lib/autopilot/eligibility');
        const result = isEligibleForAutopilot(installedAt, scoreCount);
        set({ eligible: result.eligible });
      },

      dismissCard: () => {
        set({ cardDismissedAt: new Date().toISOString() });
      },
    }),
    {
      name: 'autopilot-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        enabled: s.enabled,
        eligible: s.eligible,
        activatedAt: s.activatedAt,
        transparencyLog: s.transparencyLog,
        cardDismissedAt: s.cardDismissedAt,
      }),
    },
  ),
);
