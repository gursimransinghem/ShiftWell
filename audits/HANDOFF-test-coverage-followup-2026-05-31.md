# Handoff — ShiftWell Test-Coverage Audit → Follow-up

**From:** Claude Code session, 2026-05-31 (branch `feat/circadian-v1-hardening`)
**To:** next agent (fresh session, this repo)
**Mission:** verify the audit, question its assumptions, then produce an A/B-hardened plan to act on the recommendations. **Do not start writing tests yet** — verify and plan first.

---

## 1. What happened this session

Ran a 4-phase adversarial `Workflow` auditing the ShiftWell Jest suite for coverage gaps:
**discover** (partition source into 41 modules) → **find** (agent "A" enumerates each module's behaviors, flags untested ones) → **verify** (agent "B", blind to A's reasoning, re-reads source + greps the whole test tree to confirm/refute) → **synthesize** (rank). 84 Sonnet subagents, ~4.5M tokens, ~60 min, concurrency held ≤8 via waves of 8. Audit only — no test code was written.

## 2. Artifacts (read these first)

| What | Path |
|---|---|
| **The audit report** (617 ranked gaps, evidence, suggested tests, effort) | `audits/shiftwell-test-coverage-2026-05-30.md` |
| Decision/outcome log | `~/Obsidian/SimVault/Decisions/shiftwell-test-coverage-audit-2026-05-31.md` |
| Session note | `~/Obsidian/SimVault/sessions/claude-code/2026-05-31-shiftwell-test-coverage-audit.md` |
| Workflow script (reusable/resumable) | `~/.claude/projects/-Users-sima-Projects-ShiftWell/895639b7-898c-4a1c-91b7-591b1379bd76/workflows/scripts/shiftwell-test-coverage-audit-wf_49c53cd7-fbf.js` |
| Jay task already filed for the test work | uuid `a710b0ba-a0c1-42f7-9bad-6b06c6a75441` (epic *Ops / Personal Admin*) |

## 3. Headline findings

- **617 confirmed gaps**: 164 HIGH / 306 MEDIUM / 147 LOW. Effort skews cheap: 435 S (<1h), 141 M, 41 L.
- **~49% of *enumerated* behaviors tested** (622/1282 across the 41 audited modules). ⚠️ This % is from the agents' own behavior-counting, **not** a real `jest --coverage` run.
- **Zero-coverage HIGH modules:** `supabase-data-layer` (auth/client/storage-adapter — only ever mocked, 0/32) · `db-rls-policies` (RLS/RPC SQL, no integration harness, 0/42) · `circadian-light-protocol` (core IP, 0/13) · `auth-store` (4/24).
- **Best covered:** hrv-processor 88%, enterprise-aggregation 72%, adaptive-engine 73%, caffeine/meals 71%.

## 4. ⚠️ Assumptions & caveats — ATTACK THESE (this is the point of the handoff)

The prior agent (me) may be wrong. Specifically question:

1. **"0 refuted across 589 claims" — likely the weakest part.** Verifier B refuted *zero* finder claims. That can mean B rubber-stamped. I hand-checked only **3/617** HIGH gaps, and I picked ones where B had already written detailed evidence (selection bias — I validated "A+B agree on true positives," NOT "B catches false positives"). **You should sample harder**: pick gaps in *well-tested* modules and gaps where B's evidence is thin, and actively hunt for FALSE POSITIVES — a "gap" that's actually covered by a cross-file or integration test. If you find even a few, the 617 number is inflated and needs a discount factor.
2. **The 49% / per-module % is soft.** Run `npx jest --coverage` for real and compare line/branch coverage against the audit's behavior counts. Where they diverge sharply, trust the coverage tool, not the audit.
3. **Static-only was a deliberate choice — maybe wrong.** I skipped `jest --coverage` (RN/Expo flakiness). A coverage run may reveal behaviors that ARE incidentally executed/asserted that the static pass marked uncovered.
4. **Impact tiers were agent-assigned.** Is every circadian gap really HIGH? Is `premium-store` (revenue) really only MEDIUM? Re-judge the tiering on the gaps you'd actually act on.
5. **"Supabase needs an integration harness" assumes the data layer can't be meaningfully unit-tested.** Challenge it: some of `auth.ts`/`storage-adapter.ts` logic (error mapping, token handling, retry) may be unit-testable with mocks without a live DB. Separate "needs live Supabase" from "just needs a non-`__mocks__` test."
6. **41-module partition came from ONE discover agent.** Spot-check it didn't mis-group or drop files (cross-check against `excludedFiles` in the report's Appendix C).
7. **Effort (S/M/L) estimates are guesses.** Validate against one or two real test-writes.

## 5. Recommendations (with reasoning) — the things to plan around

1. **Quick wins first: HIGH + S-effort circadian gaps** (`light-protocol` 0/13, `prediction-engine` 8/22, `nap-engine` 14/31). *Why:* core IP, <1h each, highest correctness-per-effort before TestFlight. (Jay task `a710b0ba` already tracks this.)
2. **Build a local-Supabase integration harness** for the auth + RLS layer (`supabase-data-layer` 0/32, `db-rls-policies` 0/42). *Why:* most security-sensitive code, the only true coverage hole that mocks can't fill. One infra investment, not a pile of unit tests.
3. **Do NOT treat all 617 as a backlog.** Prioritize HIGH + revenue-path (`premium-store`) + safety (`PatternAlertCard` fatigue warnings before multi-night runs). *Why:* 306 MEDIUM + 147 LOW is mostly low-ROI coverage-for-its-own-sake pre-launch; chasing the count wastes the runway.
4. **Triage the uncommitted dependency upgrade before any commit.** *Why:* see §6 — it's unrelated churn that must not ride along with the audit commit.

## 6. Repo state / gotchas

- **Uncommitted dependency upgrade sits in the working tree** — `package.json` + `package-lock.json` (Sentry 6→7, Expo patch bumps, RN 0.83.2→0.83.6, async-storage pinned 2.2.0) + `docs/PROGRESS-DASHBOARD.md` date bump. Written by **background automation** at 03:47–03:52, NOT by the audit (which was read-only). **Verify it builds/tests before committing, and commit it SEPARATELY from the audit report.**
- The audit report (`audits/…2026-05-30.md`) is **untracked** — intentional. Sim decides when/whether to commit.
- Branch `feat/circadian-v1-hardening` is in scope-guard RED (13k+ lines, 26 days). Consider whether the test work belongs on a fresh branch.
- **Workflow gotcha (durable lesson):** in a Workflow script, a schema'd `agent()` left as a bare `await` on the critical path aborts the entire run on a transient API blip (`ConnectionRefused`). Wrap critical-path agent calls in try/catch, or run inside `parallel()` (which swallows throws to null). Then resume-from-cache reuses the expensive completed agents for free.

## 7. Your task (mirrors the activation prompt)

1. Read this handoff + `audits/shiftwell-test-coverage-2026-05-30.md`.
2. **Verify**: run `npx jest --coverage`; independently re-check a meaningful sample of HIGH gaps (and deliberately hunt false positives per §4.1). Report a confidence/discount factor on the 617.
3. **Question** every assumption in §4 — in writing, with evidence for/against.
4. **Plan, A/B-hardened**: draft a prioritized action plan (agent A) to address the §5 recommendations; then run an adversarial reviewer (agent B) that attacks the plan (over-scoped? wrong priorities? unverified assumptions?); reconcile into a final plan with binary success criteria.
5. **Close out** (`/close`) with the verified findings, the A/B-hardened plan, and next actions.

**Logging (universal rule):** before reporting back, log key findings/decisions/gotchas to BOTH the Obsidian vault (via `obsidian-gate` `vault_submit`/`vault_file`) and the daily dispatch note `~/Obsidian/SimVault/_system/session-logs/2026-05-31-dispatch.md`. If you spawn subagents, pass this logging instruction to them.
