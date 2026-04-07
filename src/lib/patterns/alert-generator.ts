/**
 * Pattern Alert Generator — Phase 23
 *
 * Converts DetectedPattern objects into natural language PatternAlert objects
 * using static templates with coach voice (not clinician voice).
 *
 * Safety: All generated text is validated against SAFETY-GUARDRAILS.md before
 * storing. Text that fails validation falls back to a safe generic message.
 *
 * Static templates are used instead of LLM calls — safer, faster, zero API cost.
 */

import { validateGuardrails } from '../ai/weekly-brief-generator';
import type { DetectedPattern, PatternAlert, PatternType } from './types';

// ---------------------------------------------------------------------------
// Template definitions
// ---------------------------------------------------------------------------

const SAFE_FALLBACK_TEXT = 'Your sleep patterns show room for improvement this week.';
const SAFE_FALLBACK_RECOMMENDATION = 'Focus on consistent sleep and wake times this week.';

interface AlertTemplate {
  text: (meta: Record<string, number | string>) => string;
  recommendation: (meta: Record<string, number | string>) => string;
}

const ALERT_TEMPLATES: Partial<Record<PatternType, AlertTemplate>> = {
  'consecutive-night-impact': {
    text: (m) =>
      `Your recovery drops when you work ${m.nightCount}+ consecutive nights. Your sleep efficiency falls during these stretches.`,
    recommendation: (m) =>
      `Try to arrange a recovery day after ${String(Number(m.nightCount) - 1)} consecutive nights when your schedule allows.`,
  },
  'debt-trend-rising': {
    text: (m) =>
      `Your sleep debt has been rising over the past 4 weeks — from ${Number(m.week1AvgHours).toFixed(1)}h to ${Number(m.week4AvgHours).toFixed(1)}h average discrepancy.`,
    recommendation: () =>
      `Prioritize your next 3 scheduled off days as full recovery windows.`,
  },
  'debt-trend-improving': {
    text: (m) =>
      `Your sleep adherence is improving — discrepancy dropped from ${Number(m.week1AvgHours).toFixed(1)}h to ${Number(m.week4AvgHours).toFixed(1)}h over 4 weeks.`,
    recommendation: () =>
      `Keep up the momentum — consistent bedtimes are working.`,
  },
  'recovery-debt-trend': {
    text: (m) =>
      `Your sleep debt has been stable but elevated at around ${Number(m.week4AvgHours).toFixed(1)}h discrepancy per week.`,
    recommendation: () =>
      `Add a recovery block on your next day off and protect that time.`,
  },
  'weekend-compensation': {
    text: (m) =>
      `You sleep ${Math.round(Number(m.excessMinutes))} minutes longer on off-days than shift days, which can reset your circadian timing each week.`,
    recommendation: () =>
      `Try to limit off-day sleep extension to 60 minutes past your usual wake time.`,
  },
  'chronic-late-sleep': {
    text: (m) =>
      `You're consistently starting sleep about ${Math.round(Number(m.avgDeltaMinutes))} minutes later than planned over the past 2 weeks.`,
    recommendation: () =>
      `Consider shifting your target bedtime 30 minutes later to better match your natural rhythm.`,
  },
  'improving-adherence': {
    text: (m) =>
      `Your sleep schedule consistency is improving — your bedtime discrepancy dropped by ${Math.round(Number(m.improvementMin))} minutes over 2 weeks.`,
    recommendation: () =>
      `Keep it up. Consistency within 15 minutes of your target is the goal.`,
  },
  'shift-transition-cluster': {
    text: () =>
      `Your schedule has several shift type changes this week, which can challenge your circadian rhythm.`,
    recommendation: () =>
      `Use the light protocol on transition days — bright light in the morning, dimmed light after 8 PM.`,
  },
};

// ---------------------------------------------------------------------------
// Alert generator
// ---------------------------------------------------------------------------

/**
 * Generate a natural language PatternAlert from a DetectedPattern.
 *
 * Uses static templates (no API call). Validates all text against guardrails.
 * Falls back to safe generic text if any guardrail check fails.
 */
export function generatePatternAlert(pattern: DetectedPattern): PatternAlert {
  const template = ALERT_TEMPLATES[pattern.type];
  const generatedAtISO = new Date().toISOString();

  let text: string;
  let recommendation: string;

  if (template) {
    try {
      text = template.text(pattern.metadata);
      recommendation = template.recommendation(pattern.metadata);
    } catch {
      text = SAFE_FALLBACK_TEXT;
      recommendation = SAFE_FALLBACK_RECOMMENDATION;
    }
  } else {
    // No template — use the detector's built-in message
    text = pattern.message;
    recommendation = pattern.recommendation;
  }

  // Validate both strings through safety guardrails
  const textResult = validateGuardrails(text);
  const recResult = validateGuardrails(recommendation);

  const passedGuardrails = textResult.pass && recResult.pass;

  if (!passedGuardrails) {
    text = SAFE_FALLBACK_TEXT;
    recommendation = SAFE_FALLBACK_RECOMMENDATION;
  }

  return {
    patternId: pattern.id,
    type: pattern.type,
    severity: pattern.severity,
    text,
    recommendation,
    generatedAtISO,
    passedGuardrails,
    dismissed: false,
  };
}
