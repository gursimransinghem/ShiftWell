# NightShift — Activity Log

> This log is automatically updated during every development session. Newest entries at the top.
> Read this file at the start of every session to orient yourself.

---

## 2026-03-14 — Session 1: Project Genesis + Week 1 Algorithm Build

### End of Session
**Completed:**
- Generated and scored 9 physician side-project ideas (PHYSICIAN_SIDE_PROJECT_IDEAS.md)
- Identified NightShift as #1 idea (scored 4.70/5) after competitive analysis
- Completed full competitive landscape research (Timeshifter, Arcashift, SleepSync, Sleep Aid)
- Designed complete implementation plan across 5 phases
- Made key tech decisions: Expo (React Native), TypeScript, deterministic algorithm (not LLM), iOS-first
- Scaffolded Expo project (SDK 55, React 19)
- Built entire circadian algorithm engine (7 modules):
  - types.ts, classify-shifts.ts, sleep-windows.ts, nap-engine.ts
  - caffeine.ts, meals.ts, light-protocol.ts, index.ts
- Built calendar import/export system (3 modules):
  - ics-parser.ts, ics-generator.ts, shift-detector.ts
- Wrote and passed 20 unit tests
- Created IMPLEMENTATION_PLAN.md (full build plan copy)
- Created PROJECT_CONTEXT.md (session synopsis + baseline context)
- Added subagent policy for context window optimization
- Created CLAUDE.md with global instructions
- Created this ACTIVITY_LOG.md

**Key Decisions Made:**
- Deterministic algorithm over LLM (testable, offline, zero cost)
- Expo over Swift (AI coding tool support, cross-platform bonus)
- MVP scope: import shifts → generate plan → export to calendar (no backend v1)
- Personal calendar awareness included in MVP (reads full calendar, not just shifts)
- Household profile in onboarding (kids, noise modeling)

**Blockers:** None

### Next Steps (Week 2)
- [ ] Onboarding flow: welcome screen, chronotype quiz (MEQ), household profile, preferences
- [ ] Zustand store for shifts and user profile (persisted to AsyncStorage)
- [ ] Calendar month view with color-coded shift/sleep/nap/meal blocks
- [ ] "Add Shift" modal with time pickers
- [ ] Wire algorithm: shifts change → generateSleepPlan() re-runs → UI updates
- [ ] Today screen: glanceable timeline with countdowns

---

*Log entries below this line are from previous sessions.*
