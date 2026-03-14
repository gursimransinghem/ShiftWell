# NightShift — Business Plan

> **Version:** 1.0 | **Date:** March 2026
> **Founder:** ED Physician (Emergency Department) — solo technical founder
> **Product:** Sleep optimization app for shift workers
> **Stage:** MVP feature-complete, pre-launch

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Entity Setup](#2-business-entity-setup)
3. [Testing Strategy & Launch Readiness](#3-testing-strategy--launch-readiness)
4. [App Store Submission](#4-app-store-submission)
5. [Monetization Strategy](#5-monetization-strategy)
6. [Go-to-Market Strategy](#6-go-to-market-strategy)
7. [Financial Plan](#7-financial-plan)
8. [Legal & Compliance](#8-legal--compliance)
9. [Intellectual Property](#9-intellectual-property)
10. [Marketing Timeline](#10-marketing-timeline)
11. [Risk Assessment](#11-risk-assessment)
12. [Key Metrics & Milestones](#12-key-metrics--milestones)

---

## 1. Executive Summary

**Problem:** 700 million people globally work shifts. 32% of US healthcare workers report short sleep. No existing app combines calendar import, science-backed schedule generation, personal calendar awareness, meal timing, nap placement, and one-click calendar export.

**Solution:** NightShift imports your work schedule (iCal/Google/QGenda), reads your personal calendar, and generates a complete circadian optimization plan — sleep windows, strategic naps, caffeine cutoffs, meal timing, light protocols — all exportable back to your calendar with one tap.

**Competitive Advantage:**
- Built by a physician who lives the problem daily
- Only app that combines calendar sync + full circadian plan + personal calendar awareness
- Deterministic algorithm based on peer-reviewed research (15+ cited papers)
- Zero backend costs in v1 (all computation on-device)

**Revenue Model:** Free at launch → Freemium at Month 3 ($4.99/mo or $39.99/yr) → B2B team plans at Month 8+

**Target:** 1,000 users by Month 3, first revenue by Month 4, $5-10K MRR by Month 12.

---

## 2. Business Entity Setup

### Step-by-Step Checklist

| Step | Action | Cost | Timeline |
|------|--------|------|----------|
| 1 | **Form LLC** | $100-200 | 1-2 weeks |
| 2 | **Get EIN** | Free | Same day |
| 3 | **Open business bank account** | Free | 1-3 days |
| 4 | **Register domain** (nightshiftapp.com or similar) | $12-15/yr | Same day |
| 5 | **Enroll in Apple Developer Program** | $99/yr | 1-2 days |
| 6 | **Set up business email** | $0-6/mo | Same day |

**Total startup cost: ~$215-320**

### LLC Formation Details

**Recommended: Single-Member LLC** — simplest structure, liability protection, pass-through taxation.

**State options:**
- **Your home state** (recommended for simplicity) — File Articles of Organization with your Secretary of State. Most states cost $50-200.
- **Wyoming** — $100 filing fee, no state income tax, strong privacy laws. Good if you want anonymity, but adds complexity (you'll need a registered agent ~$50-100/yr).
- **Delaware** — Popular for VC-backed startups, but overkill for a solo app. Skip this.

**How to file:**
1. Go to your state's Secretary of State website
2. Search "LLC formation" or "business filing"
3. File Articles of Organization online (usually takes 15-30 minutes)
4. You'll receive a Certificate of Organization
5. Write a simple Operating Agreement (single-member template, free online)

**Skip the $500 "formation services"** — they just file the same form. Do it yourself.

### EIN (Employer Identification Number)

- Apply at [irs.gov/ein](https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online) — free, takes 10 minutes
- You get your EIN immediately after completing the online application
- Needed for: business bank account, App Store payments, tax filings

### Business Bank Account

- Open at any bank (Chase, local credit union, Mercury for online-only)
- Keep personal and business finances completely separate
- All app revenue flows here; all business expenses paid from here
- This makes tax time simple and protects your LLC's liability shield

### Apple Developer Program

- Enroll at [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/)
- $99/year — required to publish to the App Store
- Enroll as **Organization** (your LLC) if formed, or **Individual** to start faster
- Organization enrollment requires a D-U-N-S Number (free, takes 1-5 business days)
- Individual enrollment is instant and can be transferred to Organization later

---

## 3. Testing Strategy & Launch Readiness

### Testing Tiers

| Tier | What | Status | Minimum Threshold |
|------|------|--------|-------------------|
| **Unit Tests** | Algorithm correctness, edge cases, ICS parsing | ✅ 83 tests passing | All passing |
| **Device Testing** | Run on physical iPhone, check all screens | ⬜ Not started | Test on 3+ device sizes |
| **Beta Testing** | Real shift workers using the app for real schedules | ⬜ Not started | 10-20 users, 2+ weeks |
| **Soft Launch** | App Store release to limited market (1 country) | ⬜ Not started | <1% crash rate |

### How Much Testing Is Enough?

**The short answer: You need real humans using it for at least 2 weeks.**

Unit tests verify the algorithm is correct. But they can't tell you:
- Is the onboarding confusing?
- Do the generated sleep windows actually feel right to a night shift nurse?
- Does the .ics export work with Google Calendar, not just Apple?
- Are the caffeine cutoff times practical for people who rely on coffee?
- Does the Today screen give enough information at a 3am glance?

**Minimum viable testing before App Store:**
1. ✅ All 83 unit tests pass
2. ⬜ You've used the app yourself for 1 full shift rotation (1-2 weeks)
3. ⬜ 5+ colleagues (nurses, residents, attendings) have used it for 1 week
4. ⬜ Zero crashes in normal use
5. ⬜ Core loop works: add shifts → see plan → export to calendar
6. ⬜ At least 3 people say "this is actually useful" unprompted

**You do NOT need:**
- Thousands of beta testers (10-20 is plenty for v1)
- Zero bugs (you'll ship fixes — that's normal)
- Perfect UI polish (functional > beautiful at this stage)
- 100% feature coverage testing (focus on the core loop)

### Beta Testing Plan (TestFlight)

**Week 1-2: Personal dogfooding**
1. Run `npx expo start`, test on your iPhone
2. Enter your actual shift schedule for the next 2 weeks
3. Export to your calendar, live by the plan
4. Note every friction point, confusing screen, or wrong recommendation

**Week 3-4: Friends & colleagues**
1. Build via EAS: `eas build --platform ios --profile preview`
2. Upload to TestFlight: `eas submit --platform ios`
3. Invite 10-20 people:
   - 3-5 ED nurses (your department)
   - 2-3 residents (rotating schedules)
   - 2-3 attendings (day/night rotations)
   - 2-3 non-medical shift workers (police, fire, factory)
4. Give them a 3-question feedback form:
   - "Did the app generate a sleep plan that makes sense for your schedule?"
   - "What confused you?"
   - "Would you keep using this? Why or why not?"

**Week 5: Iterate**
- Fix the top 3 issues from feedback
- Run another build, push to TestFlight
- Confirm fixes with the same testers

**Ready to submit when:** 5+ testers used it for 7+ days and the core loop works without crashes.

### Key Metrics to Track During Beta

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Crash-free rate | >99% | EAS crash reports |
| Onboarding completion | >80% | Manual observation |
| Plan generation success | 100% | Test with various schedules |
| Export success rate | >95% | TestFlight feedback |
| Session length | >2 min | Manual observation |
| "Would recommend" | >60% | Feedback form |

---

## 4. App Store Submission

### Required Before Submission

| Item | Status | Notes |
|------|--------|-------|
| Apple Developer Account | ⬜ | $99/yr, see Section 2 |
| App Icon (1024x1024) | ⬜ | See `assets/icons/README.md` |
| Screenshots (6.7" iPhone) | ⬜ | 3-10 screenshots, iPhone 15 Pro Max |
| Screenshots (6.5" iPhone) | ⬜ | iPhone 14 Plus / 11 Pro Max |
| App description | ✅ | See `app-store-metadata.md` |
| Keywords | ✅ | See `app-store-metadata.md` |
| Privacy policy URL | ⬜ | Host on your website or GitHub Pages |
| Support URL | ⬜ | Can be a simple contact page or email |
| Category | ✅ | Health & Fitness |
| Age rating | ⬜ | 4+ (no objectionable content) |
| Production build | ⬜ | `eas build --platform ios --profile production` |

### Step-by-Step Submission

1. **App Store Connect** — Log in at [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **Create New App** — Click "+", enter name "NightShift", select bundle ID
3. **Fill App Information** — Description, keywords, category, age rating, URLs
4. **Upload Screenshots** — Use Simulator: `Cmd+S` to save screenshots in all required sizes
5. **Upload Build** — Run `eas submit --platform ios` (auto-uploads from EAS)
6. **Submit for Review** — Click "Submit for Review", answer export compliance questions (select "No" for encryption)

### Review Timeline

- **Typical review:** 24-48 hours (90% of apps reviewed within 24h as of 2025)
- **First submission:** May take longer (up to 1 week) due to new developer flag
- **If rejected:** You get specific feedback. Fix the issue and resubmit (usually reviewed faster on resubmission)

### Common Rejection Reasons (and How to Avoid Them)

| Reason | Prevention |
|--------|------------|
| **Crashes/bugs** | Test thoroughly on device, not just Simulator |
| **Incomplete information** | Fill every field in App Store Connect |
| **Broken links** | Verify privacy policy and support URLs work |
| **Health claims** | Never say "cures", "treats", or "diagnoses" — use "optimizes", "suggests", "helps" |
| **Missing purpose string** | Add clear permission descriptions in app.json (calendar access, etc.) |
| **Misleading description** | Match screenshots to actual app behavior |
| **Insufficient content** | App must provide meaningful value beyond a simple web view |

### Health App Specific Notes

Apple reviews health apps more carefully. NightShift is **not a medical device** — it's a lifestyle/wellness tool. Key language:

- ✅ "Helps optimize your sleep schedule"
- ✅ "Science-informed recommendations"
- ✅ "Based on circadian rhythm research"
- ❌ "Treats shift work sleep disorder"
- ❌ "Medical-grade sleep optimization"
- ❌ "Clinically proven to improve sleep"

Include a disclaimer in the app and App Store description:
> "NightShift provides general wellness information and schedule suggestions. It is not a medical device and does not provide medical advice, diagnosis, or treatment. Consult your healthcare provider for medical concerns."

---

## 5. Monetization Strategy

### Phase 1: Free (Launch → Month 3)

**Why free first:**
- Shift workers are a skeptical audience — they need to trust the app before paying
- App Store reviews are your #1 growth lever, and free apps get more downloads + reviews
- You need real-world data on how people use the app before deciding what's "premium"
- Zero risk for users = higher adoption = faster validation

**What's included:**
- Full algorithm (sleep windows, naps, caffeine, meals, light)
- Manual shift entry
- .ics import and export
- Today screen with countdowns
- All 25+ sleep tips

### Phase 2: Freemium (Month 3 → Month 8)

Introduce premium tier based on beta feedback about what features users value most.

**Suggested split:**

| Feature | Free | Premium ($4.99/mo or $39.99/yr) |
|---------|------|------|
| Manual shift entry | ✅ | ✅ |
| Basic sleep plan (sleep windows only) | ✅ | ✅ |
| Full plan (naps, caffeine, meals, light) | 7-day trial | ✅ |
| .ics import | 1 file | Unlimited |
| .ics export | ❌ | ✅ |
| Today screen | Basic | Full (countdowns, insights, tips) |
| Calendar view | ✅ | ✅ |
| HealthKit integration (when built) | ❌ | ✅ |
| Widgets (when built) | ❌ | ✅ |
| Priority support | ❌ | ✅ |

**Pricing rationale:**
- $4.99/mo is the sleep app sweet spot (Timeshifter charges $9.99/mo)
- $39.99/yr (33% discount) incentivizes annual commitment
- Both are impulse-buy prices for healthcare professionals ($150K+ avg salary)

**Implementation:** Use StoreKit 2 with RevenueCat (free up to $2.5K MRR, then 1% fee) for subscription management. RevenueCat handles receipts, renewals, trial management, and analytics.

### Phase 3: B2B Team Plans (Month 8+)

**Target:** Hospital shift schedulers, EMS agencies, fire departments, nursing homes

**Pricing:** $8-15/user/month (volume discount at 50+ users)

**Value prop for administrators:**
- Reduced fatigue-related incidents (liability reduction)
- Better staff retention (nurses cite fatigue as top burnout factor)
- OSHA/Joint Commission compliance support
- Team-wide fatigue risk dashboards

**Sales approach:** Start with your own ED. If the medical director sees value, that's your first case study. Cold outreach to other EDs, nursing directors, EMS chiefs.

---

## 6. Go-to-Market Strategy

### Target User Profile

**Primary:** Healthcare shift workers (nurses, physicians, paramedics, techs)
- 16M healthcare workers in the US
- 60% work rotating or night shifts
- iPhones dominant in this demographic
- High income, willing to pay for solutions
- Tight professional communities (word-of-mouth is powerful)

**Secondary:** All shift workers (police, fire, factory, transportation)
- 22M shift workers in the US total
- Same core problem, same solution

### Pre-Launch (Weeks -4 to 0)

| Action | Details |
|--------|---------|
| **Landing page** | Simple one-page site: problem → solution → waitlist signup. Use Carrd ($19/yr) or GitHub Pages (free) |
| **Social accounts** | Create @NightShiftApp on Twitter/X, Instagram, TikTok |
| **Reddit seeding** | Share genuinely helpful sleep tips (NOT promotional) in r/nursing, r/medicine, r/ems, r/nightshift. Build credibility first |
| **Email waitlist** | Collect emails via landing page. Use Buttondown (free up to 100 subs) or Mailchimp |
| **Personal network** | Tell every colleague. "I built an app for our sleep schedules — want to try it?" |

### Launch (Weeks 0-4)

| Channel | Action | Expected Impact |
|---------|--------|-----------------|
| **TestFlight** | Invite 10-20 colleagues | Core feedback loop |
| **Your department** | Demo at staff meeting or in break room | 20-50 downloads |
| **Medical social media** | Post your story: "I'm an ED doc who built an app because I was tired of being tired" | Viral potential |
| **Reddit** | Launch post in r/residency, r/nursing, r/medicine (follow subreddit rules) | 100-500 downloads |
| **Product Hunt** | Launch on a Tuesday-Thursday (highest traffic) | 200-1000 downloads |

### Growth (Months 2-6)

| Channel | Action |
|---------|--------|
| **App Store Optimization (ASO)** | Optimize title, subtitle, keywords. "Night Shift Sleep" as subtitle |
| **Content marketing** | Write 2 blog posts/month on shift work sleep science → SEO traffic |
| **Physician podcasts** | Pitch your story to emergency medicine podcasts (EM:RAP, EMCrit, Taming the SRU) |
| **Nursing conferences** | Attend 1-2 conferences, demo the app at networking events |
| **Referral program** | "Share with your unit" — unlock a premium feature for every 3 referrals |
| **App Store reviews** | Prompt happy users for reviews (use in-app prompt after successful export) |

### Why "Physician-Built" Is Your Superpower

Most health apps are built by tech companies. Being a practicing ED physician who lives the problem gives you:
- **Instant credibility** — "This person understands my schedule"
- **Media angle** — "Doctor who codes" is a compelling story
- **Clinical accuracy** — Reviewers can verify your algorithm cites real research
- **Network access** — You know nurses, residents, and attendings personally

Lead with your clinical identity in all marketing. This is your moat.

---

## 7. Financial Plan

### Startup Costs (One-Time)

| Item | Cost |
|------|------|
| LLC formation | $100-200 |
| Apple Developer Program | $99/yr |
| Domain name | $12-15/yr |
| **Total** | **~$215-320** |

### Monthly Operating Costs

| Item | v1 (No Backend) | v2 (With Backend) |
|------|-----------------|-------------------|
| Apple Developer (amortized) | $8/mo | $8/mo |
| Domain + email | $1-6/mo | $1-6/mo |
| EAS builds (free tier) | $0 | $0 |
| Supabase (free tier) | — | $0 |
| RevenueCat (free tier) | — | $0 |
| Landing page hosting | $0-19/mo | $0-19/mo |
| **Total** | **$9-33/mo** | **$9-33/mo** |

### Revenue Projections (Conservative)

| Month | Downloads | Active Users | Premium Users | MRR | Notes |
|-------|-----------|-------------|--------------|-----|-------|
| 1 | 100 | 40 | 0 | $0 | Free launch, TestFlight |
| 2 | 300 | 100 | 0 | $0 | Word of mouth |
| 3 | 500 | 200 | 0 | $0 | Reddit + social push |
| 4 | 300 | 350 | 30 | $150 | Premium launches |
| 5 | 400 | 500 | 60 | $300 | ASO kicks in |
| 6 | 600 | 800 | 100 | $500 | Podcast features |
| 9 | 1,000 | 1,500 | 200 | $1,000 | Organic growth |
| 12 | 2,000 | 3,000 | 500 | $2,500 | Content + referral flywheel |

**Assumptions:**
- 40% 30-day retention (strong for niche utility apps)
- 8-10% free-to-premium conversion (industry avg is 2-5%, but NightShift's niche audience converts higher)
- $4.99/mo average (mix of monthly + annual)
- Zero paid advertising (organic only)

### Break-Even Analysis

- Monthly costs: ~$30/mo
- Break-even: **7 premium subscribers** ($35/mo revenue)
- This is almost certainly achievable by Month 4-5

### When to Invest More

| Revenue Level | Action |
|---------------|--------|
| $0-500 MRR | Keep costs near zero. Validate with free users |
| $500-2K MRR | Consider $200-500/mo for Apple Search Ads |
| $2K-5K MRR | Hire a part-time designer for UI polish ($1-2K) |
| $5K-10K MRR | Consider part-time developer for Phase 2 features |
| $10K+ MRR | Evaluate going full-time on the app |

### Tax Considerations

- As a single-member LLC, app revenue is pass-through income on your personal tax return
- Apple withholds no taxes — you're responsible for quarterly estimated payments
- Keep 25-30% of revenue in a savings account for taxes
- Deductible expenses: Apple Developer fee, domain, hosting, home office, conference travel, any tools/software used for development
- Get a CPA when revenue exceeds $5K/yr — worth the $200-500 investment

---

## 8. Legal & Compliance

### Required Legal Documents

#### 1. Privacy Policy (Required for App Store)

You MUST have a publicly accessible privacy policy URL. Key points to cover:

**What data NightShift collects (v1):**
- Shift schedule data (stored locally on device only)
- Chronotype quiz responses (stored locally)
- Sleep preferences (stored locally)

**What NightShift does NOT do (v1):**
- No data leaves the device
- No accounts, no server, no analytics
- No personal health information (PHI) collected
- No data sold or shared with third parties

**Where to host:** GitHub Pages (free), your domain, or Notion (public page). Must be a URL, not a PDF.

**Template approach:** Use a privacy policy generator (Termly, PrivacyPolicies.com — both have free tiers for simple apps), then customize for NightShift's specifics.

#### 2. Terms of Service

Shorter than you think. Key clauses:
- App is for informational purposes only, not medical advice
- No warranty on sleep recommendations
- User responsible for their own health decisions
- You can modify or discontinue the app
- Limitation of liability

Use a free template and customize. Not required for App Store, but strongly recommended.

#### 3. Health Disclaimer (In-App)

Display during onboarding and in Settings:

> "NightShift provides general wellness suggestions based on published circadian rhythm research. It is not a medical device and does not diagnose, treat, cure, or prevent any disease or condition. These suggestions are not a substitute for professional medical advice. If you have a sleep disorder or medical condition, consult your healthcare provider."

### HIPAA Considerations

**NightShift v1 is NOT subject to HIPAA.** Here's why:

- HIPAA applies to "covered entities" (healthcare providers, insurers, clearinghouses) and their "business associates"
- NightShift is a consumer wellness app — it's not part of a healthcare provider's practice
- No Protected Health Information (PHI) is collected, transmitted, or stored on any server
- All data stays on the user's device

**Phase 2 note:** If you add Apple HealthKit integration, you'll access sleep and activity data. Apple requires a specific privacy nutrition label and purpose strings, but this still doesn't trigger HIPAA as long as you're a consumer app (not integrated into clinical workflows).

**Phase 5 note:** If you offer B2B to hospitals, HIPAA may become relevant. Cross that bridge when you get there — you'll need a healthcare attorney at that point.

### FDA Considerations

NightShift is a **general wellness product**, not a medical device. The FDA's 2019 guidance on clinical decision support (CDS) exempts software that:
- Is intended for maintaining or encouraging a healthy lifestyle
- Does not claim to diagnose, treat, cure, or prevent disease
- Allows the user to independently review the basis of recommendations

NightShift meets all three criteria. Do NOT add features that claim to diagnose SWSD or prescribe treatment — that crosses into medical device territory.

---

## 9. Intellectual Property

### Trademark

**"NightShift" as an app name:**
- Search the USPTO database ([tmsearch.uspto.gov](https://tmsearch.uspto.gov)) for existing marks in Class 9 (software) and Class 42 (SaaS)
- "Night Shift" is a common phrase, which makes it harder to trademark but also harder for others to challenge
- Consider a distinctive variant: "NightShift" (one word), or add a tagline "NightShift — Sleep Smarter"
- Filing cost: $250-350 per class via USPTO TEAS Plus
- **Priority:** Low for v1. Focus on launching first. File before spending on marketing

### Trade Secret

Your circadian algorithm is your core IP. It's not patentable (mathematical formulas aren't), but it's protectable as a trade secret:
- Keep it in a private repository
- The compiled app binary obscures the implementation
- Your speed-to-market and physician credibility are stronger moats than the code itself

### Copyright

- Your code is automatically copyrighted upon creation
- Registration ($45-65 via copyright.gov) is optional but strengthens enforcement
- **Priority:** Not needed until someone copies your app

---

## 10. Marketing Timeline

### Pre-Launch Sprint (Week -4 to Week 0)

```
Week -4  ┌─ Register domain, set up landing page with email capture
         └─ Create social media accounts (@NightShiftApp)

Week -3  ┌─ Start posting helpful shift work sleep tips on social media
         └─ Join and contribute to r/nightshift, r/nursing, r/ems

Week -2  ┌─ Generate app icon (see assets/icons/README.md)
         └─ Take screenshots for App Store listing

Week -1  ┌─ Build production app: eas build --platform ios --profile preview
         └─ Upload to TestFlight, invite 10-20 beta testers

Week 0   ┌─ Collect initial beta feedback
         └─ Fix critical issues
```

### Launch Sprint (Weeks 1-6)

```
Week 1   ┌─ Iterate on beta feedback, push updated build
         └─ Continue social media cadence (2-3 posts/week)

Week 2   ┌─ Submit to App Store
         └─ Prepare Product Hunt launch page

Week 3   ┌─ App Store approval (expected)
         └─ Soft announce to personal network

Week 4   ┌─ Product Hunt launch (Tuesday-Thursday)
         └─ Reddit launch posts (follow subreddit rules)

Week 5   ┌─ Monitor reviews, respond to every review
         └─ Ship first update based on user feedback

Week 6   ┌─ Pitch to 2-3 medical podcasts
         └─ Write first blog post: "How I Built a Sleep App as an ED Physician"
```

### Growth Phase (Months 2-12)

```
Month 2   ── ASO optimization based on search term performance
Month 3   ── Launch premium tier (StoreKit 2 + RevenueCat)
Month 4   ── First podcast appearances
Month 5   ── Start content marketing (2 posts/month)
Month 6   ── Attend 1 nursing/EM conference
Month 8   ── Begin B2B outreach to hospital systems
Month 10  ── Holiday push (New Year = "new schedule" motivation)
Month 12  ── Year 1 retrospective, plan Year 2
```

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Algorithm gives bad advice** | Medium | High | Extensive beta testing with real shift workers, conservative defaults, clear disclaimers |
| **App Store rejection** | Low | Medium | Follow compliance checklist (Section 4), avoid health claims, test on device |
| **Low adoption** | Medium | Medium | Free launch removes friction, physician credibility differentiates, niche focus |
| **Timeshifter adds calendar sync** | Low | High | Ship fast, build community, expand beyond healthcare |
| **Name conflict (trademark)** | Medium | Low | Search USPTO before investing in marketing, consider alternatives |
| **Low premium conversion** | Medium | Medium | $0 operating costs mean you're profitable at 7 subscribers |
| **Burnout (solo founder + practicing physician)** | Medium | High | Set 5-10 hrs/week app time limit, automate what's possible, hire help at $5K MRR |
| **Technical debt** | Low | Low | Clean architecture, 83 tests, TypeScript type safety |
| **Privacy incident** | Very Low | High | v1 stores nothing on servers, all data on-device |
| **Copycat apps** | Medium | Low | Physician credibility + community + speed = hard to replicate |

### Biggest Risk: Doing Nothing

The biggest risk isn't launching too early — it's not launching at all. The MVP is built. The tests pass. Waiting for "perfect" is the enemy of "shipped." Get it into real users' hands and iterate.

---

## 12. Key Metrics & Milestones

### Month-by-Month Targets

| Milestone | Target Date | Success Criteria | Decision Gate |
|-----------|------------|------------------|---------------|
| **Beta launch** | Month 0 | 10+ TestFlight testers, core loop works | If <5 people find it useful → rethink value prop |
| **App Store launch** | Month 1 | Live on App Store, <1% crash rate | If rejected → fix and resubmit within 1 week |
| **100 downloads** | Month 1-2 | Organic discovery + personal network | If <50 after 1 month → improve ASO/marketing |
| **First review** | Month 1-2 | 4+ star average | If <3 stars → focus on UX fixes |
| **Premium launch** | Month 3-4 | Subscription available via StoreKit 2 | If <2% conversion → adjust paywall/pricing |
| **$500 MRR** | Month 6-8 | ~100 premium subscribers | If revenue < $200 by Month 8 → consider pivoting features |
| **1,000 downloads** | Month 6-9 | Growing organically | If growth stalls → invest in Apple Search Ads |
| **$2,500 MRR** | Month 12 | ~500 premium subscribers | Consider part-time developer hire |
| **$10,000 MRR** | Month 18-24 | Sustainable side income | Evaluate full-time transition |

### Key Performance Indicators (KPIs)

Track weekly:
- **Downloads** (App Store Connect)
- **Active users** (7-day and 30-day)
- **Retention** (Day 1, Day 7, Day 30)
- **Plan generation rate** (% of users who generate a sleep plan)
- **Export rate** (% of users who export to calendar)
- **Crash-free rate** (EAS/Sentry)

Track monthly:
- **MRR** (Monthly Recurring Revenue)
- **Conversion rate** (free → premium)
- **Churn rate** (premium cancellations)
- **App Store rating** (target: 4.5+)
- **Review count** (drives organic discovery)

### Decision Framework: When to Make Big Moves

| Question | Signal | Action |
|----------|--------|--------|
| "Should I add a backend?" | >500 active users requesting sync | Build Supabase backend (Phase 2) |
| "Should I invest in marketing?" | Organic growth plateaus but retention is strong | Start with $200-500/mo Apple Search Ads |
| "Should I hire help?" | $5K+ MRR, feature backlog growing, personal bandwidth maxed | Hire part-time React Native developer |
| "Should I go full-time on this?" | $10K+ MRR for 3+ consecutive months | Only if you want to — side income is fine too |
| "Should I raise funding?" | B2B demand from hospitals, need sales team | Consider when >$20K MRR and clear B2B traction |
| "Should I pivot?" | <100 active users after 6 months despite marketing | Survey users, pivot features (not the core idea) |

---

## Immediate Next Actions (This Week)

1. [ ] **Form LLC** — File in your home state (30 min + $100-200)
2. [ ] **Get EIN** — irs.gov, takes 10 minutes, free
3. [ ] **Enroll in Apple Developer Program** — developer.apple.com ($99)
4. [ ] **Generate app icon** — Follow `assets/icons/README.md`
5. [ ] **Test on your iPhone** — `npx expo start`, use the app with your real schedule
6. [ ] **Recruit 5 beta testers** — Text 5 colleagues today

---

*This business plan is a living document. Update it as you learn from real users and real revenue. The best business plan is the one you execute, not the one you perfect.*
