# I'm an ER Doctor Who Built a Sleep App at 3 AM Between Patients. Here's Why.

*By Dr. Gursimran Singh, DO — Emergency Medicine Physician, Tampa, FL*

---

It was 3:17 AM on a Tuesday in the emergency department when it clicked.

I'd just finished intubating a septic patient in Bay 12. The respiratory therapist was dialing in the vent settings. The nurse was hanging pressors. My adrenaline was still running hot, the way it does after a critical airway — that shaky, electric calm that comes after you've done something you can't undo.

I stepped out to the physician workstation, cracked open a chart for the next patient — a 34-year-old with chest pain, almost certainly noncardiac — and in that brief pause between one life and the next, I pulled out my phone to check when I should try to sleep after this shift.

The app I opened — one of the big-name sleep trackers — cheerfully informed me that my "ideal bedtime" was 10:30 PM.

I was seven hours into a twelve-hour overnight. I wouldn't see my bed until almost 8 AM, and even then, I'd be fighting daylight, garbage trucks, and a circadian system screaming at me to stay awake. The app had no concept of any of this. It was built for someone who wakes up at 7 and goes to bed at 11. Someone whose biggest sleep challenge is putting down their phone.

That's not me. That's not any of us.

I'm one of 22 million shift workers in the United States. Nurses, paramedics, firefighters, police officers, factory workers, pilots, truck drivers — people who keep the world running while the world sleeps. And 63% of us report significant sleep problems. Not the "I scrolled TikTok too late" kind. The kind where you drive home after a night shift with the windows down in January because you're genuinely afraid you'll fall asleep at the wheel. The kind where you miss your kid's soccer game because your body shut down at 2 PM and you couldn't override it. The kind that, over years, chips away at your health, your relationships, and your ability to do a job where mistakes cost lives.

I decided that night — between a sepsis case and a chest pain rule-out — that I was going to build something better.

## The Sleep Nobody Talks About

Here's what shift worker sleep actually looks like.

You finish a 7 PM to 7 AM shift. You drive home in morning sunlight, which is the single worst thing you can do for your circadian rhythm but also unavoidable unless you plan to live in the hospital. You get home. You've taped tinfoil over your bedroom windows because blackout curtains aren't dark enough. You've got earplugs in and a white noise machine running. Your partner is getting ready for work, trying to be quiet, failing.

You lie there. Your body temperature is rising — it's supposed to, because your biology thinks it's morning, because it *is* morning. Your cortisol is spiking. Melatonin production shut off an hour ago. Every physiological system you have is saying *wake up*.

You took 5 mg of melatonin before bed. It's doing almost nothing, because melatonin isn't a sledgehammer — it's a timing signal, and you took it at the wrong time. The correct window for melatonin when you're trying to shift your circadian clock after night work is specific, and it's probably not when you think it is.

You eventually fall asleep around 9:30 AM. You wake up at 1 PM — not because you're rested, but because your body decided it was done. You got three and a half hours. You have another night shift tonight.

Now multiply that by three nights in a row. Then switch back to day shifts next week. Then do it again the week after.

This is the reality for millions of people. And when they Google "how to sleep better as a shift worker," they get listicles. *Try blackout curtains. Avoid caffeine. Establish a routine.* As if the problem is that we haven't tried hard enough.

The problem isn't effort. The problem is that human circadian biology doesn't care about your work schedule. And nothing on the market actually addresses that.

## Why Every Sleep App Gets This Wrong

I tried them all. Seriously — I went through a phase where I had six sleep apps on my phone, running simultaneously, hoping one of them would crack the code.

**Sleep Cycle** tracks your sleep stages and wakes you during light sleep. Fine. But it's purely retrospective. It tells you *how* you slept — information that's approximately useless when you already know the answer is "terribly." It has no concept of shift schedules, no forward-looking recommendations, no circadian awareness.

**WHOOP** is impressive hardware with a $30/month subscription. It measures strain, recovery, and sleep performance. But it's designed for athletes optimizing around a consistent schedule. If your "schedule" is three night shifts followed by two days off followed by two day shifts, WHOOP's recovery metrics become noise. It doesn't know *why* your HRV tanked — it can't distinguish between "you're overtraining" and "you're fighting your circadian clock."

**Timeshifter** actually understands circadian science. It's built for jet lag, and it works well for that. But jet lag is a one-time phase shift. Shift work is a *recurring* phase conflict. You're not adjusting to a new time zone — you're living in two time zones simultaneously, switching between them every few days. Timeshifter doesn't handle rotating schedules, and it doesn't integrate with your actual work calendar.

**Rise** is probably the closest to what shift workers need — it's built on the Two-Process Model and tracks your sleep debt. But it assumes you have a consistent wake time. If you tell Rise you woke up at 8 AM yesterday and 8 PM today, it doesn't adapt. It breaks.

Every one of these apps was built on the same assumption: that you sleep at night and wake in the morning, on a roughly consistent schedule, like a normal human being. Shift workers aren't normal human beings. We're asking our bodies to do something they weren't designed to do, and we need tools that understand that.

## The Science That Actually Works

ShiftWell isn't built on vibes or wellness trends. It's built on chronobiology — the actual science of how circadian rhythms work, how they shift, and how to work with them instead of against them.

The foundation is the **Two-Process Model**, published by Alexander Borbély in 1982 and still the dominant framework in sleep science. It describes sleep regulation as two interacting processes: a homeostatic sleep drive (Process S) that builds the longer you're awake, and a circadian rhythm (Process C) that oscillates roughly every 24 hours. Your ability to sleep — and the quality of that sleep — depends on where these two processes intersect.

For day workers, they align naturally. You get tired at night, you sleep, you wake up refreshed. For shift workers, they're perpetually out of phase. You have high sleep pressure after a night shift, but your circadian system is promoting wakefulness. You're exhausted but wired. That's not a personal failing — that's physics.

ShiftWell models both processes for your specific schedule. It knows when your circadian nadir is (the biological low point, usually around 4-6 AM for day-oriented people, but shifted for night workers). It knows how your sleep pressure accumulates based on your actual wake times. And it uses that to generate personalized recommendations — not generic tips, but specific windows.

For rotating shift workers — the hardest case — we implement a **compromise phase position** based on the protocol developed by Charmane Eastman's lab at Rush University. The idea is that for workers who rotate between days and nights, you don't try to fully shift your circadian clock (it won't shift fast enough, and you'll just have to shift it back). Instead, you find a compromise position — a partial shift that makes both schedules tolerable. The algorithm calculates this based on your rotation pattern and recommends light exposure, light avoidance, sleep windows, and strategic napping to maintain that position.

We also incorporate NIOSH anchor sleep protocols — the idea that maintaining a consistent core sleep window (even if it's only 3-4 hours) across all your schedule types provides a stable reference point for your circadian system.

This isn't a meditation app with a moon logo. It's applied science, implemented as software, personalized to your schedule.

## Building Something From Nothing

I should be honest about something: when I started this, I didn't know how to code.

I'm an emergency medicine physician. I trained to read EKGs and manage airways, not to write React Native components. My technical background was limited to knowing enough about EMR systems to be frustrated by them.

But I had two things going for me. First, I had AI. Not the chatbot-giving-you-recipe-suggestions kind — I mean real agentic AI tools that could help me architect, write, and debug code. I learned to build by building, with Claude as my co-pilot. I'd describe what I wanted, understand what it generated, push back when something didn't make sense, and iterate. Over months, I went from copying and pasting code I didn't understand to reviewing pull requests and catching edge cases.

Second — and this is the part most tech founders don't have — I'm the user.

I don't need to run user interviews to understand the problem. I don't need to build personas or conduct empathy mapping workshops. I've driven home at 7:30 AM with my vision blurring. I've cancelled plans with Jess because my body crashed six hours before I expected it to. I've stood in a resuscitation bay at 4 AM running a code on three hours of sleep, knowing that my cognitive function is measurably impaired but also knowing that there's nobody else.

Every feature in ShiftWell exists because I needed it. The shift calendar import exists because I was tired of manually entering my QGenda schedule. The strategic nap recommendations exist because I learned — through the literature and through personal experimentation — that a 20-minute nap at the right time can be more effective than an extra hour of poorly-timed sleep. The caffeine cutoff timing exists because I kept drinking coffee too late and destroying my post-shift sleep window without realizing the pharmacokinetics were working against me.

The codebase is now over 34,000 lines. We have 1,059 automated tests across 71 test suites. The algorithm is deterministic — no LLM hallucinations, no black-box recommendations. Every output traces back to published research. When ShiftWell tells you to start your sleep window at 09:15, it can show you *why*, grounded in your specific circadian phase and sleep pressure.

One night, I ran six AI agents simultaneously to audit the entire codebase — architecture, test coverage, performance, security, accessibility, and algorithm accuracy. A war room at 2 AM, reviewing code for an app built to help people like me survive nights like that one. There was a certain poetry in it.

## What's Next

ShiftWell is heading into beta.

The first version focuses on the core loop: import your shifts, get your personalized sleep plan, export it to your calendar. Sleep windows, nap windows, light exposure timing, caffeine cutoffs, and meal timing — all calculated from the science, all adapted to your specific rotation.

After that, we're pursuing hospital partnerships. Fatigue management is a patient safety issue — the data on this is unambiguous. Residents working extended shifts show cognitive impairment equivalent to a blood alcohol level of 0.05%. Fatigued nurses have significantly higher medication error rates. Hospitals spend enormous resources on safety culture and error prevention, but almost none on the single most modifiable risk factor: sleep.

ShiftWell can be that intervention. Not as a wellness perk, but as a safety tool — integrated into scheduling systems, providing institution-level fatigue risk data, and giving individual workers evidence-based strategies that actually account for their real schedules.

The long-term vision is bigger. Shift workers are the starting point, but circadian disruption affects anyone with an irregular schedule — traveling surgeons, new parents, students during exam periods, international travelers. The core algorithm generalizes. The Two-Process Model doesn't care *why* your schedule is irregular — it just needs to know what it is.

I started building ShiftWell because I was tired. Not metaphorically — literally, physically tired, in the way that only people who regularly fight their own circadian biology understand. I kept building it because I realized that the 22 million shift workers in this country deserve better than a sleep app that tells them to go to bed at 10:30 PM.

We deserve tools that understand our lives. That's what ShiftWell is.

## Join the Beta

If you're a shift worker and you want to try ShiftWell, sign up at [shiftwell.app/beta](https://shiftwell.app/beta). We're opening spots over the next few weeks.

---

*Dr. Gursimran Singh is a board-eligible emergency medicine physician at HCA Florida Trinity Hospital and the founder of ShiftWell. He works rotating day and night shifts and builds software between patients. Find him on [LinkedIn](#) and [X/Twitter](#).*

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Anchor blog post for ShiftWell launch — long-form founder story targeting Medium, LinkedIn, KevinMD, and ShiftWell blog.
