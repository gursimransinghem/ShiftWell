# ShiftWell Promotion & Launch Sequence Plan

> **Purpose:** Step-by-step launch execution plan with migration steps, timing, and rollback procedures.
> **All dates are relative to TestFlight approval (T-day).**

---

## Part 1: Sandbox → Production Migration

### What Lives Where

| Asset | Sandbox Location | Production Destination |
|-------|-----------------|----------------------|
| Competitive matrix | reports/competitive-matrix.md | Internal reference (no publish) |
| Instagram content pack | launch-kit/D-marketing/instagram-content-pack.md | Scheduling tool (Later, Buffer, or native) |
| Press kit | launch-kit/D-marketing/press-kit.md | Website /press, email attachment |
| Email sequences | launch-kit/D-marketing/email-sequences.md | Email platform (ConvertKit, Mailchimp, Loops) |
| Community posts | launch-kit/D-marketing/community-launch-posts.md | Manual posting on launch day |
| This plan | reports/promotion-plan.md | Internal reference |

### Migration Steps

**Step 1: Set up infrastructure (T-14 days)**
- Register domain (shiftwell.app or shiftwellsleep.com — check availability)
- Set up email platform account (recommendation: Loops.so for indie — free tier, good deliverability, designed for product emails)
- Set up Instagram @ShiftWellApp (if not already claimed)
- Set up landing page with waitlist form (single page: problem → solution → waitlist signup)
- Connect email platform to waitlist form

**Step 2: Migrate content to platforms (T-10 days)**
- Upload email sequences to email platform as automated flows
- Schedule launch-week Instagram posts in scheduling tool
- Prepare press kit as downloadable PDF (host on landing page /press)
- Draft App Store listing copy from existing docs/launch/APP_STORE_LISTING.md

**Step 3: Seed the waitlist (T-7 days)**
- Share waitlist link in personal networks (Sim's ER colleagues, physician groups)
- Post a pre-launch teaser on Instagram: "Something's coming for night shift workers"
- Optional: share in private nursing/EM groups on Facebook, GroupMe, WhatsApp

**Step 4: Final checks (T-2 days)**
- Test email flow end-to-end (signup → confirmation email within 60 seconds)
- Verify Instagram scheduling is correct
- Confirm App Store listing is approved and ready to go live
- Pre-write all Reddit/HN/PH posts in drafts (don't post yet)
- Prepare TestFlight invite links for beta list

---

## Part 2: Launch Sequence (Relative to App Store Go-Live = Day 0)

### Pre-Launch (T-14 to T-1)

| Day | Action | Owner | Notes |
|-----|--------|-------|-------|
| T-14 | Infrastructure setup (domain, email, landing page) | Sim | See Step 1 above |
| T-10 | Content migration to platforms | Sim | See Step 2 above |
| T-7 | Begin waitlist seeding | Sim | Personal networks first |
| T-7 | Instagram account active, bio set, 3 pre-launch posts | Sim | Posts 18, 5, 11 from content pack |
| T-3 | Send beta invite email to TestFlight waitlist | Sim | Sequence 2 |
| T-2 | Final pre-flight checks | Sim | Email flow, scheduling, App Store |
| T-1 | Quiet day. Rest. Charge up. | Sim | Seriously. |

### Launch Week (Day 0 to Day 7)

| Day | Action | Channel | Notes |
|-----|--------|---------|-------|
| **Day 0 (Monday)** | App Store go-live | App Store | Flip the switch |
| Day 0, 8 AM | Send launch email (Sequence 3) to full waitlist | Email | Subject: "ShiftWell is live on the App Store." |
| Day 0, 9 AM | Post launch Instagram (Post 16 + Reel 4) | Instagram | Founder story first |
| Day 0, 10 AM | Submit to Product Hunt | Product Hunt | Hunter + maker comment ready |
| Day 0, 11 AM | Post to r/nursing | Reddit | Most important subreddit first |
| Day 0, 12 PM | Post to r/nightshift | Reddit | Second priority |
| Day 0, 1 PM | Post Show HN | Hacker News | Technical audience |
| Day 0, 2 PM | Post to r/shiftwork | Reddit | Third subreddit |
| **Day 1** | Instagram: Post 2 + Post 11 | Instagram | Problem + relatability |
| Day 1 | Monitor Reddit comments, respond personally | Reddit | Sim responds to every comment Day 0-3 |
| **Day 2** | Instagram: Post 13 + Reel 1 | Instagram | Product feature + comparison |
| Day 2 | Reply to HN comments if traction | HN | Technical answers only |
| **Day 3** | Instagram: Post 5 + Post 17 | Instagram | Science day |
| Day 3 | Send Day 3 email (Sequence 4) to downloaders | Email | "How's your first plan working?" |
| **Day 4** | Instagram: Post 14 + Reel 3 | Instagram | Real life + viral format |
| **Day 5** | Instagram: Post 8 + Post 10 | Instagram | Humor + shared experience |
| **Day 6** | Instagram: Post 20 + Reel 2 | Instagram | Mission + social proof |
| **Day 7** | Send Day 7 email (Sequence 5) to downloaders | Email | Feature discovery + review ask |
| Day 7 | Review App Store ratings + first-week metrics | Internal | Adjust Week 2 based on data |

### Post-Launch (Day 8-30)

| Week | Action | Notes |
|------|--------|-------|
| Week 2 | Continue Instagram posting (2x/week from remaining content) | Shift from launch intensity to sustainable cadence |
| Week 2 | Reach out to 3-5 nurse Instagram creators for review | Offer free premium, not paid promotion |
| Week 3 | Begin clinical association outreach (AACN, ENA) | Per MARKETING-PLAN.md partnership strategy |
| Week 3 | Compile first-week data into a mini case study | Downloads, retention, sleep improvement metrics |
| Week 4 | Evaluate paid social (Instagram ads) | Only if organic traction proves the message resonates |
| Week 4 | Begin hospital wellness program outreach | CNO/HR contacts, per MARKETING-PLAN.md |

---

## Part 3: Rollback Plan

### Scenario 1: Critical App Bug Post-Launch

**Symptoms:** Crash reports, 1-star reviews mentioning specific bug, support emails
**Response:**
1. Acknowledge publicly (Instagram story + reply to affected App Store reviews)
2. Push hotfix via EAS Update (OTA, no App Store review needed) within 24-48 hours
3. If bug is in core algorithm (wrong sleep times, calendar corruption): pull the app from sale temporarily
4. Email affected users personally with explanation + fix timeline
5. Resume marketing once fix is verified

### Scenario 2: Low Engagement (< 100 downloads in Week 1)

**Symptoms:** Waitlist converted poorly, organic discovery low
**Response:**
1. Don't panic. Reassess messaging — is the App Store listing clear enough?
2. Double down on Reddit/community posts (they're free and high-intent)
3. Ask beta users for honest feedback: did they keep using it? Why/why not?
4. Consider adjusting pricing (extend free trial, offer first-month discount)
5. Shift budget from paid social to influencer seeding (free premium to 20 nurse creators)

### Scenario 3: Negative Press or Community Backlash

**Symptoms:** Reddit post gets hostile, competitor calls out claims, medical community questions credibility
**Response:**
1. Respond factually and calmly. Cite the research. Don't get defensive.
2. If a specific claim is disputed, provide the citation (all ShiftWell claims trace to published papers)
3. If the criticism is valid, acknowledge it publicly and fix it
4. Never delete negative comments — engage with them
5. Lean into the "physician who built this himself" narrative — authenticity defuses most attacks

### Scenario 4: App Store Rejection

**Symptoms:** Apple rejects the submission
**Response:**
1. Read the rejection reason carefully (most common: health claims, missing disclaimers)
2. Review docs/launch/HEALTH_DISCLAIMERS.md — ensure all disclaimers are in the app
3. Adjust marketing language if Apple flags specific health claims
4. Resubmit with changes (typical turnaround: 24-48 hours)
5. Delay launch by exactly the resubmission time — don't launch with a broken pipeline

---

## Part 4: Key Metrics to Track

| Metric | Tool | Check Frequency |
|--------|------|-----------------|
| App Store downloads | App Store Connect | Daily (Week 1), weekly after |
| Email open rate | Email platform | After each send |
| Email click rate | Email platform | After each send |
| Instagram follower growth | Instagram Insights | Daily (Week 1) |
| Instagram engagement rate | Instagram Insights | Weekly |
| Reddit post upvotes + comments | Reddit | Daily (Week 1) |
| App Store rating | App Store Connect | Daily (Week 1) |
| Conversion (free → premium) | App analytics | Weekly |
| DAU / retention | App analytics | Weekly |
| Waitlist → download conversion | Email platform + App Store | After launch email |

---

## Part 5: Budget Estimate (Launch Month)

| Item | Cost | Notes |
|------|------|-------|
| Domain registration | $12-15/year | .app or .com |
| Email platform (Loops.so) | $0 (free tier) | Up to 1,000 contacts |
| Landing page (Carrd or similar) | $19/year | Single-page, clean |
| Instagram scheduling (Later) | $0 (free tier) | Up to 30 posts/month |
| App Store developer fee | $99/year | Already budgeted |
| Paid social (optional, Week 4+) | $0-500 | Only if organic works first |
| **Total launch month** | **~$130** | Bootstrapped-friendly |

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial promotion plan. Migration steps, launch sequence (relative dates), rollback scenarios, metrics tracking, budget estimate. All dates relative to TestFlight/App Store approval.
