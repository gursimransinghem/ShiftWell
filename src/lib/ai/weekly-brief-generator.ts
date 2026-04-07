/**
 * Weekly Brief Generator — transforms user sleep data into a Claude prompt
 * and returns a formatted, guardrail-validated weekly brief.
 *
 * Safety: SAFETY-GUARDRAILS.md Section 1 (prohibited categories)
 * Prompt: AI-COACHING-FRAMEWORK.md Section 2 (system prompt structure)
 */

import { generateCompletion } from './claude-client';
import type { BriefContext, WeeklyBrief, BriefGenerationResult } from './types';
import { ClaudeAPIError } from './types';

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

/**
 * Build the system prompt per AI-COACHING-FRAMEWORK.md Section 2.1.
 */
export function buildSystemPrompt(): string {
  return [
    'You are a sleep coach specializing in circadian rhythm optimization for shift workers.',
    'You are NOT a physician. Never diagnose conditions, name disorders, recommend medications',
    'or supplements, or suggest emergency care. Respond only in plain English, 150 words max.',
    'Include exactly one actionable recommendation in your final sentence.',
    '',
    'LANGUAGE BOUNDARIES:',
    '- Say "your sleep data shows" not "your symptoms indicate"',
    '- Say "consider trying" not "I recommend you"',
    '- Say "many shift workers find" not "research proves"',
    '- Say "talk to your doctor about" not "you may have"',
    '- Say "your schedule suggests" not "you need to"',
  ].join('\n');
}

/**
 * Build the user message from BriefContext.
 */
export function buildUserMessage(ctx: BriefContext): string {
  const shiftSummary = ctx.upcomingShifts
    .map((s) => `${s.dateISO}: ${s.type}`)
    .join(', ');

  return [
    `Past 7 nights: ${ctx.adherencePercent}% adherence, ${ctx.sleepDebtHours}h sleep debt`,
    `Average bedtime discrepancy: ${ctx.avgDiscrepancyMinutes} minutes`,
    `Upcoming week: ${shiftSummary || 'no shifts scheduled'} with ${ctx.hardTransitionDays} hard transition${ctx.hardTransitionDays !== 1 ? 's' : ''}`,
    'Generate a personalized Monday morning sleep summary.',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Guardrail validation
// ---------------------------------------------------------------------------

export interface GuardrailResult {
  pass: boolean;
  violation?: string;
}

/**
 * Validate AI output against prohibited categories from SAFETY-GUARDRAILS.md Section 1.
 *
 * Returns { pass: true } for safe text, { pass: false, violation: category } for violations.
 */
export function validateGuardrails(text: string): GuardrailResult {
  // Category 1: Medical Diagnosis
  // Matches: named disorders/conditions, diagnostic language, "you have/may have [clinical term]"
  if (/\b(disorder|syndrome|disease|diagnos|you\s+may\s+have|you\s+suffer|consistent\s+with\s+(a\s+)?(disorder|condition|syndrome|disease)|suggests\s+(a\s+)?(disorder|condition|syndrome)|indicates\s+(a\s+)?(disorder|condition|syndrome))/i.test(text)) {
    return { pass: false, violation: 'diagnosis' };
  }
  // Secondary check: "you have [disorder/condition name]" without false-positive on "you have X hours/nights"
  if (/\byou\s+have\s+([a-z]+\s+)?(disorder|syndrome|disease|condition|SWSD|apnea|insomnia|narcolepsy)\b/i.test(text)) {
    return { pass: false, violation: 'diagnosis' };
  }

  // Category 2: Medication Guidance
  if (/\b(melatonin|medication|supplement|drug|prescri|dosage|mg\b|magnesium|valerian|cbd|benadryl|ambien|zolpidem|trazodone|sleeping\s+pill)/i.test(text)) {
    return { pass: false, violation: 'medication' };
  }

  // Category 5: Prognosis
  if (/\b(will\s+cause|leads\s+to|results\s+in|increases\s+(your\s+)?risk\s+of|at\s+risk\s+for|will\s+develop|trajectory\s+toward)/i.test(text)) {
    return { pass: false, violation: 'prognosis' };
  }

  // Category 3: Emergency Clinical Guidance
  if (/\b(emergency|urgent|immediately\s+see|call\s+911|\bER\b|hospital|safe\s+to\s+drive|fit\s+for\s+duty|medically\s+cleared)/i.test(text)) {
    return { pass: false, violation: 'emergency' };
  }

  return { pass: true };
}

// ---------------------------------------------------------------------------
// Recommendation extraction
// ---------------------------------------------------------------------------

const IMPERATIVE_VERBS = /^(Try|Consider|Aim|Move|Add|Prioritize|Avoid|Keep|Focus|Shift|Protect|Limit|Use|Build|Start|Set)\b/;

/**
 * Extract the single actionable recommendation from the brief text.
 *
 * Returns the last sentence starting with an imperative verb,
 * or the last sentence of the text as a fallback.
 */
export function extractRecommendation(text: string): string {
  // Split into sentences (end of sentence = . or ! or ? followed by whitespace or end)
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Search from end for a sentence starting with an imperative verb
  for (let i = sentences.length - 1; i >= 0; i--) {
    if (IMPERATIVE_VERBS.test(sentences[i])) {
      return sentences[i];
    }
  }

  // Fallback: return last sentence
  return sentences[sentences.length - 1] ?? text;
}

// ---------------------------------------------------------------------------
// UUID helper (crypto.randomUUID or fallback)
// ---------------------------------------------------------------------------

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for test environments
  return `brief-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

const BRIEF_MODEL = 'claude-haiku-4-5';

/**
 * Full weekly brief generation pipeline.
 *
 * 1. Build system prompt and user message from BriefContext
 * 2. Call generateCompletion (Anthropic API)
 * 3. Validate guardrails — return failure if content is prohibited
 * 4. Extract the single actionable recommendation
 * 5. Construct and return WeeklyBrief
 */
export async function generateWeeklyBrief(
  ctx: BriefContext,
): Promise<BriefGenerationResult> {
  const systemPrompt = buildSystemPrompt();
  const userMessage = buildUserMessage(ctx);

  let text: string;
  let tokensUsed: number;

  try {
    const result = await generateCompletion(systemPrompt, userMessage, BRIEF_MODEL);
    text = result.text;
    tokensUsed = result.tokensUsed;
  } catch (err) {
    if (err instanceof ClaudeAPIError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }

  // Guardrail check
  const guardrail = validateGuardrails(text);
  if (!guardrail.pass) {
    return { success: false, guardrailFailure: guardrail.violation };
  }

  // Extract recommendation
  const recommendation = extractRecommendation(text);

  // Construct brief
  const brief: WeeklyBrief = {
    id: generateId(),
    weekStartISO: ctx.weekStartISO,
    generatedAtISO: new Date().toISOString(),
    text,
    recommendation,
    adherencePercent: ctx.adherencePercent,
    model: BRIEF_MODEL,
    tokensUsed,
    passedGuardrails: true,
  };

  return { success: true, brief };
}
