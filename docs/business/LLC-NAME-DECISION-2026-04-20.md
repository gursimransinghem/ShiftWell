# LLC Name Decision — 2026-04-20

> Research for picking the entity name before filing the LLC. Both finalists have conflicts worth knowing about before you spend $200 and 5 weeks of calendar time.

## TL;DR

**Neither finalist is clean.** Honest take:

- **Circadian Labs** — high risk. The direct-competitor space is saturated with "Circadian"-branded companies, including one with a federal trademark in shift-work consulting (literally our market). A variant called "Circadian Labs™" already exists.
- **Vigil Health** — moderate risk. One existing B2B company (senior-living hardware, acquired by ASSA ABLOY) uses this name in Canada. Different market segment, but same USPTO class region.
- **Recommendation:** Do not file either without a paid USPTO trademark clearance search. Consider a third option (see bottom of doc) before locking in.

---

## Option A — Circadian Labs

### Existing entities with this name or close variants

| Name | What they do | Domain | Threat level |
|------|--------------|--------|--------------|
| **CIRCADIAN®** (Circadian Technologies, Inc.) | **Shift-work consulting, fatigue risk management, 24/7 workforce scheduling** — our exact market | circadian.com | 🚨 HIGH — federal registered trademark (®), same industry |
| Circadian Labs™ | Neuroscience / nutrition / wellness ("align lifestyle to your body's clock") | circadianl.com | 🚨 HIGH — uses "Circadian Labs" as branded name, common-law claim via ™ |
| Circadia Health | Health platform | circadia.health | 🟡 MED — close phonetic match |
| Circadian Optics | Light therapy lamps (sleep-adjacent) | (acquired by Thrasio 2020) | 🟡 MED — sleep-adjacent consumer product |
| Circadian Risk | Risk-assessment software | — | 🟢 LOW — different domain |
| Circadian, Inc. | Historical medical device co. | — | 🟢 LOW — older registration, expired trademarks |

### Domain availability
- `circadianlabs.com` — unclear from search; likely taken or parked. Verify at [whois.com](https://www.whois.com).
- `circadianl.com` — already in use by the wellness company above.

### Legal risk
- **Trademark conflict is severe.** Filing an LLC called "Circadian Labs" in a sleep/shift-work app space where CIRCADIAN® holds a federal registration in fatigue-risk consulting is the textbook setup for a cease-and-desist.
- Apple can reject App Store listings for trademark conflicts — they check before publishing.
- A trademark lawyer would likely advise against this without a knockout USPTO search first.

---

## Option B — Vigil Health

### Existing entities with this name or close variants

| Name | What they do | Domain | Threat level |
|------|--------------|--------|--------------|
| **Vigil Health Solutions Inc.** | Nurse-call systems, memory-care monitoring for senior living | vigilhealth.com | 🟡 MED — exact match, different segment (B2B senior-living hardware) |
| Vigil (parent product, ASSA ABLOY) | Comprehensive care technology platform | vigil.com | 🟡 MED — large corporate owner |
| Vigil Services | Various | — | 🟢 LOW |

### Context
- Vigil Health Solutions is a Canadian company, Victoria BC, acquired by ASSA ABLOY (Swedish security giant) on 2022-04-01 for ~$12.55M.
- Their business: nurse call, wireless emergency call, fall monitoring, memory-care systems for senior living. **B2B hardware, not consumer apps.**
- They reported $5.1M annual revenue in 2026 — small-to-midsize.

### Domain availability
- `vigilhealth.com` — taken by Vigil Health Solutions.
- `vigilhealth.app`, `vigil.health`, `getvigilhealth.com` — probably available. Verify at [whois.com](https://www.whois.com).

### Legal risk
- **Same-name entity exists in healthcare** but in a different class (hardware for senior living B2B) vs consumer mobile app.
- USPTO class analysis (informal): their mark likely sits in Class 9 (medical hardware) or Class 44 (medical services). Ours would be Class 9 (downloadable apps) or Class 42 (SaaS). Overlap in Class 9 is possible and creates friction.
- ASSA ABLOY is a multibillion-dollar company with active legal resources. Low probability they notice a small consumer app, but not zero. If they do notice, they'll have leverage.
- **Lower risk than Circadian Labs, but not clean.**

---

## What this means for filing

### If you file as-is
- You can legally form an LLC in Florida with either name — Florida doesn't check federal trademarks at the Secretary of State level, only state-level entity-name uniqueness.
- **But:** the LLC name and the brand name you ship under can be different. You could file as "Gursimran Singh Ventures LLC" or "[neutral legal name] LLC" and do business as **ShiftWell** (which is what your app is already called).
- Apple App Store uses the **developer/seller name** displayed to users — that can be the LLC legal name or a DBA.

### Three paths forward

1. **File with a neutral legal name, ship under "ShiftWell" as DBA.**
   - Fastest. Lowest legal risk. Most common for indie founders.
   - LLC name example: "Singh Health Ventures LLC" or "Tampa Sleep Labs LLC."
   - Register "ShiftWell" as a DBA ("doing business as") in Florida for ~$50.
   - You can trademark "ShiftWell" separately once revenue justifies it (~$350 USPTO filing per class).
   - **Recommendation.**

2. **Pay for a trademark knockout search before filing "Circadian Labs" or "Vigil Health."**
   - $300–$800 with a trademark attorney (one-time).
   - Takes 1–2 weeks.
   - Delays the 5-week Apple wait by 1–2 weeks.
   - Worth it if you're set on one of the two names.

3. **Pick a new, cleaner name.**
   - Quick brainstorm of candidates that avoid the Circadian/Vigil collisions:
     - **Chronoform** (chrono = time, form = structure)
     - **Nocta Health** (nocturnal + health)
     - **Phase Labs** (sleep "phase," physics "phase")
     - **Anchorsleep** (NIOSH anchor-sleep protocol)
     - **Sentinel Sleep** (vigilance theme without "Vigil")
     - **Keylight** (circadian light therapy without "Circadian")
   - Needs its own knockout search, but starts from a cleaner baseline.

---

## Concrete next actions

| # | Action | Time | Who |
|---|--------|------|-----|
| 1 | Check `circadianlabs.com`, `vigilhealth.com`, `shiftwell.app`, `shiftwell.com` at [whois.com](https://www.whois.com) | 5 min | You |
| 2 | Search USPTO directly at [tmsearch.uspto.gov](https://tmsearch.uspto.gov) for "CIRCADIAN" and "VIGIL HEALTH" — note active registrations in Class 9, 42, 44 | 15 min | You |
| 3 | Decide: (a) pivot to neutral LLC + ShiftWell DBA, (b) hire attorney for knockout search, or (c) pick a new name | 30 min | You |
| 4 | If (a): file neutral-name LLC in Florida via [sunbiz.org](https://dos.myflorida.com/sunbiz/), register "ShiftWell" DBA | 60 min | You |
| 5 | Apply for EIN at [irs.gov](https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online) — free, immediate | 15 min | You |
| 6 | Apply for D-U-N-S at [developer.apple.com/support/D-U-N-S](https://developer.apple.com/support/D-U-N-S) — free, 5 business days | 15 min | You |

---

## Sources

- [CIRCADIAN® — Shift Work Consulting, 24/7 Workforce Solutions](https://circadian.com/)
- [Circadian Labs™ — Wellness / Neuroscience](https://circadianl.com/about/)
- [Circadia Health](https://circadia.health/)
- [Circadian Technologies (Bloomberg profile)](https://www.bloomberg.com/profile/company/1464735D:US)
- [Vigil Health Solutions — ASSA ABLOY acquisition](https://www.assaabloy.com/group/en/news-media/press-releases/id.dd44a975d8511ec4)
- [Vigil Health Solutions (PitchBook)](https://pitchbook.com/profiles/company/52244-56)
- [Vigil — Comprehensive Care Technology](https://www.vigil.com)
- [USPTO Trademark Search](https://tmsearch.uspto.gov/)
- [Florida Sunbiz LLC Filing](https://dos.myflorida.com/sunbiz/)
- [IRS EIN Application](https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online)
- [Apple D-U-N-S Lookup](https://developer.apple.com/support/D-U-N-S)
