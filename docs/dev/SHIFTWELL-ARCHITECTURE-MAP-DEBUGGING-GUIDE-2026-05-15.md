# ShiftWell Architecture-Map Debugging Guide

Created: 2026-05-15  
Status: internal debugging workflow  
Scope: ShiftWell only — non-clinical, internal use, not a product feature

## What this is

This guide shows how to use a Claude-generated **architecture map** the way the Instagram reel demo used it:

- repo comprehension
- subsystem flow tracing
- bug triage
- plain-English explanations
- minimal fix planning

## What this is **not**

- not evidence
- not a substitute for reproduction
- not a substitute for tests/runtime proof
- not a user-facing ShiftWell feature
- not a way to “solve” external-admin blockers like LLC / Apple Developer / D-U-N-S / trademark

**Rule:** the map is an **internal debugging aid**. It can suggest hypotheses. It does not close a blocker.

---

## When to use this workflow

Use it when:

- a ShiftWell blocker spans multiple files
- the flow crosses stores + hooks + services + screens
- the subsystem is messy enough that you want a map before editing
- you need a plain-English explanation of what the code is doing

Do **not** use it when:

- the blocker is external-admin (`LLC`, `Apple Developer`, `D-U-N-S`, trademark)
- the blocker is purely credential/config ownership and you do not have the missing secret
- the issue is already isolated to one tiny file and a failing test tells the story

---

## Core rule: classify the blocker first

Before asking Claude for any map, write a **blocker ledger** row.

Required fields:

- **Blocker:** short title
- **Type:** `code` | `tooling` | `credential` | `external-admin`
- **Owner:** `agent` | `Sim` | `external`
- **Suspected boundary:** screen / hook / store / service / native bridge / backend / config
- **Repro:** exact failing command or manual flow
- **Pass condition:** how you will know it is fixed
- **Evidence path:** where proof will be saved

If the blocker type is **credential** or **external-admin**, stop trying to debug it in code.

---

## Recommended pilot order for ShiftWell

### 1. HealthKit permission / integration lane

Best first pilot because it is:

- multi-layered
- a good test of whether Claude understands native/runtime boundaries
- currently **stale between docs and code**
- likely to surface the real boundary: onboarding UX vs passive post-onboarding read path

**Current repo reality (verified 2026-05-16):** the app currently has a 6-screen onboarding flow with **no dedicated HealthKit consent screen** and **no caller of `requestAuthorization()`**. That makes this lane useful, but the blocker should be framed as **doc/code mismatch or missing permission flow**, not literally "onboarding reaches consent step and crashes," unless a fresh runtime repro proves that.

### 2. Auth + password reset flow

Second-best pilot because it can reveal:

- auth state boundaries
- Supabase client usage
- route transitions
- session/error handling gaps

### 3. AI / secrets exposure lane

Good third pilot for:

- client/server boundary checks
- unsafe env/config usage
- fallback/error-path reasoning

---

## Step-by-step workflow

## Step 1 — pick **one** narrow blocker

Do not run this on the whole repo.

Good:
- `HealthKit integration docs say onboarding asks for permission, but current app has no consent screen or requestAuthorization caller`
- `Password reset flow does not complete after email link`
- `Claude client path may expose secrets / unsafe boundary assumptions`

Bad:
- `Debug ShiftWell`
- `Map the whole app`
- `Find all bugs`

**Verification:** you can describe the blocker in one sentence and name the likely subsystem.

---

## Step 2 — create an isolated lane (optional but recommended)

ShiftWell is a git repo, and worktrees are encouraged.

Example:

```bash
git -C /Users/sima/projects/ShiftWell worktree add ../ShiftWell-healthkit-map -b chore/healthkit-map
```

Use a worktree when:
- you expect multiple exploratory edits
- you want clean diffs
- you do not want to contaminate the current branch

Skip it when:
- you are doing read-only triage
- you only need a blocker report and no edits

**Verification:** your debugging work has a clear folder/branch boundary.

---

## Step 3 — build the blocker ledger row

Before Claude sees the code, write this:

```md
Blocker: HealthKit permission flow is missing / stale vs architecture docs
Type: code
Owner: agent
Suspected boundary: architecture docs -> onboarding flow -> healthkit service -> native permission bridge
Repro: docs expect an onboarding HealthKit consent step, but current onboarding flow has 6 screens and no requestAuthorization caller
Pass condition: either (a) a real HealthKit consent step exists and safely handles grant/deny/skip, or (b) docs are updated to match a passive post-onboarding HealthKit read path; targeted tests pass
Evidence path: docs/dev/evidence/MX-healthkit-map-YYYY-MM-DD.md
```

**Verification:** blocker type, owner, repro, and pass condition are explicit.

---

## Step 4 — gather a tight file bundle

Do **not** dump the full repo into Claude first. Start with the smallest useful bundle.

### HealthKit lane

Primary files:

- `src/lib/healthkit/healthkit-service.ts`
- `src/lib/healthkit/hrv-reader.ts`
- `src/lib/feedback/healthkit-sleep-reader.ts`
- `src/hooks/useSleepFeedback.ts`
- `src/hooks/useAdaptivePlan.ts`
- `src/lib/healthkit/index.ts`
- `src/types/healthkit.d.ts`

Targeted tests:

- `__tests__/lib/healthkit/sleep-ingestion.test.ts`
- `__tests__/healthkit/hrv-reader.test.ts`

### Auth lane

Primary files:

- `app/(auth)/sign-in.tsx`
- `app/(auth)/sign-up.tsx`
- `src/store/auth-store.ts`
- `src/lib/supabase/auth.ts`
- `src/lib/supabase/client.ts`

Targeted test already present:

- `__tests__/store/auth-store-delete-account.test.ts`

### AI / secrets lane

Primary files:

- `src/lib/ai/claude-client.ts`
- `src/lib/ai/weekly-brief-generator.ts`
- `src/lib/supabase/client.ts`
- `src/lib/monitoring/sentry.ts`

Targeted test already present:

- `__tests__/ai/claude-client.test.ts`

**Verification:** every file in the bundle is directly related to the blocker.

---

## Step 5 — run baseline proof **before** asking for fixes

Use existing tests first.

### HealthKit baseline

```bash
cd /Users/sima/projects/ShiftWell
npm test -- --runInBand __tests__/lib/healthkit/sleep-ingestion.test.ts __tests__/healthkit/hrv-reader.test.ts
```

Verified on 2026-05-15:
- 2 suites passed
- 25 tests passed

### Auth baseline

```bash
cd /Users/sima/projects/ShiftWell
npm test -- --runInBand __tests__/store/auth-store-delete-account.test.ts
```

Verified on 2026-05-15:
- 1 suite passed
- 6 tests passed

### AI / secrets baseline

```bash
cd /Users/sima/projects/ShiftWell
npm test -- --runInBand __tests__/ai/claude-client.test.ts
```

Verified on 2026-05-15:
- 1 suite passed
- 13 tests passed

If the issue is runtime-only and not covered by current tests, capture the manual/simulator flow instead.

**Verification:** you have a baseline command/result before Claude proposes any fix.

---

## Step 6 — ask Claude for a map, not a solution

Use Claude Code to produce:

- architecture map
- plain-English flow
- suspected boundaries
- unknowns / missing evidence
- likely choke points

Do **not** ask for code changes yet.

### Copy-paste prompt — HealthKit pilot

```text
Read only. Do not edit files yet.

I am debugging one narrow ShiftWell blocker: HealthKit permission crash / failure around onboarding.

Treat your output as an INTERNAL DEBUGGING AID, NOT EVIDENCE.
Do not give me fixes first. Do not give me a generic bug list for the whole repo.

Use only these files first:
- src/lib/healthkit/healthkit-service.ts
- src/lib/healthkit/hrv-reader.ts
- src/lib/feedback/healthkit-sleep-reader.ts
- src/hooks/useSleepFeedback.ts
- src/hooks/useAdaptivePlan.ts
- src/lib/healthkit/index.ts
- src/types/healthkit.d.ts
- __tests__/lib/healthkit/sleep-ingestion.test.ts
- __tests__/healthkit/hrv-reader.test.ts

Return exactly:
1. A concise architecture map of the HealthKit flow
2. A plain-English explanation of what happens from screen/hook -> service -> native boundary -> state update
3. Suspected crash/failure boundaries
4. Unknowns that cannot be proven from static reading alone
5. Exact file references for every claim
6. What I should reproduce next before planning a fix

Do not write code. Do not propose fixes until after reproduction.
```

**Verification:** Claude output is clearly labeled exploratory and includes unknowns, not just confident claims.

---

## Step 7 — validate the map claim-by-claim

Claude’s map is only useful if you validate it.

For each claim, check:

- exact file path
- exact function / hook / component
- whether the test already covers it
- whether runtime proof still needs to be gathered

Required labels for each claim:
- `verified by file`
- `verified by test`
- `runtime-only`
- `unknown`

If Claude says “the bug is probably here,” but you cannot tie it to a file + reproduction path, it stays a hypothesis.

**Verification:** every important claim gets one of those labels.

---

## Step 8 — reproduce the failure before writing a fix plan

No fix plan until you have reproduction evidence.

Possible proof sources:

- failing test
- manual simulator flow
- runtime logs
- screenshot/video of the failure
- console/Sentry output

If you already have a targeted test that fails after you tighten the assertion, use that.
If the issue only occurs on device/simulator, capture the exact steps and state:

- permission state (`not determined`, `denied`, `authorized`)
- where in onboarding the failure occurs
- whether the app crashes, hangs, or silently no-ops

**Verification:** you have one concrete failing artifact, not just a theory.

---

## Step 9 — only now ask for a minimal fix plan

Once the bug is reproduced, ask Claude for a **minimal** fix plan.

The plan must include:

- touched files only
- why each file changes
- target test(s)
- runtime regression check
- what not to change

### Copy-paste prompt — minimal fix plan

```text
Now that the blocker is reproduced, propose the smallest safe fix plan.

Constraints:
- Only address the reproduced blocker.
- Do not broaden scope.
- Name exact files to touch.
- Name exact tests to run.
- Include one runtime regression check.
- If there is not enough evidence yet, say so instead of pretending the fix is obvious.
```

**Verification:** the plan is narrow, file-specific, and test-specific.

---

## Step 10 — implement with TDD / evidence discipline

Implementation order:

1. strengthen or add the failing test if possible
2. make the smallest code change
3. rerun targeted tests
4. rerun the runtime flow if needed
5. record evidence

For ShiftWell, prefer a narrow lane:
- one blocker
- one small set of files
- one test bundle
- one evidence artifact

**Verification:** the fix closes the pass condition you wrote in the blocker ledger.

---

## Step 11 — save an evidence bundle

Follow ShiftWell’s existing evidence discipline.

Create:

```text
docs/dev/evidence/M<phase-or-X>-<short-name>-YYYY-MM-DD.md
```

Minimum contents:

- blocker title
- blocker type / owner
- file bundle used
- Claude prompt used
- architecture map summary
- exact commands run
- exact results
- runtime proof/artifact path
- residual risks
- final verdict: fixed / blocked / needs Sim / needs external

**Verification:** someone else can pick up the bundle and understand exactly what was proven.

---

## Recommended first execution for ShiftWell

Start with:

**HealthKit permission crash**

Why:
- known blocker
- multi-layered enough for the map to help
- bounded enough to keep the exercise honest
- already has targeted tests on disk

Run in this order:

1. write blocker ledger row
2. run HealthKit baseline tests
3. ask Claude for HealthKit architecture map + unknowns
4. validate the map against files
5. reproduce the runtime failure
6. ask for minimal fix plan
7. implement and save evidence bundle

---

## Red flags — stop if you see these

Stop and correct course if:

- Claude starts generating “all bugs in the repo”
- the map is being treated as proof
- a fix plan is written before reproduction
- external-admin blockers are being debugged in code
- credential blockers are being hand-waved as code bugs
- the scope expands beyond one blocker
- runtime-only failures are being “verified” by unit tests alone

---

## Bottom line

For ShiftWell, this workflow is worth using **internally** if you keep it tight:

- one blocker
- one file bundle
- one baseline proof
- one map
- one reproduction artifact
- one minimal fix plan
- one evidence bundle

If you do that, the architecture map becomes useful.
If you skip the verification gates, it becomes vibe-coded theater.
