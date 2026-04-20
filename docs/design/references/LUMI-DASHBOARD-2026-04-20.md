# Lumi Personal Dashboard — ShiftWell v2.0 North Star

> **Scope:** NOT v1.1. This is the aesthetic endpoint, not the next ship.
> **Source:** @airesearches carousel slide 11 — "Used Claude Design and Opus 4.7 to design a personal dashboard."
> **Date logged:** 2026-04-20

---

## What the reference shows

A dark-mode, multi-panel personal dashboard for a fictional user "Jerrod Chen" — Brooklyn-based, deep-work mode, showing live day context. Layout is dense but calm — nothing screams, everything has breathing room.

**Panels, left-to-right:**

1. **Identity column** — avatar, name ("Jerrod Chen"), status ("Deep Work End"), location map
2. **Day column** — "Good *afternoon*, Jerrod." + Saturday, April 18 + weekday strip (13/14/15/16/17/**18**/19) + timeline list: "Studio deep work," "Sync – Maya & Theo," "Run – Prospect Park loop," "Dinner w/ Eliza"
3. **Inbox column** — 4-item email preview (Maya Lin, Theo Harris, Eliza N., Arc Collective) with subject previews
4. **Now Playing** — audio waveform player showing "Harvest Moon"
5. **Stats column (right)** — big clock (09:16) + step count (7,842) + pulse rings (72/74) + battery rings (54/18) + "Getting Project" percent (68%)
6. **Project checklist (far right)** — "Jerrod OS v2.7" with sub-tasks and % progress

Everything is dark (`#080B14`-ish), serif greeting, sans labels, data in big bold serif, tight 12-col-ish grid.

---

## Why this matters for ShiftWell

It proves the ceiling. A physician-built sleep app CAN look like this. Today's ShiftWell Today screen shows 12+ stacked cards in a single scroll. The v2.0 aspiration is a single integrated viewport where:

- Hero greeting + sleep status → top-left
- Next shift + countdown → left column
- Tonight's plan timeline (sleep / nap / caffeine / wind-down / light) → center column
- 7-day recovery trend sparkline + debt meter → right column
- Pattern alerts + science insights → bottom tray, collapsed by default

One glance = full day context. No scroll to see the score. No tap to see the brief. Shift worker opens app at 2am, sees exactly what they need, closes app.

---

## Why it's NOT v1.1 scope

- Requires landscape/wide viewport (iPhone 15 Pro Max minimum, ideally iPad)
- Requires new data pipelines for ambient info (current location, music, inbox) that ShiftWell doesn't own
- Conflicts with mobile-first information architecture (design-audit P0 said SIMPLIFY dashboard, not add more panels)
- Design work alone = weeks

v1.1 plan (C4.3) is "12 cards → 3 tiers." That's the right move for now. This dashboard is the North Star that says: once the 3-tier architecture lands and the data pipelines mature, the next evolution is a single-viewport integrated view.

---

## What we borrow NOW from this screen (v1.1 scope)

Even though the dashboard itself is v2.0, three patterns here are reusable in v1.1:

1. **Serif greeting with italic emphasis** — "Good *afternoon*, Jerrod." → "Good *morning*, Sim." Already in plan.
2. **Tight weekday strip with today highlighted** — simpler version already in ShiftWell's Schedule tab; worth promoting to Today's header as a compact "this week" context strip.
3. **Progress rings pattern** — Lumi's pulse 72/74 + battery 54/18 pattern is cleaner than ShiftWell's current progress bars. Worth stealing for HeroScore secondary metrics (recovery ring primary, sleep-debt ring secondary).

---

## When to revisit

After v1.1 ships to TestFlight and we have 30+ beta users. Milestone v2.0 brief should open with this reference file.

---

## Source

- Slide 11 of carousel, posted 2026-04-19 by @airesearches
- Built in Claude Design + Opus 4.7
- Screenshot saved as `./lumi-screenshots/lumi-11-personal-dashboard-dark.png` once Sim drops it in
