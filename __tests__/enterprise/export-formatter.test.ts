/**
 * Tests for enterprise/export-formatter — Phase 27 (Outcome Data Pipeline)
 *
 * EF-01: formatAsJSON produces valid parseable JSON
 * EF-02: formatAsJSON output round-trips through JSON.parse
 * EF-03: formatAsJSON returns "[]" for empty input
 * EF-04: formatAsCSV produces a header row
 * EF-05: formatAsCSV produces correct column count per row
 * EF-06: formatAsCSV uses CRLF line endings per RFC 4180
 * EF-07: formatAsCSV escapes fields containing commas
 * EF-08: formatAsCSV escapes fields containing double-quotes
 * EF-09: formatAsCSV returns header-only for empty input
 * EF-10: formatAsCSV numeric fields are unquoted when no special chars
 */

import { formatAsJSON, formatAsCSV } from '../../src/lib/enterprise/export-formatter';
import type { AnonymizedRecord } from '../../src/lib/enterprise/anonymizer';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRecord(overrides: Partial<AnonymizedRecord> = {}): AnonymizedRecord {
  return {
    cohortId: 'hospital-A',
    periodISO: '2026-03',
    metrics: {
      avgAdherenceRate: 78,
      avgDebtHours: 0.4,
      avgRecoveryScore: 72,
      transitionRecoveryDays: 3,
      participantCount: 55,
    },
    ...overrides,
  };
}

// ─── JSON Tests ───────────────────────────────────────────────────────────────

describe('formatAsJSON', () => {
  // EF-01
  it('EF-01: produces valid parseable JSON', () => {
    const result = formatAsJSON([makeRecord()]);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  // EF-02
  it('EF-02: output round-trips through JSON.parse', () => {
    const records = [makeRecord(), makeRecord({ cohortId: 'hospital-B', periodISO: '2026-04' })];
    const result = formatAsJSON(records);
    const parsed = JSON.parse(result) as AnonymizedRecord[];
    expect(parsed).toHaveLength(2);
    expect(parsed[0].cohortId).toBe('hospital-A');
    expect(parsed[1].cohortId).toBe('hospital-B');
    expect(parsed[0].metrics.avgAdherenceRate).toBe(78);
  });

  // EF-03
  it('EF-03: returns "[]" for empty input', () => {
    const result = formatAsJSON([]);
    expect(result.trim()).toBe('[]');
  });

  it('preserves all metric fields', () => {
    const record = makeRecord();
    const parsed = JSON.parse(formatAsJSON([record])) as AnonymizedRecord[];
    expect(parsed[0].metrics.avgAdherenceRate).toBe(record.metrics.avgAdherenceRate);
    expect(parsed[0].metrics.avgDebtHours).toBe(record.metrics.avgDebtHours);
    expect(parsed[0].metrics.avgRecoveryScore).toBe(record.metrics.avgRecoveryScore);
    expect(parsed[0].metrics.transitionRecoveryDays).toBe(record.metrics.transitionRecoveryDays);
    expect(parsed[0].metrics.participantCount).toBe(record.metrics.participantCount);
  });
});

// ─── CSV Tests ────────────────────────────────────────────────────────────────

const EXPECTED_HEADERS = [
  'cohortId',
  'periodISO',
  'avgAdherenceRate',
  'avgDebtHours',
  'avgRecoveryScore',
  'transitionRecoveryDays',
  'participantCount',
];

describe('formatAsCSV', () => {
  // EF-04
  it('EF-04: produces a header row with all expected columns', () => {
    const result = formatAsCSV([makeRecord()]);
    const firstLine = result.split('\r\n')[0];
    const headers = firstLine.split(',');
    expect(headers).toEqual(EXPECTED_HEADERS);
  });

  // EF-05
  it('EF-05: each data row has the same column count as the header', () => {
    const records = [makeRecord(), makeRecord({ cohortId: 'hospital-B' })];
    const result = formatAsCSV(records);
    const lines = result.split('\r\n');
    const headerCount = lines[0].split(',').length;
    // Count commas in each data row (header has no quoted commas, data fields are numeric or simple strings)
    for (let i = 1; i < lines.length; i++) {
      const commaCount = (lines[i].match(/,/g) ?? []).length;
      expect(commaCount).toBe(headerCount - 1);
    }
  });

  // EF-06
  it('EF-06: uses CRLF line endings per RFC 4180', () => {
    const result = formatAsCSV([makeRecord(), makeRecord()]);
    // Should have exactly 2 CRLF splits (header + 2 rows = 3 parts after split)
    const parts = result.split('\r\n');
    expect(parts).toHaveLength(3); // header + row1 + row2
    // No bare LF line endings
    expect(result.split('\n').length).toBe(result.split('\r\n').length);
  });

  // EF-07
  it('EF-07: escapes fields containing commas with double quotes', () => {
    const result = formatAsCSV([makeRecord({ cohortId: 'hospital,A' })]);
    const dataRow = result.split('\r\n')[1];
    expect(dataRow).toContain('"hospital,A"');
  });

  // EF-08
  it('EF-08: escapes fields containing double-quotes', () => {
    const result = formatAsCSV([makeRecord({ cohortId: 'hospital "A"' })]);
    const dataRow = result.split('\r\n')[1];
    // RFC 4180: embedded quotes become ""
    expect(dataRow).toContain('"hospital ""A"""');
  });

  // EF-09
  it('EF-09: returns header-only for empty input', () => {
    const result = formatAsCSV([]);
    const lines = result.split('\r\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe(EXPECTED_HEADERS.join(','));
  });

  // EF-10
  it('EF-10: numeric fields are unquoted when they contain no special characters', () => {
    const result = formatAsCSV([makeRecord()]);
    const dataRow = result.split('\r\n')[1];
    // 78, 0.4, 72, 3, 55 — none should be quoted
    expect(dataRow).not.toContain('"78"');
    expect(dataRow).not.toContain('"0.4"');
    expect(dataRow).not.toContain('"55"');
  });
});
