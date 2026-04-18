/**
 * Claude API client — generates personalized weekly sleep briefs.
 *
 * All requests route through the Supabase Edge Function `claude-proxy`.
 * The Anthropic API key lives server-side only (Supabase secret).
 * Client authenticates via the current Supabase session JWT.
 *
 * Exports:
 *   generateCompletion — calls Edge Function, returns { text, tokensUsed }
 *   generateWeeklyBrief — high-level pipeline for sleep coach briefs
 */

import { ClaudeAPIError } from './types';
import { supabase } from '../supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BriefRequest {
  sleepHistory: { dateISO: string; planned: number; actual: number; score: number }[];
  debtTrend: { current: number; weekAgo: number };
  upcomingTransitions: { type: string; daysUntil: number }[];
  streakDays: number;
}

export interface BriefResponse {
  summary: string;
  trend: 'improving' | 'declining' | 'stable';
  recommendation: string;
  encouragement: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const TIMEOUT_MS = 20_000;

const SYSTEM_PROMPT =
  'You are a sleep coach for shift workers. Tone: warm, evidence-based, actionable. ' +
  'You are NOT a doctor. Never diagnose, prescribe, or recommend medications. ' +
  'Keep responses under 200 words total.';

const FALLBACK_BRIEF: BriefResponse = {
  summary:
    'Your sleep data is ready to review, but we could not generate a personalized summary right now. ' +
    'Keep following your plan — consistency is the most powerful tool you have.',
  trend: 'stable',
  recommendation:
    'Protect your wind-down window tonight by dimming lights 30 minutes before bed.',
  encouragement:
    'Every consistent night builds momentum. You are doing the right things.',
};

// ---------------------------------------------------------------------------
// Edge Function caller
// ---------------------------------------------------------------------------

async function callEdgeFunction(
  systemPrompt: string,
  userMessage: string,
  model: string = DEFAULT_MODEL,
): Promise<{ text: string; tokensUsed: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new ClaudeAPIError(401, 'User not authenticated');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const { data, error } = await supabase.functions.invoke('claude-proxy', {
      body: { systemPrompt, userMessage, model },
    });

    if (error) {
      const status = (error as { status?: number }).status ?? 500;
      throw new ClaudeAPIError(status, error.message ?? 'Edge Function error');
    }

    return {
      text: data.text as string,
      tokensUsed: (data.tokensUsed as number) ?? 0,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------------------------------------------------------------------------
// generateCompletion — public API
// ---------------------------------------------------------------------------

export async function generateCompletion(
  systemPrompt: string,
  userMessage: string,
  model: string = DEFAULT_MODEL,
): Promise<{ text: string; tokensUsed: number }> {
  return callEdgeFunction(systemPrompt, userMessage, model);
}

// ---------------------------------------------------------------------------
// generateWeeklyBrief — high-level brief generator
// ---------------------------------------------------------------------------

function buildUserMessage(request: BriefRequest): string {
  const { sleepHistory, debtTrend, upcomingTransitions, streakDays } = request;

  const historyLines = sleepHistory
    .map(
      (h) =>
        `  ${h.dateISO}: planned ${h.planned}h, actual ${h.actual}h, score ${h.score}`,
    )
    .join('\n');

  const debtChange = debtTrend.current - debtTrend.weekAgo;
  const debtDirection = debtChange < 0 ? 'decreasing' : debtChange > 0 ? 'increasing' : 'unchanged';

  const transitionLines =
    upcomingTransitions.length > 0
      ? upcomingTransitions
          .map((t) => `  ${t.type} in ${t.daysUntil} day(s)`)
          .join('\n')
      : '  None scheduled';

  return [
    'Generate a weekly sleep brief for a shift worker. Return ONLY valid JSON matching this schema:',
    '{"summary": string, "trend": "improving"|"declining"|"stable", "recommendation": string, "encouragement": string}',
    '',
    `Sleep history (last 7 days):`,
    historyLines || '  No data',
    '',
    `Sleep debt: ${debtTrend.current}h (${debtDirection} from ${debtTrend.weekAgo}h last week)`,
    `Adherence streak: ${streakDays} consecutive night(s)`,
    '',
    'Upcoming schedule transitions:',
    transitionLines,
    '',
    'Assess the trend honestly. If debt is rising or scores are low, say so warmly but clearly.',
  ].join('\n');
}

export async function generateWeeklyBrief(
  request: BriefRequest,
): Promise<BriefResponse> {
  try {
    const { text } = await callEdgeFunction(
      SYSTEM_PROMPT,
      buildUserMessage(request),
    );

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('[claude-client] No JSON found in response — returning fallback');
      return FALLBACK_BRIEF;
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<BriefResponse>;

    if (
      typeof parsed.summary !== 'string' ||
      typeof parsed.recommendation !== 'string' ||
      typeof parsed.encouragement !== 'string' ||
      !['improving', 'declining', 'stable'].includes(parsed.trend as string)
    ) {
      console.warn('[claude-client] Invalid response shape — returning fallback');
      return FALLBACK_BRIEF;
    }

    return {
      summary: parsed.summary,
      trend: parsed.trend as BriefResponse['trend'],
      recommendation: parsed.recommendation,
      encouragement: parsed.encouragement,
    };
  } catch (err) {
    if (err instanceof ClaudeAPIError && err.statusCode === 429) {
      console.warn('[claude-client] Rate limit exceeded — returning fallback');
    } else {
      console.warn('[claude-client] Edge Function error — returning fallback', err);
    }
    return FALLBACK_BRIEF;
  }
}

export { FALLBACK_BRIEF };
