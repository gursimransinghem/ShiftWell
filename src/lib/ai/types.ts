<<<<<<< HEAD
/**
 * AI types — WeeklyBrief, BriefContext, BriefGenerationResult, ClaudeAPIError.
 *
 * Used by claude-client.ts (generateCompletion), weekly-brief-generator.ts,
 * and ai-store.ts.
 */

=======
>>>>>>> worktree-agent-a211ed4f
export interface BriefContext {
  userId: string;
  weekStartISO: string;           // Monday date (yyyy-MM-dd)
  adherencePercent: number;       // 0-100, past 7 nights
  sleepDebtHours: number;         // Current debt from debt engine
  avgDiscrepancyMinutes: number;  // Mean |delta.startMinutes| past 7 nights
  upcomingShifts: {               // Next 7 days
    dateISO: string;
    type: 'day' | 'evening' | 'night' | 'off';
  }[];
  hardTransitionDays: number;     // Count of transitions >= 8h circadian phase shift
}

export interface WeeklyBrief {
  id: string;                     // UUID
  weekStartISO: string;
  generatedAtISO: string;
  text: string;                   // Claude's output (max 150 words)
  recommendation: string;         // The single actionable recommendation
  adherencePercent: number;       // Snapshot at generation time
  model: string;                  // e.g. "claude-haiku-4-5"
  tokensUsed: number;
  passedGuardrails: boolean;
}

export interface BriefGenerationResult {
  success: boolean;
  brief?: WeeklyBrief;
  error?: string;
  guardrailFailure?: string;
}

export class ClaudeAPIError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ClaudeAPIError';
  }
}
