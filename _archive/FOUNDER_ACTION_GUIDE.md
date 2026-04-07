# ShiftWell: Your Step-by-Step Launch Guide

**From "Code Complete" to Live on the App Store**

---

Hey! If you're reading this, congratulations — you've already done the hardest part. You built an app. That's something most people only talk about doing. Everything from here is just paperwork and clicking buttons. Seriously.

This guide walks you through every step to get ShiftWell into the hands of real shift workers. No jargon, no assumptions, no skipped steps. Think of it as a friend sitting next to you saying "okay, now click this."

Let's do this.

---

## Step 1: Form Your LLC

**Estimated time:** 30 minutes online | **Cost:** $50–200 (varies by state)

### Why do this?

An LLC (Limited Liability Company) is a simple business structure that creates a legal wall between you and your app. If someone ever sues the app — say, they claim a sleep recommendation caused them harm — they sue the LLC, not you personally. Your house, your savings, your personal assets stay protected.

It also looks more professional. On the App Store, users will see your company name instead of your personal name. That builds trust.

### How to do it:

1. **Pick your state.** The simplest choice is whatever state you live in. (You may have heard Wyoming or Delaware are popular — they have lower fees and more privacy, but registering out-of-state adds complexity. For a solo founder, home state is the way to go.)

2. **Go to your state's Secretary of State website.** Google "[your state] Secretary of State file LLC" and it'll be the first result. Every state has an online filing system now.

3. **File your "Articles of Organization."** This is the official form that creates your LLC. It asks for basic info:
   - Your LLC name (something like "ShiftWell Health LLC" or "ShiftWell LLC" — check that the name is available in your state)
   - Your address
   - What the business does (one sentence is fine: "Mobile health application development")
   - Your name as the organizer

4. **Choose a registered agent.** This is just the person who receives official legal mail for your LLC. You can list yourself and use your home address — totally fine. If you want privacy (so your home address isn't in public records), use a registered agent service for about $50/year. Companies like Northwest Registered Agent or LegalZoom offer this.

5. **Create an Operating Agreement.** Even though you're the only member, having this document strengthens your LLC protection. It's a one-page document that says "I own 100% of this LLC and here's how I run it." Search "single-member LLC operating agreement template [your state]" — there are free templates everywhere. Fill it in, sign it, save it. You don't file this anywhere; just keep it in your records.

6. **Pay the filing fee.** It's usually $50–200 depending on your state. You'll get a confirmation and your LLC documents within a few days (some states process instantly).

That's it. You now own a business.

---

## Step 2: Get Your EIN (Employer Identification Number)

**Estimated time:** 10 minutes | **Cost:** FREE

### Why do this?

An EIN is like a Social Security number, but for your business. You'll need it to:
- Open a business bank account
- File business taxes
- Enroll in the Apple Developer Program (they ask for it)

### How to do it:

1. Go to [irs.gov/ein](https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online).

2. Click "Apply Online Now."

3. Answer the questions. They're straightforward:
   - Type of entity: LLC
   - Number of members: 1
   - Why you're applying: "Started a new business"
   - Your LLC name and address
   - Your personal info (as the responsible party)

4. Submit, and you get your EIN immediately. Right there on the screen. Save the confirmation letter as a PDF.

**Important:** Never pay a third party to get your EIN. It's completely free directly from the IRS. Any website charging you for this is just filling out the same free form on your behalf.

---

## Step 3: Open a Business Bank Account

**Estimated time:** 30 minutes | **Cost:** Usually free

### Why do this?

Keeping business money separate from personal money is essential for two reasons:
- **Legal protection:** Mixing personal and business funds can "pierce the corporate veil" — meaning a court could ignore your LLC protection. Separate accounts keep that wall strong.
- **Easy taxes:** When tax time comes, all your business income and expenses are in one place. No digging through personal transactions.

### How to do it:

1. **Choose a bank.** You have two options:
   - **Your current bank:** Walk in with your documents. Easiest if you like in-person banking.
   - **An online business bank:** Mercury, Relay, or Novo are popular with solo founders. No fees, nice apps, quick setup. Mercury is especially popular with tech founders.

2. **Bring these documents:**
   - Your Articles of Organization (LLC formation docs)
   - Your EIN confirmation letter
   - Your personal ID (driver's license)
   - Your Operating Agreement (some banks ask for this)

3. **Open a business checking account.** That's all you need for now. No need for a savings account, credit card, or anything fancy yet.

4. **Set up online access** so you can check balances and track expenses from your phone.

From now on, any app-related expenses (Apple Developer fee, design tools, etc.) go through this account. Any future app revenue goes here too.

---

## Step 4: Enroll in the Apple Developer Program

**Estimated time:** 15 minutes to start, then 1–5 business days waiting | **Cost:** $99/year

### Why do this?

You cannot publish an app on the App Store or distribute it through TestFlight (for beta testing) without an Apple Developer account. This is Apple's gatekeeper — no way around it.

### How to do it:

1. **Go to** [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll).

2. **Sign in with your Apple ID.** If you don't have one, create one. Use your business email if you have one.

3. **Choose "Organization"** (not "Individual"). This is important — enrolling as an Organization means the App Store will display your LLC name (like "ShiftWell Health LLC") instead of your personal name. More professional, more trustworthy.

4. **You'll need a D-U-N-S Number.** This is a free business identifier from Dun & Bradstreet. Sounds intimidating, but Apple walks you through it:
   - Apple will check if your LLC already has one (it probably doesn't yet)
   - If not, Apple submits the request for you
   - It takes 1–5 business days to get approved
   - You'll get an email when it's ready, then you can continue enrollment

5. **You'll also need a website.** It can be a simple one-page site with your LLC name, what ShiftWell is, and a contact email. You can set one up for free using GitHub Pages, Carrd ($19/year), or even a simple Google Site. This is also where you'll host your privacy policy later (Step 10).

6. **Pay the $99/year fee** with the business bank account you just opened.

7. **Wait for Apple to verify** your enrollment. This usually takes 24–48 hours after your D-U-N-S number is approved.

Once approved, you have access to App Store Connect (where you manage your app listing) and TestFlight (where you distribute beta builds).

---

## Step 5: Generate Your App Icon

**Estimated time:** 20–30 minutes | **Cost:** Free–$10

### Why do this?

Your app icon is required for the App Store, and it's the very first thing a potential user sees. A clean, professional icon builds instant trust — especially for a health app where credibility matters.

### How to do it:

1. **Open the icon guide:** Check out `APP_ICON_GUIDE.md` in this project. It has three design concepts already created for ShiftWell, along with ready-to-use prompts for AI image generators.

2. **Generate your icon** using one of these AI tools:
   - **DALL-E** (via ChatGPT) — Free if you have a ChatGPT account
   - **Midjourney** — $10/month, often produces the most polished results
   - **Ideogram** — Free tier available, good for clean designs

3. **Make sure the image is:**
   - Exactly **1024 x 1024 pixels**
   - **PNG format**
   - **No transparency** (Apple requires a solid background)
   - **No rounded corners** (Apple adds those automatically)

4. **Replace the placeholder icon** in the project:
   - Save your final icon as `icon.png`
   - Put it at `nightshift/assets/images/icon.png` (replacing the existing placeholder)
   - The build system automatically generates all the different sizes Apple requires

5. **Look at it small.** Shrink it down to the size it'll appear on a phone home screen. Can you still tell what it is? If the details get lost, simplify the design.

---

## Step 6: Test on Your Physical iPhone

**Estimated time:** 30 minutes (first time) | **Cost:** Free

### Why do this?

The iPhone simulator on your Mac is useful for development, but it can't test everything. Real touch interactions, notification behavior, actual performance, and how the dark theme looks on a real screen — you need a physical device for all of that. Never ship an app you haven't used yourself on a real phone.

### How to do it:

1. **Make sure Node.js is installed** on your Mac. Open Terminal (search "Terminal" in Spotlight) and type:
   ```
   node --version
   ```
   If you see a version number (like `v18.17.0`), you're good. If you get "command not found," download it from [nodejs.org](https://nodejs.org) — pick the "LTS" version.

2. **Open Terminal** and navigate to the project:
   ```
   cd path/to/nightshift
   ```
   (Replace `path/to/nightshift` with the actual folder location on your computer.)

3. **Start the development server:**
   ```
   npx expo start
   ```
   Wait for a QR code to appear in the Terminal.

4. **On your iPhone:**
   - Download the **"Expo Go"** app from the App Store (it's free)
   - Open your iPhone camera and point it at the QR code on your computer screen
   - Tap the notification that appears — it opens the app in Expo Go

5. **Test everything.** Go through the app like a real user:
   - Add a shift schedule
   - Generate a sleep optimization plan
   - Export the plan to your calendar
   - Try every button and screen
   - Check that text is readable and nothing overlaps
   - Make sure the dark theme looks good
   - Try it in bright light and in the dark

6. **Write down anything that feels off.** Crashes, confusing wording, buttons that are hard to tap, screens that load slowly — all of it. You can bring these notes back to Claude Code to fix.

---

## Step 7: Set Up TestFlight for Beta Testing

**Estimated time:** 1–2 hours (first time — the build process takes a while) | **Cost:** Free (included in your $99/yr Apple Developer fee)

### Why do this?

TestFlight is Apple's official beta testing platform. It lets you share a pre-release version of ShiftWell with testers without going through the full App Store review. Testers install it like a regular app — no technical knowledge needed on their end. This is how you get real-world feedback before your public launch.

### How to do it:

1. **Check the full walkthrough** in `DEPLOYMENT_GUIDE.md` in this project — it has detailed instructions with screenshots. Here's the summary:

2. **Build the app for TestFlight** by running this in Terminal:
   ```
   eas build --platform ios --profile preview
   ```
   This packages your app and sends it to Expo's build servers. The first build takes 15–30 minutes. You'll get a link when it's done.

3. **Upload the build to App Store Connect.**
   ```
   eas submit --platform ios
   ```
   This sends your built app to Apple's servers.

4. **Set up TestFlight in App Store Connect:**
   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Find your app → click "TestFlight" tab
   - Create a group (like "ED Beta Testers")
   - Add tester email addresses

5. **Your testers will receive an email** with an invitation. They:
   - Open the email on their iPhone
   - Download the TestFlight app (free, from Apple)
   - Accept the invitation
   - Install ShiftWell through TestFlight

That's it — they now have the app on their phone, and you can see crash reports and feedback right in App Store Connect.

---

## Step 8: Recruit Beta Testers

**Estimated time:** 10 minutes | **Cost:** Free

### Why do this?

You built this app for shift workers — now you need actual shift workers to use it and tell you what works and what doesn't. Their feedback is gold. They'll find things you never thought of, because they're living the problem every day.

### Who to ask:

Aim for **5–10 people** from your ED. A mix is ideal:
- Nurses (they have the most varied shift patterns)
- Residents (they're usually tech-savvy and will give detailed feedback)
- Attendings (they'll test it with a different perspective)
- Paramedics or techs (different shift structures)
- Anyone who works night shifts or rotating shifts

### How to ask:

Send a text or message — keep it casual. Something like:

> "Hey! I built an app that helps shift workers figure out the best times to sleep based on their schedule. Would you be willing to try it for a couple weeks and give me honest feedback? It's free, takes 2 minutes to set up, and I'll send you a TestFlight invite. No pressure either way!"

Most people will be intrigued — a colleague who built an app is interesting. Don't be shy about asking.

### What to ask after 1 week:

Send a quick follow-up:
- "Does the sleep plan actually match your reality?"
- "Was anything confusing when you first opened it?"
- "Would you keep using it?"
- "What's the one thing you wish it did differently?"

Listen more than you talk. Write down every piece of feedback.

---

## Step 9: Iterate on Beta Feedback (1–2 Weeks)

**Estimated time:** Ongoing over 1–2 weeks | **Cost:** Free

### Why do this?

This is the most valuable phase of your entire launch process. Real users using your app in real life will teach you more in one week than months of building in isolation. Don't skip this step or rush through it.

### What to do with the feedback:

1. **Collect everything.** Write down every comment, complaint, and suggestion. A simple note on your phone or a Google Doc works fine.

2. **Sort feedback into three buckets:**
   - **Bugs** — "The app crashed when I..." or "This button doesn't work." Fix these immediately.
   - **UX issues** — "I didn't understand what this screen was asking" or "I couldn't find where to..." Fix these before launch.
   - **Feature requests** — "It would be cool if it could..." Save these for after launch. Write them down, but don't build them now. Stay focused on a solid v1.

3. **Come back to Claude Code** to implement fixes. Describe the feedback in plain language — "Two testers said they didn't understand the main screen" — and work through the solutions together.

4. **Send updated builds** through TestFlight. Your testers will get a notification that an update is available. Ask them to try the fixes and confirm they work.

5. **Know when to stop.** You'll never run out of feedback. The goal isn't perfection — it's an app that works reliably, is easy to understand, and delivers value. When your testers say "yeah, this is solid," you're ready.

---

## Step 10: Submit to the App Store

**Estimated time:** 2–3 hours to prepare, then 1–3 days waiting for review | **Cost:** Free (covered by your $99/yr Apple Developer fee)

### Why do this?

This is the finish line. Once Apple approves your app, anyone with an iPhone can find and download ShiftWell. You built something real and put it out into the world. That's a big deal.

### How to do it:

1. **Build the production version:**
   ```
   eas build --platform ios --profile production
   ```

2. **Submit it to Apple:**
   ```
   eas submit --platform ios
   ```

3. **Fill in your App Store listing** in App Store Connect. The good news — most of this is already written for you in `APP_STORE_LISTING.md`:
   - App name and subtitle
   - Description
   - Keywords
   - Screenshots (you'll need to take these from your phone — `DEPLOYMENT_GUIDE.md` explains the required sizes)
   - Category (Health & Fitness)
   - Age rating
   - Privacy questionnaire (what data your app collects and why)

4. **Host your Privacy Policy.** Apple requires a live URL for your privacy policy. You already have the content in `PRIVACY_POLICY.md`. The easiest free option:
   - Use **GitHub Pages** to host it as a simple web page
   - Or paste it into a free Carrd or Google Site
   - Put the URL in your App Store listing

5. **Submit for review.** Click the button and wait. Apple reviews typically take 1–3 days.

6. **If you get rejected** (and don't panic if you do — it happens to everyone):
   - Read the rejection reason carefully. Apple tells you exactly what to fix.
   - Common reasons for health apps:
     - Missing privacy policy URL
     - Screenshots don't match the app
     - Health claims need disclaimers (you already have these in `HEALTH_DISCLAIMERS.md`)
     - Missing purpose string for permissions (like "why does this app need notifications?")
   - Fix the issue, resubmit. Most rejections are resolved in one round.
   - Check `DEPLOYMENT_GUIDE.md` for a list of common rejection reasons and fixes.

7. **Once approved:** Your app goes live. Take a screenshot of ShiftWell on the App Store. You earned it.

---

## Summary Checklist

Here's everything in one view. Check them off as you go:

| # | Step | Time | Cost |
|---|------|------|------|
| &#9744; | **Form your LLC** | 30 min | $50–200 |
| &#9744; | **Get your EIN** | 10 min | Free |
| &#9744; | **Open a business bank account** | 30 min | Free |
| &#9744; | **Enroll in Apple Developer Program** | 15 min + 1–5 days wait | $99/year |
| &#9744; | **Generate your app icon** | 20–30 min | Free–$10 |
| &#9744; | **Test on your physical iPhone** | 30 min | Free |
| &#9744; | **Set up TestFlight** | 1–2 hours | Free |
| &#9744; | **Recruit beta testers** | 10 min | Free |
| &#9744; | **Iterate on beta feedback** | 1–2 weeks (ongoing) | Free |
| &#9744; | **Submit to the App Store** | 2–3 hours + 1–3 days wait | Free |

**Total active time:** ~6–8 hours, spread over 2–3 weeks
**Total cost:** ~$250–400 (mostly one-time, plus $99/year for Apple)

You've already done the hardest part — building the app. Everything on this list is just paperwork and clicking buttons. You've got this.

---

## Frequently Asked Questions

### "What if I get rejected by Apple?"

It's normal. Seriously — even big companies get rejections. Apple's review team is thorough, and health apps get extra scrutiny. The key thing: Apple tells you exactly why you were rejected and what to fix. The most common reasons are:

- Missing privacy policy URL (easy fix — host the one that's already written for you)
- Screenshots that don't match the current app
- Health claims that need disclaimers (already covered in `HEALTH_DISCLAIMERS.md`)

Read the reason, fix it, resubmit. Most rejections are resolved in one round. It's a speed bump, not a wall.

### "Do I need a lawyer?"

Not yet. The privacy policy in `PRIVACY_POLICY.md` and health disclaimers in `HEALTH_DISCLAIMERS.md` are solid for a v1 launch. They cover the key legal requirements for a wellness/health information app.

Consider getting a lawyer when:
- Your revenue exceeds $10K/year
- You want to add features that involve medical advice (vs. general wellness)
- You're raising outside investment
- You're collecting sensitive health data beyond what's currently in the app

For now, your LLC provides liability protection, and your disclaimers make clear the app provides general wellness information, not medical advice.

### "What about Android?"

Great news — ShiftWell is built with Expo, which is a cross-platform framework. That means the same code can run on Android with relatively minimal extra work. But there's a smart reason to launch on iOS first:

- One platform means fewer bugs to track, fewer edge cases, fewer support requests
- iPhone users statistically spend more on apps (relevant if you add a premium tier later)
- You can learn from your iOS launch and apply those lessons to Android

When you're ready for Android, you'll need a Google Play Developer account ($25 one-time fee) and some Android-specific build steps. That's a future project — for now, keep it simple and ship on iOS.

### "When should I quit my day job?"

Don't. Not yet, and not for a long time probably. Here's why:

- **Your clinical work is your competitive advantage.** You understand shift workers because you ARE one. That insight is what makes ShiftWell better than anything a pure tech company could build.
- **Your credibility matters.** "Built by an ER doctor who works nights" is incredibly powerful marketing. Keep that identity.
- **Financial safety.** Don't quit until the app generates reliable income that could replace your salary, OR you've raised enough funding to pay yourself for at least 18 months. Most apps take 1–2 years to reach meaningful revenue.

The best-case scenario is actually keeping your clinical work part-time even if the app succeeds. You stay connected to your users, you maintain credibility, and you have financial stability while the business grows.

### "How much should I charge?"

That's a great question for later. For your v1 launch, consider launching free to build your user base and collect feedback. When you're ready to monetize, common models for health apps include:

- Freemium (basic features free, advanced features for $4.99–9.99/month)
- One-time purchase ($4.99–14.99)
- Free with a "pro" upgrade

But don't let pricing decisions delay your launch. Ship it, learn from users, then decide.

### "What if nobody downloads it?"

That's okay — and honestly, expected at first. The App Store has millions of apps, and organic discovery is slow. Your first users will come from:

1. Your beta testers telling colleagues
2. You sharing it in shift worker communities (Reddit, Facebook groups, nursing forums)
3. Word of mouth in your hospital

Growth takes time. Focus on making the app genuinely useful for a small group of people first. If 50 shift workers love it and tell their friends, that's worth more than 5,000 downloads from people who use it once.

---

*You're closer than you think. One step at a time. Let's go.*

---
Created: 2026-03-24
Last Reviewed: 2026-03-24
Last Edited: 2026-03-24
Review Notes: Freshness footer added during comprehensive audit.
