# API Key Migration Spec — Claude API → Supabase Edge Function Proxy

**Priority:** P0 (CTO Audit Finding)
**Status:** Spec Complete — Ready for Implementation
**Owner:** Sim

---

## 1. Current State Analysis

### 1.1 How the Key Is Exposed

`src/lib/ai/claude-client.ts` reads the Anthropic API key directly from client-side environment variables:

```typescript
// Lines 121-123 (generateWeeklyBrief)
const apiKey =
  process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ??
  process.env.EXPO_PUBLIC_CLAUDE_API_KEY;

// Lines 213-215 (generateCompletion) — same pattern
```

Any environment variable prefixed with `EXPO_PUBLIC_` is embedded in the JavaScript bundle at build time by Metro bundler. This means:

- The API key is **literally present as a string** in the compiled JS bundle
- Anyone who downloads the app and inspects the bundle (trivial with standard tools) can extract it
- The key grants **unrestricted access** to the Anthropic API under ShiftWell's billing account
- An attacker could run arbitrary prompts, rack up charges, or abuse the API

### 1.2 Current Data Flow

```
┌──────────┐    EXPO_PUBLIC_ key in bundle     ┌──────────────────┐
│  Mobile   │ ──────────────────────────────── → │ api.anthropic.com │
│  Client   │   POST /v1/messages                │  Claude API       │
│           │   x-api-key: <EXPOSED_KEY>         │                   │
│           │ ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │                   │
└──────────┘   JSON response (brief text)       └──────────────────┘
```

### 1.3 Endpoints and Data in Transit

| Endpoint | Method | What's Sent | What's Returned |
|----------|--------|-------------|-----------------|
| `https://api.anthropic.com/v1/messages` | POST | System prompt, 7-day sleep stats, shift schedule, adherence %, sleep debt | JSON with sleep brief text (~150 words) |

**Models used:** `claude-3-haiku-20240307` (in `generateWeeklyBrief`) and `claude-haiku-4-5` (in `generateCompletion`). Note: model inconsistency — both should use `claude-haiku-4-5`.

**Data sensitivity:** Sleep history, shift schedules, and adherence data are sent. While not PHI (no patient identifiers), this is personal health-adjacent data that should transit through our own infrastructure.

### 1.4 Current Mitigations (Insufficient)

- Code comment warns "Before App Store release, route through Edge Function" (line 8-10)
- Fallback to static brief if key is missing (line 124-127)
- 15-second timeout with abort controller
- No key is currently set in `.env` (placeholder only) — but the architecture is wrong regardless

### 1.5 Other EXPO_PUBLIC_ Variables Audit

| Variable | File | Risk |
|----------|------|------|
| `EXPO_PUBLIC_SUPABASE_URL` | `src/lib/supabase/client.ts` | **Low** — Public by design. URL is not secret. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `src/lib/supabase/client.ts` | **Low** — Anon key is designed for client use. RLS policies enforce auth. |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` | `src/lib/premium/premium-service.ts` | **Low** — RevenueCat public API keys are designed for client embedding. Purchase validation happens server-side at Apple/Google. |
| `EXPO_PUBLIC_ANTHROPIC_API_KEY` | `src/lib/ai/claude-client.ts` | **CRITICAL** — Secret key. Full API access. Must be server-side only. |
| `EXPO_PUBLIC_CLAUDE_API_KEY` | `src/lib/ai/claude-client.ts` | **CRITICAL** — Same issue, alternate var name. |

**Verdict:** Only the Anthropic/Claude API keys are problematic. Supabase anon key and RevenueCat public key are safe by design.

---

## 2. Target Architecture

### 2.1 Overview

```
┌──────────┐  Supabase JWT    ┌─────────────────────┐  ANTHROPIC_API_KEY   ┌──────────────┐
│  Mobile   │ ──────────────→ │ Supabase Edge Fn     │ ──────────────────→ │ Claude API   │
│  Client   │  POST /generate │ generate-brief       │  POST /v1/messages  │              │
│           │                 │                       │                     │              │
│           │ ← ─ ─ ─ ─ ─ ─ │ • Auth check (JWT)    │ ← ─ ─ ─ ─ ─ ─ ─ ─ │              │
│           │  brief JSON     │ • Rate limit (per UID)│  Claude response    │              │
└──────────┘                  │ • Guardrails          │                     └──────────────┘
                              │ • Logging             │
                              └─────────────────────┘
                                ANTHROPIC_API_KEY lives
                                here as a Supabase secret
                                (never reaches client)
```

### 2.2 Design Principles

1. **API key is server-side only** — stored as a Supabase Edge Function secret, never in client code
2. **Authentication required** — Edge Function validates Supabase JWT before proxying
3. **Rate limited per user** — prevents abuse if a user automates requests
4. **Request/response logged** — stored in Supabase table for debugging and usage tracking
5. **Guardrails enforced server-side** — double-check safety even if client is tampered with
6. **Graceful degradation** — client falls back to static brief if Edge Function is unreachable

### 2.3 Rate Limiting Strategy

| Limit | Value | Rationale |
|-------|-------|-----------|
| Per user per day | 5 requests | Weekly brief = 1/week. 5/day is generous for retries. |
| Per user per hour | 3 requests | Prevents rapid-fire abuse |
| Global per minute | 60 requests | Protects Anthropic rate limits at scale |

Rate limits tracked via Supabase table (no Redis needed at current scale).

### 2.4 Fallback Behavior

If the Edge Function is unreachable (network error, 5xx, timeout):

1. Client catches the error
2. Returns the existing `FALLBACK_BRIEF` (static, pre-written)
3. Schedules a retry after 1-hour cooldown (existing behavior in `weekly-brief-scheduler.ts`)
4. No user-facing error — the brief just shows generic coaching text

---

## 3. Implementation Plan

### Phase 1: Create Edge Function (Day 1)

**Step 1.1:** Initialize Supabase functions directory
```bash
supabase functions new generate-brief
```

**Step 1.2:** Set the Anthropic API key as a Supabase secret
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

**Step 1.3:** Create the rate-limit tracking table (new migration)

**Step 1.4:** Write the Edge Function handler (see Section 4.1)

**Step 1.5:** Deploy and smoke test
```bash
supabase functions deploy generate-brief
```

### Phase 2: Update Client (Day 2)

**Step 2.1:** Create `src/lib/ai/edge-function-client.ts` — new client that calls the Edge Function instead of Anthropic directly

**Step 2.2:** Update `src/lib/ai/claude-client.ts` — swap `generateCompletion()` internals to use Edge Function client

**Step 2.3:** Update `src/lib/ai/weekly-brief-generator.ts` — no changes needed (it calls `generateCompletion()` which is the swapped layer)

**Step 2.4:** Run all 1,059 tests — verify nothing breaks

### Phase 3: Clean Up Secrets (Day 3)

**Step 3.1:** Remove `EXPO_PUBLIC_ANTHROPIC_API_KEY` and `EXPO_PUBLIC_CLAUDE_API_KEY` from `.env` and `.env.example`

**Step 3.2:** Remove direct Anthropic fetch logic from `claude-client.ts`

**Step 3.3:** Add `.env` audit to CI — fail build if any `EXPO_PUBLIC_` var contains `ANTHROPIC` or `CLAUDE_API` or `SECRET`

**Step 3.4:** Update `CLAUDE.md` to note the Edge Function architecture

### Phase 4: Testing (Day 3-4)

**Step 4.1:** Unit tests for Edge Function (Deno test runner)
- Auth validation (reject missing/invalid JWT)
- Rate limiting (reject after threshold)
- Guardrail enforcement
- Successful proxy round-trip (mock Anthropic)

**Step 4.2:** Integration test from client
- Authenticated request → brief returned
- Unauthenticated request → 401
- Rate limit exceeded → 429 with retry-after
- Anthropic down → fallback brief

**Step 4.3:** Manual E2E on device
- Generate brief on iOS simulator
- Verify brief appears in UI
- Inspect network traffic — confirm no Anthropic key in any request

---

## 4. Code Samples

### 4.1 Edge Function: `supabase/functions/generate-brief/index.ts`

```typescript
// supabase/functions/generate-brief/index.ts
// Deno runtime — Supabase Edge Functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 300;
const TIMEOUT_MS = 15_000;

// Rate limit constants
const MAX_REQUESTS_PER_HOUR = 3;
const MAX_REQUESTS_PER_DAY = 5;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GenerateBriefRequest {
  systemPrompt: string;
  userMessage: string;
  model?: string;
}

// ---------------------------------------------------------------------------
// Rate Limiting
// ---------------------------------------------------------------------------

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // Count requests in the last hour
  const { count: hourCount } = await supabase
    .from("ai_request_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);

  if ((hourCount ?? 0) >= MAX_REQUESTS_PER_HOUR) {
    return { allowed: false, retryAfterSeconds: 3600 };
  }

  // Count requests in the last 24 hours
  const { count: dayCount } = await supabase
    .from("ai_request_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneDayAgo);

  if ((dayCount ?? 0) >= MAX_REQUESTS_PER_DAY) {
    return { allowed: false, retryAfterSeconds: 86400 };
  }

  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Log request
// ---------------------------------------------------------------------------

async function logRequest(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  model: string,
  tokensUsed: number,
  durationMs: number,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  await supabase.from("ai_request_log").insert({
    user_id: userId,
    model,
    tokens_used: tokensUsed,
    duration_ms: durationMs,
    success,
    error_message: errorMessage ?? null,
  });
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const startTime = Date.now();

  try {
    // -----------------------------------------------------------------------
    // 1. Authenticate via Supabase JWT
    // -----------------------------------------------------------------------
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT and extract user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // -----------------------------------------------------------------------
    // 2. Rate limit check
    // -----------------------------------------------------------------------
    const rateCheck = await checkRateLimit(supabase, user.id);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    // -----------------------------------------------------------------------
    // 3. Parse and validate request body
    // -----------------------------------------------------------------------
    const body: GenerateBriefRequest = await req.json();

    if (!body.systemPrompt || !body.userMessage) {
      return new Response(
        JSON.stringify({ error: "systemPrompt and userMessage are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Cap message length to prevent prompt injection / cost abuse
    if (body.userMessage.length > 2000 || body.systemPrompt.length > 3000) {
      return new Response(
        JSON.stringify({ error: "Message exceeds maximum length" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // -----------------------------------------------------------------------
    // 4. Proxy to Claude API
    // -----------------------------------------------------------------------
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      console.error("ANTHROPIC_API_KEY not configured as secret");
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const model = body.model ?? MODEL;
    // Only allow haiku models to prevent cost abuse
    const allowedModels = ["claude-haiku-4-5", "claude-3-haiku-20240307"];
    if (!allowedModels.includes(model)) {
      return new Response(
        JSON.stringify({ error: `Model not allowed. Use: ${allowedModels.join(", ")}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const claudeResponse = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model,
          max_tokens: MAX_TOKENS,
          system: body.systemPrompt,
          messages: [{ role: "user", content: body.userMessage }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!claudeResponse.ok) {
        const errorBody = await claudeResponse.text();
        console.error(`Claude API error ${claudeResponse.status}:`, errorBody);

        const durationMs = Date.now() - startTime;
        await logRequest(supabase, user.id, model, 0, durationMs, false,
          `Claude API ${claudeResponse.status}`);

        return new Response(
          JSON.stringify({ error: "AI service error", status: claudeResponse.status }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const data = await claudeResponse.json();
      const text = data?.content?.[0]?.text ?? "";
      const tokensUsed =
        (data?.usage?.input_tokens ?? 0) + (data?.usage?.output_tokens ?? 0);

      // Log successful request
      const durationMs = Date.now() - startTime;
      await logRequest(supabase, user.id, model, tokensUsed, durationMs, true);

      return new Response(
        JSON.stringify({
          text,
          tokensUsed,
          model: data.model,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      const isTimeout =
        fetchErr instanceof Error && fetchErr.name === "AbortError";
      const durationMs = Date.now() - startTime;
      await logRequest(supabase, user.id, model, 0, durationMs, false,
        isTimeout ? "Timeout" : String(fetchErr));

      return new Response(
        JSON.stringify({
          error: isTimeout ? "AI request timed out" : "AI service unavailable",
        }),
        {
          status: 504,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    console.error("Unhandled error in generate-brief:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

### 4.2 Shared CORS Helper: `supabase/functions/_shared/cors.ts`

```typescript
// supabase/functions/_shared/cors.ts

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
```

### 4.3 Migration: `supabase/migrations/002_ai_request_log.sql`

```sql
-- Rate limiting and usage tracking for AI requests

CREATE TABLE IF NOT EXISTS ai_request_log (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model       text NOT NULL,
  tokens_used integer NOT NULL DEFAULT 0,
  duration_ms integer NOT NULL DEFAULT 0,
  success     boolean NOT NULL DEFAULT true,
  error_message text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for rate limiting queries (user + time range)
CREATE INDEX idx_ai_request_log_user_time
  ON ai_request_log (user_id, created_at DESC);

-- RLS: users can read their own logs, service role can insert
ALTER TABLE ai_request_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI logs"
  ON ai_request_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert AI logs"
  ON ai_request_log FOR INSERT
  WITH CHECK (true);

-- Auto-cleanup: delete logs older than 90 days (run via pg_cron or manual)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-ai-logs', '0 3 * * 0',
--   $$DELETE FROM ai_request_log WHERE created_at < now() - interval '90 days'$$);

COMMENT ON TABLE ai_request_log IS
  'Tracks AI API usage per user for rate limiting, cost monitoring, and debugging';
```

### 4.4 Updated Client: `src/lib/ai/claude-client.ts` (after migration)

```typescript
/**
 * Claude API client — generates personalized weekly sleep briefs.
 *
 * Routes all requests through the Supabase Edge Function `generate-brief`.
 * The Anthropic API key lives server-side only (Supabase secret).
 * Client authenticates via Supabase JWT.
 *
 * Exports:
 *   generateCompletion — calls Edge Function, returns { text, tokensUsed }
 *   generateWeeklyBrief — high-level pipeline for sleep coach briefs
 */

import { ClaudeAPIError } from './types';
import { supabase } from '../supabase/client';

// ---------------------------------------------------------------------------
// Types (unchanged)
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

const DEFAULT_MODEL = 'claude-haiku-4-5';
const TIMEOUT_MS = 20_000; // slightly longer to account for Edge Function overhead

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
  // Get current session token for auth
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new ClaudeAPIError(401, 'User not authenticated');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const { data, error } = await supabase.functions.invoke('generate-brief', {
      body: { systemPrompt, userMessage, model },
    });

    if (error) {
      // supabase.functions.invoke wraps HTTP errors
      const status = (error as any).status ?? 500;
      throw new ClaudeAPIError(status, error.message ?? 'Edge Function error');
    }

    return {
      text: data.text,
      tokensUsed: data.tokensUsed ?? 0,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------------------------------------------------------------------------
// generateCompletion — public API (now routes through Edge Function)
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
    console.warn('[claude-client] Edge Function error — returning fallback', err);
    return FALLBACK_BRIEF;
  }
}

export { FALLBACK_BRIEF };
```

### 4.5 Environment Variable Cleanup

**Remove from `.env` and `.env.example`:**
```diff
- EXPO_PUBLIC_ANTHROPIC_API_KEY=...
- EXPO_PUBLIC_CLAUDE_API_KEY=...
```

**Add to `.env.example` (documentation only):**
```bash
# AI API key is stored as a Supabase Edge Function secret.
# Set it with: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
# It is NOT an EXPO_PUBLIC_ variable — it never reaches the client.
```

### 4.6 CI Guard: Prevent Future Secret Leaks

Add to CI pipeline (GitHub Actions or similar):

```yaml
# .github/workflows/secret-guard.yml
name: Secret Guard
on: [push, pull_request]

jobs:
  check-exposed-secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check for exposed secrets in EXPO_PUBLIC_ vars
        run: |
          # Fail if any EXPO_PUBLIC_ var references known secret patterns
          VIOLATIONS=$(grep -rn 'EXPO_PUBLIC_.*\(ANTHROPIC\|CLAUDE_API\|SECRET\|PRIVATE\)' \
            --include='*.ts' --include='*.tsx' --include='*.js' --include='*.env*' \
            src/ .env* || true)
          if [ -n "$VIOLATIONS" ]; then
            echo "::error::Secret key exposed via EXPO_PUBLIC_ variable!"
            echo "$VIOLATIONS"
            exit 1
          fi
          echo "No exposed secrets found."
```

---

## 5. Rollout Plan

### 5.1 Deployment Sequence

Since no users are on the app yet (pre-TestFlight), this is a clean cutover — no backward compatibility needed.

| Step | Action | Rollback |
|------|--------|----------|
| 1 | Apply migration `002_ai_request_log.sql` to Supabase | Drop table |
| 2 | Deploy `generate-brief` Edge Function | `supabase functions delete generate-brief` |
| 3 | Set `ANTHROPIC_API_KEY` secret | `supabase secrets unset ANTHROPIC_API_KEY` |
| 4 | Smoke test Edge Function via `curl` (see below) | — |
| 5 | Merge client code changes | Revert commit |
| 6 | Remove `EXPO_PUBLIC_ANTHROPIC_API_KEY` from `.env` | Re-add (temporary) |
| 7 | Run full test suite (`npm test` — 1,059 tests) | Fix failures before proceeding |
| 8 | Build with EAS, verify no API key in bundle | `strings` check on built JS |
| 9 | Submit to TestFlight | — |

### 5.2 Smoke Test Command

```bash
# Get a fresh JWT by signing in
TOKEN=$(curl -s -X POST \
  'https://<PROJECT>.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: <ANON_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@shiftwell.app","password":"testpass123"}' \
  | jq -r '.access_token')

# Call the Edge Function
curl -X POST \
  'https://<PROJECT>.supabase.co/functions/v1/generate-brief' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "systemPrompt": "You are a sleep coach. Be brief.",
    "userMessage": "Past 7 nights: 78% adherence, 2.1h sleep debt. Generate a test brief."
  }'
```

### 5.3 Bundle Verification

After EAS build, verify no API key leaked:

```bash
# Extract the JS bundle from the .ipa
unzip -o build.ipa -d extracted_ipa
# Search for any Anthropic key patterns
grep -r 'sk-ant-' extracted_ipa/ && echo "FAIL: Key found!" || echo "PASS: No key in bundle"
grep -r 'ANTHROPIC_API_KEY' extracted_ipa/ && echo "FAIL: Key ref found!" || echo "PASS: Clean"
```

### 5.4 Post-Migration Monitoring

After deploy, watch for:

- **ai_request_log table:** Verify requests are logged with correct user IDs and token counts
- **Edge Function logs:** `supabase functions logs generate-brief` — watch for 4xx/5xx spikes
- **Anthropic dashboard:** Confirm usage matches expected patterns (1 brief/user/week)

---

## 6. Open Questions

1. **Model consolidation:** `generateWeeklyBrief` uses `claude-3-haiku-20240307` while `generateCompletion` uses `claude-haiku-4-5`. Recommend standardizing on `claude-haiku-4-5` during this migration.

2. **Server-side guardrails:** Currently guardrails run client-side in `weekly-brief-generator.ts`. Consider also running them in the Edge Function so a tampered client can't bypass them. Tradeoff: adds latency. Recommendation: add them server-side for defense-in-depth.

3. **Cost tracking:** The `ai_request_log` table captures `tokens_used`. Consider adding a dashboard query or scheduled report for cost monitoring as user count grows.

4. **Premium gating:** Weekly briefs are a premium feature. The Edge Function should eventually check subscription status before proxying. For now, auth alone is sufficient since the feature is only surfaced in premium UI.

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial spec. Covers full migration from client-side Anthropic API key to Supabase Edge Function proxy. All code samples tested for syntactic correctness. EXPO_PUBLIC_ audit completed — only Anthropic keys are problematic.
