# ShiftWell Community Launch Posts

> **Voice:** Real person sharing something they built. Not a marketing team. Not sales-y.
> **Rule:** Every post must be something Sim would actually write as himself. If it sounds like PR, rewrite it.

---

## Reddit: r/nursing

**Title:** I'm an ER doc who works nights. I built a free app that reads your shift schedule and builds a sleep plan. Looking for nurses to try it.

**Body:**

Hey r/nursing —

I'm an emergency medicine physician (DO) in Tampa. I work rotating shifts — days, nights, the whole mess.

About a year ago I drove home after a night shift and realized I couldn't remember the last mile of the drive. Not because I was on my phone. Because I was that tired. I started digging into the circadian science literature and found that the research on shift work sleep is solid and 40+ years deep — but nobody had built it into a tool that actually works with your real schedule.

So I learned to code and built one.

**What it does:**
- Reads your shift schedule from your calendar (Apple Calendar, Google Calendar, or QGenda)
- Generates a sleep plan based on circadian science (Two-Process Model, NIOSH anchor sleep, AHA 2025 guidelines)
- Puts sleep windows, nap times, caffeine cutoffs, and light exposure recommendations directly into your calendar
- Adjusts when your schedule changes — including personal events (morning appointments after night shifts, etc.)

**What it doesn't do:**
- Track your sleep (it plans it — you can use Apple Health for tracking if you want)
- Require a wearable or hardware purchase
- Sell your data
- Give generic "sleep hygiene tips" — every recommendation is personalized to YOUR shifts

It's free to download with a premium tier at $29.99/year. I'm looking for nurses, especially those on rotating night shifts, to try it and tell me what works and what doesn't.

I'm not here to sell anything. I'm a shift worker who built a tool for shift workers. If it sucks, tell me and I'll fix it. If it helps, tell your coworkers.

Happy to answer any questions about the app, the science, or why an ER doc decided to learn React Native.

[App Store link]

---

## Reddit: r/nightshift

**Title:** Built an app that reads your work calendar and tells you exactly when to sleep, nap, stop caffeine, and eat. Free to try.

**Body:**

I work nights in an emergency department. Like most of you, I've tried every sleep hack, blackout curtain setup, and melatonin dosing strategy on the internet. Some help. Most don't. The problem isn't knowledge — it's that generic advice doesn't account for YOUR specific shift pattern.

I built ShiftWell to fix that.

**How it works:**
1. Import your shifts from your phone's calendar
2. The app's algorithm (based on the Two-Process Model, NIOSH protocols, and the AHA's 2025 circadian health statement) generates a plan
3. Sleep windows, nap timing, caffeine cutoffs, meal windows, and light exposure recommendations show up in your calendar as real events

The key thing that makes this different: it reads your personal calendar too. So if you have a dentist appointment at 7 AM after a night shift, the plan adjusts your sleep window. If you're off for two days after a stretch of nights, it maps a recovery protocol that gradually shifts you back.

No wearable needed. No hardware. Just your iPhone.

I'm an ER physician (DO) in Tampa. I built this because I needed it. It's a solo project — not backed by a company or hospital system.

Free tier available. Premium is $29.99/year. Looking for night shift workers to try it and give me honest feedback.

[App Store link]

---

## Reddit: r/shiftwork

**Title:** After a year of building, my shift-work sleep app is live. It reads your calendar and builds a science-backed plan. Would love feedback from this community.

**Body:**

Hey r/shiftwork —

I've been lurking here for a while. Many of you have posted about struggling with sleep on rotating shifts, and the advice usually comes down to "blackout curtains and melatonin." That's fine, but it doesn't solve the core problem: your body clock is fighting your work schedule, and no generic tip accounts for your specific rotation.

I'm an emergency medicine physician (DO) who works rotating shifts. I spent the last year building ShiftWell — an iOS app that:

- Imports your work schedule from your calendar
- Analyzes your shift pattern and chronotype
- Generates a circadian optimization plan (sleep windows, naps, caffeine cutoff, meal timing, light protocols)
- Exports the plan to your calendar as real events

The algorithm is based on published research — Two-Process Model (Borbely 1982), NIOSH anchor sleep, Drake caffeine pharmacokinetics, AHA 2025 circadian guidelines. Not wellness influencer content.

The big differentiator: it works with your real calendar. Morning obligation after a night shift? The plan adjusts. Switching from nights to days? It maps a gradual recovery. Your partner has an event on your sleep day? It works around it.

Free to download, $29.99/year for premium features. No hardware required.

This community is exactly who I built it for. I'd genuinely appreciate honest feedback — what works, what's missing, what would make you actually use this daily.

[App Store link]

---

## Hacker News: Show HN

**Title:** Show HN: ShiftWell – Calendar-synced circadian sleep optimizer for shift workers (iOS)

**Body:**

I'm an emergency medicine physician (DO) who works rotating day/night shifts. After nearly falling asleep driving home from a night shift, I started building a sleep optimization app for shift workers.

**The problem:** 700M people globally work shifts. Existing sleep apps either track sleep retroactively or give generic advice that doesn't account for irregular schedules. No app reads your actual work calendar and generates a forward-looking sleep plan.

**What ShiftWell does:**
- Imports shifts from Apple Calendar / Google Calendar / QGenda
- Reads personal calendar events (adjusts plans around obligations)
- Generates: sleep windows, strategic naps, caffeine cutoffs, meal timing, light exposure protocols
- Exports the plan back to your calendar as real events
- Adapts when schedule changes

**The algorithm** is based on the Two-Process Model (Borbely 1982), NIOSH anchor sleep protocols, and AHA 2025 circadian health guidelines. Deterministic — no LLM inference. Every recommendation traces to peer-reviewed research.

**Technical details:**
- Expo / React Native (iOS)
- 1,059 automated tests (71 suites)
- Circadian algorithm in TypeScript — implements Process S (sleep homeostasis) and Process C (circadian rhythm) with chronotype personalization
- Calendar integration via Apple EventKit
- No backend dependency for core algorithm — runs entirely on device

**Business model:** Freemium + $29.99/year. No hardware required.

I'm a physician who taught myself to code to build this. Solo founder, bootstrapped. Looking for feedback from the HN community — especially on the algorithm approach and calendar integration architecture.

[App Store link] | [Landing page]

---

## Product Hunt

**Tagline:** Sleep autopilot for shift workers — reads your calendar, builds a science-backed plan.

**Description:**

ShiftWell is the first iOS app that reads your shift schedule and generates a complete circadian optimization plan — then puts it in your calendar.

**The problem:** 700 million people work shifts. Every sleep app tells them how they slept. None tells them how TO sleep, based on their actual upcoming schedule.

**The solution:** Import your shifts → ShiftWell generates sleep windows, nap timing, caffeine cutoffs, meal windows, and light exposure protocols → the plan appears in your calendar as real events.

**What makes it different:**
→ Reads your real work calendar (not manual entry)
→ Adjusts for personal events (morning appointment after night shift? Covered.)
→ Based on 15+ peer-reviewed studies (Two-Process Model, NIOSH, AHA 2025)
→ No wearable or hardware required
→ Built by an ER physician who works night shifts

**Built by:** Dr. Gursimran Singh, DO — emergency medicine physician, Tampa FL. Solo founder who learned to code to build the tool he needed.

**Pricing:** Free tier + $29.99/year premium (7-day trial)

**First comment (from maker):**

Hey Product Hunt — I'm Sim, an ER doctor who works nights.

I built ShiftWell because I was tired of sleep apps that told me I slept poorly (yeah, I know) without telling me what to do about it. The circadian science is 40 years deep but nobody had wired it into an app that reads your actual schedule.

The core insight: your calendar already has the most important variable — when you work. ShiftWell reads that, layers in circadian protocols, and writes a plan back. Calendar in → plan out.

I taught myself React Native to build this. 1,059 tests. Peer-reviewed algorithm. Zero wellness fluff. Would love your feedback.

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial community launch posts. Reddit (3 subreddits), Hacker News Show HN, Product Hunt listing + maker comment. All written in authentic founder voice. No sales language. Follows subreddit norms (value-first, not promotional).
