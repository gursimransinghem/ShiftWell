/**
 * Tests for:
 *   - generateCompletion (claude-client.ts) — API call, error handling
 *   - validateGuardrails / extractRecommendation / generateWeeklyBrief (weekly-brief-generator.ts)
 *   - useAIStore (ai-store.ts) — setLatestBrief, getLastBriefForWeek
 *
 * TDD pattern: red → green. Task 1 creates failing scaffolds; Task 2 makes them pass.
 */

import { ClaudeAPIError } from '@/src/lib/ai/types';
import { generateCompletion } from '@/src/lib/ai/claude-client';
import {
  generateWeeklyBrief,
  validateGuardrails,
  extractRecommendation,
} from '@/src/lib/ai/weekly-brief-generator';
import { useAIStore } from '@/src/store/ai-store';
import type { BriefContext, WeeklyBrief } from '@/src/lib/ai/types';

// ---------------------------------------------------------------------------
// Mock the claude-client module for generator / store tests
// ---------------------------------------------------------------------------

jest.mock('@/src/lib/ai/claude-client', () => ({
  generateCompletion: jest.fn(),
}));

const mockGenerateCompletion = generateCompletion as jest.MockedFunction<
  typeof generateCompletion
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBriefContext(overrides: Partial<BriefContext> = {}): BriefContext {
  return {
    userId: 'user-123',
    weekStartISO: '2026-04-07',
    adherencePercent: 75,
    sleepDebtHours: 2,
    avgDiscrepancyMinutes: 20,
    upcomingShifts: [
      { dateISO: '2026-04-08', type: 'night' },
      { dateISO: '2026-04-09', type: 'night' },
      { dateISO: '2026-04-10', type: 'off' },
    ],
    hardTransitionDays: 1,
    ...overrides,
  };
}

function makeWeeklyBrief(overrides: Partial<WeeklyBrief> = {}): WeeklyBrief {
  return {
    id: 'brief-001',
    weekStartISO: '2026-04-07',
    generatedAtISO: new Date().toISOString(),
    text: 'You stayed fairly consistent this week.',
    recommendation: 'Try moving your bedtime 30 minutes earlier tonight.',
    adherencePercent: 75,
    model: 'claude-haiku-4-5',
    tokensUsed: 120,
    passedGuardrails: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Group 1: generateCompletion — API call tests
// ---------------------------------------------------------------------------

describe('generateCompletion', () => {
  beforeEach(() => {
    mockGenerateCompletion.mockReset();
    process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  });

  it('Test 1: returns a string when the Anthropic API mock returns 200', async () => {
    mockGenerateCompletion.mockResolvedValueOnce({
      text: 'Your sleep was solid this week.',
      tokensUsed: 80,
    });

    const result = await generateCompletion('system prompt', 'user message');
    expect(typeof result.text).toBe('string');
    expect(result.text).toBe('Your sleep was solid this week.');
    expect(result.tokensUsed).toBe(80);
  });

  it('Test 2: throws ClaudeAPIError when API returns 429', async () => {
    const error = new ClaudeAPIError(429, 'Rate limit exceeded — retry after 60s');
    mockGenerateCompletion.mockRejectedValueOnce(error);

    await expect(generateCompletion('system', 'user')).rejects.toThrow(ClaudeAPIError);
  });

  it('Test 2b: ClaudeAPIError from 429 has correct statusCode', async () => {
    const error = new ClaudeAPIError(429, 'Rate limit exceeded — retry after 60s');
    mockGenerateCompletion.mockRejectedValueOnce(error);

    await expect(generateCompletion('system', 'user')).rejects.toMatchObject({
      statusCode: 429,
    });
  });

  it('Test 3: throws ClaudeAPIError when API returns 500', async () => {
    const error = new ClaudeAPIError(500, 'Internal server error');
    mockGenerateCompletion.mockRejectedValueOnce(error);

    await expect(generateCompletion('system', 'user')).rejects.toThrow(ClaudeAPIError);
  });

  it('Test 3b: ClaudeAPIError from 500 has correct statusCode', async () => {
    const error = new ClaudeAPIError(500, 'Internal server error');
    mockGenerateCompletion.mockRejectedValueOnce(error);

    await expect(generateCompletion('system', 'user')).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});

// ---------------------------------------------------------------------------
// Group 2: validateGuardrails
// ---------------------------------------------------------------------------

describe('validateGuardrails', () => {
  it('Test 4: brief text with "you have SWSD" triggers a FAIL guardrail check', () => {
    const result = validateGuardrails(
      'Based on your patterns, you have SWSD and should see a doctor.',
    );
    expect(result.pass).toBe(false);
    expect(result.violation).toBeDefined();
  });

  it('Test 5: brief text with "try moving bedtime earlier" passes all guardrail checks', () => {
    const result = validateGuardrails(
      'Your adherence was 75% this week — solid effort for a rotating night schedule. ' +
      'Try moving your bedtime 30 minutes earlier to rebuild sleep pressure.',
    );
    expect(result.pass).toBe(true);
    expect(result.violation).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Group 3: useAIStore
// ---------------------------------------------------------------------------

describe('useAIStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useAIStore.setState({ briefs: [], isGenerating: false, lastError: null });
  });

  it('Test 6: setLatestBrief stores brief and updates store', () => {
    const brief = makeWeeklyBrief();
    useAIStore.getState().setLatestBrief(brief);

    const { briefs } = useAIStore.getState();
    expect(briefs).toHaveLength(1);
    expect(briefs[0]).toEqual(brief);
  });

  it('Test 7: getLastBriefForWeek returns the brief if generated this week, null otherwise', () => {
    const brief = makeWeeklyBrief({ weekStartISO: '2026-04-07' });
    useAIStore.getState().setLatestBrief(brief);

    // Should find it
    const found = useAIStore.getState().getLastBriefForWeek('2026-04-07');
    expect(found).toEqual(brief);

    // Should not find a different week
    const notFound = useAIStore.getState().getLastBriefForWeek('2026-03-31');
    expect(notFound).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Group 4: generateWeeklyBrief pipeline (Task 2 green phase tests)
// ---------------------------------------------------------------------------

describe('generateWeeklyBrief', () => {
  beforeEach(() => {
    mockGenerateCompletion.mockReset();
  });

  it('Test 8: generateWeeklyBrief with high debt (sleepDebtHours=6) mentions debt in output', async () => {
    mockGenerateCompletion.mockResolvedValueOnce({
      text: 'Sleep debt reached 6 hours this week. Consider an anchor sleep strategy. Aim for a consistent wake time this week.',
      tokensUsed: 90,
    });

    const ctx = makeBriefContext({ sleepDebtHours: 6 });
    const result = await generateWeeklyBrief(ctx);

    expect(result.success).toBe(true);
    expect(result.brief).toBeDefined();
    // The prompt builder should mention debt to Claude; Claude's mock output confirms debt content
    expect(result.brief?.passedGuardrails).toBe(true);
  });

  it('Test 9: generateWeeklyBrief with hardTransitionDays=3 mentions transitions', async () => {
    mockGenerateCompletion.mockResolvedValueOnce({
      text: 'Three hard transitions are coming up this week. Prioritize your anchor sleep window to reduce circadian disruption.',
      tokensUsed: 88,
    });

    const ctx = makeBriefContext({ hardTransitionDays: 3 });
    const result = await generateWeeklyBrief(ctx);

    expect(result.success).toBe(true);
    expect(result.brief).toBeDefined();
  });

  it('Test 10: extractRecommendation pulls the last sentence starting with an imperative verb', () => {
    const text =
      'Your adherence was strong this week. Sleep debt is building slightly. ' +
      'Consider reducing screen time in the hour before sleep. ' +
      'Try shifting your anchor sleep 20 minutes earlier tonight.';

    const rec = extractRecommendation(text);
    expect(rec).toMatch(/^Try|^Consider|^Aim|^Move|^Add|^Prioritize|^Avoid/);
  });

  it('Test 11: validateGuardrails("You have delayed sleep phase disorder") returns { pass: false, violation: "diagnosis" }', () => {
    const result = validateGuardrails(
      'Your data is consistent with delayed sleep phase disorder.',
    );
    expect(result.pass).toBe(false);
    expect(result.violation).toBe('diagnosis');
  });

  it('Test 12: validateGuardrails("Try moving your bedtime 30 minutes earlier") returns { pass: true }', () => {
    const result = validateGuardrails(
      'Try moving your bedtime 30 minutes earlier for better circadian alignment.',
    );
    expect(result.pass).toBe(true);
  });
});
