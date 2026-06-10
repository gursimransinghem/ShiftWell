# ShiftWell Beta Tester Onboarding Flow

## 1. Welcome Message

Welcome to ShiftWell beta.

You're among the first to use this app. We're a small team with one goal: build the sleep optimization tool we wished existed when we were shift workers ourselves.

I'm Dr. Gursimran Singh—EM physician, shift worker, and founder. This app came out of frustration with my own sleep during residency. We've spent the last year researching sleep science, talking to ER nurses, paramedics, and night-shift ICU residents, and building a tool that works the way *we* actually need it to.

Beta means you'll find rough edges. Some UI polish is still landing. Calendar import might not handle every edge case. But the core algorithm is solid—it's based on published research (Two-Process Model, NIOSH protocols, circadian chronobiology) and tested against real shift worker data.

Your feedback directly shapes what ships next. Every crash report, every "this would be better if..." message makes the app better. We read every single one.

Thank you for believing in this enough to test it with us.

—Dr. Singh

---

## 2. What to Expect

ShiftWell does one thing really well: it takes your shift schedule and generates a personalized sleep, nap, meal, and light plan designed to keep your circadian rhythm as stable as possible.

**How it works:**
1. You tell ShiftWell your shift pattern (manual entry or calendar import)
2. You answer a few questions about your chronotype (are you a morning person or night owl?)
3. The algorithm generates science-backed recommendations for when to sleep, eat, and expose yourself to light
4. You export the plan to your calendar and see how it affects your actual sleep

**It's not AI-generated guesses.** The math comes from decades of circadian research—Borbel's Two-Process Model, Eastman & Burgess circadian shifting, NIOSH anchor sleep protocols, Czeisler's bright-light timing. The algorithm is deterministic: same input, same output. No LLM involved.

**This is a beta, so expect:**
- Some UI elements still being refined
- Possible crashes (report them—they help us fix things fast)
- Calendar import might not handle all custom event formats
- Notifications may need some tuning to your phone's behavior
- Features still in progress (Apple Watch integration is next quarter)

**You get full premium access during beta.** No paywalls, no limits. Test everything.

---

## 3. How to Give Feedback

We want to hear from you. Three ways to reach us:

### In-App Feedback
- **Shake your device** (settings in iOS) — opens a feedback form. Type what you found and optionally attach a screenshot.
- **Settings > Send Feedback** — same form, no shake needed.

**What makes good in-app feedback:**
- Be specific: "Calendar import failed when I tried to add a weekly shift pattern" is better than "calendar is broken"
- Include a screenshot if possible
- Tell us what you expected vs. what actually happened
- Let us know your shift type (night shift, rotating, etc.)—context helps us reproduce issues

### TestFlight Feedback
TestFlight has a built-in screenshot tool:
- While using the app, swipe up from the bottom (iPhone) or down from the top (if you have the TestFlight overlay enabled)
- Take a screenshot or write a note
- Submit directly in TestFlight
- Fastest way to flag a visual bug or UI polish issue

### Email
Email us at **beta@shiftwell.app** for:
- Feature requests you're passionate about
- Ideas for how the algorithm should work differently
- General product feedback
- Anything that doesn't fit the other channels

**Subject line examples that help us triage:**
- `[BUG] Calendar import crashes on weekly patterns`
- `[FEATURE] Apple Watch notification of nap windows`
- `[UX] Settings UI is confusing`
- `[QUESTION] How does algorithm handle split shifts?`

---

## 4. Known Limitations (and Why)

Setting expectations early prevents frustration.

**Calendar Import**
- Works great with standard recurring shifts and Apple Calendar
- May skip or misinterpret custom all-day events
- Google Calendar sync is in beta (may have edge cases)
- Workaround: manual entry is always reliable

**UI Polish**
- Some screens still lack final design polish
- Buttons and colors will be refined before public launch
- Layout may shift on different phone sizes (we're optimizing)

**Notifications**
- Timing may drift based on your phone's power-saving settings
- We're still tuning the balance between helpful and annoying
- You can fully customize notification timing in Settings

**Battery Optimization**
- Battery usage is being tuned—expect this to improve in coming builds
- If you notice unusual drain, let us know your usage pattern and phone model

**No Apple Watch Integration Yet**
- Notifications go to your phone only
- Watch app is Q3 2026 priority
- Workaround: Set phone notifications to critical so they come through anyway

**Data Syncing**
- Cloud sync via Supabase is optional and still in beta
- Local-only mode is fully stable (and is our default)
- If you enable sync, you might see occasional "syncing..." delays

---

## 5. Privacy Assurance

We built this to be trustworthy.

**Your schedule data stays on your device.** Period. No uploading shift times to the cloud unless you explicitly enable it.

**We never see your calendar.** When you import from Apple Calendar, we read only the times (start/end of shifts). Your actual event titles, locations, descriptions—we don't touch them. They never leave your phone.

**Optional cloud sync is encrypted end-to-end.** If you choose to sync across devices, all data is encrypted before it leaves your phone. Supabase stores encrypted blobs. We cannot decrypt them.

**No data is sold or shared.** Not to insurance companies, not to employers, not to advertisers. Never.

**Anonymous usage analytics.** We collect:
- Crash reports (stack traces, device model, iOS version)
- Feature usage (did you use calendar import? How often did you view your sleep plan?)
- Aggregated counts (no personally identifiable info)

Why? To understand what's working and what's not. It helps us prioritize fixes and features.

**You can delete all your data anytime.**
- Settings > Data & Privacy > Delete All Data
- Removes everything: shifts, sleep logs, preferences, sync data
- Takes 2 seconds, no confirmation delay, no data recovery option
- It's gone forever—by design

**We're registered with HIPAA legal counsel** because sleep optimization sits in health space. We take that seriously.

---

## 6. Quick Start Guide

Five steps to get going. First 5 minutes.

### Step 1: Complete Your Chronotype Questionnaire
When you open the app for the first time, you'll see a 5-question survey: "Are you a morning person or night owl?" and similar.

This helps the algorithm calibrate sleep recommendations to *your* circadian preference. It takes 2 minutes. Answer honestly—there are no wrong answers.

### Step 2: Add Your First Shift Schedule
Two ways to do this:

**Option A: Import from Calendar (fastest)**
- Tap "Add Schedule"
- Select "Import from Apple Calendar"
- Pick a calendar and a date range (e.g., next 60 days)
- ShiftWell reads your shift times and auto-creates a schedule
- Review the detected shifts and adjust if needed

**Option B: Manual Entry (most reliable)**
- Tap "Add Schedule"
- Select "Manual Entry"
- Enter your shift pattern (e.g., "11 PM to 7 AM, Mon–Fri")
- If you work a rotating pattern, add each unique shift and how often it repeats
- Takes 5–10 minutes but gives you full control

### Step 3: Review Your Generated Sleep Plan
After you add a schedule, ShiftWell generates a full sleep, nap, meal, and light plan for the next 30 days.

- Sleep windows: when to aim for sleep (respects your chronotype)
- Nap opportunities: 20–30 min power naps if you're at risk of fatigue
- Meal timing: when to eat to support your circadian rhythm
- Light exposure: when to seek bright light, when to avoid it

Swipe through the recommendations. You don't have to follow them exactly—they're a guide. Adjust in Settings if you want shorter naps or different meal times.

### Step 4: Export Sleep Windows to Your Calendar
This is the magic.

- Tap "Export to Calendar"
- Choose which recommendations you want (e.g., just sleep windows, or sleep + naps + light breaks)
- ShiftWell creates calendar events on your phone
- You can color-code them (blue for sleep, green for naps, etc.)

Now your sleep plan shows up alongside your shift schedule. You see conflicts at a glance. You can set reminders for nap windows or pre-sleep wind-down time.

### Step 5: Log Your Sleep and Rate Your Plan
Each morning, ShiftWell reminds you to log how well you slept (1–10 scale, or just tap the notification).

Over time, this data builds a picture of what works for *you*. The algorithm learns. You see trends. We see what recommendations actually improve sleep quality—and we use that to improve the app.

---

## 7. TestFlight "What to Test" Email

Copy this text into TestFlight's "What to Test" field when you invite beta testers.

---

### What to Test in ShiftWell Beta

**Thanks for being an early tester.**

ShiftWell is an AI-free circadian sleep optimization tool for shift workers. It uses research-backed algorithms (Two-Process Model, NIOSH protocols) to generate personalized sleep, nap, meal, and light plans based on your shift schedule.

**Focus on these areas:**

1. **Onboarding** — Does the chronotype questionnaire make sense? Does calendar import work with your calendar app? Manual shift entry intuitive?

2. **Algorithm Output** — Do the generated sleep recommendations feel realistic for your shift type? Are nap suggestions helpful? Light-exposure timing make sense?

3. **Calendar Export** — Can you export the plan to your calendar without crashes? Do events show up correctly? Can you color-code them?

4. **Reliability** — Do crashes happen? If so, what were you doing? Does the app recover gracefully if your phone goes to sleep?

5. **Usability** — Is anything confusing? Are buttons where you expect them? Is the app fast or sluggish?

6. **Battery & Performance** — Does the app drain your battery faster than expected? Any lag in scrolling or menu navigation?

**How to Send Feedback:**

- **In-app:** Shake your device or tap Settings > Send Feedback (attach a screenshot)
- **TestFlight:** Use TestFlight's native screenshot tool (swipe up from home, take a screenshot, submit)
- **Email:** beta@shiftwell.app with [BUG], [FEATURE], [UX] tags in subject line

**Known Limitations:**
- Some UI polish in progress (final design landing soon)
- Calendar import may not handle all custom event formats (workaround: manual entry)
- Apple Watch integration coming Q3 2026
- Optional cloud sync is in beta (local-only mode is fully stable)

**Privacy:**
- All shift and sleep data stays on your device by default
- We only see crash reports and anonymous usage metrics
- You can delete all data anytime in Settings > Data & Privacy > Delete All Data
- See the in-app Privacy Policy for full details

**Thank you.** Your feedback makes this app better.

—Dr. Gursimran Singh, Founder

---

## 8. FAQ (Quick Answers for Testers)

**Q: Will ShiftWell work for my shift type?**
A: We've tested rotating shifts, nights, overnight on-call, split shifts, and mixed schedules. If your shift pattern is unusual, manual entry gives you full control. Let us know how it goes.

**Q: Can I use ShiftWell on multiple devices?**
A: Not yet during beta. We recommend picking one device as your primary. Cloud sync is coming post-beta.

**Q: What happens to my data if I uninstall the app?**
A: If you enabled cloud sync, your data is backed up (encrypted). If you only used local storage, all data is deleted when you uninstall. Always export your calendar before uninstalling.

**Q: Is this HIPAA-compliant?**
A: We've had HIPAA counsel review our privacy and data handling. We don't require you to provide health info—you're logging sleep yourself. But yes, we take health privacy seriously. See the full Privacy Policy in Settings.

**Q: Can I turn off notifications?**
A: Yes. Settings > Notifications > toggle each type off. We default to minimal notifications (morning sleep log reminders only).

**Q: What if I find a crash?**
A: Shake your device and send the crash report in-app. That gives us a stack trace and your device info—faster than email. If you can reproduce it, tell us the steps.

**Q: Will my feedback actually be used?**
A: Yes. We're pre-launch. Every piece of feedback from testers influences what ships in v1.0. We track all requests and prioritize the most-asked-for features.

---

## Freshness Footer

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation — beta tester onboarding flow. Ready for TestFlight invite template and onboarding screen integration.
