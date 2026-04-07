/**
 * HRVCalibrationBanner — shows Apple Watch HRV status on the Today screen.
 *
 * Three states:
 * 1. No HRV: renders nothing (no Apple Watch or permission denied)
 * 2. Calibrating (days 1-13): shows progress bar with "Day X/14" fill
 * 3. HRV Active (day 14+): shows small "HRV Enhanced" badge
 *
 * When HRV is suppressed during a circadian transition, shows an informational
 * note below the recovery score.
 *
 * Reads directly from score-store — no props required.
 */

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScoreStore } from '@/src/store/score-store';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/src/theme';

// ─── Gold accent (matches app design system) ─────────────────────────────────

const GOLD = '#F59E0B';
const GOLD_BG = 'rgba(245, 158, 11, 0.08)';
const GOLD_BORDER = 'rgba(245, 158, 11, 0.25)';

// ─── HRVDetailModal ───────────────────────────────────────────────────────────

interface HRVDetailModalProps {
  visible: boolean;
  onClose: () => void;
  overnightSDNN: number | null;
  personalHRVBaseline: number | null;
}

function HRVDetailModal({ visible, onClose, overnightSDNN, personalHRVBaseline }: HRVDetailModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <View style={modalStyles.card}>
          <View style={modalStyles.header}>
            <Ionicons name="watch-outline" size={20} color={GOLD} />
            <Text style={modalStyles.title}>HRV Enhanced Recovery</Text>
          </View>
          <Text style={modalStyles.body}>
            Your Apple Watch HRV data is contributing to your recovery score.
          </Text>
          {overnightSDNN !== null && (
            <View style={modalStyles.statRow}>
              <Text style={modalStyles.statLabel}>Current HRV</Text>
              <Text style={modalStyles.statValue}>{overnightSDNN}ms</Text>
            </View>
          )}
          {personalHRVBaseline !== null && (
            <View style={modalStyles.statRow}>
              <Text style={modalStyles.statLabel}>Personal Baseline</Text>
              <Text style={modalStyles.statValue}>{personalHRVBaseline}ms</Text>
            </View>
          )}
          <Text style={modalStyles.caption}>
            HRV (Heart Rate Variability) measures your autonomic nervous system recovery.
            Higher values relative to your baseline indicate better physiological recovery.
          </Text>
          <Pressable onPress={onClose} style={modalStyles.closeBtn}>
            <Text style={modalStyles.closeBtnText}>Got it</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 340,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GOLD_BORDER,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  body: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  statValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: GOLD,
  },
  caption: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginTop: SPACING.md,
    lineHeight: 18,
  },
  closeBtn: {
    marginTop: SPACING.lg,
    backgroundColor: GOLD,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  closeBtnText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: '#0A0A0F',
  },
});

// ─── HRVCalibrationBanner ─────────────────────────────────────────────────────

/**
 * HRV status banner for the Today screen.
 *
 * Renders nothing when no Apple Watch is detected.
 * Shows calibration progress during days 1-13.
 * Shows "HRV Enhanced" badge after calibration completes.
 * Shows suppression note during circadian transitions.
 */
export function HRVCalibrationBanner() {
  const hrv_available = useScoreStore((s) => s.hrv_available);
  const hrv_calibrating = useScoreStore((s) => s.hrv_calibrating);
  const hrv_calibration_progress = useScoreStore((s) => s.hrv_calibration_progress);
  const hrvBaselineDays = useScoreStore((s) => s.hrvBaselineDays);
  const hrv_suppressed_transition = useScoreStore((s) => s.hrv_suppressed_transition);
  const overnightSDNN = useScoreStore((s) => s.overnightSDNN);
  const personalHRVBaseline = useScoreStore((s) => s.personalHRVBaseline);

  const [showModal, setShowModal] = useState(false);

  // No Apple Watch detected — render nothing
  if (!hrv_available && !hrv_calibrating) {
    return null;
  }

  // ── Post-calibration: HRV Active badge ────────────────────────────────────
  if (!hrv_calibrating && hrv_available) {
    return (
      <>
        <Pressable
          onPress={() => setShowModal(true)}
          style={styles.activeBadge}
        >
          <Ionicons name="watch-outline" size={14} color={GOLD} />
          <Text style={styles.activeBadgeText}>HRV Enhanced</Text>
          <Ionicons name="chevron-forward-outline" size={12} color={GOLD} />
        </Pressable>

        {/* Transition suppression note */}
        {hrv_suppressed_transition && (
          <Text style={styles.transitionNote}>
            HRV paused during shift transition
          </Text>
        )}

        <HRVDetailModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          overnightSDNN={overnightSDNN}
          personalHRVBaseline={personalHRVBaseline}
        />
      </>
    );
  }

  // ── Calibration in progress (days 1-13) ───────────────────────────────────
  const progressPercent = Math.min(hrv_calibration_progress * 100, 100);
  const daysLeft = Math.max(14 - hrvBaselineDays, 0);

  return (
    <View style={styles.calibrationCard}>
      <View style={styles.calibrationHeader}>
        <Ionicons name="watch-outline" size={18} color={GOLD} />
        <Text style={styles.calibrationTitle}>Calibrating Apple Watch HRV</Text>
      </View>

      <Text style={styles.calibrationSubtitle}>
        Day {hrvBaselineDays}/14 — HRV will improve your recovery score accuracy
      </Text>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <Text style={styles.calibrationNote}>
        {daysLeft > 0
          ? `${daysLeft} night${daysLeft === 1 ? '' : 's'} remaining`
          : 'Calibration almost complete'}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Calibration card
  calibrationCard: {
    backgroundColor: GOLD_BG,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GOLD_BORDER,
  },
  calibrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  calibrationTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  calibrationSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  calibrationNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginTop: SPACING.xs,
  },

  // Active badge (post-calibration)
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: GOLD_BG,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GOLD_BORDER,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: GOLD,
    letterSpacing: 0.2,
  },

  // Transition suppression note
  transitionNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
});
