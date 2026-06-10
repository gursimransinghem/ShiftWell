# ShiftWell 8-Week Beta Operations Plan

## Overview

This plan operationalizes ShiftWell's TestFlight beta across four phases over 8 weeks, moving from internal validation (5 people) → F&F (15) → healthcare cohort (50) → public (200). The goal is to gather quantitative and qualitative data on core flows, identify showstoppers before App Store submission, and validate the circadian algorithm's real-world effectiveness across diverse shift patterns.

---

## Beta Timeline at a Glance

| Week | Phase | Cohort Size | Focus | Go/No-Go Decision |
|------|-------|-------------|-------|-------------------|
| 1 | Phase 0 (Internal) | 5 | Crash-free flow, <5min onboarding → plan | Launch Phase 1 |
| 2 | Phase 1 (F&F) | 15 | Onboarding friction, survey Day 1 | Launch Phase 2 |
| 3 | Phase 1 (F&F) | 15 | Feature depth, survey Week 1 | Hold/escalate as needed |
| 4 | Phase 2 (Healthcare) | 50 | Scale stability, edge-case shift patterns | Pause recruitment or proceed |
| 5 | Phase 2 (Healthcare) | 50 | Retention, sleep quality data quality | Feature completeness checkpoint |
| 6 | Phase 2 (Healthcare) | 50 | Bug fix sprint, survey Phase 1, prep Phase 3 | Hold or Phase 3 launch |
| 7 | Phase 3 (Public) | 200 | Crash rate at scale, infrastructure load | Monitor only |
| 8 | Phase 3 (Public) | 200 | Retrospective, App Store readiness decision | Go/no-go for submission |

---

## Week-by-Week Operations Plan

### **Week 1: Phase 0 — Internal Stability & Onboarding**

**Phase:** Phase 0 (Internal)  
**Cohort:** 5 people (Sim + 4 close colleagues/advisors)

**Focus Area**
Core flow validation. Does the app launch without crashes? Can a user with no context get from app install → sleep plan generated in under 5 minutes? This is the "does it work at all" week.

**Build Priority**
- Fix any blocking crashes (unhandled exceptions, null refs, missing Supabase keys)
- Verify chronotype quiz completes without UI hangs
- Confirm schedule import accepts standard shift patterns (8h, 10h, 12h, rotating)
- Validate that sleep plan exports to calendar successfully
- Ensure session persists across app restart

**Quantitative Metrics**
- **Crash rate:** 0 crashes per 100 sessions (target: 0)
- **Onboarding completion rate:** % who complete chronotype quiz + enter first shift (target: 100%)
- **Time to plan:** Median time from install to "View Plan" screen (target: <5min)
- **Session length:** Median time spent in app (target: >2min)
- **DAU:** 5/5 internal users (target: 100%)

**Qualitative Signals**
- "Did the app crash at any point?"
- "Were any flows confusing?"
- "Did the sleep plan feel reasonable for your shift pattern?"
- "What would make this more helpful?" (open-ended)

**Decision Point: Go/No-Go for Phase 1**
- **GO if:** Crash rate = 0, onboarding completion = 100%, time to plan <5min, no blocking UX issues reported
- **NO-GO if:** Crashes present, onboarding stalls, plan generation fails, or SQL query errors indicate data corruption

**Sim's Action Items**
1. Run the app through the full flow yourself 5+ times daily; log any crashes or hangs with timestamp
2. Schedule 15-min debrief calls with each 4 testers; ask directly: "Did anything break or confuse you?"
3. Spot-check Supabase logs (Auth, DB, RLS) for errors; escalate any permission issues immediately

**Timeline:** Mon 4/22 – Sun 4/28

---

### **Week 2: Phase 1 — Friends & Family Onboarding Friction**

**Phase:** Phase 1 (F&F)  
**Cohort:** 15 people (friends, family, early advisors — non-technical)

**Focus Area**
Real users hitting the app for the first time. Focus on onboarding friction: Does the chronotype quiz make sense? Do users understand what their shift schedule means in context? Does the "meal timing" recommendation land, or does it feel like noise?

**Build Priority**
- Ship any UI copy improvements from Week 1 feedback
- Add inline help text (tooltips) to confusing fields in chronotype quiz
- Fix any validation issues in shift schedule entry (e.g., incorrect time ranges rejected)
- Ensure error messages are clear and actionable (not raw backend errors)
- Add a "skip" or "learn more" option for optional fields
- Monitor Supabase logs for any new exceptions

**Quantitative Metrics**
- **DAU:** 15/15 (target: 100%)
- **Onboarding completion rate:** % who generate a plan on Day 1 (target: 80%+)
- **Chronotype quiz completion:** % who finish all questions (target: 85%+)
- **Session length:** Median time in app on Day 1 (target: >3min)
- **Feature adoption:** % who tap "View Calendar" or "Log Sleep" after plan generation (target: 40%+)
- **Crash rate:** # crashes per 100 sessions (target: <0.5%)

**Qualitative Signals**
- *Day 1 survey:* "Was the chronotype quiz clear? Did you understand what each answer meant?"
- *Day 1 survey:* "What's one thing that confused you in the first 5 minutes?"
- *Day 1 survey:* "Would you recommend this to a coworker?" (Net Promoter-style)
- *Feedback channel:* "What does this nap recommendation mean for me?"
- *Feedback channel:* Drop-off points — where do users quit?

**Decision Point: Go/No-Go for Week 3**
- **GO if:** DAU 13+/15, onboarding completion 70%+, no blocking crashes, feedback shows actionable issues not showstoppers
- **HOLD if:** Crash rate >1%, onboarding completion <50%, or consensus "I don't understand what to do"
- **NO-GO if:** Multiple testers can't complete chronotype quiz or schedule entry despite instructions

**Sim's Action Items**
1. Send Day 1 survey at 8am Mon (email + in-app prompt); compile responses by end of day
2. Read through all feedback daily; file bugs for any blockers; deprioritize cosmetic issues
3. One optional: schedule a 20-min call with 3 testers to watch them use the app live (screen share); listen for hesitation and confusion

**Timeline:** Mon 4/29 – Sun 5/5

---

### **Week 3: Phase 1 — Feature Depth & Early Retention**

**Phase:** Phase 1 (F&F)  
**Cohort:** 15 people (same as Week 2)

**Focus Area**
Are people using the plan beyond the first day? Which features stick: calendar export, nap logging, sleep tracking, light recommendations? What's the "aha moment" that makes the plan feel valuable?

**Build Priority**
- Ship fixes for top 3 bugs from Week 2 feedback
- Improve calendar export UX (make the button more obvious, show success confirmation)
- Simplify sleep logging (reduce fields if needed; ensure timestamps default correctly)
- Verify nap recommendations render correctly for all shift types
- Add a "sample plan" or "preview" flow for users unsure about entering their schedule
- Monitor for any DB performance issues with 15 concurrent sessions

**Quantitative Metrics**
- **DAU (Day 7):** % still opening app (target: 70%+)
- **Calendar export rate:** % who export plan to calendar (target: 50%+)
- **Sleep logged:** % who log ≥1 sleep entry (target: 40%+)
- **Nap recommendation views:** % who open nap section of plan (target: 60%+)
- **Session length (Day 7):** Median (target: >2min)
- **Crash rate:** # crashes per 100 sessions (target: <0.5%)
- **Retention cohort:** % Day 1 → Day 3 → Day 7 (target: 90% → 80% → 70%)

**Qualitative Signals**
- *Week 1 survey:* "Which part of your sleep plan did you find most helpful?"
- *Week 1 survey:* "Have you used the calendar export? Why or why not?"
- *Week 1 survey:* "What feature would make this app indispensable for you?"
- *Feedback:* "The nap timing doesn't match my schedule" → edge case discovery
- *Feedback:* "I don't know how to export to my calendar" → UX friction

**Decision Point: Go/No-Go for Phase 2**
- **GO if:** Day 7 DAU 10+/15 (67%), calendar export 40%+, crash rate <0.5%, no new showstoppers
- **HOLD if:** Day 7 DAU <8, retention cliff (e.g., >30% drop Day 1→3), or new bugs reported
- **NO-GO if:** Calendar export broken, sleep logging doesn't persist, or algorithm feedback "plan doesn't match my shifts"

**Sim's Action Items**
1. Send Week 1 survey (email + in-app, ~7 questions) by Wed; compile insights by Fri
2. Do a 30-min review of top-10 feedbacks; create a triage doc: ship, hold, won't-fix
3. Prepare Phase 2 recruitment list: identify 50 healthcare workers (nurses, docs, paramedics, etc.); draft recruitment message

**Timeline:** Mon 5/6 – Sun 5/12

---

### **Week 4: Phase 2 — Scale Stability & Diverse Shift Patterns**

**Phase:** Phase 2 (Healthcare)  
**Cohort:** 50 people (nurses, physicians, paramedics, ED techs — real shift workers)

**Focus Area**
Stability at scale. Does the app handle 50 concurrent users without performance degradation? Edge-case shift patterns: 24h on-calls, 12h rotations, continental flips. Real sleep data coming in — does the algorithm's guidance land?

**Build Priority**
- Fix any top 3 blockers from Phase 1 feedback
- Verify DB queries handle 50+ concurrent users (test Supabase connection pool limits)
- Add support for any missing shift types (24h on-call, continental rotations, ultra-long shifts)
- Ensure sleep logging timestamps handle different timezones (healthcare workers travel)
- Stress test calendar export with large plans (8+ weeks of recommendations)
- Monitor Supabase CPU, connection count, and query latency
- Add Sentry or similar crash reporting if not already in place (to catch edge-case crashes)

**Quantitative Metrics**
- **DAU (Day 1):** 50/50 (target: 100%)
- **Onboarding completion:** % who generate plan Day 1 (target: 75%+)
- **Crash rate:** # crashes per 100 sessions (target: <0.5%)
- **API response time (p95):** Median <500ms (target: <300ms)
- **Sleep entries logged:** Total sleep logs per cohort per day (target: average 1+ per user per week)
- **Calendar exports:** % of cohort who export (target: 50%+)
- **Session length:** Median (target: >3min)
- **Supabase metrics:** CPU %, connection count, query latency (baseline for Week 5-7)

**Qualitative Signals**
- *Day 1 survey:* "Does this sleep plan match your actual shift schedule?"
- *Day 1 survey:* "What's your shift pattern?" (to catch unmodeled types)
- *Feedback:* Reports of incorrect plan timing for specific shift type → algorithm validation
- *Feedback:* "I can't select my shift time" or "Timezone is wrong" → UX bug
- *Support requests:* Bulk requests for same feature = priority signal
- *Feedback:* "The nap window is during my sleep shift" → algorithm mismatch

**Decision Point: Go/No-Go for Continued Phase 2 & Week 5**
- **GO if:** DAU 40+/50 (80%), crash rate <0.5%, API response p95 <500ms, no showstopping feedback
- **HOLD if:** DAU <35, crash spike, or algorithm feedback indicates fundamental misalignment
- **NO-GO if:** Supabase fails to scale, >2% crash rate, or security/privacy breach detected

**Sim's Action Items**
1. Monitor Supabase dashboard hourly Mon-Fri; set alerts for CPU >70%, latency p95 >500ms
2. Triage all Day 1 feedback (target: by end of day Wed); flag any crash clusters or missing shift types
3. Call 5 healthcare worker testers (pick diverse specialties: ED, ICU, night shift, rotating) for 15-min debrief; ask: "Did the plan feel realistic for your schedule?"

**Timeline:** Mon 5/13 – Sun 5/19

---

### **Week 5: Phase 2 — Retention Cliff & Sleep Quality Signal**

**Phase:** Phase 2 (Healthcare)  
**Cohort:** 50 people (same as Week 4)

**Focus Area**
Who's still using the app at Day 7? Retention is the canary in the coal mine. Real sleep quality data accumulating — does sleep logging reveal improvements? Are users comparing their actual sleep to plan recommendations?

**Build Priority**
- Ship fixes for top blockers from Week 4 feedback
- Improve sleep logging UX if completion rate <30% (add pre-filled times, simpler interface)
- Add a "week in review" feature showing plan adherence (optional: basic sleep quality trend)
- Verify all shift types from Week 4 feedback are correctly modeled
- Optimize any slow queries identified in Week 4 (e.g., sleep log retrieval for large datasets)
- Add feature flag for Week 6 polish features (don't ship yet, just prepare)

**Quantitative Metrics**
- **DAU (Day 7):** % still opening (target: 55%+)
- **Retention cohort:** % Day 1 → Day 3 → Day 7 (target: 90% → 75% → 55%)
- **Sleep entries logged:** Cumulative per cohort (target: 100+ total logs by end of week)
- **Sleep quality data:** % users with 3+ sleep logs (target: 30%+)
- **Session length (Day 7):** Median (target: >2.5min)
- **Feature adoption:** % using each feature by Day 7:
  - Calendar export: target 45%+
  - Sleep logging: target 30%+
  - Nap review: target 40%+
- **Crash rate:** # crashes per 100 sessions (target: <0.5%)

**Qualitative Signals**
- *Week 2 survey:* "Are you following your sleep plan? Why or why not?"
- *Week 2 survey:* "How has your sleep changed since using ShiftWell?"
- *Feedback:* "I'm sleeping better" or "I'm still tired" → outcome signal
- *Feedback:* Complaints about nap timing or light recommendations → algorithm validation
- *Support:* Questions about interpreting plan recommendations → education gap
- *Feedback:* "I forgot to log my sleep" → feature friction

**Decision Point: Go/No-Go for Week 6 Sprint**
- **GO if:** Day 7 DAU 27+/50 (55%), sleep logs accumulating, crash rate <0.5%, retention curve healthy
- **HOLD if:** Day 7 DAU <20 (40%), retention cliff (>40% drop Day 1→7), or sleep quality data quality poor
- **NO-GO if:** Algorithm feedback consensus = plan doesn't match real shifts, or major crash reappears

**Sim's Action Items**
1. Send Week 2 survey by Tue (5 questions on retention, sleep quality, plan relevance); compile by Thu
2. Analyze sleep log data by Fri: # logs per user, adherence rate (did they actually use plan timings?); identify patterns
3. Schedule 1-on-1 calls with 3 high-engagement and 2 low-engagement users (why the difference?); 15 min each

**Timeline:** Mon 5/20 – Sun 5/26

---

### **Week 6: Phase 2 — Polish Sprint & Phase 1 Retrospective**

**Phase:** Phase 2 (Healthcare)  
**Cohort:** 50 people (same as Week 4-5); also Phase 1 final survey

**Focus Area**
Fix the top 5 bugs/friction points from Phase 1 and 2 feedback. Prepare for Phase 3 public launch: UI polish, copy clarity, edge-case handling. Collect final Phase 1 data to inform public cohort onboarding.

**Build Priority**
- Fix top 5 bugs identified from Week 4-5 feedback (prioritize crashes, then retention-blocking issues)
- Improve app copy for clarity (tooltips, error messages, feature descriptions)
- Add any missing shift patterns discovered in Phase 2
- Optimize performance where identified (slow queries, heavy re-renders)
- Ship Week 6 feature flags (prep but don't launch Phase 3 features yet)
- Stress test with 50 concurrent sessions one final time
- Update privacy policy or disclaimers if Phase 2 feedback revealed gaps

**Quantitative Metrics**
- **DAU (Week 6):** 50 cohort active rate (target: 50%+)
- **Crash rate:** # crashes per 100 sessions (target: <0.25%)
- **Bug fix rate:** # of top-5 bugs resolved (target: 5/5)
- **Sleep logs:** Cumulative from Phase 2 cohort (target: 150+ total)
- **Feature adoption:** Stable (target: no regression from Week 5)

**Qualitative Signals (Phase 1 Final Survey)**
- *Final survey:* "Overall, would you recommend ShiftWell to a shift-worker friend?"
- *Final survey:* "What's the one thing we should improve before launch?"
- *Final survey:* "Did this app change how you sleep?" (even anecdotal "yes/no")
- *Feedback:* Any last-minute blockers or edge cases from 2+ weeks of use

**Decision Point: Go/No-Go for Phase 3 Launch**
- **GO if:** Crash rate <0.25%, top-5 bugs fixed, Phase 1 NPS-like score 7+/10, Phase 2 retention stable, no new showstoppers
- **HOLD if:** Critical bug reappears, Phase 1 NPS <5, or Phase 2 cohort reports algorithm misalignment
- **NO-GO if:** Crash rate >1%, Phase 1 consensus negative feedback, or database integrity issues found

**Sim's Action Items**
1. Final Phase 1 survey (5 questions, async); compile responses by Wed; summarize top themes for Phase 3 prep
2. Daily bug triage Mon-Fri: prioritize, assign to fix, verify resolution; aim for 5/5 fixed by Fri EOD
3. Prepare Phase 3 recruitment: draft invite emails, set up TestFlight link distribution, brief communication plan

**Timeline:** Mon 5/27 – Sun 6/2

---

### **Week 7: Phase 3 — Public Beta at Scale**

**Phase:** Phase 3 (Public)  
**Cohort:** 200 people (mix of healthcare + general shift workers, public signup)

**Focus Area**
Go wide. Monitor crash rate, infrastructure load, and unexpected edge cases from diverse users. This is the "does it work in the wild?" week. Minimal new features — focus is stability and observability.

**Build Priority**
- No new features this week — freeze code except for critical hotfixes
- Monitor Sentry/crash logs hourly for new error patterns
- Watch Supabase metrics for any scaling issues
- Add real-time monitoring dashboard (Vercel, Supabase, or custom) visible to Sim
- Prepare rollback plan (feature flag to disable problematic features, or rollout percentage limits)
- Have patch builds ready to deploy if critical bugs emerge
- Monitor App Store submission process (if parallel-tracking)

**Quantitative Metrics**
- **DAU (Day 1):** 200/200 (target: 100%)
- **Crash rate:** # crashes per 100 sessions (target: <0.25%)
- **Onboarding completion (Day 1):** % who generate plan (target: 70%+)
- **API response time (p95):** <500ms (baseline: Week 4; target: stable)
- **Supabase metrics:** CPU %, connections, query latency (target: no spikes >20% above Week 4)
- **Sleep logs:** Cumulative (target: 100+ per day from 200 users)
- **Retention (Day 3):** % still opening (target: 65%+)

**Qualitative Signals**
- *Day 1 survey:* "Any crashes, errors, or confusing flows?" (simple yes/no)
- *Feedback:* New error classes or shift patterns not seen in Phase 1-2
- *Support:* Bulk requests from specific geography/profession (e.g., "all ICU nurses report X")
- *Sentiment:* Social media or word-of-mouth feedback (if any)

**Decision Point: Monitor & Escalate**
- **MONITOR if:** Crash rate <0.5%, no new showstoppers, retention tracking Phase 1-2
- **ESCALATE if:** Crash rate >1%, new critical bug, or Supabase overload
- **PAUSE RECRUITMENT if:** Multiple crashes in same flow or security issue suspected

**Sim's Action Items**
1. Daily check-in: review Sentry, Supabase metrics, and feedback queue at 9am, 1pm, 5pm (set phone alerts)
2. Weekly sync: compile a "Week 7 Status" doc (crash trends, top issues, infrastructure health) by Fri EOD
3. Prepare for Week 8: finalize decision framework for App Store submission (go/hold/no-go criteria)

**Timeline:** Mon 6/3 – Sun 6/9

---

### **Week 8: Phase 3 — Retrospective & App Store Decision**

**Phase:** Phase 3 (Public)  
**Cohort:** 200 people (final week of beta)

**Focus Area**
Compile all 8 weeks of data. Synthesize feedback from 260 total testers (5 + 15 + 50 + 200). Make the go/no-go decision for App Store submission. Document learnings and build decisions for launch retrospective.

**Build Priority**
- No new features or major changes — only critical hotfixes
- Finalize App Store metadata (screenshots, description, keywords)
- Prepare submission package (build, privacy policy, health disclaimers, IAP setup)
- Confirm EAS build pipeline works for App Store (not TestFlight)
- Set up support workflow for post-launch (email, in-app feedback)
- Create launch retrospective doc

**Quantitative Metrics (Aggregate across all 260 testers)**
- **Overall crash rate:** <0.5% (target)
- **Onboarding completion:** 70%+ of new users generate plan (aggregate)
- **Retention (Day 7):** 60%+ of Phase 1-2 cohorts still active (aggregate)
- **Sleep quality signal:** Any measurable improvement in sleep logs vs. self-report? (directional)
- **Feature adoption:** % using calendar export, nap logging, sleep tracking (aggregate)
- **Infrastructure:** Supabase stable through 200 concurrent users? Yes/No
- **Safety/Security:** Any privacy breaches, data corruption, or health concern flags? None (target)

**Qualitative Signals**
- *Final retrospective survey:* "Would you pay $29.99/yr for ShiftWell?" (willingness-to-pay signal)
- *Final retrospective survey:* "What one thing changed about your sleep?" (outcome narrative)
- *Feedback:* Consensus on algorithm accuracy for different shift types (8h, 12h, 24h, rotating)
- *Feedback:* Any demographic or profession gaps (e.g., "worked great for nurses, not paramedics")

**Decision Framework: Go/No-Go for App Store Submission**

**GO (Submit to App Store):**
- Crash rate <0.5% sustained through Week 7
- Onboarding completion 70%+
- Day 7 retention 60%+
- No security/privacy breaches
- Algorithm feedback consensus positive (not perfect, but helpful)
- Infrastructure stable at 200 concurrent users
- Willingness-to-pay signal 60%+ "yes" or "maybe"

**HOLD (1-2 Week Extension):**
- Crash rate 0.5%-1% (fixable)
- Specific feature broken or missing (e.g., calendar export doesn't work for 10%+)
- Retention <50% (but no fundamental product issue)
- Supabase scaling needs optimization (but not broken)
- Wait for fixes, collect one more week of data

**NO-GO (Major Rework):**
- Crash rate >1%
- Algorithm feedback consensus negative ("plan doesn't match my shifts")
- Security/privacy breach or data loss
- Supabase can't scale beyond 200 users
- Retention <40% with no clear fix
- Willingness-to-pay <30%

**Sim's Action Items**
1. By Wed: compile 8-week aggregated metrics doc (crashes, retention, features, infrastructure, safety)
2. By Thu: survey all 260 testers with final retrospective (3-5 questions, async); compile by Fri EOD
3. By Fri EOD: final decision (go/hold/no-go) + retrospective post-mortem (what worked, what didn't, learnings for public launch)

**Timeline:** Mon 6/10 – Sun 6/16

---

## Cross-Week Standards

### Feedback Cadence
- **Day 1 survey (weeks 2, 4, 7):** In-app prompt + email, same-day deploy, EOD compile
- **Week 1 survey (weeks 3, 5):** End of week, 5 questions, async, compile by EOW
- **Final retrospective (week 8):** All testers, synthesis only, no new surprises

### Metrics Collection
- **Daily:** DAU, crashes (Sentry), session length
- **Weekly:** Retention cohort, feature adoption, Supabase metrics
- **Milestone (weeks 4, 6, 8):** Comprehensive review + decision point

### Issue Triage
- **P0 (Showstoppers):** Crash loops, data loss, broken core flow → 24h fix or rollback
- **P1 (Blockers):** Feature broken, major UX issue → fix by EOW
- **P2 (Nice-to-have):** Copy clarity, cosmetic bugs → backlog for future

### Communication Plan
- **Weekly status:** Sim internal doc (metrics + decisions), optional weekly email to testers (morale)
- **Critical issues:** Email/Slack alert same day
- **Weekly metrics:** Compile by EOW Fri for Sim review

---

## Success Criteria Summary

| Milestone | Success = | Watch for |
|-----------|-----------|-----------|
| Week 1 complete | 0 crashes, 100% onboarding, <5min to plan | Any blocker prevents Phase 1 launch |
| Week 3 complete | 70% Day 7 DAU, 50%+ calendar export, clear "aha moment" | Retention cliff or algorithm mismatch |
| Week 6 complete | <0.25% crash rate, top-5 bugs fixed, Phase 1 NPS 7+/10 | Critical bug or negative consensus feedback |
| Week 8 complete | <0.5% crash rate, 70%+ onboarding, 60%+ retention, infrastructure stable | Any showstopper → HOLD or NO-GO |

---

## Appendices

### A. TestFlight Logistics Checklist
- [ ] TestFlight build live and distributable (Week 1, Mon)
- [ ] Recruit Phase 0 internal testers (Week 1, Mon)
- [ ] Recruit Phase 1 F&F testers (Week 1, Fri)
- [ ] Recruit Phase 2 healthcare testers (Week 2, Fri)
- [ ] Recruit Phase 3 public testers (Week 5, Fri)
- [ ] Supabase monitoring dashboard live (Week 1, Fri)
- [ ] Sentry or crash reporting live (Week 1, Fri)
- [ ] Support email alias live (Week 3, Mon)

### B. Survey Template Outline
**Day 1 Survey (2 min):**
1. Any crashes? (yes/no)
2. Did you complete your sleep plan? (yes/no)
3. One word: how confusing was the chronotype quiz? (very/somewhat/not at all)
4. Would you recommend to a coworker? (yes/maybe/no)

**Week 1 Survey (3 min):**
1. Which feature most helpful? (plan/calendar/nap/tracking/light)
2. Have you exported to calendar? Why/why not?
3. Any confusion on what to do next?
4. Rate plan accuracy for your shifts (1-5)

**Week 2 Survey (3 min):**
1. Still following the plan? (yes/somewhat/no)
2. Sleep better since starting? (yes/no/too early to say)
3. Top improvement for us?

**Final Retrospective (5 min):**
1. Pay $29.99/yr? (yes/maybe/no)
2. Sleep improved? (specific narrative)
3. Best part of app?
4. Biggest gap?
5. Recommend to shift worker? (NPS 0-10)

### C. Roles & Escalation
- **Sim:** Daily metrics, triage, decision-maker
- **Supabase alerts:** CPU >70%, latency p95 >500ms, connection pool exhausted → Slack/email same-day
- **Crash alert:** >5 new crashes in same flow within 1 hour → investigate & hotfix within 4h
- **Feedback consensus:** 3+ reports of same issue → P1 priority

---

**Created:** 2026-04-18  
**Last Reviewed:** 2026-04-18  
**Last Edited:** 2026-04-18  
**Review Notes:** Initial creation — comprehensive 8-week beta operations plan with phase gates, weekly focus areas, decision frameworks, and cross-week standards. Ready for deployment Week 1 (4/22).
