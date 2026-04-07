/**
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

const mockGenerateCompletion = generateCompletion as jest.MockedFunction<
  typeof generateCompletion
>;

// ---------------------------------------------------------------------------
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
      statusCode: 429,
    });
  });

  it('throws ClaudeAPIError when API returns 500', async () => {
    mockGenerateCompletion.mockRejectedValueOnce(
      new ClaudeAPIError(500, 'Internal server error'),
    );

    await expect(
      generateCompletion('system prompt', 'user message'),
    ).rejects.toMatchObject({
      name: 'ClaudeAPIError',
      statusCode: 500,
    });
  });
});

// ---------------------------------------------------------------------------
// Group 2: Guardrail validation
// ---------------------------------------------------------------------------
describe('validateGuardrails', () => {
  it('brief text with "you have SWSD" triggers a FAIL guardrail check', () => {
    const result = validateGuardrails('Your patterns suggest you have SWSD.');
    expect(result.pass).toBe(false);
    expect(result.violation).toBeDefined();
  });

  it('brief text with "try moving bedtime earlier" passes all guardrail checks', () => {
    const result = validateGuardrails(
      'Try moving your bedtime 30 minutes earlier tonight to ease the transition.',
    );
    expect(result.pass).toBe(true);
    expect(result.violation).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
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

    useAIStore.getState().setLatestBrief(brief);

    const { briefs } = useAIStore.getState();
    expect(briefs).toHaveLength(1);
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
    const notFound = useAIStore.getState().getLastBriefForWeek('2026-03-31');
    expect(notFound).toBeNull();
  });
});

// ---------------------------------------------------------------------------
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
  });
});
