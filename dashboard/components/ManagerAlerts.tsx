/**
 * ManagerAlerts — fatigue risk alert list for employer dashboard.
 * Phase 38 — Advanced Platform Features
 *
 * HIPAA Note: This component shows ONLY anonymized worker IDs (e.g., "Worker SW-4821").
 * Real worker identities are never transmitted to the employer side. Workers must
 * explicitly consent to manager alerts in their ShiftWell settings.
 *
 * Per 45 CFR §164.514(b) Safe Harbor: worker IDs are derived identifiers with no
 * direct linkage to name, SSN, contact info, or geographic locator. See:
 * dashboard/HIPAA-COMPLIANCE-ASSESSMENT.md
 */

'use client';

import React, { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Alert record as returned by GET /api/v1/alerts */
interface AlertRecord {
  /** Anonymized identifier — NEVER a real worker name. E.g., "Worker SW-4821". */
  anonymizedId: string;
  /** Current 7-day rolling average recovery score (0–100). */
  recoveryScore: number;
  /** Recovery trend direction over past 7 days. */
  trend: 'improving' | 'stable' | 'declining';
  /** Number of consecutive days recovery score has been below alert threshold. */
  daysBelowThreshold: number;
  shiftType: string;
  lastShiftType: 'night' | 'day' | 'evening';
  /** Suggested manager action (e.g., "Consider schedule adjustment"). */
  suggestedAction: string;
}

interface ManagerAlertsProps {
  orgId: string;
  /** Recovery score threshold below which a worker appears as at-risk. Default: 40. */
  threshold?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreBadgeStyle(score: number): React.CSSProperties {
  if (score < 30) {
    return { backgroundColor: '#dc2626', color: '#ffffff' }; // red
  } else if (score < 40) {
    return { backgroundColor: '#ea580c', color: '#ffffff' }; // orange
  } else {
    return { backgroundColor: '#ca8a04', color: '#ffffff' }; // yellow
  }
}

function TrendArrow({ trend }: { trend: AlertRecord['trend'] }): React.ReactElement {
  if (trend === 'improving') {
    return <span style={{ color: '#16a34a', marginLeft: 6 }} aria-label="improving">↑</span>;
  } else if (trend === 'declining') {
    return <span style={{ color: '#dc2626', marginLeft: 6 }} aria-label="declining">↓</span>;
  }
  return <span style={{ color: '#6b7280', marginLeft: 6 }} aria-label="stable">→</span>;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Manager fatigue alert component for employer dashboard.
 *
 * Shows anonymized team members below recovery threshold, sorted worst-first.
 * Includes HIPAA disclosure, worker consent notice, and opt-out reminder.
 *
 * Usage:
 *   <ManagerAlerts orgId="org-hosp-1" threshold={40} />
 */
export function ManagerAlerts({ orgId, threshold = 40 }: ManagerAlertsProps): React.ReactElement {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/v1/alerts?orgId=${encodeURIComponent(orgId)}&threshold=${threshold}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load alerts (${res.status})`);
        return res.json() as Promise<AlertRecord[]>;
      })
      .then((data) => {
        // Sort by recoveryScore ascending — worst first
        const sorted = [...data].sort((a, b) => a.recoveryScore - b.recoveryScore);
        setAlerts(sorted);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [orgId, threshold]);

  // ── Loading ──
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingText}>Loading fatigue alerts...</div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorText}>Unable to load alerts: {error}</div>
      </div>
    );
  }

  // ── Empty state ──
  if (alerts.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Fatigue Risk Alerts</h2>
        </div>
        <div style={styles.consentDisclaimer}>
          <span style={styles.lockIcon}>🔒</span>
          <span>
            Workers shown as anonymous IDs. Real identities not visible. Workers consented to
            manager alerts.
          </span>
        </div>
        <div style={styles.emptyState}>
          <span style={styles.checkIcon}>✓</span>
          <p style={styles.emptyText}>
            No workers currently at risk (recovery scores above threshold)
          </p>
        </div>
        <div style={styles.thresholdNote}>
          Alert threshold: <strong>{threshold} pts</strong>{' '}
          <span style={styles.tooltip} title="Workers whose 7-day average recovery score falls below this value appear in the alert list.">
            ⓘ
          </span>
        </div>
        <p style={styles.optOutNote}>
          Workers can disable manager alerts in their ShiftWell settings at any time.
        </p>
      </div>
    );
  }

  // ── Alert list ──
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Fatigue Risk Alerts</h2>
        <span style={styles.alertBadge}>{alerts.length}</span>
      </div>

      {/* HIPAA consent disclaimer */}
      <div style={styles.consentDisclaimer}>
        <span style={styles.lockIcon}>🔒</span>
        <span>
          Workers shown as anonymous IDs. Real identities not visible. Workers consented to
          manager alerts.
        </span>
      </div>

      {/* Alert list */}
      <div style={styles.alertList}>
        {alerts.map((alert) => (
          <div key={alert.anonymizedId} style={styles.alertCard}>
            <div style={styles.cardTop}>
              <span style={styles.workerId}>{alert.anonymizedId}</span>
              <div style={styles.scoreRow}>
                <span style={{ ...styles.scoreBadge, ...scoreBadgeStyle(alert.recoveryScore) }}>
                  {Math.round(alert.recoveryScore)}
                </span>
                <TrendArrow trend={alert.trend} />
              </div>
            </div>
            <div style={styles.cardDetails}>
              <span style={styles.shiftLabel}>
                {alert.lastShiftType} shift · {alert.daysBelowThreshold}d below threshold
              </span>
            </div>
            <div style={styles.suggestedAction}>{alert.suggestedAction}</div>
          </div>
        ))}
      </div>

      {/* Threshold setting */}
      <div style={styles.thresholdNote}>
        Alert threshold: <strong>{threshold} pts</strong>{' '}
        <span
          style={styles.tooltip}
          title="Workers whose 7-day average recovery score falls below this value appear in the alert list."
        >
          ⓘ
        </span>
      </div>

      {/* Opt-out reminder */}
      <p style={styles.optOutNote}>
        Workers can disable manager alerts in their ShiftWell settings at any time.
      </p>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 24,
    maxWidth: 560,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: '#f9fafb',
  },
  alertBadge: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    borderRadius: 999,
    padding: '2px 10px',
    fontSize: 13,
    fontWeight: 700,
  },
  consentDisclaimer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 16,
    lineHeight: 1.5,
  },
  lockIcon: {
    flexShrink: 0,
    fontSize: 14,
  },
  alertList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: '12px 16px',
    borderLeft: '3px solid #dc2626',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workerId: {
    fontSize: 15,
    fontWeight: 600,
    color: '#f3f4f6',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
  },
  scoreBadge: {
    borderRadius: 6,
    padding: '2px 10px',
    fontSize: 14,
    fontWeight: 700,
  },
  cardDetails: {
    marginBottom: 4,
  },
  shiftLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  suggestedAction: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  thresholdNote: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  tooltip: {
    cursor: 'help',
    color: '#6b7280',
  },
  optOutNote: {
    fontSize: 11,
    color: '#4b5563',
    margin: 0,
  },
  emptyState: {
    backgroundColor: '#052e16',
    borderRadius: 8,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  checkIcon: {
    color: '#16a34a',
    fontSize: 18,
    fontWeight: 700,
  },
  emptyText: {
    margin: 0,
    fontSize: 14,
    color: '#bbf7d0',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
};

export default ManagerAlerts;
