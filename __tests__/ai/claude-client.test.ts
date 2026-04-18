/**
 * claude-client tests
 *
 * Mocks supabase.functions.invoke — never calls the real Edge Function or Claude API.
 * Tests: prompt construction, JSON parsing, fallback behavior, auth gating.
 */

import { generateWeeklyBrief, FALLBACK_BRIEF } from '../../src/lib/ai/claude-client';
import type { BriefRequest } from '../../src/lib/ai/claude-client';
import { supabase } from '../../src/lib/supabase/client';

// ---------------------------------------------------------------------------
// Mock the supabase client
// ---------------------------------------------------------------------------

jest.mock('../../src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    functions: {
      invoke: jest.fn(),
    },
  },
}));

const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockInvoke = supabase.functions.invoke as jest.Mock;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MINIMAL_REQUEST: BriefRequest = {
  sleepHistory: [
    { dateISO: '2026-01-05', planned: 7.5, actual: 7.0, score: 85 },
    { dateISO: '2026-01-06', planned: 7.5, actual: 6.5, score: 70 },
  ],
  debtTrend: { current: 1.5, weekAgo: 2.0 },
  upcomingTransitions: [{ type: 'day-to-night', daysUntil: 3 }],
  streakDays: 4,
};

const VALID_RESPONSE = {
  summary: 'Your sleep improved this week.',
  trend: 'improving',
  recommendation: 'Keep your wind-down consistent.',
  encouragement: 'Great momentum — keep it up!',
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  // Default: authenticated session
  mockGetSession.mockResolvedValue({
    data: { session: { access_token: 'test-jwt-123' } },
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockInvokeOk(body: object) {
  mockInvoke.mockResolvedValueOnce({
    data: { text: JSON.stringify(body), tokensUsed: 50 },
    error: null,
  });
}

function mockInvokeError(status: number, message: string) {
  mockInvoke.mockResolvedValueOnce({
    data: null,
    error: { status, message },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateWeeklyBrief', () => {
  it('returns parsed response on success', async () => {
    mockInvokeOk(VALID_RESPONSE);
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result.summary).toBe(VALID_RESPONSE.summary);
    expect(result.trend).toBe('improving');
    expect(result.recommendation).toBe(VALID_RESPONSE.recommendation);
    expect(result.encouragement).toBe(VALID_RESPONSE.encouragement);
  });

  it('calls Edge Function with correct body fields', async () => {
    mockInvokeOk(VALID_RESPONSE);
    await generateWeeklyBrief(MINIMAL_REQUEST);

    expect(mockInvoke).toHaveBeenCalledTimes(1);
    const [functionName, options] = mockInvoke.mock.calls[0];
    expect(functionName).toBe('claude-proxy');
    expect(options.body.systemPrompt).toContain('NOT a doctor');
    expect(options.body.systemPrompt).toContain('Never diagnose');
    expect(options.body.userMessage).toBeTruthy();
  });

  it('includes sleep history and debt data in prompt', async () => {
    mockInvokeOk(VALID_RESPONSE);
    await generateWeeklyBrief(MINIMAL_REQUEST);

    const [, options] = mockInvoke.mock.calls[0];
    const userMessage: string = options.body.userMessage;
    expect(userMessage).toContain('2026-01-05');
    expect(userMessage).toContain('day-to-night');
    expect(userMessage).toContain('4');
    expect(userMessage).toContain('1.5');
  });

  it('includes safety system prompt', async () => {
    mockInvokeOk(VALID_RESPONSE);
    await generateWeeklyBrief(MINIMAL_REQUEST);

    const [, options] = mockInvoke.mock.calls[0];
    expect(options.body.systemPrompt).toContain('NOT a doctor');
    expect(options.body.systemPrompt).toContain('Never diagnose');
  });

  it('returns fallback when user is not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } });
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('returns fallback on Edge Function error', async () => {
    mockInvokeError(500, 'Internal server error');
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
  });

  it('returns fallback when response has no JSON block', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { text: 'Sorry, I cannot help.', tokensUsed: 10 },
      error: null,
    });
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
  });

  it('returns fallback when JSON has invalid trend', async () => {
    mockInvokeOk({ ...VALID_RESPONSE, trend: 'unknown-trend' });
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
  });

  it('returns fallback when JSON is missing fields', async () => {
    mockInvokeOk({ summary: 'Only summary' });
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
  });

  it('strips markdown fences from response text', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: {
        text: '```json\n' + JSON.stringify(VALID_RESPONSE) + '\n```',
        tokensUsed: 50,
      },
      error: null,
    });
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result.trend).toBe('improving');
  });

  it('returns fallback on network error (invoke throws)', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('Network error'));
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
  });

  it('returns fallback on AbortError (timeout)', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    mockInvoke.mockRejectedValueOnce(abortError);
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
  });

  it('works with empty sleep history', async () => {
    mockInvokeOk(VALID_RESPONSE);
    const request: BriefRequest = {
      ...MINIMAL_REQUEST,
      sleepHistory: [],
      upcomingTransitions: [],
    };
    const result = await generateWeeklyBrief(request);
    expect(result.trend).toBe('improving');
  });
});
