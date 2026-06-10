# ShiftWell Beta Success Metrics

## 1. What "Successful Beta" Means

A successful beta validates that ShiftWell solves a real problem for shift workers: users who import their schedules and follow the generated sleep plans report measurable improvements in sleep quality, adopt the core features consistently (>90% generate a plan, >40% export to calendar), maintain engagement through at least 4 weeks (D30 >30%), and demonstrate economic signal (>40% express intent to pay $29.99/yr). Technical stability must be indistinguishable from production-ready (<1% crash rate), and qualitative feedback should surface no fundamental flaws in the algorithm or user experience. If these conditions hold across 8 weeks and 200 testers, ShiftWell is ready for App Store submission.

---

## 2. Retention Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **D1 (Day 1 return)** | 70%+ | Beta testers are self-selected and highly motivated. Health apps average 25% D1 retention; at 70%+, we demonstrate exceptional hook. Falls indicate fundamental onboarding friction. |
| **D7 (Day 7)** | 50%+ | Week 1 is critical for sleep plan impact to show. At 50%, we're in top tier for health apps (mHealth average ~15% D7). Drop below 40% signals broken activation loop. |
| **D30 (Day 30)** | 30%+ | Shift workers need 2–4 weeks to see sleep pattern stabilization. At 30% D30, we're retaining power users who report sleep improvement. This is our target: engaged, measurable cohort. |

**Why aggressive?** These targets assume a curated beta (referral-driven, founder-vetted testers) with 10–20% higher baseline motivation than public release. D30 retention of 30% represents genuinely engaged users in a health app context—sufficient to validate retention for launch.

---

## 3. Stability Metrics

| Metric | Target | Threshold |
|--------|--------|-----------|
| **Crash-free rate** | >99% of sessions | One crash per 100 sessions is unacceptable for health software; 99%+ is table stakes. |
| **ANR (Application Not Responding) rate** | <0.5% | <30 ANRs per 10,000 sessions. On-device plan generation and calendar sync must be responsive. |
| **App launch time (cold start)** | <3 seconds | Users lose patience after 3–5 seconds. Plan generation should complete within the app, not block launch. |
| **API response time (Supabase)** | <500ms p95 | Auth, user profile, and log persistence must feel instant. p95 means 95% of requests hit this target; p99 acceptable at 1–2s for bulk operations. |

**Kill criteria:** Crash rate >1% sustained across 2+ consecutive builds triggers immediate investigation and potential hold of new test builds until root-caused.

---

## 4. Engagement Metrics

| Metric | Target | Why It Matters |
|--------|--------|---------|
| **Onboarding completion rate** | >80% | If users can't finish onboarding, nothing else matters. Below 80% indicates UX/clarity failure. Debug session recordings and drop-off points. |
| **Sleep plan generation** | >90% of users generate ≥1 plan | Core feature. >90% adoption confirms the shift schedule import and plan generation are intuitive. |
| **Calendar export** | >40% of users export ≥1 plan | Secondary feature, but critical for real-world usage. <40% suggests users don't see value in moving plans to iCal. |
| **Sleep quality logging** | >50% log ≥3 times in first 2 weeks | Key signal for engagement and outcome tracking. Logs feed our "sleep improved" metric. |
| **DAU / MAU ratio** | >30% | Of users in the app in Month 1, 30%+ should be daily or every-other-day active. Health habit apps target 20–40%. |
| **Average session length** | >90 seconds | Plan generation + view + export shouldn't take <1 min. Users lingering 90+ seconds indicates meaningful engagement. |
| **Feature adoption funnel** | Chronotype → Schedule → Plan → Export → Log | Track dropoff at each step. Ideal: 100% → 95% → 90% → 40% → 50%. Large gaps trigger UX review. |

---

## 5. NPS Target

| Score | Interpretation |
|-------|-----------------|
| **>50** | Exceptional for health software. Promoters >70%, Detractors <10%. |
| **40–50** | Good, sufficient for launch. Promoters 50–70%, Detractors 10–20%. |
| **0–40** | Warning. More neutral/detractors than promoters. Qualitative feedback essential to understand why. |
| **<0** | Kill criterion. More detractors than promoters; fundamental positioning or UX problem. |

**Segmentation:** Track NPS separately for:
- **By shift type:** Night-shift workers vs. rotating vs. split shifts
- **By outcome:** Users who report sleep improvement vs. no change (expect 20–30 point NPS gap)
- **By feature adoption:** Power users (export + log) vs. casual (plan generation only)

---

## 6. Willingness to Pay

| Criterion | Target |
|-----------|--------|
| **"Definitely" or "Probably" would pay $29.99/yr** | >40% of Week 4 survey respondents |
| **Median acceptable price point** | $20–40/yr (from open-ended responses) |
| **Feature-price association** | Track which features (calendar export, adaptive naps, chronotype) correlate with WTP >$40 |

**Measurement:** Administer willingness-to-pay survey in Week 2, Week 4, and Week 8. Ask:
- "How likely would you pay $29.99/year for ShiftWell with all current features?"
- "What price would feel fair to you?"
- "Which features are worth paying for?"

**Why 40%?** In health app freemium models, 5–10% of free users convert to paid. If 40% of engaged beta testers express intent, we're signaling 10–20x higher intent than average—strong launch signal.

---

## 7. Sleep Quality Signal

| Metric | Target | Critical? |
|--------|--------|-----------|
| **% reporting "better" or "much better" sleep after 2+ weeks** | >30% | **YES** — this is the core value prop. If <30%, the algorithm isn't working. If >30%, we have proof. |
| **Mean sleep duration change (cohort)** | +15–30 min / night by Week 4 | Supporting signal; use actigraphy or sleep logs to measure. |
| **% reporting consistent plan adherence** | >60% | Users who follow 80%+ of recommended sleep windows. High adherence validates both plan quality and user motivation. |

**Why critical:** Without sleep improvement, no amount of engagement or stability matters. This is the product promise. If after 4 weeks, users don't report better sleep, we have an algorithm problem—potential kill criterion.

---

## 8. Kill Criteria

Clear thresholds for deciding to hold or abort launch:

| Kill Criterion | Threshold | Duration | Action if Hit |
|----------------|-----------|----------|---------------|
| **Crash rate sustained** | >3% across 2+ consecutive builds | 1+ week | Halt new test builds; root-cause and fix before resuming beta |
| **D7 retention collapse** | <20% sustained | 2+ cohorts | UX failure; conduct 1:1s to debug onboarding/core loop |
| **NPS inversion** | <0 (detractors > promoters) | End of Week 4 | App positioning or experience fundamentally broken; pivot or kill |
| **Onboarding completion** | <50% | 2+ test cohorts | Users can't get through setup; redesign required |
| **Algorithm distrust** | >20% of feedback mentions "plans feel wrong/dangerous" | 4+ weeks | Safety/legitimacy issue; requires clinical review before launch |
| **Sleep improvement signal absent** | <10% report "better" sleep by Week 4 (vs. >30% target) | End of Week 6 | Core value prop failing; algorithm needs rework |
| **Legal/compliance incident** | Privacy breach, App Store guideline violation, medical claims issue | Immediate | Pause beta, remediate, legal review required before resume |

**If any kill criterion is hit:** Freeze test build distribution. Conduct triage within 24 hours. Determine: (a) can we fix with targeted iteration? (b) does this require product redesign? (c) is this a blocker for launch? Default: hold launch by 2–4 weeks and retest with new cohort. If criterion persists across retest, escalate to decision meeting with advisor(s).

---

## 9. Metrics Dashboard

**Lightweight stack (no over-engineering):**

**Option A: Supabase + Simple React Admin Page (Recommended)**
- Create a `/admin` route in the app (gated by `is_admin` user flag).
- Query Supabase views aggregating:
  - Daily cohort counts, retention curves (SQL: `COUNT(DISTINCT user_id) WHERE created_at >= date...`)
  - Crash events (from error logging table)
  - Feature usage (plan generation, export, logs) as counts and percentages
  - NPS responses (mean, promoter %, detractor %)
  - WTP survey responses (% "definitely" + "probably")
  - Sleep improvement self-reports (from user_logs table, "feeling" field)
- Render with simple charts (Chart.js or Recharts).
- Update real-time; refresh every 6 hours or on-demand.

**Option B: Google Sheet + Supabase Export (If React Admin feels overscoped)**
- Run weekly SQL exports from Supabase (via dashboard or pg_dump) → CSV.
- Import to Google Sheet with formulas and pivot tables.
- Pros: no coding, shared with team, built-in charts.
- Cons: manual refresh, latency, no real-time signal.

**Recommended: Hybrid**
- Supabase admin page for daily/real-time monitoring.
- Weekly snapshot export to Google Sheet for stakeholder reports and archiving.

**Key tables to instrument:**
```sql
-- Existing (ensure logging is complete)
user_logs (user_id, created_at, "feeling", sleep_duration_hours)
error_logs (user_id, error_type, timestamp, stack_trace)
feature_usage (user_id, feature, action, timestamp)

-- New (for beta tracking)
surveys (user_id, week, survey_type, nps_score, wtp_response, sleep_improved, created_at)
cohort_metadata (cohort_name, start_date, expected_user_count, notes)
```

---

## 10. Benchmarks

**Industry context for ShiftWell targets:**

### Health App Retention (General)
| Metric | Industry Average | ShiftWell Target | Status |
|--------|------------------|------------------|--------|
| D1 | ~25% | 70% | Aggressive (3x avg) |
| D7 | ~15% | 50% | Aggressive (3x avg) |
| D30 | ~5% | 30% | Aggressive (6x avg) |

*Source: Adjust.io 2024 mHealth benchmarks; ShiftWell targets reflect curated beta cohort.*

### mHealth App NPS
| Category | Typical Range | Note |
|----------|---------------|------|
| Health apps (avg) | 10–30 | Sleep apps (Oura, Eight Sleep) report 45–60 NPS. |
| Sleep-specific apps | 45–60 | ShiftWell target 40–50 is competitive. |
| Wearable ecosystem | 50–70 | Higher because of hardware lock-in. |

*Target NPS >40 positions ShiftWell in top-tier health software.*

### Freemium Conversion (Health Apps)
| Category | Conversion Rate |
|----------|-----------------|
| Typical health app (low intent) | 2–5% |
| Sleep/wellness (higher intent) | 5–15% |
| ShiftWell beta (engaged cohort) | Target: 40% WTP intent → ~10–15% actual conversion post-launch expected |

*If 40% of beta users say "yes" to $29.99/yr, we can project 10–20% conversion at launch, accounting for lower motivation in public users.*

### Crash Rates (iOS Health Apps)
| Rating | Crash Rate | Status |
|--------|-----------|--------|
| Excellent | <0.1% | Production-ready |
| Good | 0.1–0.5% | Launchable with post-launch monitoring |
| Acceptable | 0.5–1% | Needs investigation before launch |
| Unacceptable | >1% | Hold and fix |

*ShiftWell target >99% crash-free (i.e., <1% crash rate) matches production expectation.*

---

## Success Metrics Timeline

| Week | Key Checks | Owner |
|------|-----------|-------|
| **Cohort 1–2 (0–2 weeks)** | D1/D7 retention, onboarding completion, crash rate | Founder + QA |
| **Week 3–4** | D30 first signal, NPS + WTP survey, feature adoption funnel | Founder |
| **Week 5–6** | Sleep improvement signal, DAU/MAU ratio, engagement patterns | Founder |
| **Week 7–8** | Final retention/NPS cohorts, kill-criterion review, launch readiness decision | Founder + Advisors |

---

## Final Decision Gate

**Go/No-Go Criteria (End of Week 8):**

✅ **GO TO TESTFLIGHT** if:
- D30 retention ≥30%
- Crash-free rate ≥99%
- NPS ≥40
- Onboarding completion ≥80%
- Sleep improvement ≥30%
- Zero kill criteria triggered

⚠️ **HOLD & ITERATE** if:
- One kill criterion hit but addressable (e.g., onboarding UX issue)
- Retention trending toward targets but not yet there
- Timeline: 2–4 week fix cycle, then retest with new cohort

❌ **KILL OR PIVOT** if:
- Multiple kill criteria hit (e.g., NPS <0 AND crash rate >3%)
- Fundamental algorithm distrust (>20% of feedback)
- No path to fix within 4-week window
- Requires business model pivot (e.g., B2B instead of B2C)

---

## Freshness

**Created:** 2026-04-18  
**Last Reviewed:** 2026-04-18  
**Last Edited:** 2026-04-18  

**Review Notes:** Initial creation — comprehensive beta success metrics document including retention targets, stability criteria, engagement funnels, NPS and WTP signals, sleep improvement validation, explicit kill criteria, lightweight metrics dashboard recommendations, and industry benchmarks. Designed for 8-week beta scaling 5 → 200 testers. Metrics are aggressive but appropriate for curated, motivated cohort. Kill criteria provide clear decision gates for launch readiness.
