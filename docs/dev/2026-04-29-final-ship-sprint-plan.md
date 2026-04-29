 # ShiftWell — Dated Product Assessment and Final Ship Sprint Plan
 
 > **Created:** 2026-04-29  
 > **Purpose:** Preserve the current honest product assessment and convert it into a steady execution cadence for getting ShiftWell to a clean, useful TestFlight build.  
 > **Use with:** `docs/vision/MANIFESTO.md`, `docs/superpowers/skills/deep-product-ship-review.md`, `tasks/todo.md`
 
 ---
 
 ## 1. One-Sentence Product Summary
 
 ShiftWell is a schedule-aware circadian planning app for shift workers: import or enter shifts, account for real-life constraints, then generate clear sleep, nap, caffeine, meal, light, and recovery guidance that can live inside the user's day.
 
 The core promise is not "track your sleep." The core promise is:
 
 > "Tell ShiftWell what your life looks like; ShiftWell tells you exactly when to protect rest so you can function safely."
 
 ---
 
 ## 2. Honest App Assessment
 
 ### What Is Strong
 
 1. **The problem is real and painful.**  
    Shift workers, especially healthcare workers, have a repeatable, high-stakes problem: rotating shifts, night work, short recovery windows, caffeine misuse, childcare constraints, and calendar conflicts.
 
 2. **The positioning is differentiated.**  
    Most sleep apps assume normal schedules. ShiftWell is strongest when it says: "Your schedule is abnormal, so your sleep plan has to be abnormal too."
 
 3. **The deterministic algorithm is the right foundation.**  
    The core circadian system is not LLM-dependent. It is offline, testable, inspectable, and tied to research-backed rules.
 
 4. **The app has meaningful technical depth.**  
    Shift classification, sleep windows, naps, caffeine, meals, light, debt, recovery, and transition prediction are already represented in code.
 
 5. **Test coverage is a major asset.**  
    The current suite passes at 1,065 tests. The best-covered areas are the algorithmic surfaces where correctness matters most.
 
 ### What Is Weak
 
 1. **The visible product surface is broader than the validated product loop.**  
    The repo contains auth, backend, premium, AI brief, adaptive planning, outcomes, HealthKit, growth, enterprise, and dashboard concepts. Some are promising, but the first build must prove a simpler loop.
 
 2. **Some features are scaffolding more than finished product.**  
    HealthKit, AI brief, premium gating, outcomes, and enterprise surfaces should not be allowed to imply reliability until each is fully tested on a real device with real data.
 
 3. **Native flows need live-device proof.**  
    Calendar import/export, notifications, HealthKit permissions, onboarding, paywall routing, cold start, and share sheets cannot be trusted from unit tests alone.
 
 4. **Repo-wide TypeScript is not clean yet.**  
    Jest is green, but `tsc --noEmit` still reports pre-existing issues in API/dashboard/Sentry/i18n/growth surfaces. Treat this as a production-hardening task, not a blocker to learning if those surfaces are hidden.
 
 5. **Product copy and monetization policy need consistency.**  
    Trial length, premium promises, disclaimers, and App Store-facing copy must align before TestFlight/App Store distribution.
 
 ---
 
 ## 3. What Logic Makes Sense
 
 Keep protecting and polishing these areas. They are the core IP and user value:
 
 - Shift classification: day, evening, night, extended, recovery, transitions.
 - Plan generation: main sleep, wind-down, naps, caffeine cutoffs, meals, light guidance.
 - Real-life constraints: commute, chronotype, household, kids, pets, personal calendar events.
 - Prediction: upcoming stressful transitions and pre-adaptation windows.
 - Calendar-as-interface: import schedule, generate plan, export useful blocks back to the place users already live.
 
 This logic is coherent. It matches the mission and should be the center of the ship build.
 
 ---
 
 ## 4. What Is Half-Baked Right Now
 
 These may become valuable, but should not drive the next sprint unless they directly support the core loop:
 
 - Backend/cloud sync.
 - Account system beyond what is required for testing.
 - Premium entitlements and paywall monetization.
 - AI weekly coaching.
 - Full Adaptive Brain/autopilot as a visible promise.
 - Outcomes dashboard.
 - Referral/growth experiments.
 - Enterprise/API/dashboard modules.
 - Watch app ambitions.
 - Internationalization.
 - Advanced HRV personalization before real HealthKit QA.
 
 The issue is not that these are bad ideas. The issue is sequencing. They should earn visibility after the first real users confirm the core loop is useful.
 
 ---
 
 ## 5. Honest Utility Assessment
 
 ShiftWell can be genuinely useful if the first version does one thing beautifully:
 
 > A shift worker enters/imports a schedule, gets a trustworthy circadian plan, understands what to do today, and can act on it without thinking too hard.
 
 The useful version answers:
 
 - "When should I sleep after this night shift?"
 - "Should I nap before work?"
 - "When is my caffeine cutoff?"
 - "How do I recover after three nights?"
 - "What changes because I have an appointment or kids?"
 - "What should I do next?"
 
 The biggest risk is not lack of ambition. The biggest risk is too much ambition appearing before the simple version feels reliable.
 
 ---
 
 ## 6. Core Company Principles for the Ship Sprint
 
 All execution decisions should trace back to the manifesto.
 
 ### Principle 1: Automation Over Effort
 
 Users should make fewer sleep decisions, not more. If a screen asks the user to interpret too much, simplify it.
 
 **Ship rule:** Every main screen must answer "what do I do next?" within five seconds.
 
 ### Principle 2: Science Over Opinion
 
 Advice must be traceable, plain-English, and humble. Avoid wellness exaggeration.
 
 **Ship rule:** Every recommendation type should have a short "why this matters" explanation available or nearby.
 
 ### Principle 3: Premium Over Desperate
 
 No manipulative paywall or aggressive conversion mechanics before value is proven.
 
 **Ship rule:** TestFlight should optimize trust and learning, not monetization.
 
 ### Principle 4: Invisible Over Impressive
 
 The best version fits into calendar, notifications, and daily rhythm. It should not require constant app opening.
 
 **Ship rule:** Calendar export and notification behavior matter more than adding another dashboard.
 
 ### Principle 5: Mission Over Money
 
 Revenue follows usefulness. The first users should feel helped, respected, and safe.
 
 **Ship rule:** If a feature makes the product feel less trustworthy, hide it until it is ready.
 
 ---
 
 ## 7. Final Ship Sprint Objective
 
 ### Objective
 
 Produce a tight TestFlight candidate centered on:
 
 1. Fresh install and onboarding.
 2. Manual shift entry and/or calendar import.
 3. Reliable plan generation.
 4. Clear Today screen guidance.
 5. Schedule/calendar review.
 6. Export/share and/or notifications.
 7. Basic settings, disclaimers, and feedback.
 
 ### Non-Objective
 
 Do not expand the product surface. Do not add new major features. Do not prioritize monetization, enterprise, AI, or growth loops until the core loop is verified by real users.
 
 ---
 
 ## 8. Clean Execution Cadence
 
 Use short, evidence-driven loops. Each loop ends with tests and a concrete artifact.
 
 ### Loop 1: Decide the Visible TestFlight Surface
 
 **Goal:** Determine what users can actually see.
 
 Actions:
 - List every tab, modal, onboarding screen, settings row, and hidden route.
 - Mark each as Keep, Hide, or Fix.
 - Hide surfaces that depend on unverified backend, premium, AI, enterprise, or watch behavior.
 - Keep the user-facing promise narrow: schedule in, plan out, today guidance clear.
 
 Exit criteria:
 - A single visible navigation map exists.
 - No visible screen promises an untested system.
 - Full Jest suite passes.
 
 ### Loop 2: Fresh Install and Onboarding Walkthrough
 
 **Goal:** Make the first-run experience reliable.
 
 Actions:
 - Clear AsyncStorage and run from a fresh install.
 - Verify entry routing waits for persisted state.
 - Verify onboarding screens in order.
 - Verify skip/manual/demo/import paths are intentional.
 - Remove any production onboarding bypass or mock seed behavior.
 
 Exit criteria:
 - Fresh install has no flicker into the wrong route.
 - User can complete onboarding without developer context.
 - The app lands in a useful state.
 
 ### Loop 3: Shift Entry and Import Reliability
 
 **Goal:** Make schedule ingestion trustworthy.
 
 Actions:
 - Test manual shift creation, editing, deletion.
 - Test `.ics` import with real examples from Apple/Google/QGenda if available.
 - Confirm false positives can be unchecked before import.
 - Confirm malformed imports do not crash.
 - Confirm shift classification is understandable.
 
 Exit criteria:
 - User can get a correct schedule into the app.
 - Bad imports are recoverable.
 - Detected shifts are reviewable before they affect the plan.
 
 ### Loop 4: Plan Generation and Today Screen Clarity
 
 **Goal:** Make the app useful after schedule entry.
 
 Actions:
 - Verify plan generation for day, evening, night, extended, recovery, and off days.
 - Verify Today screen empty state, active state, upcoming state, and past state.
 - Make the next action visually obvious.
 - Add or refine "why this recommendation" copy where needed.
 - Confirm all countdowns and labels are local-time correct.
 
 Exit criteria:
 - A user can open Today and know what to do next.
 - No card renders with fake, stale, or confusing data.
 - Schedule changes regenerate plan reliably.
 
 ### Loop 5: Calendar Export and Notifications
 
 **Goal:** Move the plan into the user's life.
 
 Actions:
 - Test `.ics` export/share sheet on device.
 - Verify event titles, times, descriptions, and time zone behavior.
 - Test notification permission prompt.
 - Verify at least wind-down and caffeine cutoff reminders schedule correctly.
 - Disable notification types that are not reliable yet.
 
 Exit criteria:
 - User can export a plan and see correct events in calendar.
 - Notifications that are visible in the UI actually work.
 
 ### Loop 6: Trust, Legal, and Feedback
 
 **Goal:** Make the app feel safe and professional.
 
 Actions:
 - Review medical disclaimer placement.
 - Align trial/premium copy or hide monetization for TestFlight.
 - Add a simple feedback pathway in Settings.
 - Verify delete/reset account behavior.
 - Ensure privacy language matches actual data use.
 
 Exit criteria:
 - No misleading medical, AI, premium, or data claims.
 - Testers have an obvious way to report friction.
 
 ### Loop 7: Live Device QA and Release Candidate
 
 **Goal:** Prove the app on an actual iPhone.
 
 Actions:
 - Run through all core paths on physical device.
 - Test dark mode, small screens, permissions, share sheet, notifications, cold start.
 - Run `npm test`.
 - Run targeted smoke checks after any final fixes.
 - Prepare TestFlight metadata, screenshots, icon, privacy labels, and beta instructions.
 
 Exit criteria:
 - Physical-device walkthrough passes.
 - Full Jest suite passes.
 - Known issues list is honest and acceptable for beta.
 - Build is ready for TestFlight once external Apple/LLC blockers are cleared.
 
 ---
 
 ## 9. Next Focus
 
 The next focus should be:
 
 > **Core loop polish and live-device proof.**
 
 Specifically:
 
 1. Define and simplify the visible TestFlight surface.
 2. Remove or hide anything not ready to be trusted.
 3. Revert production onboarding bypass/mock data.
 4. Run fresh-install onboarding on device.
 5. Test schedule import/manual entry with realistic data.
 6. Verify Today screen makes the next action obvious.
 7. Prove export and notifications on device.
 8. Add simple feedback.
 9. Align legal/copy/trial messaging.
 10. Prepare TestFlight only after this path works end-to-end.
 
 ---
 
 ## 10. Operating Rule for Future Work
 
 Before building anything new, ask:
 
 1. Does this improve the core loop?
 2. Does it reduce user effort?
 3. Is it scientifically defensible?
 4. Can it be tested on device?
 5. Does it make the app feel more trustworthy?
 6. Would we still build it if monetization were delayed?
 
 If the answer is not clearly yes, defer it.
 
 ---
 
 ## 11. Suggested Invocation
 
 To request this level of review again, say:
 
 > "Run the Deep Product Ship Review skill on the current app state and update the ship sprint plan."
 
 The reusable skill lives at:
 
 - `docs/superpowers/skills/deep-product-ship-review.md`
 
