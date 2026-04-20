# ShiftWell — Website Launch Plan

> **Date:** 2026-04-18
> **Status:** Ready to Execute

---

## 1. Domain Strategy

### Primary Recommendation: `shiftwell.app`

The `.app` TLD is ideal: enforces HTTPS by default, signals "this is an application," and Google runs the registry (long-term stability). Check availability immediately at [Namecheap](https://namecheap.com) or [Google Domains](https://domains.google).

### Backup Options (in priority order)

| Domain | Pros | Cons | Est. Cost |
|--------|------|------|-----------|
| `getshiftwell.com` | .com credibility, likely available | "get" prefix is generic | ~$12/yr |
| `shiftwell.health` | Category-relevant TLD | Less recognized | ~$30/yr |
| `tryshiftwell.com` | Action-oriented, likely available | Same "prefix" issue | ~$12/yr |
| `shiftwell.co` | Short, modern | Can confuse with .com | ~$25/yr |

**Important:** `shiftwell.io` is taken by a different shift scheduling product. Do NOT use `.io` — it creates brand confusion.

### Domain Acquisition Steps
1. Search `shiftwell.app` at Namecheap, Cloudflare Registrar, or Porkbun (cheapest renewal rates)
2. If available: register for 2+ years (signals legitimacy to Google, prevents lapsing)
3. If taken: check if it's parked (make an offer) or active (use backup)
4. Also register `shiftwell.com` defensively if available (even if not primary)
5. Set up domain privacy / WHOIS protection

---

## 2. Hosting Recommendation: Cloudflare Pages

### Why Cloudflare Pages Over Vercel/Netlify

| Factor | Cloudflare Pages | Vercel | Netlify |
|--------|-----------------|--------|---------|
| Free tier | Unlimited bandwidth | 100GB/mo | 100GB/mo |
| Build speed | Fast | Fast | Medium |
| Edge network | 300+ PoPs (largest) | ~20 regions | ~10 regions |
| Custom domains | Free SSL, instant | Free SSL | Free SSL |
| Analytics | Built-in (privacy-first) | Paid add-on | Paid add-on |
| Cost at scale | Free for static | $20/mo Pro | $19/mo Pro |
| DDoS protection | Included (enterprise-grade) | Basic | Basic |

Cloudflare Pages wins on: unlimited free bandwidth, largest edge network (fastest globally), built-in analytics, and integrated DDoS protection. Since this is a static HTML site, the free tier covers everything.

### Setup Steps

```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Create the project
cd website/
wrangler pages project create shiftwell-site

# 4. Deploy
wrangler pages deploy . --project-name=shiftwell-site

# 5. The site is live at shiftwell-site.pages.dev
```

Alternatively, connect the GitHub repo for auto-deploys on push:
1. Go to Cloudflare Dashboard → Pages → Create a project
2. Connect GitHub repo
3. Set build output directory to `website/`
4. Every push to `main` auto-deploys

---

## 3. DNS Setup

### If Domain is on Cloudflare Registrar (simplest)

DNS is automatic. Just add the custom domain in Pages settings.

### If Domain is on External Registrar

1. **Add site to Cloudflare** (free plan)
2. **Update nameservers** at your registrar to Cloudflare's:
   - `ns1.cloudflare.com` (example — actual values shown in dashboard)
   - `ns2.cloudflare.com`
3. **Add DNS records:**
   - `CNAME` → `@` → `shiftwell-site.pages.dev` (proxied)
   - `CNAME` → `www` → `shiftwell-site.pages.dev` (proxied)
4. **Set up redirect:** `www.shiftwell.app` → `shiftwell.app` (Page Rule or Redirect Rule)
5. Wait 24-48 hours for DNS propagation (usually <1 hour with Cloudflare)

---

## 4. SSL Configuration

Cloudflare Pages handles SSL automatically. No manual configuration needed.

**Verify these settings in Cloudflare Dashboard:**
- SSL/TLS → Full (Strict)
- Edge Certificates → Always Use HTTPS: ON
- Automatic HTTPS Rewrites: ON
- HSTS: Enable with `max-age=31536000`, `includeSubDomains`, `preload`
- Minimum TLS Version: TLS 1.2

---

## 5. Analytics Setup

### Recommended: Plausible Analytics

Privacy-first, no cookies, GDPR/CCPA compliant out of the box. No consent banner needed.

**Setup:**
1. Sign up at [plausible.io](https://plausible.io) ($9/mo for up to 10K monthly pageviews)
2. Add the script tag before `</head>`:
```html
<script defer data-domain="shiftwell.app" src="https://plausible.io/js/script.js"></script>
```
3. Done. Dashboard is at `plausible.io/shiftwell.app`

**Key metrics to track:**
- Unique visitors, pageviews, bounce rate
- Referral sources (where traffic comes from)
- Top pages
- Country/device breakdown
- Goal conversions: "Download" button clicks, "Start Trial" clicks

**Set up goals:**
```
Goal 1: Click → .app-store-btn (App Store download)
Goal 2: Click → .pricing-btn-primary (Start trial)
Goal 3: Pageview → /blog/* (content engagement)
```

### Alternative: PostHog (if you want product analytics later)

PostHog is free up to 1M events/month and includes session replay, feature flags, and A/B testing. Better for when the app launches and you need deeper product analytics. Overkill for a landing page alone.

---

## 6. Performance Optimization

The current landing page is pure HTML/CSS/JS — already fast. Additional optimizations:

1. **Compress images** — Run any added images through `squoosh.app` or `tinypng.com`
2. **Add `loading="lazy"`** to any images below the fold
3. **Preload hero fonts:**
```html
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800&display=swap" as="style">
```
4. **Add resource hints:**
```html
<link rel="dns-prefetch" href="https://plausible.io">
```
5. **Enable Cloudflare optimizations:**
   - Speed → Optimization → Auto Minify: HTML, CSS, JS
   - Speed → Optimization → Brotli: ON
   - Caching → Tiered Cache: ON

**Target:** Lighthouse score 95+ on all categories. The current single-file HTML approach should hit 98-100 on Performance.

---

## 7. Pre-Launch Checklist

### Content & Design
- [ ] Replace placeholder testimonials with real beta feedback (or remove section until you have real quotes)
- [ ] Add actual app screenshots or screen recordings
- [ ] Create OG image (1200×630px) for social sharing
- [ ] Create favicon set (16×16, 32×32, 180×180 apple-touch-icon)
- [ ] Proofread all copy (there's a typo: "halluccinates" → "hallucinates" in the Science section)
- [ ] Add actual App Store link once live
- [ ] Verify pricing matches current plan ($29.99/yr annual, $4.99/mo monthly)

### Technical
- [ ] Domain purchased and DNS configured
- [ ] SSL verified working (https:// loads correctly)
- [ ] www → non-www redirect working
- [ ] Analytics script added and verified
- [ ] All anchor links working (#features, #pricing, etc.)
- [ ] Mobile responsive tested on iPhone, Android, iPad
- [ ] Test on slow 3G connection
- [ ] Add `robots.txt` and `sitemap.xml`
- [ ] Verify Open Graph tags with [opengraph.xyz](https://opengraph.xyz)

### SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Submit site to Bing Webmaster Tools
- [ ] Create Google Business Profile (if applicable)
- [ ] Set up Google Alerts for "ShiftWell" brand mentions

### Legal
- [ ] Privacy Policy page live (link from footer)
- [ ] Terms of Service page live
- [ ] Health Disclaimers page live
- [ ] Cookie notice (not needed if using Plausible — it's cookieless)

### Launch Day
- [ ] Share on all social media channels
- [ ] Post on Product Hunt (schedule for Tuesday 12:01 AM PT)
- [ ] Post in relevant Reddit communities
- [ ] Email any beta waitlist
- [ ] Monitor analytics for first 24 hours

---

## 8. Post-Launch Additions

**Week 1-2:**
- Add blog section (static markdown → HTML, or use Astro for a simple blog)
- Create "For Employers" landing page (B2B positioning)
- Add email capture for waitlist/newsletter (use Buttondown — privacy-first)

**Month 1:**
- Add app screenshots/video demo
- Replace placeholder testimonials with real ones
- Start SEO content: "Best sleep schedule for night shift nurses" etc.
- Add FAQ section

**Month 2-3:**
- Consider migrating to Astro or Next.js (static export) if you need blog, multiple pages, or content management
- Add comparison pages ("ShiftWell vs. Sleep Cycle for shift workers")
- Create landing pages for specific audiences (nurses, firefighters, police)

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Domain strategy, hosting comparison, DNS/SSL setup, analytics, performance optimization, pre-launch checklist, post-launch roadmap.
