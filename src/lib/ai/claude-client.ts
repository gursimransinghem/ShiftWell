/**
 * Claude API client — generates personalized weekly sleep briefs.
 *
 * Uses fetch() against the Anthropic messages endpoint.
 * API key loaded from EXPO_PUBLIC_CLAUDE_API_KEY env var (never hardcoded).
 * Timeout: 15 seconds. Falls back to a static brief on any failure.
 */

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
  summary: string;       // 2-3 sentence overview
  trend: 'improving' | 'declining' | 'stable';
  recommendation: string; // single actionable tip
  encouragement: string;  // motivational close
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-haiku-20240307';
const TIMEOUT_MS = 15_000;

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
// Prompt builder
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

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function generateWeeklyBrief(
  request: BriefRequest,
): Promise<BriefResponse> {
  // WARNING: EXPO_PUBLIC_ vars are bundled into the client JS bundle.
  // Before App Store release, route Claude API calls through a Supabase Edge Function.
  // This is acceptable for pre-TestFlight beta only.
  const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
  if (!apiKey) {
    console.warn('[claude-client] EXPO_PUBLIC_CLAUDE_API_KEY not set — returning fallback');
    return FALLBACK_BRIEF;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserMessage(request) }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(`[claude-client] API error ${response.status} — returning fallback`);
      return FALLBACK_BRIEF;
    }

    const data = await response.json();
    const rawText: string = data?.content?.[0]?.text ?? '';

    // Extract JSON from the response (strip markdown fences if present)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('[claude-client] No JSON found in response — returning fallback');
      return FALLBACK_BRIEF;
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<BriefResponse>;

    // Validate required fields
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
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    console.warn(
      isTimeout
        ? '[claude-client] Request timed out — returning fallback'
        : '[claude-client] Fetch error — returning fallback',
      err,
    );
    return FALLBACK_BRIEF;
  } finally {
    clearTimeout(timeoutId);
  }
}

export { FALLBACK_BRIEF };
