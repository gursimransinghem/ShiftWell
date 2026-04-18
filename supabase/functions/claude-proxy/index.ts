// supabase/functions/claude-proxy/index.ts
// Deno runtime — Supabase Edge Functions
// Proxies Claude API requests; API key lives server-side only.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 300;
const TIMEOUT_MS = 15_000;

const MAX_REQUESTS_PER_HOUR = 3;
const MAX_REQUESTS_PER_DAY = 5;

const ALLOWED_MODELS = [
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6",
] as const;

interface GenerateRequest {
  systemPrompt: string;
  userMessage: string;
  model?: string;
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const now = Date.now();
  const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const { count: hourCount } = await supabase
    .from("ai_request_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);

  if ((hourCount ?? 0) >= MAX_REQUESTS_PER_HOUR) {
    return { allowed: false, retryAfterSeconds: 3600 };
  }

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
// Request logging
// ---------------------------------------------------------------------------

async function logRequest(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  model: string,
  tokensUsed: number,
  durationMs: number,
  success: boolean,
  errorMessage?: string,
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
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        },
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
        },
      );
    }

    // -----------------------------------------------------------------------
    // 3. Parse and validate request body
    // -----------------------------------------------------------------------
    let body: GenerateRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!body.systemPrompt || !body.userMessage) {
      return new Response(
        JSON.stringify({ error: "systemPrompt and userMessage are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (body.userMessage.length > 2000 || body.systemPrompt.length > 3000) {
      return new Response(
        JSON.stringify({ error: "Message exceeds maximum length" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // -----------------------------------------------------------------------
    // 4. Model allowlist
    // -----------------------------------------------------------------------
    const model = body.model ?? DEFAULT_MODEL;
    if (!(ALLOWED_MODELS as readonly string[]).includes(model)) {
      return new Response(
        JSON.stringify({
          error: `Model not allowed. Permitted: ${ALLOWED_MODELS.join(", ")}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // -----------------------------------------------------------------------
    // 5. Proxy to Claude API
    // -----------------------------------------------------------------------
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      console.error("ANTHROPIC_API_KEY secret not configured");
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const claudeRes = await fetch(ANTHROPIC_API_URL, {
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

      if (!claudeRes.ok) {
        const errBody = await claudeRes.text();
        console.error(`Claude API error ${claudeRes.status}:`, errBody);
        await logRequest(
          supabase, user.id, model, 0, Date.now() - startTime,
          false, `Claude API ${claudeRes.status}`,
        );
        return new Response(
          JSON.stringify({ error: "AI service error", status: claudeRes.status }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const data = await claudeRes.json();
      const text: string = data?.content?.[0]?.text ?? "";
      const tokensUsed: number =
        (data?.usage?.input_tokens ?? 0) + (data?.usage?.output_tokens ?? 0);

      await logRequest(
        supabase, user.id, model, tokensUsed, Date.now() - startTime, true,
      );

      return new Response(
        JSON.stringify({ text, tokensUsed, model: data.model }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      const isTimeout = fetchErr instanceof Error && fetchErr.name === "AbortError";
      await logRequest(
        supabase, user.id, model, 0, Date.now() - startTime,
        false, isTimeout ? "Timeout" : String(fetchErr),
      );
      return new Response(
        JSON.stringify({
          error: isTimeout ? "AI request timed out" : "AI service unavailable",
        }),
        {
          status: isTimeout ? 504 : 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (err) {
    console.error("Unhandled error in claude-proxy:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
