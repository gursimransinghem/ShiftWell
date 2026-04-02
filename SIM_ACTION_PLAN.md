# Sim's Action Plan — ShiftWell

> **Last updated:** 2026-04-02
> **Purpose:** Step-by-step personal checklist. Only things that require Sim's hands.
> Everything code, design, and strategy is handled by Claude.

---

## Phase 1: Business Formation (Do First — Blocks Everything)

- [ ] **1. Form LLC in Florida**
  - Go to: sunbiz.org → File → Florida LLC
  - Name: ShiftWell LLC (or variant if taken)
  - Registered agent: yourself (home address is fine)
  - Cost: ~$125
  - Time: 30 minutes online, active within 1-2 days
  - _Why first:_ Apple Developer requires a legal entity

- [ ] **2. Get EIN (Tax ID)**
  - Go to: irs.gov → Apply for EIN → Online
  - Cost: $0 (free)
  - Time: 10 minutes, instant
  - _Why:_ Needed for business bank account and Apple Developer

- [ ] **3. Open Business Bank Account**
  - Options: Chase Business, Mercury (online, startup-friendly), Relay
  - Bring: LLC articles of organization + EIN
  - Cost: $0 (most have no monthly fees)
  - Time: 30 minutes
  - _Why:_ Revenue from App Store needs somewhere to go. Keep personal/business separate.

## Phase 2: Apple Developer + D-U-N-S (Blocks TestFlight)

- [ ] **4. Apply for D-U-N-S Number**
  - Go to: Apple's D-U-N-S lookup page (linked from developer enrollment)
  - Need: LLC name, EIN, business address
  - Cost: $0
  - Time: Apply in 5 min, takes ~5 business days to process
  - _Why:_ Required for Apple Developer Organization account

- [ ] **5. Enroll in Apple Developer Program**
  - Go to: developer.apple.com → Enroll
  - Enroll as: **Organization** (not Individual) — needed for B2B credibility later
  - Need: D-U-N-S number, Apple ID
  - Cost: $99/year
  - Time: Enrollment takes 24-48 hours for review
  - _Why:_ Blocks TestFlight builds and App Store submission

## Phase 3: Trademark (Parallel — Don't Wait)

- [ ] **6. Order Trademark Clearance Search**
  - Options: Corsearch, TrademarkNow, or local IP attorney
  - Search for: "ShiftWell" in Class 9 (software) + Class 44 (health)
  - Budget: $300-500
  - Time: Results in 3-5 business days
  - _Why:_ Confirms name is safe before we invest in branding

- [ ] **7. File USPTO Trademark (after clearance)**
  - Go to: USPTO TEAS (Trademark Electronic Application System)
  - File in: Class 9 (software) + Class 44 (health services)
  - Cost: ~$250-350 per class ($500-700 total)
  - Time: Filing takes 30 min, review takes 3-6 months
  - _Or:_ Hire IP attorney to file (~$1,000-1,500 total including search)

## Phase 4: Pre-TestFlight (While Claude Builds)

- [ ] **8. Test on Physical iPhone**
  - Run: `npx expo start` → scan QR code with Expo Go
  - Walk through every screen, note issues
  - Share feedback in Claude Code session

- [ ] **9. Recruit Beta Testers (10-20 people)**
  - Target: coworkers (nurses, docs, medics who work nights)
  - Ask: "Would you try a sleep app for 2 weeks if I built it?"
  - Collect: names + Apple ID email addresses (needed for TestFlight)
  - Goal: 10-20 testers, mix of roles and shift patterns

- [ ] **10. Domain Purchase**
  - Check availability: shiftwell.com, getshiftwell.com, shiftwell.app
  - Register through: Namecheap, Cloudflare, or Google Domains
  - Cost: ~$10-50/year
  - _Tip:_ Don't buy until trademark clearance comes back clean

## Phase 5: Launch Prep (Month Before App Store)

- [ ] **11. Generate App Icon**
  - Follow instructions in `assets/icons/README.md`
  - Gold owl on black — will need AI image generation or designer
  - Need: 1024x1024 PNG

- [ ] **12. App Store Screenshots**
  - Claude will build screenshot generator tool
  - Need: physical iPhone screenshots of key screens
  - 6.7" (iPhone 15 Pro Max) and 6.1" (iPhone 15 Pro) sizes

- [ ] **13. App Store Listing Text**
  - Claude will draft, Sim reviews
  - Need: title, subtitle, keywords, description, promotional text

- [ ] **14. Privacy Policy + Terms of Service**
  - Claude will draft from template, Sim reviews
  - Must be hosted on the website
  - Required for App Store submission

## Optional / When Ready

- [ ] Set up social media accounts (Instagram, X/Twitter, TikTok) once name is trademarked
- [ ] Reach out to medical influencer contacts for early access
- [ ] Talk to HCA colleagues about potential pilot interest
- [ ] Consider applying for NIH SBIR/STTR grant (Arcashift got $2M, SleepSpace got $3.5M)

---

## Quick Reference — Total Costs

| Item | Cost |
|------|-----:|
| LLC (FL) | ~$125 |
| EIN | $0 |
| Bank account | $0 |
| D-U-N-S | $0 |
| Apple Developer | $99/yr |
| Trademark search | ~$400 |
| Trademark filing (2 classes) | ~$600 |
| Domain | ~$15/yr |
| **Total to launch** | **~$1,240** |

---

## Timeline

```
Week 1:  LLC + EIN + Bank Account (Sim)
Week 1:  Claude starts v1.0 build
Week 2:  D-U-N-S application (Sim)
Week 2:  Trademark search ordered (Sim)
Week 3:  Apple Developer enrollment (Sim, after D-U-N-S)
Week 3:  Recruit beta testers (Sim)
Week 3:  Trademark results → file if clear (Sim)
Week 4-6: Claude completes v1.0 build
Week 5:  Domain purchase (Sim, after trademark)
Week 6:  TestFlight build → beta testers
Week 8+: Iterate on feedback → App Store submission
```

---
*Keep this checklist updated. Check items off as you go.*
