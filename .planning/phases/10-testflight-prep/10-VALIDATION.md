---
phase: 10
slug: testflight-prep
status: reconstructed
nyquist_compliant: true
nyquist_status: compliant-by-inspection
wave_0_complete: true
created: 2026-04-17
reconstructed_from: [10-VERIFICATION.md]
---

# Phase 10 — Validation Strategy (Reconstructed)

> Retrofit built from existing VERIFICATION artifact on 2026-04-17. Phase 10 was a **configuration-only phase** — no runtime behavior to unit-test. Validation happens at EAS build time + App Store Connect submission time, not in the Jest suite.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (existing suite) + EAS build pipeline |
| **Config file** | `jest.config.js` + `eas.json` + `app.json` |
| **Quick run command** | `npm test` (no Phase 10 specific tests — full suite acts as regression guard) |
| **JSON/plist validation** | `npx expo config --type introspect` + manual `plutil -lint` for generated plists |
| **Build smoke test** | `eas build --profile preview --platform ios --non-interactive` (requires Apple Developer) |

---

## Per-Task Verification Map

| Requirement | Test Type | How verified | Status |
|-------------|-----------|-------------|--------|
| TF-01 Privacy manifest (4 NSPrivacyAccessedAPITypes) | config audit | `app.json` inspection — 4 entries present; ITMS-91061 compliance | ✅ verified |
| TF-02 HealthKit entitlements | config audit | `app.json` expo.ios.entitlements — both keys present | ✅ verified |
| TF-03 App icon + splash configured | config audit | `app.json` icon/splash paths valid; **custom 1024×1024 PNG still pending** | ⚠️ placeholder art |
| TF-04 EAS production build profile | config audit | `eas.json` build.production has distribution=store, autoIncrement=true, bundleIdentifier match | ✅ verified |
| TF-05 installedAt ISO timestamp | integration | `app/(onboarding)/calendar.tsx` writes `AsyncStorage.setItem('installedAt', ...)` on 3 exit paths | ✅ verified (no dedicated test) |

---

## Sampling Rate

- **After config edits:** `npx expo config --type introspect | grep -A 2 privacyManifests` to verify schema still parses
- **Before `eas build`:** Manual review of `eas.json` submit credentials
- **Manual gate:** Icon pixel dimensions (1024×1024 PNG, no alpha) before App Store submission

---

## Wave 0 Requirements

None — Phase 10 edits config files; no new framework/test install.

---

## Manual-Only Verifications

Configuration phases validate at build time, not in Jest:

| Behavior | Requirement | Why Manual | Gate |
|----------|-------------|------------|------|
| EAS production build succeeds | TF-01, TF-02, TF-04 | Requires Apple Developer enrollment + D-U-N-S + signing certs | Blocked on external gate |
| App icon renders at all iOS icon sizes | TF-03 | Visual QA on device + App Store Connect upload | Blocked on custom PNG |
| installedAt write survives cold restart | TF-05 | AsyncStorage persistence on real device | Blocked on device dev build |
| Privacy manifest passes App Store review | TF-01 | ITMS-91061 check happens on submission | Blocked on App Store Connect |

---

## Validation Sign-Off

- [x] All 5 config changes verified against schema via 10-VERIFICATION.md code refs
- [x] 377 tests still pass (no regressions from config edits)
- [x] `nyquist_compliant: true` (as "compliant-by-inspection" — config-only phase)

**Nyquist verdict:** COMPLIANT (config-only). Runtime validation gated on Apple Developer enrollment — will surface at first `eas build` and App Store submission. No runtime unit tests applicable.

**Outstanding pre-build items** (tech debt, not Nyquist gaps):
- Custom 1024×1024 app icon PNG (placeholder in repo)
- `eas.json` submit.production.ios credentials (appleId, ascAppId, appleTeamId placeholders)
- `PLACEHOLDER_CLIENT_ID` in Google Sign-In plugin config
- Revert `app/index.tsx` dev seed + onboarding bypass before production build

**Reconstructed:** 2026-04-17
**Last reviewed:** 2026-04-17
