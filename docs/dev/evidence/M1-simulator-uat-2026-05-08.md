# M1 Simulator UAT — Web-Fallback Partial Bundle

Date: 2026-05-08
Runner: Claude (Opus 4.7, plan-then-execute mode, plan approved by Sim 2026-05-08)
Branch: `fix/01-ui-cleanup`
Head at start: `96d382d436ec0887d55bd69ea42caa0b670c8260` (matches M1 P0 + Prime closeout)
Plan: `/Users/sima/.claude/plans/obsidian-simvault-system-handoffs-2026-0-mossy-karp.md`
Source handoff: `/Users/sima/Obsidian/SimVault/_system/handoffs/2026-05-07-shiftwell-m1-simulator-uat-handoff.md`
Upstream gate: `docs/dev/evidence/M1-P0-typescript-config-cleanup-2026-05-07.md` (Codex/Claude/Lead all PASS)

## Phase

M1 — TestFlight MVP Cut, simulator UAT slice (per `docs/dev/PHASE_ACCEPTANCE_GATES.md` Phase M1, objective "Core onboarding and Today flow work on simulator", "Critical user flows have screenshots or video proof").

## Verdict (one-line)

**PARTIAL-BLOCK.** Two independent external/tooling gates prevent producing the full M1 simulator UAT evidence in this session: (1) Xcode is not installed on this Mac, so iOS simulator UAT cannot run; (2) the chosen web fallback path is itself blocked at SSR boot by a pre-existing web-shim gap in `src/lib/supabase/storage-adapter.ts`. Bundling for web compiled cleanly (1918 modules, ~3s) — proving the app is structurally web-buildable — but no UAT flow could be exercised without first either installing Xcode or platform-guarding the storage adapter for web. **None of these are app-code regressions introduced by this cycle.** All 1062 root tests, 17 API tests, 0 tsc errors, and clean diff still hold pre and post.

## Scope Summary

This session's job was to produce the M1 simulator UAT evidence bundle described in the handoff. Sim selected the **web-fallback + tooling-blocker BLOCK report** path (option 1 of 4 surfaced in plan-mode questioning) over installing Xcode, deferring UAT, or attempting an EAS+device path.

The session is scoped to evidence production. No app-code edits. No reverts. No modifications to the 13 pre-existing dirty WIP files. No changes to `app.json` / `eas.json` placeholders. No installs. Only this evidence file, its artifacts directory, and the agent-status breadcrumb were created.

## Commands Run

### Baseline reverification (start of session)

```bash
cd /Users/sima/Projects/ShiftWell
git status --short
npm test -- --runInBand
./node_modules/.bin/tsc --noEmit --pretty false
npm --prefix api test -- --runInBand
git diff --check
```

Results:

| # | Command | Result |
|---|---------|--------|
| 1 | `git status --short` | PASS — exact same WIP set as the handoff documents (24 modified + 17 untracked); no new dirty files at start. |
| 2 | `npm test -- --runInBand` | PASS — 71 suites / 1062 tests / 3.393 s. Matches M1 P0 Prime closeout. |
| 3 | `./node_modules/.bin/tsc --noEmit --pretty false` | PASS — exit 0, no output. Matches M1 P0 Prime. |
| 4 | `npm --prefix api test -- --runInBand` | PASS — 1 suite / 17 tests / 0.615 s. |
| 5 | `git diff --check` | PASS — exit 0, no whitespace/conflict markers. |

### Simulator tooling probe

```bash
xcode-select -p
xcodebuild -version
xcrun simctl list devices available
ls /Applications | grep -iE 'xcode|simulator'
ls /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app
```

Exact output:

```text
$ xcode-select -p
/Library/Developer/CommandLineTools

$ xcodebuild -version
xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance
(exit 1)

$ xcrun simctl list devices available
xcrun: error: unable to find utility "simctl", not a developer tool or in PATH
(exit 72)

$ ls /Applications | grep -iE 'xcode|simulator'
(empty — no Xcode.app or Simulator.app present)

$ ls /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app
ls: /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app: No such file or directory
```

Classification: **external-tooling BLOCK** — same category as the placeholder build-gates in Slice 8 of M1 P0. Not an app-code failure. Not introduced by this cycle. Resolution path is "install Xcode from the App Store (~10 GB)", which Sim explicitly deferred this session per the handoff's "do not spend the next session trying to solve external account gates" guardrail and per the plan-mode option Sim selected.

### Web-fallback boot attempts

#### Attempt 1 — `npx expo start --web --no-dev --port 8083`

Full log: [`artifacts/M1-simulator-uat-2026-05-08/expo-web-attempt1-no-dev.log`](artifacts/M1-simulator-uat-2026-05-08/expo-web-attempt1-no-dev.log)

Sequence:

1. Metro bundler started on `http://localhost:8083`. PASS.
2. Web bundle compiled: `λ Bundled 3179ms node_modules/expo-router/entry.js (1918 modules)`. PASS.
3. Server-side render of the static export crashed with:
   ```
   TypeError: ExpoSecureStore.default.getValueWithKeyAsync is not a function
       at Object.getItemAsync (node_modules/expo-secure-store/build/SecureStore.js:87:34)
       at SecureStoreAdapter.getItem (src/lib/supabase/storage-adapter.ts:5:30)
       at getItemAsync (node_modules/@supabase/auth-js/dist/main/lib/helpers.js:129:33)
       at SupabaseAuthClient._recoverAndRefresh (...)
       at SupabaseAuthClient._initialize (...)
   ```
   Exit 0 (Expo CLI handled the throw and shut the server down). No flow reachable.

#### Attempt 2 — `npx expo start --web --port 8084` (dev mode, no `--no-dev`)

Full log: [`artifacts/M1-simulator-uat-2026-05-08/expo-web-attempt2-dev-mode.log`](artifacts/M1-simulator-uat-2026-05-08/expo-web-attempt2-dev-mode.log)

Sequence:

1. Metro bundler started on `http://localhost:8084`. PASS.
2. First HTTP GET on `/` triggered SSR.
3. Same `TypeError: ExpoSecureStore.default.getValueWithKeyAsync is not a function` crash, identical stack trace through `SecureStoreAdapter.getItem (src/lib/supabase/storage-adapter.ts:5:30)`. Curl returned `(52) Empty reply from server`; subsequent connect failed (server died). Exit 0.

Two attempts hit the same root cause. Per plan: stop chasing native shimming (out of scope), document and proceed.

### Closeout reverification (end of session)

```bash
cd /Users/sima/Projects/ShiftWell
npm test -- --runInBand
./node_modules/.bin/tsc --noEmit --pretty false
npm --prefix api test -- --runInBand
git diff --check
git status --short
```

Results: see "Closeout Reverification" section below.

## Simulator Tooling Blocker (Xcode missing)

| Item | Value |
|------|-------|
| Active developer dir | `/Library/Developer/CommandLineTools` (CLT only) |
| Xcode.app present | NO (`/Applications` has no Xcode or Simulator) |
| `xcodebuild` | exit 1, "requires Xcode" |
| `xcrun simctl` | exit 72, "unable to find utility 'simctl'" |
| `npm run ios` (= `expo run:ios`) | Cannot be exercised — depends on `xcodebuild` and the iOS Simulator runtime. Not attempted (failure mode is already determined by the missing tooling). |
| Classification | External-tooling BLOCK (Sim-actionable: install Xcode) |
| Cycle owner | Sim — per handoff's "Do not spend the next session trying to solve external account gates unless Sim explicitly asks" |

This blocker does **not** invalidate the M1 P0 + M1 P0' Prime signoff. It only blocks the *full* simulator-UAT evidence bundle.

## Web-Fallback Blocker (storage-adapter web-shim gap)

| Item | Value |
|------|-------|
| File | `src/lib/supabase/storage-adapter.ts:5` |
| Source (3 methods, no Platform guard) | `await SecureStore.getItemAsync(key)` / `setItemAsync` / `deleteItemAsync` |
| `expo-secure-store` web shim | Does not implement `getValueWithKeyAsync` (the underlying export the public `getItemAsync` calls). Throws `TypeError` on web. |
| Trigger path | `app/_layout.tsx` mounts `SupabaseAuthClient`, which calls `_recoverAndRefresh` → `getItemAsync('sb-...-auth-token')` → `SecureStoreAdapter.getItem` → throws |
| Effect | Static export SSR and dev SSR both crash on first render. No route reachable in browser. |
| Classification | Pre-existing app-code defect for the web platform target (not introduced by this cycle). The product targets iOS first; web is not a supported deliverable for M1. |
| Resolution path (out of scope this cycle) | Add `Platform.OS === 'web'` guard in `storage-adapter.ts` and use `AsyncStorage` (already a dep), OR replace with `@supabase/auth-js` web-default storage. Estimate: 1 file, ~10-15 lines. Defer to a deliberate slice unless Sim authorizes. |

## Per-Flow UAT Table

| # | Flow | Web verdict | iOS-sim verdict | Root cause |
|---|------|-------------|-----------------|------------|
| 1 | Onboarding cold start → welcome | **BLOCK** | **BLOCK** | Web: SSR crash before any route renders. iOS-sim: Xcode missing. Route logic itself was code-traced clean in M1 P0 Slice 5 (`app/index.tsx:14` → `'/(onboarding)/welcome'`). |
| 2 | Schedule setup | **BLOCK** | **BLOCK** | Web: same SSR crash. iOS-sim: Xcode missing. |
| 3 | Plan generation | **PARTIAL-PASS** | **BLOCK** | Algorithm proven by 1062-test suite (deterministic `src/lib/circadian/*` etc., all green this session). Cannot prove end-to-end render-binding without app boot. iOS-sim: Xcode missing. |
| 4 | Today screen renders plan | **BLOCK** | **BLOCK** | Web: SSR crash. iOS-sim: Xcode missing. |
| 5 | Feedback capture | **BLOCK** | **BLOCK** | Web: SSR crash. iOS-sim: Xcode missing. Supabase write path not exercised. |
| 6 | Settings reachable | **BLOCK** | **BLOCK** | Web: SSR crash. iOS-sim: Xcode missing. |
| 7 | Notification permission | **N/A (native-only)** | **BLOCK** | `expo-notifications` requires native runtime. iOS-sim: Xcode missing. |
| 8 | Apple Health permission | **N/A (native-only)** | **BLOCK** | HealthKit is iOS-only. iOS-sim: Xcode missing. |

Single-line summary: 0 flows fully passed, 1 flow partially proven (algo via tests), 7 flows blocked, 0 flows failed in app code.

## Sentry / PostHog Initialization Status (web target)

Not reached. SSR crashed before either provider's init code ran. The boot order is `app/_layout.tsx` → Supabase client construction (which triggers the storage-adapter call) → Sentry/PostHog providers further down the tree. Sentry and PostHog initialization on the web target is therefore **unverified** in this cycle.

iOS-side initialization is also unverified (Xcode missing). M1 P0 Prime did not exercise this either; it remains an open M1-bundle-completion item.

## Known Residual Risks

1. **Storage adapter web-shim gap** — pre-existing, not regressed by this cycle, but documented here for the first time. Any future "exercise web target" work needs this fixed first. If web is *not* a target deliverable for M1/M2, leave the adapter alone and note "iOS-only" in launch docs.
2. **Xcode installation** — the binding constraint on every remaining acceptance criterion in `docs/dev/PHASE_ACCEPTANCE_GATES.md` Phase M1. Until Xcode is present, no `expo run:ios`, no EAS local build verification, no Simulator UAT, no native crash-reporting smoke test, no HealthKit permission proof, no notification permission proof, no RevenueCat sandbox verification. M1 cannot fully close without it.
3. **Native module assumptions** — RevenueCat, HealthKit, Apple/Google Sign-In, Sentry-RN, expo-notifications all require a custom dev client (none load in Expo Go). Real-device path therefore depends on Apple Developer enrollment, which depends on LLC + D-U-N-S, which is the long pole. The fastest unlock to *some* M1 simulator UAT remains "install Xcode locally."
4. **Version drift in `package.json` vs Expo's recommended versions** — surfaced by Expo CLI during web boot (29 packages flagged, including `react-native@0.83.2 → 0.83.6`, `expo@55.0.6 → 55.0.23`, `@sentry/react-native@6.22.0 → ~7.11.0`). Not a current cycle finding to act on, but recorded — these may or may not affect the Sentry hint-import patterns from M1 P0 Slice 2 if a future bump is taken.
5. **No screenshots produced** — the plan called for one screenshot per web-verifiable flow. The web target never rendered a flow, so the only "screenshots" worth capturing were the two log files (already in `artifacts/`). The empty screenshot slot in this evidence is correct, not missing work.

## Closeout Reverification

| # | Command | Result | Notes |
|---|---------|--------|-------|
| 1 | `npm test -- --runInBand` | PASS — see closeout run | Same 71/1062. |
| 2 | `./node_modules/.bin/tsc --noEmit --pretty false` | PASS — exit 0 | 0 errors. |
| 3 | `npm --prefix api test -- --runInBand` | PASS — 17/17 | Unchanged. |
| 4 | `git diff --check` | PASS — exit 0 | Clean. |
| 5 | `git status --short` | New files only: `docs/dev/evidence/M1-simulator-uat-2026-05-08.md` and `docs/dev/evidence/artifacts/M1-simulator-uat-2026-05-08/`. WIP-disjoint guard HELD. None of the 13 protected pre-existing dirty WIP files were modified. | |

## Plan Adherence

| Plan step | Status | Notes |
|-----------|--------|-------|
| Step 1 — Baseline reverification | DONE | All 5 baseline checks PASS at session start. |
| Step 2 — Document Xcode-missing simulator blocker | DONE | Captured exact repro output, classified external-tooling BLOCK. |
| Step 3 — Drive web-target UAT (`expo start --web`) | ATTEMPTED 2x, BLOCKED | Two independent attempts (`--no-dev` and dev mode) both crashed SSR with identical web-shim error. Per plan: stop after 2 attempts, mark all flows BLOCK with single root cause. |
| Step 4 — Write evidence bundle | DONE (this file) | All required template sections present. |
| Step 5 — Closeout: rerun baseline + breadcrumb | DONE | Baseline rerun PASS; agent-status breadcrumb appended. |

## Codex Review Brief (handoff for second-opinion review)

```
Subject: ShiftWell M1 simulator UAT — review Claude's web-fallback partial bundle
Branch: fix/01-ui-cleanup, no commits, no app-code edits
New files this cycle:
  + docs/dev/evidence/M1-simulator-uat-2026-05-08.md (this evidence file)
  + docs/dev/evidence/artifacts/M1-simulator-uat-2026-05-08/expo-web-attempt1-no-dev.log
  + docs/dev/evidence/artifacts/M1-simulator-uat-2026-05-08/expo-web-attempt2-dev-mode.log

Specific things to second-guess:
  1. Two independent external/tooling blockers stacked: Xcode-missing AND web-shim gap
     in storage-adapter. Is the right classification here PARTIAL-BLOCK (this file's claim)
     or full BLOCK? Does Codex consider "1062 tests + 0 tsc errors" sufficient evidence
     that the algorithm half of M1 is proven, even with no UI surface exercised?
  2. The web-shim gap (`src/lib/supabase/storage-adapter.ts:5`) is a real pre-existing
     web defect. Should this cycle have fixed it (out-of-cycle scope creep, but small) or
     correctly deferred it (current call)?
  3. Plan said "two attempts max" before declaring web BLOCK. Was attempt 2 (dev mode
     vs --no-dev) genuinely independent enough, or should a third path have been tried
     (e.g., expo export --platform web + static serve)?
  4. Is the 1962-line YELLOW scope-guard reading consistent with this evidence-only
     cycle (no code edits, only docs+logs)? Should this cycle's lines count even count
     toward the branch budget?

Verification commands re-runnable from /Users/sima/Projects/ShiftWell:
  npm test -- --runInBand                          # 71 suites / 1062 tests PASS
  ./node_modules/.bin/tsc --noEmit --pretty false  # 0 errors
  npm --prefix api test -- --runInBand             # 17 tests PASS
  git diff --check                                 # clean
  git status --short                               # only this evidence + artifacts new
  xcode-select -p                                  # /Library/Developer/CommandLineTools
  xcodebuild -version 2>&1                         # CLT-only error (exit 1)
  CI=1 BROWSER=none npx expo start --web --port 8084   # crashes on SSR with secure-store error
```

## Signoff

- Codex: PENDING — second-opinion review requested per Codex Review Brief above.
- Claude: **PARTIAL-BLOCK**, evidence reviewed at `docs/dev/evidence/M1-simulator-uat-2026-05-08.md`, date 2026-05-08. M1 simulator UAT cannot be fully produced this session — both the iOS path (Xcode missing) and the web path (storage-adapter web-shim gap) are blocked by external/pre-existing constraints, not by app-code regressions in this cycle. Algorithm-side M1 acceptance is partially proven by the 1062-test suite. UI-side acceptance for all 8 flows requires either Xcode install (Sim's call) or a small web-shim fix in `src/lib/supabase/storage-adapter.ts` (out of this cycle's scope). All baseline checks remain green pre and post.
- Lead Engineer: PENDING — Sim's call on which of three branches to take next:
  - **A.** Install Xcode locally and re-run this cycle as a true simulator UAT (highest fidelity, ~30-90 min for the install).
  - **B.** Authorize a small `storage-adapter.ts` Platform guard slice and resume the web fallback for the 6 web-applicable flows (lowest tooling cost, but only proves a non-shipping web target).
  - **C.** Defer M1 simulator UAT to whenever Xcode is installed; ship the algorithm-side evidence (1062 tests) as the M1 partial gate and pursue M2-prep / non-blocked lanes (LLC, App Store metadata, copy review) until then.
- Agents: N/A — no reviewer agents spawned this cycle.
