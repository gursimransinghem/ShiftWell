# ShiftWell Pricing Model

> **Version:** 1.0 | **Date:** April 2026
> **Purpose:** Canonical pricing reference for consumer and enterprise tiers
> **Audience:** Sales, finance, product, investor conversations

---

## 1. Consumer (B2C) Pricing

| Plan | Price | Notes |
|------|-------|-------|
| Free | $0 | Core shift import, basic sleep plan, limited history |
| Monthly | $6.99/month | Full premium features, cancel anytime |
| Annual | $49.99/year | ~$4.17/mo — best value for individuals |
| Lifetime | $149.99 one-time | Single purchase, all future updates included |
| Premium Trial | 7 days free | Unlocks all premium features before commitment |

**Free tier limits:** 2-week schedule history, no Weekly Sleep Brief, no circadian forecast, no Night Sky visualization, no AI coaching.

**Premium features:** Unlimited history, Weekly Sleep Brief, circadian forecast, Night Sky visualization, AI coaching nudges, HealthKit deep integration, advanced nap windows.

---

## 2. Enterprise (B2B) Pricing

### 2.1 Seat-Based Tiers

| Tier | Seats | Price per Seat/Month | Annual per Seat | Notes |
|------|-------|---------------------|-----------------|-------|
| Tier 1 | 10–49 | $15/seat/month | $180/seat | Billed annually or monthly |
| Tier 2 | 50–199 | $10/seat/month | $120/seat | Annual billing required |
| Tier 3 | 200–999 | $7/seat/month | $84/seat | Annual billing required |
| Enterprise | 1,000+ | Custom (starting $5/seat/month) | Custom | Multi-year contracts available |

### 2.2 Implementation Fee

| Item | Price | Includes |
|------|-------|---------|
| One-time setup fee | $2,500 | Admin dashboard configuration, SSO/directory integration, onboarding webinar for employees, 90-day check-in with Customer Success |
| Custom integration | $5,000–$15,000 | API integration with scheduling systems (Kronos, API Health, AMS), custom data export formats |
| Research partnership | $0 additional | Included for pilot hospitals; requires data sharing agreement and IRB review |

### 2.3 Volume Discount Examples

| Organization | Seats | Monthly Cost | Annual Cost | Per-Seat Annual |
|--------------|-------|-------------|-------------|-----------------|
| Single department (ER, 30 nurses) | 30 | $450 | $5,400 | $180 |
| Mid-size hospital (nursing, 150 staff) | 150 | $1,500 | $18,000 | $120 |
| Regional health system (500 staff) | 500 | $3,500 | $42,000 | $84 |
| Large health system (1,200 staff) | 1,200 | Custom | Custom (est. $72,000+) | ~$60 |

### 2.4 What's Included in Enterprise

All enterprise tiers include:
- All premium consumer features for enrolled employees
- Admin dashboard with de-identified aggregate reporting
- Cohort sleep health metrics (department, shift type, week-over-week trends)
- Monthly executive summary report (PDF)
- Dedicated Customer Success manager (Tier 2+)
- HIPAA BAA execution
- SSO support (SAML 2.0, Okta, Azure AD)
- Employee onboarding materials (email templates, FAQ)
- Priority support (24-hour response SLA for Tier 1; 4-hour for Tier 2+)

---

## 3. ROI Reference

The enterprise pricing is designed to deliver 10:1 ROI at minimum for any healthcare employer. Key benchmarks (full methodology in `docs/enterprise/ROI-CALCULATOR.md`):

| Metric | Value | Source |
|--------|-------|--------|
| Unplanned absence cost | $4,080/employee/year | Sedgwick 2024 |
| Fatigue productivity loss | $1,967/employee/year | Rosekind et al. 2010 |
| RN turnover cost | $100,000–$150,000/departure | NSI Nursing Solutions 2024 |
| ShiftWell break-even | 0.6 prevented nurse departures/year (500 seats) | Internal model |

**Example ROI — 150-nurse hospital, Tier 2 ($10/seat/month):**

| Category | Annual Value |
|----------|-------------|
| Absenteeism savings (20% reduction) | $122,400 |
| Productivity savings (10% improvement) | $29,505 |
| Turnover savings (5% reduction, ~4 nurses retained) | $400,000 |
| ShiftWell cost (150 × $10 × 12) | ($18,000) |
| **Net annual savings** | **$533,905** |
| **ROI** | **2,966%** |

---

## 4. Competitive Pricing Comparison

| Product | Target Audience | Consumer Price | Enterprise |
|---------|----------------|---------------|-----------|
| **ShiftWell** | Shift workers, healthcare | $6.99/mo, $49.99/yr | $5–15/seat/mo |
| Rise Science | Athletes, general | $9.99/mo, $69.99/yr | Undisclosed (premium) |
| Calm | General wellness | $14.99/mo, $69.99/yr | $15/seat/mo (est.) |
| Headspace for Work | Corporate wellness | $12.99/mo consumer | $8–18/seat/mo |
| Hatch Sleep (hardware) | General | $99.99 device + $4.99/mo | N/A |
| BetterSleep | General | $9.99/mo | No enterprise offering |

**ShiftWell pricing advantages:**
1. **Purpose-built for shift workers** — competitors are general wellness apps charging premium rates for non-specialized content
2. **Lower consumer price than Rise** ($49.99 vs. $69.99 annual) with shift-work-specific features Rise lacks
3. **Enterprise pricing with ROI guarantee** — no competitor offers documented, source-cited ROI models
4. **Physician-founded credibility** — clinical credibility commands enterprise pricing without the hospital IT friction of consumer apps

---

## 5. Pricing Philosophy

**Consumer:** Price below Rise ($69.99) and Calm ($69.99) because ShiftWell is mission-driven (accessible to all shift workers regardless of income). The $49.99 annual price is competitive with a single night of poor sleep calling out sick.

**Enterprise:** Price as a clinical tool, not a wellness perk. At $10/seat/month ($120/year), ShiftWell costs less than 0.1% of the annual salary of the nurses it serves — and needs to prevent fewer than 0.2 nurse departures per 100 enrolled employees to break even.

**Lifetime:** Available at $149.99 as a high-conviction option for early adopters. Will be retired when enterprise revenue matures. Held below $200 to remain accessible.

---

## 6. Pricing Review Schedule

| Trigger | Action |
|---------|--------|
| Enterprise ARR hits $100K | Review Tier 3 floor; consider raising to $8/seat/mo |
| Consumer conversion rate <3% | A/B test $4.99/month intro offer |
| Competitor price change | Rerun competitive analysis within 2 weeks |
| Annual (April) | Full pricing review against new market data |

---

*ShiftWell Pricing Model v1.0 — April 2026*
*Reference: ROI-CALCULATOR.md for full methodology and source citations*
