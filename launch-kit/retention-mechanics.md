# ShiftWell Retention Mechanics

**Targets:** D7 retention ≥ 50% · D30 retention ≥ 30%

This document defines the retention systems that keep shift workers coming back. Every mechanic is designed around the irregular, high-fatigue reality of shift work — not the 9-to-5 assumptions baked into most wellness apps.

The framework draws on two behavioral models throughout:

- **Nir Eyal's Hook Model** (Trigger → Action → Variable Reward → Investment) — each mechanic maps to at least one phase of the hook cycle.
- **BJ Fogg's Tiny Habits** (Motivation × Ability × Prompt) — we reduce friction and anchor new behaviors to existing routines (e.g., post-shift wind-down, pre-sleep ritual).

---

## 1. Sleep Score Gamification

A daily sleep score (0–100) gives users a single number to orient around. This is the core **variable reward** in the Hook Model — scores fluctuate based on real behavior, creating curiosity and motivation to improve.

### Score Breakdown

| Component | Weight | What It Measures |
|-----------|--------|------------------|
| Duration | 30% | Total sleep vs. recommended for shift type |
| Timing Alignment | 25% | How well sleep window matches circadian plan |
| Consistency | 20% | Day-to-day regularity of sleep/wake times |
| Efficiency | 15% | Time asleep vs. time in bed (self-reported or wearable) |
| Debt Trend | 10% | Direction of cumulative sleep debt (improving = higher score) |

### Shift-Aware Scoring

Standard sleep apps penalize night-shift workers for sleeping during the day or getting 6 hours after a 12-hour overnight. ShiftWell doesn't.

- **Dynamic baselines:** Expected duration adjusts per shift type. A 6.5h sleep after a 12h night shift scores the same as 7.5h after a day shift, based on NIOSH fatigue modeling.
- **Timing alignment is relative to plan, not clock time.** Sleeping 8am–3pm scores 100% on timing if that's what the algorithm recommended.
- **Transition days get leniency.** Consistency scoring relaxes during day↔night rotation transitions — the app knows the user is shifting, not slipping.
- **Anchor sleep recognition.** Maintaining a consistent anchor sleep block (per NIOSH CDC protocol) earns bonus consistency points even if total sleep is split.

### Streaks & Milestones

Streaks are the **investment** phase of the Hook Model — users accumulate value they don't want to lose.

| Milestone | Badge | Reward |
|-----------|-------|--------|
| 7-day streak | "Week Warrior" | Unlock detailed sleep stage estimates |
| 30-day streak | "Monthly Master" | Unlock trend comparison charts |
| 90-day streak | "Quarter Champion" | Unlock lifetime sleep analytics |
| Personal best score | "New Record" celebration | Confetti animation + shareable card |

Design rules for streaks:

- **Streak freeze:** One free freeze per week (Fogg: reduce friction to maintain habit). Users don't lose a streak for one missed day — life happens, especially in shift work.
- **Streak recovery:** If a streak breaks, show "you were at 12 days — get back to 7 and we'll restore it." This is a loss-aversion nudge (Kahneman & Tversky) that re-engages lapsed users instead of demoralizing them.
- **No shame mechanics.** Low scores get constructive framing: "Your score was 42 — here's one thing to try tonight." Never "You failed."

### Personal Best Celebrations

When a user hits a new high score, the app fires a brief celebration (confetti, haptic, sound — all configurable). The **variable reward** is the score itself; the celebration is a **dopamine marker** that reinforces the behavior loop.

- First-ever score: special "Welcome to your baseline" framing.
- New personal best: "New record! 🏆 You beat your previous best of 74."
- Trending up: "Your 7-day average is up 8 points. The plan is working."

---

## 2. Smart Notifications

Notifications are the **external trigger** in the Hook Model. Done wrong, they drive uninstalls. Done right, they're the on-ramp back into the app.

### Notification Types

**Pre-Sleep Window Reminder**
- Default: 30 minutes before recommended sleep window.
- Configurable: 15 / 30 / 45 / 60 min, or off.
- Content: "Your sleep window opens in 30 min. Time to start winding down." + optional wind-down checklist link.
- Fogg anchor: ties to the existing behavior of finishing a shift or evening routine.

**Caffeine Cutoff Alert**
- Triggered based on logged substances and the user's caffeine half-life estimate (default 5h, adjustable).
- Example: "Last call for caffeine — after this, it'll push into your sleep window."
- Only fires if the user has substance tracking enabled (progressive disclosure, see §4).

**Weekly Sleep Report**
- Delivered Sunday morning (time adjustable for non-standard weeks).
- One-screen summary: average score, best night, worst night, total debt change, one actionable insight.
- This is the **variable reward** — users look forward to seeing how their week went.

**Fatigue Alert**
- Fires when the user has been awake 14+ hours (calculated from last logged wake time or wearable data).
- Content: "You've been up for 15 hours. If you're driving, consider a 20-min power nap first."
- Safety-critical framing — this isn't about score, it's about not falling asleep at the wheel.
- Respects shift context: doesn't fire mid-shift (unless user opts in), only fires during commute/off-duty windows.

### Notification Fatigue Prevention

| Rule | Implementation |
|------|----------------|
| Daily cap | Max 3 push notifications per 24h period |
| Dismiss detection | If user dismisses 3 notifications in a row without opening, auto-reduce to 1/day for 7 days |
| Recovery | After 7 days of reduced notifications, test with 2/day. If engagement returns, resume normal cadence |
| Night shift respect | No notifications during logged sleep windows, ever |
| Preference learning | Track which notification types get opened vs. dismissed; deprioritize low-engagement types |

This implements Fogg's principle of **right prompt, right moment** — a notification that arrives during sleep or gets ignored repeatedly is a prompt with zero ability, which means zero behavior change and maximum annoyance.

---

## 3. Social Features (Lightweight, Privacy-First)

Social features add **external accountability** without compromising the privacy that healthcare workers need (HIPAA adjacency, institutional politics, stigma around sleep struggles).

### Anonymous Unit/Team Leaderboards

- **Opt-in only.** Never auto-enrolled.
- Users join by team code (e.g., "TrinityED-Night") — no real names, just handles.
- Leaderboard shows: team average score, individual rank (pseudonymous), top 3 streaks.
- **B2B angle:** Hospital administrators can create org-wide challenges ("Night Shift Sleep Challenge — March 2027"). This is the wedge into enterprise contracts.
- Privacy: no individual sleep data is shared. Only aggregate score and rank.

### Sleep Buddy

- Pair with one accountability partner (colleague, spouse, friend).
- Both see each other's daily score and streak (nothing else).
- Optional daily check-in prompt: "Your buddy scored 71 last night. Send them a 👊?"
- This is Fogg's **social motivation** — knowing someone sees your score changes behavior more than any algorithm.

### Share to Instagram Stories

- One-tap export of a branded sleep score card (dark theme, ShiftWell logo, score, streak count).
- Template: minimal, aesthetic, no clinical data — just "I scored 82 on ShiftWell 🌙" with a download link.
- **Viral loop:** each share is a free acquisition channel. The card includes a subtle "shiftwell.app" watermark.
- User controls exactly what's shared — no auto-posting, no social graph access.

---

## 4. Progressive Disclosure

New users are overwhelmed by feature-dense apps. Progressive disclosure creates **curiosity loops** (Hook Model) and prevents cognitive overload (Fogg: increase ability by reducing complexity).

### Unlock Schedule

| Week | What's Available | Why Now |
|------|-----------------|---------|
| Week 1 (D1–D7) | Basic sleep plan + daily sleep score + wind-down checklist | Core value prop. User must experience "this app knows my schedule" before anything else. Minimum viable hook. |
| Week 2 (D8–D14) | Substance tracking (caffeine, melatonin, alcohol) | User has established the logging habit. Adding inputs improves plan accuracy — they feel the plan getting smarter. |
| Week 3 (D15–D21) | Detailed analytics (sleep debt chart, weekly trends, timing heatmap) | Enough data to show meaningful patterns. "You sleep 40 min less on your first night shift" — this kind of insight requires 2+ weeks of data. |
| Week 4 (D22–D30) | Personalized recommendations adapt to observed patterns | Algorithm has enough signal to make confident suggestions. "Based on your data, moving your anchor sleep 30 min earlier could improve your score by ~6 points." |

### Implementation Details

- Unlocks are communicated with a brief in-app banner: "New: Substance Tracking is now available. Log your caffeine to sharpen your plan." One tap to try, one tap to dismiss.
- Features don't disappear if unused — they're available but not forced.
- Premium features (advanced analytics, team leaderboards, multi-schedule support) are always visible but gated with a "Premium" badge. This uses the **endowment effect** — users see what they're missing, increasing upgrade motivation after the 7-day trial ends.
- If a user skips a week (e.g., doesn't open during week 2), the unlock still happens on next open. Clock is based on calendar days from install, not active days.

---

## 5. Re-engagement Flows

Users lapse. The question is whether they come back. Each tier escalates from lightweight to heavier outreach, respecting the user's signal that they're disengaging.

### Lapse Tiers

**3 Days Inactive — Gentle Nudge**
- Channel: Push notification (if enabled).
- Tone: Warm, zero guilt. "Your sleep plan is ready when you are. Tap to see tonight's window."
- Hook Model: This is a **re-trigger**. The reward (seeing a personalized plan) is still available.
- Fogg: Make the action tiny — just open and look. No logging required.

**7 Days Inactive — Data-Driven Pull**
- Channel: Push notification.
- Tone: Curiosity-driven. "Your sleep data shows an interesting pattern from last week — come take a look."
- This leverages the **curiosity gap** (Loewenstein 1994) — the user has to open the app to close the information gap.
- If the user has wearable integration, use real data: "You averaged 5.8h last week. Your plan can help you get to 6.5h."

**14 Days Inactive — Minimal Friction Re-entry**
- Channel: Push notification.
- Tone: Ultra-low-friction ask. "Quick 30-second check-in: how'd you sleep last night? Just tap a rating."
- Opens directly to a 1-tap sleep rating screen (1–5 stars). No login wall, no onboarding re-flow.
- Fogg: Shrink the behavior to its smallest possible version. Rating one night is easier than resuming full tracking.
- If they rate, immediately show a score estimate and a "welcome back" plan.

**30 Days Inactive — Email Only**
- Channel: Email (never push — at this point, push notifications feel intrusive).
- Tone: Respectful, acknowledges the gap. "It's been a while. If your schedule changed, ShiftWell can build a fresh plan in 60 seconds."
- Offer: "Fresh start" button that clears old data and re-runs onboarding. Some users lapse because their rotation changed and old data feels stale.
- Include one compelling stat: "Users who came back after a break improved their sleep score by an average of 11 points in the first week."

**Win-Back (45+ Days)**
- Channel: Email only, max 1 per month.
- Content: Changelog-driven. "Since you've been away: [new feature], [new feature], [improvement]."
- Social proof: "12,000 shift workers are now using ShiftWell."
- Final email at 90 days: "We'll stop emailing unless you want to hear from us. Tap to stay subscribed."
- After 90 days of inactivity with no email engagement: suppress from all outreach. Respect the exit.

### Anti-Patterns to Avoid

- Never use guilt ("You haven't logged in 5 days!").
- Never inflate urgency ("Your streak is about to expire!" when they're already lapsed).
- Never send re-engagement pushes during sleep windows.
- Never stack multiple re-engagement messages — one per tier, then wait.

---

## 6. Shift Worker-Specific Hooks

These are the mechanics that no generic sleep app can replicate. They're the reason shift workers stay with ShiftWell instead of switching to Oura, Rise, or SleepCycle.

### Schedule Change Detection

- When a new schedule syncs from QGenda/Google Calendar, the app detects rotation changes automatically.
- Push notification: "New rotation detected — your plan has been updated for the transition."
- This is the most powerful **trigger** in the Hook Model for this audience: the moment their schedule changes is the moment they most need the app.
- The plan recalculates immediately — no manual input needed. The user opens to a fully updated week.

### Pre-Shift Prep Checklist

A customizable checklist that surfaces 2–4 hours before a shift:

- ☐ Nap opportunity (if applicable per algorithm)
- ☐ Caffeine timing reminder
- ☐ Meal timing suggestion
- ☐ Light exposure recommendation (bright light or blue-blocking, depending on shift direction)
- ☐ Gear check (sunglasses for post-night drive home, blackout curtains set up)

Fogg's **action prompt** anchored to an existing routine (getting ready for shift). Each checklist item is a tiny habit with a clear trigger (time before shift) and zero ambiguity about what to do.

### Post-Shift Wind-Down Routine

Surfaces after shift end (detected via calendar or manual check-in):

- Guided 5-minute wind-down (breathing exercise, optional).
- Light blocking reminder ("Put on blue-blockers now if heading home in daylight").
- "Don't check your phone in bed" nudge (configurable).
- Estimated sleep window: "Based on your shift, aim to be asleep by 8:15 AM."

This is the **investment** moment — the user puts effort into the wind-down, which increases their likelihood of returning (sunk cost + improved outcome).

### Payoff Moments

The most critical retention mechanic for long-term users. The app must **prove it's working.**

- After 7 days on a new protocol: "Your sleep improved 18% since switching to the compromise protocol."
- After a rotation transition: "You adapted to night shifts 2 days faster than your previous rotation."
- Monthly: "This month you slept 14 more hours than last month. That's almost two full nights recovered."
- These are **variable rewards with personal relevance** — the strongest type in the Hook Model. The user can't predict exactly what the insight will be, and it's about *their own data*.

### Commute Safety Check

- Post-night-shift: "You've been awake 13 hours. Your reaction time may be impaired. Consider a 20-min nap before driving."
- References: Barger et al. (2005) — extended work shifts increase motor vehicle crash risk 168% for healthcare workers.
- This isn't just retention — it's a feature users tell colleagues about. Word-of-mouth from "this app might have saved my life driving home" is worth more than any ad campaign.

---

## Behavioral Psychology Summary

| Mechanic | Hook Model Phase | Fogg Element | Primary Retention Target |
|----------|-----------------|--------------|------------------------|
| Sleep Score | Variable Reward | Motivation (progress tracking) | D7 |
| Streaks & Badges | Investment | Motivation (loss aversion) | D30 |
| Pre-sleep Notification | External Trigger | Prompt (right time) | D7 |
| Weekly Report | Variable Reward | Motivation (curiosity) | D30 |
| Team Leaderboard | Investment + Reward | Social motivation | D30 |
| Progressive Disclosure | Variable Reward | Ability (reduce complexity) | D7 → D30 bridge |
| Re-engagement Flows | External Trigger | Prompt (re-trigger) | D30 recovery |
| Schedule Detection | External Trigger | Prompt (context-aware) | D30 |
| Payoff Moments | Variable Reward | Motivation (proof of value) | D30 |

---

## Implementation Priority

**Phase 1 — Ship for TestFlight (pre-launch):**
Sleep score with shift-aware baselines, pre-sleep notification, progressive disclosure framework, fatigue alert.

**Phase 2 — Launch week:**
Weekly report, streaks with freeze mechanic, caffeine cutoff alert, share to Stories.

**Phase 3 — Post-launch (D30–D60):**
Re-engagement flows (all tiers), post-shift wind-down, pre-shift checklist, payoff moments.

**Phase 4 — B2B readiness:**
Team leaderboards, sleep buddy, org-level challenges, admin dashboard.

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. All six retention mechanic categories defined with behavioral psychology grounding. Implementation phased across TestFlight → launch → post-launch → B2B.
