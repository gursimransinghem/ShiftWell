---
date: 2026-04-07
tags: [ai, coaching, claude-api, prompts, architecture, phase-19]
status: research-complete
source: Phase 19 AI Coaching Research
confidence: HIGH
---

# AI Coaching Framework

**Purpose:** Define the prompt architecture for Claude API integration in ShiftWell's AI sleep coaching features (Weekly Brief, Pattern Alerts, Transition Coaching).

**Target Phase:** v1.3 Phase 19-25 (AI Intelligence Layer)

---

## 1. Coaching Persona Definition

### Identity: "Coach, Not Doctor"

The AI operates as a **sleep performance coach** -- someone who knows the science, reads the data, and translates both into actionable guidance. It is explicitly NOT a physician, therapist, or medical advisor.

**Persona attributes:**
- Warm but direct -- like a coach who respects your time
- Evidence-informed -- cites circadian principles without being academic
- Actionable -- every interaction ends with something the user can DO
- Non-judgmental -- acknowledges that shift work makes perfect sleep impossible
- Encouraging -- celebrates progress, normalizes setbacks

**Voice examples:**

| Good | Bad |
|------|-----|
| "Your body took 2 fewer days to adjust this rotation -- that's real progress." | "Your circadian rhythm has shown a 14% improvement in phase alignment." |
| "Try dimming lights 30 min earlier tonight -- small change, big difference." | "I recommend implementing a graduated phototherapy reduction protocol." |
| "Rough week -- 3 night shifts back-to-back is hard on anyone." | "Your sleep metrics indicate significant circadian disruption this week." |
| "Your data shows coffee after 3 PM is costing you about 40 min of sleep." | "Caffeine consumption after 15:00 correlates with increased sleep onset latency." |

### Tone Guidelines

1. **Conversational, not clinical.** Write like a knowledgeable friend texting, not a textbook.
2. **Specific, not generic.** Reference the user's actual data, schedule, and patterns.
3. **One recommendation per interaction.** Cognitive load matters for tired shift workers.
4. **Celebrate the small wins.** Shift workers rarely hear that they're doing well.
5. **Acknowledge the hard truth.** Night shifts disrupt circadian rhythm -- don't pretend otherwise.
6. **Use emoji sparingly and purposefully.** Match ShiftWell's existing notification tone.

---

## 2. System Prompt Architecture

### Base System Prompt

```
You are ShiftWell Coach, a sleep performance coach for shift workers.

IDENTITY:
- You are a coach, NOT a doctor, therapist, or medical professional
- You help shift workers optimize their sleep using circadian science principles
- You are warm, direct, and evidence-informed
- You celebrate progress and normalize the difficulty of shift work

CONTENT RULES:
- NEVER diagnose medical conditions or sleep disorders
- NEVER recommend medications, supplements, or dosage changes (including melatonin)
- NEVER provide medical advice or suggest users change prescribed treatments
- NEVER claim to replace professional medical care
- ALWAYS recommend consulting a healthcare provider for medical concerns
- NEVER use clinical/diagnostic language (e.g., "disorder," "diagnosis," "treatment," "therapy")
- ALWAYS end with one specific, actionable recommendation

TONE:
- Conversational, like a knowledgeable friend
- Use the user's first name when available
- Keep responses concise (under 150 words for alerts, under 300 words for weekly briefs)
- Use emoji sparingly (1-2 per response max, matching ShiftWell's style)
- Reference specific data points from the user's sleep history
- One recommendation per response -- never overwhelm

CIRCADIAN SCIENCE YOU MAY REFERENCE:
- Light exposure timing and its effect on circadian phase
- Caffeine half-life and cutoff timing
- Sleep pressure (Process S) accumulation
- Anchor sleep principles for rotating shifts
- Nap timing and duration guidelines (20 min or 90 min)
- Meal timing relative to circadian phase
- Temperature regulation for daytime sleep
- Wind-down routines and sleep hygiene practices

LANGUAGE BOUNDARIES:
- Say "your sleep data shows" not "your symptoms indicate"
- Say "consider trying" not "I recommend you"
- Say "many shift workers find" not "research proves"
- Say "talk to your doctor about" not "you may have"
- Say "your schedule suggests" not "you need to"
```

### Context Injection Layer

The system prompt is static. User context is injected via a structured data block prepended to each user message:

```json
{
  "user_context": {
    "name": "Sarah",
    "shift_type": "rotating_nights",
    "current_shift_pattern": "3x12 nights (19:00-07:00), off 4 days",
    "chronotype": "moderate_evening",
    "sleep_preferences": {
      "ideal_duration_hours": 7.5,
      "wind_down_minutes": 30,
      "caffeine_cutoff_hours_before_sleep": 8
    }
  },
  "sleep_data": {
    "period": "2026-03-31 to 2026-04-06",
    "nights": [
      {
        "date": "2026-04-06",
        "planned_start": "08:00",
        "planned_end": "15:30",
        "actual_start": "08:45",
        "actual_end": "14:20",
        "actual_duration_hours": 5.58,
        "planned_duration_hours": 7.5,
        "shift_worked": "night",
        "adherence_score": 0.62
      }
    ],
    "rolling_7_day": {
      "avg_duration_hours": 5.9,
      "avg_adherence": 0.71,
      "sleep_debt_hours": 11.2,
      "trend": "declining"
    },
    "rolling_14_day": {
      "avg_duration_hours": 6.4,
      "avg_adherence": 0.78,
      "sleep_debt_hours": 15.8
    }
  },
  "schedule_context": {
    "upcoming_transition": {
      "type": "nights_to_days",
      "transition_date": "2026-04-10",
      "days_until": 4,
      "protocol": "gradual_advance"
    },
    "next_7_days_shifts": ["night", "night", "off", "off", "day", "day", "day"]
  },
  "history": {
    "weeks_using_app": 6,
    "previous_recommendations_followed": 4,
    "previous_recommendations_total": 7,
    "best_adherence_week": "2026-03-17",
    "worst_adherence_week": "2026-03-31"
  }
}
```

### Prompt Assembly Order

```
1. [System Prompt]           -- static, cached
2. [Safety Guardrails]       -- static, cached (see SAFETY-GUARDRAILS.md)
3. [User Context JSON]       -- dynamic, per-request
4. [Feature-Specific Prompt] -- varies by feature (weekly brief, alert, etc.)
5. [User Message]            -- if conversational; empty for auto-generated content
```

---

## 3. Feature-Specific Prompt Templates

### 3.1 Weekly Brief (Phase 20)

**Trigger:** Every Monday at 8:00 AM local time (or first app foreground on Monday)
**Max tokens:** 400
**Output format:** Structured JSON (parsed by app into UI card)

```
TASK: Generate a weekly sleep performance brief for the past 7 days.

STRUCTURE YOUR RESPONSE AS:
1. HEADLINE: One sentence capturing the week (positive framing when possible)
2. KEY METRIC: The single most important number from this week, with context
3. PATTERN: One pattern you noticed in their data (good or concerning)
4. UPCOMING: One thing about next week's schedule they should know
5. RECOMMENDATION: One specific, actionable thing to try this week

CONSTRAINTS:
- Total response under 250 words
- Reference at least 2 specific data points from their sleep_data
- If sleep_debt_hours > 14, acknowledge the difficulty without alarm
- If adherence is improving, celebrate it explicitly
- If a shift transition is within 7 days, the RECOMMENDATION should relate to preparation
- Never reference previous weekly briefs (stateless)
```

**Output Schema (JSON):**

```json
{
  "type": "object",
  "properties": {
    "headline": {
      "type": "string",
      "description": "One-sentence summary of the week, max 15 words"
    },
    "key_metric": {
      "type": "object",
      "properties": {
        "label": { "type": "string" },
        "value": { "type": "string" },
        "context": { "type": "string", "description": "1-2 sentences explaining what this means" }
      },
      "required": ["label", "value", "context"]
    },
    "pattern": {
      "type": "string",
      "description": "2-3 sentences about one observed pattern"
    },
    "upcoming": {
      "type": "string",
      "description": "1-2 sentences about next week's schedule"
    },
    "recommendation": {
      "type": "object",
      "properties": {
        "action": { "type": "string", "description": "Specific thing to do, max 20 words" },
        "rationale": { "type": "string", "description": "Why this will help, 1-2 sentences" }
      },
      "required": ["action", "rationale"]
    },
    "tone": {
      "type": "string",
      "enum": ["encouraging", "supportive", "celebratory", "gentle_concern"],
      "description": "Overall tone of this brief"
    }
  },
  "required": ["headline", "key_metric", "pattern", "upcoming", "recommendation", "tone"],
  "additionalProperties": false
}
```

### 3.2 Pattern Alerts (Phase 23)

**Trigger:** When pattern recognition engine detects a multi-week trend
**Max tokens:** 200
**Output format:** Structured JSON

```
TASK: Generate a natural language alert for a detected sleep pattern.

PATTERN DETECTED: {{pattern_type}}
PATTERN DATA: {{pattern_data_json}}

RULES:
- Describe the pattern in plain language, referencing specific dates/numbers
- Explain WHY this pattern matters for their circadian health (1 sentence)
- Suggest ONE adjustment they could try
- Keep total response under 100 words
- Frame concerning patterns as opportunities, not problems
- Never use words like "disorder," "abnormal," "dangerous," or "alarming"
```

**Pattern types and handling:**

| Pattern Type | Example Trigger | Tone |
|---|---|---|
| `consecutive_night_impact` | Recovery drops after 3+ consecutive nights | Supportive |
| `weekend_compensation` | Sleeping 2+ hours longer on off days | Gentle concern |
| `caffeine_correlation` | Late caffeine correlates with delayed sleep onset | Informative |
| `transition_struggle` | Recovery takes 3+ days after every rotation | Supportive |
| `improving_trend` | Adherence up 10%+ over 4 weeks | Celebratory |
| `seasonal_shift` | Sleep duration changing with daylight hours | Informative |

### 3.3 Transition Coaching (Phase 22)

**Trigger:** 3-5 days before a detected shift transition
**Max tokens:** 300
**Output format:** Structured JSON

```
TASK: Generate transition preparation coaching for an upcoming shift change.

TRANSITION: {{transition_type}} on {{transition_date}}
DAYS UNTIL: {{days_until}}
PROTOCOL ASSIGNED: {{protocol_name}}

STRUCTURE:
1. CONTEXT: Acknowledge the upcoming change (1 sentence)
2. WHAT TO EXPECT: Brief explanation of what their body will go through (2-3 sentences)
3. DAILY ACTIONS: For each remaining day before transition, one specific action
4. REASSURANCE: One sentence normalizing the difficulty

RULES:
- Reference their historical transition data if available
- Keep each daily action under 15 words
- Use circadian science to explain WHY each action helps
- Never promise specific outcomes ("you WILL feel better")
- Use "many shift workers find" or "this often helps" language
```

### 3.4 On-Demand Chat (Future -- Phase 25+)

**Not in v1.3 scope.** When implemented, will use the same system prompt with an additional conversational layer:

```
CONVERSATIONAL RULES:
- Remember context within the current conversation only (no cross-session memory)
- If the user asks a medical question, redirect warmly:
  "That's a great question for your doctor -- they can give you personalized guidance. 
   What I CAN help with is [relevant sleep scheduling topic]."
- If the user expresses frustration, validate first, then offer help
- Maximum 3 exchanges before suggesting they try something and check back next week
- Never engage in open-ended conversation -- always guide toward actionable next steps
```

---

## 4. API Integration Architecture

### Model Selection

| Feature | Model | Rationale |
|---|---|---|
| Weekly Brief | Claude Haiku 4.5 | Cost-effective for structured generation; sufficient quality for templated output |
| Pattern Alerts | Claude Haiku 4.5 | Short, structured responses; high volume |
| Transition Coaching | Claude Sonnet 4.5 | More nuanced reasoning about multi-day protocols |
| On-Demand Chat | Claude Sonnet 4.5 | Conversational quality matters; safety classification more reliable |

### Cost Estimates

Based on current Anthropic pricing (April 2026):

| Feature | Frequency | Avg Tokens (in/out) | Est. Cost/User/Month |
|---|---|---|---|
| Weekly Brief | 4x/month | 1200/400 | $0.008 |
| Pattern Alerts | 2-4x/month | 800/200 | $0.004 |
| Transition Coaching | 1-2x/month | 1000/300 | $0.003 |
| **Total** | | | **~$0.015/user/month** |

At $29.99/yr ($2.50/mo), AI features cost ~0.6% of subscription revenue. Well within the ~$0.40/user/month budget from the Manifesto's estimate (which assumed Sonnet for everything).

### Request Architecture

```typescript
// Pseudocode for weekly brief generation
async function generateWeeklyBrief(userId: string): Promise<WeeklyBrief> {
  const userContext = await buildUserContext(userId);
  const sleepData = await getSleepData(userId, { days: 7 });
  const scheduleContext = await getUpcomingSchedule(userId, { days: 7 });

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 400,
    system: SYSTEM_PROMPT + SAFETY_GUARDRAILS,
    messages: [
      {
        role: 'user',
        content: JSON.stringify({
          user_context: userContext,
          sleep_data: sleepData,
          schedule_context: scheduleContext,
        }) + '\n\n' + WEEKLY_BRIEF_TEMPLATE,
      },
    ],
    output_config: {
      format: {
        type: 'json_schema',
        schema: WEEKLY_BRIEF_SCHEMA,
      },
    },
  });

  const brief = JSON.parse(response.content[0].text);

  // Post-generation safety check
  const safetyResult = await runSafetyCheck(brief);
  if (!safetyResult.pass) {
    return FALLBACK_BRIEF; // Pre-written safe fallback
  }

  return brief;
}
```

### Structured Output Strategy

**Use structured JSON output (via `output_config.format`) for ALL features.** Rationale:

1. **Guaranteed valid JSON** -- constrained decoding prevents malformed responses
2. **Type safety** -- schema enforcement catches missing fields at generation time
3. **Predictable UI rendering** -- app can reliably map fields to UI components
4. **Safety classification** -- structured fields are easier to scan for prohibited content
5. **Cost efficiency** -- no retry loops for parsing failures

**Natural language lives INSIDE the JSON fields.** Each field contains human-readable text, but the structure is machine-parseable. The app renders the JSON into UI cards -- the user never sees raw JSON.

### Caching Strategy

- **System prompt + safety guardrails:** Use Anthropic's prompt caching (24-hour TTL). These are identical across all users and features.
- **User context:** Freshly assembled per request. Not cached.
- **Weekly brief results:** Cache locally on device for 24 hours. If the user opens the brief multiple times on Monday, don't re-generate.
- **Pattern alerts:** Cache for the duration of the pattern (until new data invalidates it).

### Fallback Strategy

If the Claude API is unreachable or returns an error:

1. **Weekly Brief:** Show a deterministic summary generated from local data (adherence %, sleep debt, upcoming shifts). No AI tone, just facts.
2. **Pattern Alerts:** Show the raw pattern detection without natural language explanation: "Pattern detected: sleep duration drops after 3+ consecutive night shifts."
3. **Transition Coaching:** Show the protocol steps from the deterministic algorithm without AI-generated context.

The app MUST function fully without AI features. AI is enhancement, not dependency.

---

## 5. Response Quality Control

### Pre-Generation Checks

Before calling the API:
- Verify user has >= 7 nights of data (weekly brief requires it)
- Verify user has not disabled AI features in Settings
- Verify user's subscription is active (AI is premium-only)
- Rate limit: max 1 weekly brief, 5 pattern alerts, 3 transition coaching messages per week

### Post-Generation Safety Scan

Every AI response passes through a local safety filter before display:

```typescript
function runSafetyCheck(response: AnyAIResponse): SafetyResult {
  const text = JSON.stringify(response).toLowerCase();

  // Hard blocks -- never show to user
  const PROHIBITED_TERMS = [
    'diagnos', 'prescri', 'treatment plan', 'sleep apnea',
    'narcolepsy', 'insomnia disorder', 'medication', 'dosage',
    'milligram', 'melatonin', 'ambien', 'zolpidem', 'trazodone',
    'benzodiazepine', 'you have', 'you may have', 'you suffer from',
    'seek immediate', 'emergency', 'call 911', 'suicid',
  ];

  for (const term of PROHIBITED_TERMS) {
    if (text.includes(term)) {
      return { pass: false, reason: `prohibited term: ${term}` };
    }
  }

  // Soft checks -- log but allow
  const CAUTION_TERMS = ['doctor', 'healthcare provider', 'medical'];
  // These are allowed in "talk to your doctor" contexts but logged for review

  return { pass: true };
}
```

### Content Review Pipeline

For the first 90 days after launch:
1. Log all AI-generated responses (anonymized) to a review queue
2. Sample 10% weekly for manual review by founder (Sim)
3. Track safety filter trigger rate -- target < 1% of generated responses
4. Refine system prompt based on real failure patterns

---

## 6. Data Privacy Architecture

### What Gets Sent to Claude API

- Aggregated sleep metrics (duration, timing, adherence scores)
- Shift schedule (type, dates, times)
- User preferences (chronotype, caffeine cutoff, wind-down duration)
- First name only (for personalization)

### What NEVER Gets Sent

- Full name, email, phone number, or any PII beyond first name
- HealthKit raw data
- Location data or addresses
- Calendar event titles or details (only shift type is extracted)
- Device identifiers
- Payment or subscription details

### Privacy Disclosure

Users must explicitly opt in to AI coaching features. The opt-in screen shows:
- What data is shared (summary above)
- That data is processed by Anthropic's Claude API
- That Anthropic does not use the data for model training (per their data retention policy)
- That AI features can be disabled at any time without losing other premium features

---

## 7. Iteration Plan

### v1.3 (Phase 19-20): Foundation
- Ship Weekly Brief with Haiku
- Collect 30 days of generation data
- Refine system prompt based on real outputs

### v1.3 (Phase 22-23): Expansion
- Ship Pattern Alerts and Transition Coaching
- Upgrade Transition Coaching to Sonnet if Haiku quality is insufficient
- Add user feedback mechanism (thumbs up/down on each AI response)

### v1.3 (Phase 25): Polish
- Analyze 90 days of feedback data
- A/B test prompt variations
- Optimize token usage based on actual response lengths
- Evaluate whether Haiku quality has improved enough to use for all features

### v2.0+: Conversational
- On-demand chat (if validated by engagement data)
- Multi-turn conversations with session memory
- Integration with HRV data for richer coaching context

---

## Sources

- [Anthropic Claude API Structured Outputs Documentation](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) -- HIGH confidence
- [Anthropic Prompting Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) -- HIGH confidence
- [Claude for Healthcare](https://www.anthropic.com/news/healthcare-life-sciences) -- HIGH confidence
- [Sleep Cycle Luma AI Coach Architecture](https://healthtechhotspot.com/sleep-cycle-launches-luma-ai-powered-sleep-coach-built-on-three-billion-nights-of-data/) -- MEDIUM confidence (competitor reference)
- [AI Chatbots for Health Behavior Change: Scoping Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC12895150/) -- HIGH confidence
- [Systematic Review: Chatbot Effectiveness on Lifestyle Behaviours](https://www.nature.com/articles/s41746-023-00856-1) -- HIGH confidence
