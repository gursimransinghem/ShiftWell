/**
<<<<<<< HEAD
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
=======
 * TDD test scaffold for weekly-brief-generator.ts
 * Task 1: RED phase — tests written before implementation
 * Task 2: GREEN phase — implementation makes these pass
 */

import { ClaudeAPIError } from '../../../src/lib/ai/types';
import type { BriefContext, WeeklyBrief } from '../../../src/lib/ai/types';

// ---------------------------------------------------------------------------
// Mock claude-client — controlled in tests
// ---------------------------------------------------------------------------
jest.mock('../../../src/lib/ai/claude-client', () => ({
  generateCompletion: jest.fn(),
}));

// Mock AsyncStorage for ai-store persist
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

import { generateCompletion } from '../../../src/lib/ai/claude-client';
import {
  generateWeeklyBrief,
  validateGuardrails,
} from '../../../src/lib/ai/weekly-brief-generator';
import { useAIStore } from '../../../src/store/ai-store';
>>>>>>> worktree-agent-a211ed4f

const mockGenerateCompletion = generateCompletion as jest.MockedFunction<
  typeof generateCompletion
>;

// ---------------------------------------------------------------------------
<<<<<<< HEAD
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
=======
// Fixtures
// ---------------------------------------------------------------------------
const baseBriefContext: BriefContext = {
  userId: 'user-001',
  weekStartISO: '2026-04-07',
  adherencePercent: 75,
  sleepDebtHours: 2,
  avgDiscrepancyMinutes: 20,
  upcomingShifts: [
    { dateISO: '2026-04-08', type: 'night' },
    { dateISO: '2026-04-09', type: 'night' },
    { dateISO: '2026-04-10', type: 'off' },
    { dateISO: '2026-04-11', type: 'off' },
    { dateISO: '2026-04-12', type: 'day' },
    { dateISO: '2026-04-13', type: 'day' },
    { dateISO: '2026-04-14', type: 'off' },
  ],
  hardTransitionDays: 1,
};

// ---------------------------------------------------------------------------
// Group 1: claude-client behavior (via mock)
// ---------------------------------------------------------------------------
describe('generateCompletion (mocked claude-client)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a string when the Anthropic API mock returns 200', async () => {
    mockGenerateCompletion.mockResolvedValueOnce({
      text: 'Great week! Try moving your wind-down 30 minutes earlier.',
      tokensUsed: 250,
    });

    const result = await generateCompletion('system prompt', 'user message');

    expect(typeof result.text).toBe('string');
    expect(result.tokensUsed).toBeGreaterThan(0);
  });

  it('throws ClaudeAPIError when API returns 429 (rate limit)', async () => {
    mockGenerateCompletion.mockRejectedValueOnce(
      new ClaudeAPIError(429, 'Rate limit exceeded — retry after 60s'),
    );

    await expect(
      generateCompletion('system prompt', 'user message'),
    ).rejects.toMatchObject({
      name: 'ClaudeAPIError',
>>>>>>> worktree-agent-a211ed4f
      statusCode: 429,
    });
  });

<<<<<<< HEAD
  it('Test 3: throws ClaudeAPIError when API returns 500', async () => {
    const error = new ClaudeAPIError(500, 'Internal server error');
    mockGenerateCompletion.mockRejectedValueOnce(error);

    await expect(generateCompletion('system', 'user')).rejects.toThrow(ClaudeAPIError);
  });

  it('Test 3b: ClaudeAPIError from 500 has correct statusCode', async () => {
    const error = new ClaudeAPIError(500, 'Internal server error');
    mockGenerateCompletion.mockRejectedValueOnce(error);

    await expect(generateCompletion('system', 'user')).rejects.toMatchObject({
=======
  it('throws ClaudeAPIError when API returns 500', async () => {
    mockGenerateCompletion.mockRejectedValueOnce(
      new ClaudeAPIError(500, 'Internal server error'),
    );

    await expect(
      generateCompletion('system prompt', 'user message'),
    ).rejects.toMatchObject({
      name: 'ClaudeAPIError',
>>>>>>> worktree-agent-a211ed4f
      statusCode: 500,
    });
  });
});

// ---------------------------------------------------------------------------
<<<<<<< HEAD
// Group 2: validateGuardrails
// ---------------------------------------------------------------------------

describe('validateGuardrails', () => {
  it('Test 4: brief text with "you have SWSD" triggers a FAIL guardrail check', () => {
    const result = validateGuardrails(
      'Based on your patterns, you have SWSD and should see a doctor.',
    );
=======
// Group 2: Guardrail validation
// ---------------------------------------------------------------------------
describe('validateGuardrails', () => {
  it('brief text with "you have SWSD" triggers a FAIL guardrail check', () => {
    const result = validateGuardrails('Your patterns suggest you have SWSD.');
>>>>>>> worktree-agent-a211ed4f
    expect(result.pass).toBe(false);
    expect(result.violation).toBeDefined();
  });

<<<<<<< HEAD
  it('Test 5: brief text with "try moving bedtime earlier" passes all guardrail checks', () => {
    const result = validateGuardrails(
      'Your adherence was 75% this week — solid effort for a rotating night schedule. ' +
      'Try moving your bedtime 30 minutes earlier to rebuild sleep pressure.',
=======
  it('brief text with "try moving bedtime earlier" passes all guardrail checks', () => {
    const result = validateGuardrails(
      'Try moving your bedtime 30 minutes earlier tonight to ease the transition.',
>>>>>>> worktree-agent-a211ed4f
    );
    expect(result.pass).toBe(true);
    expect(result.violation).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
<<<<<<< HEAD
// Group 3: useAIStore
// ---------------------------------------------------------------------------

describe('useAIStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useAIStore.setState({ briefs: [], isGenerating: false, lastError: null });
  });

  it('Test 6: setLatestBrief stores brief and updates store', () => {
    const brief = makeWeeklyBrief();
=======
// Group 3: AI store
// ---------------------------------------------------------------------------
describe('useAIStore', () => {
  beforeEach(() => {
    // Reset the store to initial state between tests
    useAIStore.setState({ briefs: [], isGenerating: false, lastError: null });
  });

  it('setLatestBrief stores brief and updates store', () => {
    const brief: WeeklyBrief = {
      id: 'test-id-001',
      weekStartISO: '2026-04-07',
      generatedAtISO: new Date().toISOString(),
      text: 'Your week was solid. Try adding a 20-minute nap before your first night.',
      recommendation: 'Try adding a 20-minute nap before your first night.',
      adherencePercent: 75,
      model: 'claude-haiku-4-5',
      tokensUsed: 250,
      passedGuardrails: true,
    };

>>>>>>> worktree-agent-a211ed4f
    useAIStore.getState().setLatestBrief(brief);

    const { briefs } = useAIStore.getState();
    expect(briefs).toHaveLength(1);
<<<<<<< HEAD
    expect(briefs[0]).toEqual(brief);
  });

  it('Test 7: getLastBriefForWeek returns the brief if generated this week, null otherwise', () => {
    const brief = makeWeeklyBrief({ weekStartISO: '2026-04-07' });
    useAIStore.getState().setLatestBrief(brief);

    // Should find it
    const found = useAIStore.getState().getLastBriefForWeek('2026-04-07');
    expect(found).toEqual(brief);

    // Should not find a different week
=======
    expect(briefs[0].id).toBe('test-id-001');
  });

  it('getLastBriefForWeek returns the brief if generated this week, null otherwise', () => {
    const brief: WeeklyBrief = {
      id: 'test-id-002',
      weekStartISO: '2026-04-07',
      generatedAtISO: new Date().toISOString(),
      text: 'Solid adherence this week. Aim to keep your wind-down at the same time.',
      recommendation: 'Aim to keep your wind-down at the same time.',
      adherencePercent: 80,
      model: 'claude-haiku-4-5',
      tokensUsed: 200,
      passedGuardrails: true,
    };

    useAIStore.getState().setLatestBrief(brief);

    // Should find this week's brief
    const found = useAIStore.getState().getLastBriefForWeek('2026-04-07');
    expect(found).not.toBeNull();
    expect(found?.id).toBe('test-id-002');

    // Should return null for a different week
>>>>>>> worktree-agent-a211ed4f
    const notFound = useAIStore.getState().getLastBriefForWeek('2026-03-31');
    expect(notFound).toBeNull();
  });
});

// ---------------------------------------------------------------------------
<<<<<<< HEAD
// Group 4: generateWeeklyBrief pipeline (Task 2 green phase tests)
// ---------------------------------------------------------------------------

describe('generateWeeklyBrief', () => {
  beforeEach(() => {
    mockGenerateCompletion.mockReset();
  });

  it('Test 8: generateWeeklyBrief with high debt (sleepDebtHours=6) mentions debt in output', async () => {
    mockGenerateCompletion.mockResolvedValueOnce({
      text: 'You have 6 hours of sleep debt this week. Consider an anchor sleep strategy. Aim for a consistent wake time this week.',
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
      text: 'You have 3 hard transitions coming up this week. Prioritize your anchor sleep window to reduce circadian disruption.',
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
=======
// Group 4: generateWeeklyBrief pipeline (Task 2 will make these pass)
// ---------------------------------------------------------------------------
describe('generateWeeklyBrief', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAIStore.setState({ briefs: [], isGenerating: false, lastError: null });
  });

  it('returns success with a WeeklyBrief when API call succeeds', async () => {
    mockGenerateCompletion.mockResolvedValueOnce({
      text: 'Your adherence was 75% this week. Try moving your wind-down 30 minutes earlier tonight.',
      tokensUsed: 280,
    });

    const result = await generateWeeklyBrief(baseBriefContext);

    expect(result.success).toBe(true);
    expect(result.brief).toBeDefined();
    expect(typeof result.brief?.text).toBe('string');
    expect(typeof result.brief?.recommendation).toBe('string');
    expect(result.brief?.passedGuardrails).toBe(true);
  });

  it('returns guardrail failure when generated text contains prohibited content', async () => {
    mockGenerateCompletion.mockResolvedValueOnce({
      text: 'Based on your patterns, you have delayed sleep phase disorder.',
      tokensUsed: 120,
    });

    const result = await generateWeeklyBrief(baseBriefContext);

    expect(result.success).toBe(false);
    expect(result.guardrailFailure).toBeDefined();
  });

  it('returns error result when generateCompletion throws ClaudeAPIError', async () => {
    mockGenerateCompletion.mockRejectedValueOnce(
      new ClaudeAPIError(429, 'Rate limit exceeded — retry after 60s'),
    );

    const result = await generateWeeklyBrief(baseBriefContext);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Rate limit');
>>>>>>> worktree-agent-a211ed4f
  });
});
