/**
 * Tests for transparency-log — Phase 34 (30-Day Autopilot)
 *
 * TL-01: logAutonomousChange returns a TransparencyEntry with autoApplied=true
 * TL-02: dateISO matches today's date
 * TL-03: reason is preserved in the entry
 * TL-04: change is preserved in the entry
 * TL-05: trimTransparencyLog returns unchanged array when under limit
 * TL-06: trimTransparencyLog removes oldest entries when over 90
 * TL-07: trimTransparencyLog returns empty array for empty input
 * TL-08: entry has no undoneAt by default
 */

import { logAutonomousChange, trimTransparencyLog } from '../../src/lib/adaptive/transparency-log';
import type { AdaptiveChange } from '../../src/lib/adaptive/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeChange(magnitudeMinutes = 30): AdaptiveChange {
  return {
    type: 'bedtime-shifted',
    factor: 'circadian',
    magnitudeMinutes,
    humanReadable: `Bedtime shifted ${magnitudeMinutes} min later`,
    reason: 'Night shift transition',
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('logAutonomousChange', () => {
  it('TL-01: returns entry with autoApplied=true', () => {
    const entry = logAutonomousChange(makeChange(), 'test reason');
    expect(entry.autoApplied).toBe(true);
  });

  it('TL-02: dateISO matches today in YYYY-MM-DD format', () => {
    const entry = logAutonomousChange(makeChange(), 'test reason');
    const todayISO = new Date().toISOString().split('T')[0];
    expect(entry.dateISO).toBe(todayISO);
  });

  it('TL-03: reason is preserved', () => {
    const entry = logAutonomousChange(makeChange(), 'Autopilot: Bedtime shifted 30 min later (confidence 75%)');
    expect(entry.reason).toBe('Autopilot: Bedtime shifted 30 min later (confidence 75%)');
  });

  it('TL-04: change is preserved', () => {
    const change = makeChange(45);
    const entry = logAutonomousChange(change, 'test');
    expect(entry.change).toEqual(change);
    expect(entry.change.magnitudeMinutes).toBe(45);
  });

  it('TL-08: undoneAt is undefined by default', () => {
    const entry = logAutonomousChange(makeChange(), 'test');
    expect(entry.undoneAt).toBeUndefined();
  });
});

describe('trimTransparencyLog', () => {
  it('TL-07: returns empty array for empty input', () => {
    expect(trimTransparencyLog([])).toEqual([]);
  });

  it('TL-05: returns unchanged array when at or under 90 entries', () => {
    const entries = Array.from({ length: 90 }, (_, i) =>
      logAutonomousChange(makeChange(), `reason ${i}`)
    );
    const result = trimTransparencyLog(entries);
    expect(result).toHaveLength(90);
    expect(result).toBe(entries); // same reference since no trimming needed
  });

  it('TL-06: removes oldest entries when over 90', () => {
    const entries = Array.from({ length: 95 }, (_, i) =>
      logAutonomousChange(makeChange(), `reason ${i}`)
    );
    const result = trimTransparencyLog(entries);
    expect(result).toHaveLength(90);
    // Should keep the last 90 (i.e., starting from index 5)
    expect(result[0].reason).toBe('reason 5');
    expect(result[89].reason).toBe('reason 94');
  });
});
