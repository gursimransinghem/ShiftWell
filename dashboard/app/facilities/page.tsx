/**
 * Facilities Overview page — multi-facility employer dashboard.
 * Phase 38 — Advanced Platform Features
 *
 * Protected route: requires the same session auth as the main employer dashboard.
 *
 * Layout:
 *   - Header: "Facilities Overview" + org name
 *   - Tab selector: "All Facilities" + per-facility tabs
 *   - All Facilities view:
 *       · Summary cards: network avg score, best/worst facility, gap
 *       · Recharts grouped bar chart: per-facility avgRecoveryScore vs network avg
 *       · Ranked list: rank badge, score, trend, worker count
 *   - Individual facility view:
 *       · Cohort metrics for that facility
 *       · ManagerAlerts for that facility
 *       · Schedule impact note
 *
 * Cross-facility insight (generated from report data):
 *   "Your {best} team averages {score} — {gap} pts above your lowest facility ({worst})."
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ManagerAlerts } from '../../components/ManagerAlerts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FacilityConfig {
  facilityId: string;
  facilityName: string;
  location?: string;
}

interface FacilityCohortSummary {
  facilityId: string;
  facilityName: string;
  avgRecoveryScore: number;
  adherenceRate: number;
  cohortSize: number;
  rank: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface CrossFacilityOverview {
  orgId: string;
  orgName: string;
  networkAvgRecoveryScore: number;
  facilities: FacilityCohortSummary[];
  bestFacilityId: string;
  worstFacilityId: string;
  generatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rankBadge(rank: number): React.ReactElement {
  const colors: Record<number, string> = {
    1: '#c8a84b', // gold
    2: '#9ca3af', // silver
    3: '#b45309', // bronze
  };
  const bg = colors[rank] ?? '#374151';
  return (
    <span
      style={{
        backgroundColor: bg,
        color: rank <= 3 ? '#111827' : '#f9fafb',
        borderRadius: 6,
        padding: '2px 9px',
        fontSize: 13,
        fontWeight: 700,
        minWidth: 28,
        textAlign: 'center',
        display: 'inline-block',
      }}
    >
      #{rank}
    </span>
  );
}

function scoreColor(score: number): string {
  if (score >= 65) return '#16a34a'; // green
  if (score >= 50) return '#ca8a04'; // yellow
  return '#dc2626'; // red
}

function trendArrow(trend: FacilityCohortSummary['trend']): string {
  if (trend === 'improving') return '↑';
  if (trend === 'declining') return '↓';
  return '→';
}

function generateInsight(overview: CrossFacilityOverview): string {
  const best = overview.facilities.find((f) => f.facilityId === overview.bestFacilityId);
  const worst = overview.facilities.find((f) => f.facilityId === overview.worstFacilityId);
  if (!best || !worst) return '';
  const gap = Math.round(best.avgRecoveryScore - worst.avgRecoveryScore);
  return (
    `Your ${best.facilityName} team averages ${Math.round(best.avgRecoveryScore)} — ` +
    `${gap} points above your lowest facility (${worst.facilityName}). ` +
    `Schedule analysis shows ${worst.facilityName} may benefit from shift pattern optimization.`
  );
}

// ─── Stub data loader ─────────────────────────────────────────────────────────

/**
 * Loads cross-facility overview from the employer dashboard API.
 * In Phase 38 this fetches /api/v1/facilities and constructs a stub summary.
 * The real aggregation pipeline (buildMultiFacilityReport) will be wired in Phase 28+.
 */
async function loadCrossFacilityOverview(orgId: string): Promise<CrossFacilityOverview> {
  const res = await fetch(`/api/facilities?orgId=${encodeURIComponent(orgId)}`);
  if (!res.ok) throw new Error(`Failed to load facilities (${res.status})`);
  const data = await res.json() as { orgId: string; facilities: FacilityConfig[] };

  // Build a stub overview with placeholder metrics.
  // TODO: replace with real aggregation via buildMultiFacilityReport in Phase 28.
  const facilities: FacilityCohortSummary[] = data.facilities.map((f, idx) => ({
    facilityId: f.facilityId,
    facilityName: f.facilityName,
    avgRecoveryScore: 65 - idx * 8, // placeholder — decreasing by index
    adherenceRate: 0.78 - idx * 0.06,
    cohortSize: 40 + idx * 10,
    rank: idx + 1,
    trend: idx === 0 ? 'improving' : 'stable',
  }));

  const networkAvg =
    facilities.reduce((sum, f) => sum + f.avgRecoveryScore * f.cohortSize, 0) /
    facilities.reduce((sum, f) => sum + f.cohortSize, 0);

  return {
    orgId,
    orgName: orgId.replace('org-', '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    networkAvgRecoveryScore: networkAvg,
    facilities,
    bestFacilityId: facilities[0]?.facilityId ?? '',
    worstFacilityId: facilities[facilities.length - 1]?.facilityId ?? '',
    generatedAt: new Date().toISOString(),
  };
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: 'best' | 'worst' | 'neutral';
}): React.ReactElement {
  const borderColor =
    highlight === 'best' ? '#16a34a' : highlight === 'worst' ? '#dc2626' : '#374151';

  return (
    <div
      style={{
        backgroundColor: '#1f2937',
        borderRadius: 10,
        padding: '16px 20px',
        borderTop: `3px solid ${borderColor}`,
        flex: 1,
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function FacilityRankedRow({
  summary,
  isSelected,
  onSelect,
}: {
  summary: FacilityCohortSummary;
  isSelected: boolean;
  onSelect: () => void;
}): React.ReactElement {
  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        backgroundColor: isSelected ? '#1e3a5f' : '#1f2937',
        borderRadius: 8,
        border: isSelected ? '1px solid #3b82f6' : '1px solid transparent',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
      }}
    >
      {rankBadge(summary.rank)}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6' }}>
          {summary.facilityName}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{summary.cohortSize} workers</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: scoreColor(summary.avgRecoveryScore) }}>
          {Math.round(summary.avgRecoveryScore)}
        </span>
        <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 4 }}>
          {trendArrow(summary.trend)}
        </span>
      </div>
    </button>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

interface PageProps {
  searchParams?: { orgId?: string };
}

export default function FacilitiesPage({ searchParams }: PageProps): React.ReactElement {
  const orgId = searchParams?.orgId ?? 'org-demo';
  const [overview, setOverview] = useState<CrossFacilityOverview | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    loadCrossFacilityOverview(orgId)
      .then((data) => {
        setOverview(data);
      })
      .catch((err: Error) => {
        setFetchError(err.message);
      })
      .finally(() => setLoading(false));
  }, [orgId]);

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loading}>Loading facilities...</div>
      </main>
    );
  }

  if (fetchError || !overview) {
    return (
      <main style={styles.page}>
        <div style={styles.errorText}>
          Unable to load facilities: {fetchError ?? 'Unknown error'}
        </div>
      </main>
    );
  }

  const selectedFacility = overview.facilities.find(
    (f) => f.facilityId === selectedFacilityId
  ) ?? null;

  const best = overview.facilities.find((f) => f.facilityId === overview.bestFacilityId);
  const worst = overview.facilities.find((f) => f.facilityId === overview.worstFacilityId);
  const gap = best && worst ? Math.round(best.avgRecoveryScore - worst.avgRecoveryScore) : 0;

  // Bar chart data
  const chartData = overview.facilities.map((f) => ({
    name: f.facilityName.replace('Campus', '').trim(),
    score: Math.round(f.avgRecoveryScore),
    networkAvg: Math.round(overview.networkAvgRecoveryScore),
  }));

  return (
    <main style={styles.page}>
      {/* Page header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Facilities Overview</h1>
          <p style={styles.orgName}>{overview.orgName}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={styles.tabBar}>
        <button
          style={selectedFacilityId === null ? styles.tabActive : styles.tab}
          onClick={() => setSelectedFacilityId(null)}
        >
          All Facilities
        </button>
        {overview.facilities.map((f) => (
          <button
            key={f.facilityId}
            style={selectedFacilityId === f.facilityId ? styles.tabActive : styles.tab}
            onClick={() => setSelectedFacilityId(f.facilityId)}
          >
            {f.facilityName}
          </button>
        ))}
      </div>

      {/* ─ All Facilities view ─ */}
      {selectedFacilityId === null && (
        <div>
          {/* Summary cards */}
          <div style={styles.summaryCards}>
            <SummaryCard
              label="Network Avg Score"
              value={Math.round(overview.networkAvgRecoveryScore).toString()}
              sub="7-day rolling average"
              highlight="neutral"
            />
            {best && (
              <SummaryCard
                label="Best Facility"
                value={best.facilityName}
                sub={`Score: ${Math.round(best.avgRecoveryScore)}`}
                highlight="best"
              />
            )}
            {worst && (
              <SummaryCard
                label="Needs Attention"
                value={worst.facilityName}
                sub={`Score: ${Math.round(worst.avgRecoveryScore)}`}
                highlight="worst"
              />
            )}
            <SummaryCard
              label="Performance Gap"
              value={`${gap} pts`}
              sub="best vs lowest"
              highlight="neutral"
            />
          </div>

          {/* Cross-facility insight */}
          <div style={styles.insightBanner}>
            <span style={styles.insightIcon}>💡</span>
            <span style={styles.insightText}>{generateInsight(overview)}</span>
          </div>

          {/* Bar chart */}
          <div style={styles.chartContainer}>
            <h3 style={styles.sectionTitle}>Recovery Score by Facility</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8 }}
                  labelStyle={{ color: '#f9fafb' }}
                  itemStyle={{ color: '#c8a84b' }}
                />
                <ReferenceLine
                  y={Math.round(overview.networkAvgRecoveryScore)}
                  stroke="#6b7280"
                  strokeDasharray="4 4"
                  label={{ value: 'Network Avg', fill: '#6b7280', fontSize: 11 }}
                />
                <Bar dataKey="score" fill="#c8a84b" radius={[4, 4, 0, 0]} name="Recovery Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ranked list */}
          <div style={styles.rankedList}>
            <h3 style={styles.sectionTitle}>Facility Rankings</h3>
            <div style={styles.rankedItems}>
              {overview.facilities.map((f) => (
                <FacilityRankedRow
                  key={f.facilityId}
                  summary={f}
                  isSelected={false}
                  onSelect={() => setSelectedFacilityId(f.facilityId)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─ Individual facility view ─ */}
      {selectedFacility !== null && (
        <div>
          <div style={styles.facilityHeader}>
            <h2 style={styles.facilityTitle}>{selectedFacility.facilityName}</h2>
            <div style={styles.facilityMeta}>
              {rankBadge(selectedFacility.rank)}
              <span style={{ fontSize: 14, color: '#9ca3af', marginLeft: 8 }}>
                {selectedFacility.cohortSize} workers · Avg score{' '}
                <strong style={{ color: scoreColor(selectedFacility.avgRecoveryScore) }}>
                  {Math.round(selectedFacility.avgRecoveryScore)}
                </strong>
              </span>
            </div>
          </div>

          {/* Cohort metrics summary */}
          <div style={styles.summaryCards}>
            <SummaryCard
              label="Avg Recovery Score"
              value={Math.round(selectedFacility.avgRecoveryScore).toString()}
              sub="7-day rolling"
              highlight={selectedFacility.avgRecoveryScore >= 60 ? 'best' : 'worst'}
            />
            <SummaryCard
              label="Adherence Rate"
              value={`${Math.round(selectedFacility.adherenceRate * 100)}%`}
              sub="plan adherence"
              highlight="neutral"
            />
            <SummaryCard
              label="Team Size"
              value={selectedFacility.cohortSize.toString()}
              sub="enrolled workers"
              highlight="neutral"
            />
          </div>

          {/* Schedule impact note */}
          <div style={styles.scheduleNote}>
            <strong style={{ color: '#c8a84b' }}>Schedule Analysis</strong>
            <p style={{ margin: '6px 0 0', color: '#9ca3af', fontSize: 13, lineHeight: 1.6 }}>
              Run schedule optimization for this facility to identify workers with high circadian
              disruption scores and get evidence-based schedule recommendations (Eastman & Burgess,
              2009; Folkard & Tucker, 2003).
            </p>
          </div>

          {/* Manager alerts */}
          <div style={{ marginTop: 24 }}>
            <ManagerAlerts orgId={`${orgId}::${selectedFacility.facilityId}`} threshold={40} />
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '32px 24px',
    color: '#f9fafb',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pageTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: '#f9fafb',
  },
  orgName: {
    margin: '4px 0 0',
    fontSize: 14,
    color: '#6b7280',
  },
  tabBar: {
    display: 'flex',
    gap: 8,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  tab: {
    padding: '7px 16px',
    backgroundColor: '#1f2937',
    color: '#9ca3af',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
  },
  tabActive: {
    padding: '7px 16px',
    backgroundColor: '#c8a84b',
    color: '#111827',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
  },
  summaryCards: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  insightBanner: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 24,
  },
  insightIcon: {
    fontSize: 16,
    flexShrink: 0,
  },
  insightText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 1.6,
  },
  chartContainer: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 24,
  },
  sectionTitle: {
    margin: '0 0 14px',
    fontSize: 15,
    fontWeight: 600,
    color: '#f3f4f6',
  },
  rankedList: {
    marginBottom: 32,
  },
  rankedItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  facilityHeader: {
    marginBottom: 20,
  },
  facilityTitle: {
    margin: '0 0 6px',
    fontSize: 20,
    fontWeight: 700,
    color: '#f9fafb',
  },
  facilityMeta: {
    display: 'flex',
    alignItems: 'center',
  },
  scheduleNote: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    padding: '14px 18px',
    marginTop: 16,
    borderLeft: '3px solid #c8a84b',
  },
  loading: {
    color: '#6b7280',
    fontSize: 16,
    padding: 40,
    textAlign: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    padding: 40,
  },
};
