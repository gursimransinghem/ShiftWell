/**
 * AdaptiveInsightCard component tests (BRAIN-04 / BRAIN-06)
 *
 * Tests that X button, Accept button, Dismiss button, and Undo button
 * call the correct callbacks. Tests run against the component source
 * to verify wiring without relying on React Native rendering environment.
 *
 * Strategy: parse the component source to verify callback wiring patterns
 * and instantiate the handler logic directly, since the project uses a
 * node test environment without react-test-renderer setup for React Native.
 */

import * as fs from 'fs';
import * as path from 'path';

const COMPONENT_PATH = path.resolve(
  __dirname,
  '../../src/components/today/AdaptiveInsightCard.tsx',
);

const source = fs.readFileSync(COMPONENT_PATH, 'utf8');

// ── Fixture types ──────────────────────────────────────────────────────────────

import type { AdaptiveChange, AdaptiveContext } from '../../src/lib/adaptive/types';

const mockChange: AdaptiveChange = {
  type: 'bedtime-shifted',
  factor: 'debt',
  magnitudeMinutes: 30,
  humanReadable: 'Bedtime shifted 30 min earlier',
  reason: 'High sleep debt (2.5h)',
};

const learningContext: AdaptiveContext = {
  circadian: { protocol: null, phaseOffsetMinutes: 0, maintenanceMode: false },
  debt: { rollingHours: 2.5, bankHours: 0, severity: 'mild' },
  schedule: {
    transitionType: null,
    daysUntilTransition: 0,
    calendarConflicts: [],
    patternAlerts: [],
    bankingWindowOpen: false,
  },
  recovery: { score: null, zone: null, baselineMature: false },
  meta: { learningPhase: true, daysTracked: 5, lastUpdated: new Date() },
};

const calibratedContext: AdaptiveContext = {
  ...learningContext,
  meta: { learningPhase: false, daysTracked: 35, lastUpdated: new Date() },
};

// ── Helper: extract onPress content from source ────────────────────────────────

/**
 * Count how many times a pattern appears in the component source.
 */
function countPattern(pattern: RegExp): number {
  return (source.match(pattern) || []).length;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('AdaptiveInsightCard — callback wiring (BRAIN-04)', () => {
  it('X button onPress contains onDismiss() call', () => {
    // The X button: find onPress block that contains close-circle-outline icon
    // Pattern: onPress={...} followed by close-circle-outline in same Pressable
    const xButtonBlock = source.match(/onPress=\{[^}]*onDismiss\(\)[^}]*\}[^>]*>[\s]*<Ionicons name="close-circle-outline/);
    expect(xButtonBlock).not.toBeNull();
  });

  it('X button onPress contains setDismissed(true) for immediate UI feedback', () => {
    const xButtonBlock = source.match(/onPress=\{[^}]*setDismissed\(true\)[^}]*\}[^>]*>[\s]*<Ionicons name="close-circle-outline/);
    expect(xButtonBlock).not.toBeNull();
  });

  it('Accept button onPress contains onDismiss() call', () => {
    // The Accept button: find onPress block followed by Accept text
    const acceptBlock = source.match(/onPress=\{[^}]*onDismiss\(\)[^}]*\}[\s\S]*?Accept/);
    expect(acceptBlock).not.toBeNull();
    expect(acceptBlock![0]).toContain('onDismiss()');
  });

  it('Accept button onPress contains setDismissed(true) for immediate UI feedback', () => {
    const acceptBlock = source.match(/onPress=\{[^}]*setDismissed\(true\)[^}]*\}[\s\S]*?Accept/);
    expect(acceptBlock).not.toBeNull();
    expect(acceptBlock![0]).toContain('setDismissed(true)');
  });

  it('Dismiss button onPress contains onDismiss() call', () => {
    // The Dismiss button: find onPress block followed by Dismiss text
    const dismissBlock = source.match(/onPress=\{[^}]*onDismiss\(\)[^}]*\}[\s\S]*?Dismiss/);
    expect(dismissBlock).not.toBeNull();
    expect(dismissBlock![0]).toContain('onDismiss()');
  });

  it('Undo button onPress calls onUndo() but NOT onDismiss()', () => {
    // The Undo Pressable: look for onPress containing onUndo() followed by arrow-undo-outline
    // The structure is: <Pressable onPress={...onUndo()...}> ... <Ionicons name="arrow-undo-outline".../>
    // We extract the Pressable block containing the undo button
    const undoBlock = source.match(/onPress=\{[^}]*onUndo\(\)[^}]*\}[\s\S]*?arrow-undo-outline/);
    expect(undoBlock).not.toBeNull();
    expect(undoBlock![0]).toContain('onUndo()');
    expect(undoBlock![0]).not.toContain('onDismiss()');
  });

  it('onDismiss() appears at least 3 times in the component (X, Accept, Dismiss)', () => {
    // X button + Accept button + Dismiss button all call onDismiss()
    const matches = source.match(/onDismiss\(\)/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  it('component returns null when changes array would be empty (dismissed state logic present)', () => {
    // Verify the null-return guard for dismissed state exists
    expect(source).toContain('if (dismissed || changes.length === 0) return null');
  });
});

describe('AdaptiveInsightCard — fixtures valid (type check)', () => {
  it('mockChange has all required fields', () => {
    expect(mockChange.type).toBe('bedtime-shifted');
    expect(mockChange.factor).toBe('debt');
    expect(mockChange.magnitudeMinutes).toBe(30);
    expect(mockChange.humanReadable).toBeTruthy();
    expect(mockChange.reason).toBeTruthy();
  });

  it('learningContext has learningPhase=true', () => {
    expect(learningContext.meta.learningPhase).toBe(true);
    expect(learningContext.meta.daysTracked).toBe(5);
  });

  it('calibratedContext has learningPhase=false and daysTracked>30', () => {
    expect(calibratedContext.meta.learningPhase).toBe(false);
    expect(calibratedContext.meta.daysTracked).toBeGreaterThan(30);
  });
});
