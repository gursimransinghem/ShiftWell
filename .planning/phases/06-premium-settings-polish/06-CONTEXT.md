# Phase 6: Premium, Settings & Polish - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** Auto-generated (autonomous execution mode)

<domain>
## Phase Boundary

14-day full premium trial with graceful free-tier downgrade, pricing presentation, referral system ("Spread the Sleep"), post-onboarding profile/routine editing in Settings, and final quality pass. This is the last phase before TestFlight.

</domain>

<decisions>
## Implementation Decisions

### Premium Trial
- **D-01:** New users automatically get 14 days of full premium. No paywall on first launch — the full experience builds loss aversion.
- **D-02:** RevenueCat service already exists (`src/lib/premium/`). Wire the 14-day trial countdown and downgrade logic.
- **D-03:** After trial ends: graceful downgrade messaging. User keeps: algorithm, manual entry, basic Today view. User loses: calendar sync, auto-scheduling, Night Sky Mode, Live Activities, notifications, score.
- **D-04:** Pricing: $6.99/mo, $49.99/yr, $149.99 lifetime. Clear, no dark patterns, easy cancellation.

### Referral
- **D-05:** "Spread the Sleep" referral option in Settings. Simple share sheet with a referral link. No complex referral tracking for v1.0.

### Settings - Profile Editing
- **D-06:** User can edit profile (chronotype, household, sleep preferences) post-onboarding without starting over.
- **D-07:** User can edit AM/PM routines post-onboarding. Reuse the routine builder components from Phase 1.

### Polish
- **D-08:** Final quality pass: fix any TypeScript errors, clean up imports, verify all screens use theme tokens.

### Claude's Discretion
- Paywall screen design (within brand guidelines)
- Downgrade messaging copy
- Referral link format
- Profile editing screen layout

</decisions>

<canonical_refs>
## Canonical References

### Premium Infrastructure
- `src/lib/premium/` — Existing premium service + entitlements
- `app/paywall.tsx` — Existing paywall screen

### Settings
- `app/(tabs)/settings.tsx` — Settings screen (add profile editing + referral)
- `src/components/calendar/CalendarSettingsSection.tsx` — Pattern for settings sections

### Design System
- `src/theme/colors.ts` — ACCENT.primary '#C8A84B'

### Onboarding (for routine reuse)
- `app/(onboarding)/` — Routine builder components

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- RevenueCat premium service already scaffolded
- Paywall screen exists but may need redesign
- Onboarding routine builder components can be reused for editing
- Settings screen already has Calendar section (Phase 2) and Notification section (Phase 4)

### Integration Points
- Premium store gates features across the app
- Settings screen gets profile editing + referral sections
- Paywall screen gets pricing presentation

</code_context>

<specifics>
## Specific Ideas

- The downgrade experience should be respectful — "We'll keep your data safe. Upgrade anytime to get it all back."
- Referral should be dead simple — share sheet, done.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>

---

*Phase: 06-premium-settings-polish*
*Context gathered: 2026-04-02*
