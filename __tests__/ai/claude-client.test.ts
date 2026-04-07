/**
 * claude-client tests (Phase 20)
 *
 * Mocks fetch — never calls the real Claude API.
 * Tests: prompt construction, JSON parsing, timeout, fallback behavior.
 */

import { generateWeeklyBrief, FALLBACK_BRIEF } from '../../src/lib/ai/claude-client';
import type { BriefRequest } from '../../src/lib/ai/claude-client';

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

const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv, EXPO_PUBLIC_CLAUDE_API_KEY: 'test-key-123' };
  global.fetch = jest.fn();
});

afterEach(() => {
  process.env = originalEnv;
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function mockFetchOk(body: object) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      content: [{ text: JSON.stringify(body) }],
    }),
  });
}

function mockFetchError(status: number) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({}),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateWeeklyBrief', () => {
  it('returns parsed response on success', async () => {
    mockFetchOk(VALID_RESPONSE);
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result.summary).toBe(VALID_RESPONSE.summary);
    expect(result.trend).toBe('improving');
    expect(result.recommendation).toBe(VALID_RESPONSE.recommendation);
    expect(result.encouragement).toBe(VALID_RESPONSE.encouragement);
  });

  it('sends correct headers to Anthropic API', async () => {
    mockFetchOk(VALID_RESPONSE);
    await generateWeeklyBrief(MINIMAL_REQUEST);

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(options.headers['x-api-key']).toBe('test-key-123');
    expect(options.headers['anthropic-version']).toBe('2023-06-01');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('includes sleep history and debt data in prompt', async () => {
    mockFetchOk(VALID_RESPONSE);
    await generateWeeklyBrief(MINIMAL_REQUEST);

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body);
    const userMessage: string = body.messages[0].content;

    expect(userMessage).toContain('2026-01-05');
    expect(userMessage).toContain('day-to-night');
    expect(userMessage).toContain('streakDays' in MINIMAL_REQUEST ? '4' : '');
    expect(userMessage).toContain('1.5');
  });

  it('includes safety system prompt', async () => {
    mockFetchOk(VALID_RESPONSE);
    await generateWeeklyBrief(MINIMAL_REQUEST);

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.system).toContain('NOT a doctor');
    expect(body.system).toContain('Never diagnose');
  });

  it('returns fallback when API key is missing', async () => {
    delete process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns fallback on non-OK HTTP response', async () => {
    mockFetchError(500);
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
  });

  it('returns fallback when response has no JSON block', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [{ text: 'Sorry, I cannot help.' }] }),
    });
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
  });

  it('returns fallback when JSON has invalid trend', async () => {
    mockFetchOk({ ...VALID_RESPONSE, trend: 'unknown-trend' });
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
  });

  it('returns fallback when JSON is missing fields', async () => {
    mockFetchOk({ summary: 'Only summary' });
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
  });

  it('strips markdown fences from response text', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [
          {
            text: '```json\n' + JSON.stringify(VALID_RESPONSE) + '\n```',
          },
        ],
      }),
    });
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result.trend).toBe('improving');
  });

  it('returns fallback on network error (fetch throws)', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
  });

  it('returns fallback on AbortError (timeout)', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);
    const result = await generateWeeklyBrief(MINIMAL_REQUEST);
    expect(result).toEqual(FALLBACK_BRIEF);
  });

  it('works with empty sleep history', async () => {
    mockFetchOk(VALID_RESPONSE);
    const request: BriefRequest = {
      ...MINIMAL_REQUEST,
      sleepHistory: [],
      upcomingTransitions: [],
    };
    const result = await generateWeeklyBrief(request);
    expect(result.trend).toBe('improving');
  });
});
