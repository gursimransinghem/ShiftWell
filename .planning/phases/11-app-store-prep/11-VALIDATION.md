---
phase: 11
slug: app-store-prep
status: reconstructed
nyquist_compliant: false
nyquist_status: partial
wave_0_complete: true
created: 2026-04-17
reconstructed_from: [11-VERIFICATION.md]
---

# Phase 11 — Validation Strategy (Reconstructed)

> Retrofit built from existing VERIFICATION artifact on 2026-04-17. Phase 11 mixes **code** (APP-01 account deletion, APP-02 medical disclaimer) with **documentation-only App Store Connect requirements** (APP-03 screenshots, APP-04 privacy labels, APP-05 review notes). Nyquist applies to the code portion only.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x + ts-jest |
| **Config file** | `jest.config.js` (root) |
| **Quick run command** | `npx jest --testPathPatterns="auth-store"` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~8s (full), ~1.5s (auth-store only) |
| **App Store Connect validation** | Manual — at submission time |

---

## Per-Task Verification Map

| Requirement | Test Type | File / Mechanism | Count | Status |
|-------------|-----------|------------------|-------|--------|
| APP-01 Account deletion | unit | `__tests__/store/auth-store-delete-account.test.ts` | 6 tests | ✅ green |
| APP-01 Supabase RPC fallback | unit | covered in auth-store delete tests (mock rpc failure path) | ≥1 test | ✅ green |
| APP-02 Medical disclaimer text in onboarding | content (MISSING) | *no test* — verified via source inspection in welcome.tsx | — | ⚠️ partial |
| APP-02 Medical disclaimer in Settings | content (MISSING) | *no test* — verified via source inspection in settings.tsx | — | ⚠️ partial |
| APP-03 App Store screenshots | documentation-only | 11-VERIFICATION.md documents workflow for EAS build + simulator screenshots | — | 🚫 manual (external) |
| APP-04 Privacy nutrition labels | documentation-only | 11-VERIFICATION.md has data table ready to paste into App Store Connect | — | 🚫 manual (external) |
| APP-05 App Review notes | documentation-only | 11-VERIFICATION.md has template ready to paste into App Store Connect | — | 🚫 manual (external) |

---

## Sampling Rate

- **After every auth-store change:** `npx jest --testPathPatterns="auth-store"`
- **After every plan wave:** `npm test`
- **Before App Store submission:** Full suite + App Store Connect manual paste-in for APP-03/04/05

---

## Wave 0 Requirements

None — Phase 11 extended existing auth-store test scaffolding with 6 new delete-account tests. No new framework installs.

---

## Identified Gaps

| Gap | Suggested Test | Priority |
|-----|---------------|----------|
| APP-02 disclaimer text presence | Snapshot test or grep-based content assertion on `welcome.tsx` + `settings.tsx` | LOW — text changes are visible in PRs, unlikely to silently regress |
| Supabase `delete_user` RPC deployed | Integration test against live Supabase (or documented deployment checklist) | MEDIUM — client has graceful fallback but real deletion depends on server-side SQL |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Status |
|----------|-------------|------------|--------|
| Delete-account alert + navigation flow | APP-01 | iOS alert dialog + AsyncStorage multi-clear on device | Pending device |
| Medical disclaimer placement + visual | APP-02 | Design aesthetics, line-break behavior | Pending device |
| Screenshots uploaded to App Store Connect | APP-03 | EAS build + simulator + ASC upload | Blocked on Apple Developer |
| Privacy nutrition labels declared | APP-04 | App Store Connect form entry | Blocked on ASC account |
| App Review notes submitted | APP-05 | App Store Connect form entry | Blocked on ASC account |

---

## Validation Sign-Off

- [x] APP-01 has 6 dedicated unit tests covering delete flow + RPC fallback
- [ ] APP-02 has no dedicated test (source-inspection only)
- [x] APP-03, APP-04, APP-05 documented for paste-in when ASC available
- [x] 383 tests pass (was 377 pre-phase; +6 from delete-account)
- [ ] `nyquist_compliant: true` — **NOT SET** (partial — APP-02 untested, 3 reqs external)

**Nyquist verdict:** PARTIAL. APP-01 fully covered; APP-02 is source-verified; APP-03/04/05 are inherently manual. Test debt is minimal and external gates dominate.

**Reconstructed:** 2026-04-17
**Last reviewed:** 2026-04-17
