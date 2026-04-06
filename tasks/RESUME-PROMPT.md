# ShiftWell V6 Visual QA — Resume Prompt

> Copy-paste this into your next Claude Code session to pick up exactly where we left off.

---

## Context

ShiftWell (Expo/React Native sleep app) just went through a full V6 UI redesign. The code is written (15 new components, 15 modified files, 8 commits, 299 tests passing) but has **NOT been visually verified**. The subagents wrote code from specs without ever seeing it render. We got the app running in the iOS Simulator but only saw Night Sky mode and the Empty state — never the core Today screen with the V6 components.

**The #1 priority is: make every screen match the approved V6 mockup.**

## What Exists

- **Design spec:** `docs/design/2026-04-05-ui-redesign/SPEC.md` — exact colors, typography, spacing, component specs
- **Build target mockup:** `docs/design/2026-04-05-ui-redesign/final-definitive-v6.html` — open in browser to see what it SHOULD look like
- **All mockups:** `docs/design/2026-04-05-ui-redesign/*.html` (14 files) — full design evolution
- **Implementation plan:** `docs/superpowers/plans/2026-04-05-ui-redesign.md` — what was built
- **Session report:** `docs/design/2026-04-05-ui-redesign/SESSION-REPORT.md` — full history
- **Task list:** `tasks/todo.md` — prioritized remaining work

## Current Blockers for Simulator

1. **Native module mocks** — `metro.config.js` mocks GoogleSignin, HealthKit, NitroModules for Expo Go. May need to also mock AsyncStorage (currently throws errors).
2. **Night Sky auto-activates at night** — need to either: set simulator clock to daytime, or temporarily disable `useNightSkyMode` to see the Today screen.
3. **Onboarding bypass** — `app/index.tsx` currently seeds mock data and skips to tabs. Works but shift data may not trigger plan generation (needs `regeneratePlan()` call).
4. **RevenueCat error toast** — placeholder API key in `.env`. Non-fatal but noisy.

## What Needs to Happen

### Phase 1: Get the Today Screen Visible (~15 min)
1. Set simulator time to daytime (e.g., 2 PM): `xcrun simctl status_bar booted override --time "14:00"`
2. Or temporarily return `false` from `useNightSkyMode` hook
3. Seed a shift for today + trigger `regeneratePlan()` so the Today screen has blocks to display
4. Mock AsyncStorage if still throwing errors
5. Take screenshots of all screens

### Phase 2: Visual QA Against Mockup (~30 min)
1. Open `docs/design/2026-04-05-ui-redesign/final-definitive-v6.html` in browser
2. Screenshot each simulator screen
3. Compare side-by-side for EVERY element:
   - StatusPill: is it the V3 boxed style with green gradient and 🌿?
   - HeroScore: is it centered with 104px ring, breathing glow, sparkline?
   - CountdownRow: 3 unified cells with correct colors?
   - Timeline: narrow timestamps (32px), spine, accent bars, collapsed past?
   - InsightLine: at bottom with 💡?
   - FloatingTabBar: glassmorphic blur, gold glow on active?
   - GradientMeshBackground: 3 animated orbs visible?
4. Create a list of every discrepancy

### Phase 3: Fix Discrepancies (~30-60 min)
1. For each discrepancy, fix the component to match the mockup
2. Re-screenshot and verify
3. Commit fixes

### Phase 4: Test All States (~15 min)
1. Empty state (no shifts)
2. Recovery Day (off day with score)
3. On Shift (during a night shift)
4. Wind-down (approaching bedtime)
5. Night Sky (bedtime overlay)

## Key Files

| Purpose | File |
|---------|------|
| Today screen | `app/(tabs)/index.tsx` |
| Status pill | `src/components/today/StatusPill.tsx` |
| Hero score | `src/components/today/HeroScore.tsx` |
| Countdown row | `src/components/today/CountdownRow.tsx` |
| Timeline event | `src/components/today/TimelineEvent.tsx` |
| Collapsed past | `src/components/today/CollapsedPast.tsx` |
| Insight line | `src/components/today/InsightLine.tsx` |
| Wind-down view | `src/components/today/WindDownView.tsx` |
| Floating tab bar | `src/components/navigation/FloatingTabBar.tsx` |
| Gradient mesh bg | `src/components/ui/GradientMeshBackground.tsx` |
| Night Sky overlay | `src/components/night-sky/NightSkyOverlay.tsx` |
| Theme colors | `src/theme/colors.ts` |
| Theme typography | `src/theme/typography.ts` |
| Metro mocks | `metro.config.js` |
| Entry/seed | `app/index.tsx` |
| Night Sky hook | `src/hooks/useNightSkyMode.ts` |
| Design spec | `docs/design/2026-04-05-ui-redesign/SPEC.md` |
| Build target | `docs/design/2026-04-05-ui-redesign/final-definitive-v6.html` |

## Success Criteria

Every screen in the simulator matches `final-definitive-v6.html` within acceptable tolerance. The app feels premium — animations are smooth, colors are correct, spacing is consistent, and the overall experience matches what was designed.
