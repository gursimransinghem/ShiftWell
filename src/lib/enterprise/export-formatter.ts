/**
 * Export Formatter — Phase 27 (Outcome Data Pipeline)
 *
 * Serializes AnonymizedRecord arrays into export-ready formats.
 *
 * JSON: standard JSON array (AnonymizedRecord[])
 * CSV:  RFC 4180 compliant — comma-separated, CRLF line endings,
 *       fields containing commas/quotes/newlines double-quoted
 */

import type { AnonymizedRecord } from './anonymizer';

// ─── CSV Helpers ──────────────────────────────────────────────────────────────

/** RFC 4180: escape a single CSV field value */
function escapeCSVField(value: string | number): string {
  const str = String(value);
  // Must quote if field contains comma, double-quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Build a CSV row from an array of values */
function csvRow(fields: Array<string | number>): string {
  return fields.map(escapeCSVField).join(',');
}

// ─── CSV column order ──────────────────────────────────────────────────────────

const CSV_HEADERS = [
  'cohortId',
  'periodISO',
  'avgAdherenceRate',
  'avgDebtHours',
  'avgRecoveryScore',
  'transitionRecoveryDays',
  'participantCount',
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Serialize anonymized records as a JSON string.
 *
 * @param records - Anonymized outcome records from applyDifferentialPrivacy()
 * @returns       - Formatted JSON string (pretty-printed, 2-space indent)
 */
export function formatAsJSON(records: AnonymizedRecord[]): string {
  return JSON.stringify(records, null, 2);
}

/**
 * Serialize anonymized records as RFC 4180 compliant CSV.
 *
 * Columns: cohortId, periodISO, avgAdherenceRate, avgDebtHours,
 *          avgRecoveryScore, transitionRecoveryDays, participantCount
 *
 * @param records - Anonymized outcome records from applyDifferentialPrivacy()
 * @returns       - CSV string with CRLF line endings per RFC 4180
 */
export function formatAsCSV(records: AnonymizedRecord[]): string {
  const lines: string[] = [csvRow(CSV_HEADERS)];

  for (const record of records) {
    lines.push(csvRow([
      record.cohortId,
      record.periodISO,
      record.metrics.avgAdherenceRate,
      record.metrics.avgDebtHours,
      record.metrics.avgRecoveryScore,
      record.metrics.transitionRecoveryDays,
      record.metrics.participantCount,
    ]));
  }

  // RFC 4180: CRLF line endings
  return lines.join('\r\n');
}
