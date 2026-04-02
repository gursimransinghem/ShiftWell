# Requirements: ShiftWell

**Defined:** 2026-04-02
**Core Value:** Sleep on autopilot — set up once, never think about sleep scheduling again.

## v1.0 Requirements

Requirements for TestFlight release. Each maps to roadmap phases.

### Calendar Sync

- [ ] **CAL-01**: User can connect Apple Calendar (read access to shifts + personal events)
- [ ] **CAL-02**: User can connect Google Calendar (read access to shifts + personal events)
- [ ] **CAL-03**: App auto-detects shift events from connected calendars
- [ ] **CAL-04**: App writes sleep blocks back to user's calendar as real events
- [ ] **CAL-05**: Sleep blocks auto-update when calendar changes (dynamic rescheduling)
- [ ] **CAL-06**: User can configure which calendars to read and write to

### Onboarding

- [ ] **ONB-01**: User completes chronotype quiz (simplified MEQ → early/intermediate/late)
- [x] **ONB-02**: User builds AM routine (wake, shower, breakfast, kids/pets, exercise, commute time)
- [x] **ONB-03**: User builds PM routine (dinner, wind-down activities, phone-down, lights-out)
- [x] **ONB-04**: User enters work and home addresses for commute calculation
- [ ] **ONB-05**: User sets household profile (size, young children, pets)
- [x] **ONB-06**: User sets sleep preferences (target hours, nap preference, caffeine sensitivity)

### Sleep Plan Generation

- [ ] **PLAN-01**: Algorithm generates complete sleep plan from calendar + profile data
- [ ] **PLAN-02**: Plan includes: sleep windows, naps, caffeine cutoffs, meal timing, light protocols
- [ ] **PLAN-03**: Plan accounts for commute time when calculating wake-up
- [ ] **PLAN-04**: Plan detects free mornings and extends sleep-in opportunity
- [ ] **PLAN-05**: Plan provides schedule preview ("3 nights next week, pre-adapt starting Thursday")
- [ ] **PLAN-06**: Plan updates dynamically when calendar or profile changes

### Night Sky Mode

- [ ] **NSM-01**: App transitions to dark night-sky theme as bedtime approaches
- [ ] **NSM-02**: Night Sky Mode shows only critical info: alarm confirmation, latest wake time, morning schedule
- [ ] **NSM-03**: Recharge animation shows projected sleep quality (adjusts if user is up past bedtime)
- [ ] **NSM-04**: Quick bedtime tips cycle (water, phone placement, room temp based on weather)
- [ ] **NSM-05**: Firefly/star animations create soothing visual environment

### Live Activities

- [ ] **LIVE-01**: Wind-down countdown appears on Dynamic Island / lock screen
- [ ] **LIVE-02**: At bedtime, Live Activity displays "Sleep [logo]" or calm message
- [ ] **LIVE-03**: Morning Live Activity shows sleep score or AM routine countdown

### Notifications

- [ ] **NOTIF-01**: Wind-down reminder push notification (30-60 min before bedtime)
- [ ] **NOTIF-02**: Caffeine cutoff reminder push notification
- [ ] **NOTIF-03**: Morning brief push notification (score + first open block in schedule)
- [ ] **NOTIF-04**: Notifications are warm, emoji, minimal (not clinical)
- [ ] **NOTIF-05**: User can customize notification timing and preferences

### Recovery Score

- [ ] **SCORE-01**: App calculates Shift Readiness Score based on plan adherence
- [ ] **SCORE-02**: Score displays prominently on Today screen
- [ ] **SCORE-03**: Score trends visible over time (improving/declining)

### Premium & Trial

- [ ] **PREM-01**: New users get 14-day full premium experience (no restrictions)
- [ ] **PREM-02**: After trial, graceful downgrade to free tier with clear messaging
- [ ] **PREM-03**: Free tier: algorithm + manual schedule entry + basic today view
- [ ] **PREM-04**: Premium tier: calendar sync, auto-scheduling, Night Sky Mode, Live Activities, notifications, score
- [ ] **PREM-05**: Pricing: $6.99/mo, $49.99/yr, $149.99 lifetime
- [ ] **PREM-06**: No dark patterns — easy cancellation, no sneaky charges, transparent billing

### Design & Polish

- [x] **DES-01**: App uses blend design (dark base + warm accents)
- [x] **DES-02**: Smooth animations throughout (transitions, feedback, staggered loading)
- [x] **DES-03**: Premium, confident visual identity — never cluttered or clinical

### Settings & Referral

- [ ] **SET-01**: "Spread the Sleep" referral option in Settings
- [ ] **SET-02**: User can edit profile, preferences, and routine post-onboarding
- [ ] **SET-03**: User can trigger DND / Sleep Focus mode from app

## v1.1 Requirements

Deferred to next release. Tracked but not in current roadmap.

### AI Intelligence

- **AI-01**: Weekly AI check-in with prewritten + dynamic questions
- **AI-02**: AI generates follow-up questions based on user data trends
- **AI-03**: Detailed morning briefing push (score, energy prediction, schedule, to-dos, wind-down time)

### Health Integration

- **HEALTH-01**: HealthKit integration reads actual sleep data
- **HEALTH-02**: Recovery Score v2 uses real sleep data (not just adherence)
- **HEALTH-03**: Sleep Debt Tracker with weekly trend visualization
- **HEALTH-04**: Circadian Phase Indicator

### Engagement

- **ENG-01**: Morning brain dump prompt (deep-link to quick capture)
- **ENG-02**: Screen time / phone pickup awareness at bedtime

## v1.2 Requirements

- **CREW-01**: Shift Crew — create/join temporary rotation groups
- **CREW-02**: AI suggests overlapping free time activities
- **CREW-03**: Thumbs-up/raincheck flow with calendar event creation
- **HOUSE-01**: Household mode — partner notifications
- **GAME-01**: Consistency-based level system and streaks
- **GAME-02**: Weekly Sleep Intelligence Report
- **GAME-03**: Personalized insights from data patterns
- **DASH-01**: Sleep analytics dashboards

## Out of Scope

| Feature | Reason |
|---------|--------|
| Soundscapes / meditation audio | Not our lane — Calm and BetterSleep own this |
| Social feed / community | Distraction from core value |
| Wearable-specific dashboards (Oura, Whoop) | Apple Health is the aggregator |
| Manual sleep logging | The whole point is automation |
| Android (v1) | iOS first — Apple HealthKit, physician iPhone use |
| Real-time chat | Complexity without proportional value |
| Video content | Storage/bandwidth costs, not core |

## Traceability

_Updated 2026-04-02 after roadmap creation._

| Requirement | Phase | Status |
|-------------|-------|--------|
| DES-01 | Phase 1 | Complete |
| DES-02 | Phase 1 | Complete |
| DES-03 | Phase 1 | Complete |
| ONB-01 | Phase 1 | Pending |
| ONB-02 | Phase 1 | Complete |
| ONB-03 | Phase 1 | Complete |
| ONB-04 | Phase 1 | Complete |
| ONB-05 | Phase 1 | Pending |
| ONB-06 | Phase 1 | Complete |
| CAL-01 | Phase 2 | Pending |
| CAL-02 | Phase 2 | Pending |
| CAL-03 | Phase 2 | Pending |
| CAL-04 | Phase 2 | Pending |
| CAL-05 | Phase 2 | Pending |
| CAL-06 | Phase 2 | Pending |
| PLAN-01 | Phase 3 | Pending |
| PLAN-02 | Phase 3 | Pending |
| PLAN-03 | Phase 3 | Pending |
| PLAN-04 | Phase 3 | Pending |
| PLAN-05 | Phase 3 | Pending |
| PLAN-06 | Phase 3 | Pending |
| NSM-01 | Phase 4 | Pending |
| NSM-02 | Phase 4 | Pending |
| NSM-03 | Phase 4 | Pending |
| NSM-04 | Phase 4 | Pending |
| NSM-05 | Phase 4 | Pending |
| NOTIF-01 | Phase 4 | Pending |
| NOTIF-02 | Phase 4 | Pending |
| NOTIF-03 | Phase 4 | Pending |
| NOTIF-04 | Phase 4 | Pending |
| NOTIF-05 | Phase 4 | Pending |
| LIVE-01 | Phase 5 | Pending |
| LIVE-02 | Phase 5 | Pending |
| LIVE-03 | Phase 5 | Pending |
| SCORE-01 | Phase 5 | Pending |
| SCORE-02 | Phase 5 | Pending |
| SCORE-03 | Phase 5 | Pending |
| PREM-01 | Phase 6 | Pending |
| PREM-02 | Phase 6 | Pending |
| PREM-03 | Phase 6 | Pending |
| PREM-04 | Phase 6 | Pending |
| PREM-05 | Phase 6 | Pending |
| PREM-06 | Phase 6 | Pending |
| SET-01 | Phase 6 | Pending |
| SET-02 | Phase 6 | Pending |
| SET-03 | Phase 6 | Pending |

**Coverage:**
- v1.0 requirements: 46 total
- Mapped to phases: 46
- Unmapped: 0

---
*Requirements defined: 2026-04-02*
*Last updated: 2026-04-02 after roadmap creation*
