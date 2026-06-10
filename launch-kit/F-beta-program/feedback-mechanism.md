# ShiftWell Beta Feedback Mechanism

## 1. Current State

**Status:** No in-app feedback collection exists. TestFlight offers native screenshot feedback, but it's limited, asynchronous, and doesn't capture structured data (severity, category, app state).

**Gap:** Beta testers have no easy way to report bugs or suggest features in-app. Sim must manually track feedback from email, text, or scattered notes.

**Blocker:** Without organized feedback collection, it's hard to prioritize bugs vs. features or identify patterns in user pain points.

---

## 2. Recommended Approach: Lightweight Shake-to-Report + Settings Button

### Architecture Overview

```
┌─────────────────────────────────────────┐
│  User Action: Shake Device OR           │
│  Tap "Send Feedback" in Settings        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  FeedbackModal Component                │
│  ├─ Category picker (Bug/Feature/Other) │
│  ├─ Severity selector (for bugs)        │
│  ├─ Text description input              │
│  ├─ Optional: screenshot (auto-captured)│
│  └─ Submit button                       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Data Collection & Enrichment           │
│  ├─ App version (from package.json)     │
│  ├─ Device model (expo-device)          │
│  ├─ OS version                          │
│  ├─ Current screen name (nav state)     │
│  ├─ Timestamp                           │
│  └─ Anonymous user hash                 │
└────────────┬────────────────────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌──────────────┐  ┌──────────────────────┐
│ Supabase     │  │ Screenshot upload to │
│ beta_feedback│  │ Supabase Storage     │
│ table insert │  │ (if provided)        │
└──────────────┘  └──────────────────────┘
      │                    │
      └──────────┬─────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Supabase Edge   │
        │ Function        │
        │ (send email)    │
        └─────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ beta@shiftwell  │
        │ .app email      │
        └─────────────────┘
```

### Key Design Decisions

| Aspect | Choice | Why |
|--------|--------|-----|
| **Trigger** | Shake + Settings button | Shake is frictionless for bugs (immediate); Settings button is discoverable for planned feedback |
| **Storage** | Supabase `beta_feedback` table | Already integrated; no new vendor; RLS & Edge Functions available |
| **Screenshots** | Optional, user-initiated | Captures context; avoids privacy concerns with auto-screenshots |
| **Email notify** | Edge Function + Resend/SendGrid | Ensures Sim gets immediate alerts; doesn't rely on polling dashboard |
| **Categorization** | Bug / Feature / General | Simple enough for beta; expandable later |
| **Severity** | Low / Medium / High (bugs only) | Helps prioritize; not shown for feature requests |

---

## 3. Data Schema: Supabase `beta_feedback` Table

### SQL DDL

```sql
-- Create the beta_feedback table
CREATE TABLE beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id_hash TEXT NOT NULL, -- SHA256 hash of device ID for anonymity
  
  -- Feedback content
  category TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'general')),
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', NULL)), -- NULL for non-bug categories
  
  -- Context metadata
  screenshot_url TEXT, -- Supabase Storage public URL (nullable)
  app_version TEXT NOT NULL, -- e.g., "1.0.0-beta.1"
  device_model TEXT, -- e.g., "iPhone14,2"
  os_version TEXT, -- e.g., "17.2.1"
  screen_name TEXT, -- e.g., "HomeScreen", "SettingsScreen"
  
  -- Tracking
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved', 'wontfix')),
  notes TEXT, -- Admin notes; filled in by Sim during review
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Analytics
  is_duplicate BOOLEAN DEFAULT FALSE,
  parent_feedback_id UUID REFERENCES beta_feedback(id) ON DELETE SET NULL,
  
  CONSTRAINT severity_only_for_bugs CHECK (
    (category = 'bug' AND severity IS NOT NULL) OR
    (category != 'bug' AND severity IS NULL)
  )
);

-- Index for fast queries
CREATE INDEX idx_beta_feedback_created_at ON beta_feedback(created_at DESC);
CREATE INDEX idx_beta_feedback_status ON beta_feedback(status);
CREATE INDEX idx_beta_feedback_category ON beta_feedback(category);

-- Storage bucket for screenshots
-- Run in Supabase dashboard:
-- 1. Go to Storage
-- 2. Create new bucket: name "beta-feedback-screenshots", set public
-- 3. Set RLS policy to allow authenticated uploads

-- Enable RLS on beta_feedback table
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: anyone (including anonymous via anon key) can insert
CREATE POLICY "anyone_can_insert_feedback"
  ON beta_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Policy: only Sim (via authenticated session with custom claim) can view/update
-- For MVP, just let anyone read (or disable this until auth is needed)
CREATE POLICY "anyone_can_read_feedback"
  ON beta_feedback
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);
```

### Table Walkthrough

- **id, created_at**: Standard audit trail.
- **user_id_hash**: SHA256 of `DeviceInfo.deviceId`. Allows grouping feedback from same tester without storing PII.
- **category**: Enum (bug/feature/general). Sim filters by this in dashboard.
- **description**: Free text. Min 20 chars (enforced client-side).
- **severity**: Only present for bugs. UI only shows this field if `category === 'bug'`.
- **screenshot_url**: Public Supabase Storage URL. Optional. Only set if user chose to include screenshot.
- **app_version, device_model, os_version, screen_name**: Context for debugging. Collected automatically.
- **status**: Workflow state. Sim updates this as he reviews.
- **notes**: Sim's internal notes (e.g., "duplicate of #42", "investigating").
- **is_duplicate, parent_feedback_id**: Link to canonical feedback if this is a dupe.

---

## 4. Implementation: Files to Create & Modify

### New Files (6 total, ~120 lines each)

| File | Purpose | Effort |
|------|---------|--------|
| `src/components/FeedbackModal.tsx` | Modal UI, form state, screenshot preview | 200 lines |
| `src/lib/feedback/feedbackService.ts` | Supabase insert, storage upload, error handling | 150 lines |
| `src/lib/feedback/deviceContext.ts` | Collect app version, device model, OS, screen name | 100 lines |
| `src/hooks/useFeedback.ts` | Hook to trigger modal, handle shake, submit logic | 120 lines |
| `supabase/functions/notify-feedback/index.ts` | Edge Function to send email on feedback insert | 80 lines |
| `__tests__/feedback.test.ts` | Unit tests for feedback collection, validation | 150 lines |

### Modified Files (3 total)

| File | Change |
|------|--------|
| `src/screens/SettingsScreen.tsx` | Add "Send Feedback" button → `useFeedback().openModal()` |
| `src/lib/AppContainer.tsx` | Wrap with `FeedbackShakeListener` (shake detector at root) |
| `package.json` | Add `react-native-shake` dependency |

### Total Effort: ~8–10 hours (solo, beginner coder)

**Breakdown:**
- FeedbackModal & hooks: 3 hours
- Service layer & Supabase integration: 2.5 hours
- Edge Function & email setup: 1.5 hours
- Tests: 1.5 hours
- Integration & debugging: 1.5 hours

---

## 5. Implementation Details

### 5.1 Dependencies

```json
{
  "dependencies": {
    "react-native-shake": "^3.3.1"
  }
}
```

Install:
```bash
npm install react-native-shake
```

### 5.2 FeedbackModal.tsx (Sketch)

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { submitFeedback } from '@/lib/feedback/feedbackService';

export const FeedbackModal = ({ visible, onClose, screenName }) => {
  const [category, setCategory] = useState('bug');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [screenshotUri, setScreenshotUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please describe your feedback.');
      return;
    }
    
    setLoading(true);
    try {
      await submitFeedback({
        category,
        severity: category === 'bug' ? severity : null,
        description,
        screenshotUri,
        screenName,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Send Feedback
        </Text>

        {/* Category picker */}
        <Text style={{ marginBottom: 8, fontWeight: '600' }}>Category</Text>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {['bug', 'feature', 'general'].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 4,
                backgroundColor: category === cat ? '#007AFF' : '#E0E0E0',
              }}
            >
              <Text style={{ textAlign: 'center', color: category === cat ? '#FFF' : '#000' }}>
                {cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Severity (bugs only) */}
        {category === 'bug' && (
          <>
            <Text style={{ marginBottom: 8, fontWeight: '600' }}>Severity</Text>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              {['low', 'medium', 'high'].map((sev) => (
                <TouchableOpacity
                  key={sev}
                  onPress={() => setSeverity(sev)}
                  style={{
                    flex: 1,
                    padding: 8,
                    borderRadius: 4,
                    backgroundColor: severity === sev ? '#FF3B30' : '#E0E0E0',
                  }}
                >
                  <Text style={{ textAlign: 'center', color: severity === sev ? '#FFF' : '#000' }}>
                    {sev.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Description */}
        <Text style={{ marginBottom: 8, fontWeight: '600' }}>Description</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#CCC',
            borderRadius: 4,
            padding: 12,
            minHeight: 120,
            marginBottom: 16,
            textAlignVertical: 'top',
          }}
          multiline
          placeholder="What happened? What did you expect?"
          value={description}
          onChangeText={setDescription}
        />

        {/* Screenshot preview */}
        {screenshotUri && (
          <>
            <Text style={{ marginBottom: 8, fontWeight: '600' }}>Screenshot</Text>
            <Image
              source={{ uri: screenshotUri }}
              style={{ width: '100%', height: 200, borderRadius: 4, marginBottom: 16 }}
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={() => setScreenshotUri(null)}
              style={{ marginBottom: 16, padding: 8, backgroundColor: '#FFE0E0', borderRadius: 4 }}
            >
              <Text style={{ textAlign: 'center', color: '#C33' }}>Remove Screenshot</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Error */}
        {error && (
          <Text style={{ color: '#C33', marginBottom: 16 }}>{error}</Text>
        )}

        {/* Submit button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            padding: 12,
            backgroundColor: loading ? '#CCC' : '#007AFF',
            borderRadius: 4,
            marginBottom: 8,
          }}
        >
          <Text style={{ textAlign: 'center', color: '#FFF', fontWeight: 'bold' }}>
            {loading ? 'Sending...' : 'Send Feedback'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={{ padding: 12, backgroundColor: '#F0F0F0', borderRadius: 4 }}>
          <Text style={{ textAlign: 'center', color: '#000' }}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
};
```

### 5.3 feedbackService.ts (Sketch)

```typescript
import { supabase } from '@/lib/supabase';
import { uploadScreenshot } from '@/lib/feedback/storageService';
import { getAppVersion, getDeviceInfo } from '@/lib/feedback/deviceContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FeedbackPayload {
  category: 'bug' | 'feature' | 'general';
  severity?: 'low' | 'medium' | 'high';
  description: string;
  screenshotUri?: string;
  screenName: string;
}

export const submitFeedback = async (payload: FeedbackPayload) => {
  try {
    // Collect device context
    const appVersion = await getAppVersion();
    const deviceInfo = await getDeviceInfo();
    
    // Get or create anonymous user hash
    let userIdHash = await AsyncStorage.getItem('feedback_user_hash');
    if (!userIdHash) {
      const deviceId = deviceInfo.deviceId;
      const crypto = require('crypto');
      userIdHash = crypto.createHash('sha256').update(deviceId).digest('hex');
      await AsyncStorage.setItem('feedback_user_hash', userIdHash);
    }

    // Upload screenshot if provided
    let screenshotUrl = null;
    if (payload.screenshotUri) {
      screenshotUrl = await uploadScreenshot(payload.screenshotUri, userIdHash);
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('beta_feedback')
      .insert([
        {
          user_id_hash: userIdHash,
          category: payload.category,
          severity: payload.severity || null,
          description: payload.description,
          screenshot_url: screenshotUrl,
          app_version: appVersion,
          device_model: deviceInfo.modelName,
          os_version: deviceInfo.osVersion,
          screen_name: payload.screenName,
          status: 'new',
        },
      ]);

    if (error) throw error;

    console.log('[Feedback] Submitted:', data);
  } catch (err) {
    console.error('[Feedback] Error:', err);
    throw new Error('Failed to submit feedback. Please try again.');
  }
};
```

### 5.4 useFeedback.ts (Sketch)

```typescript
import { useState, useEffect } from 'react';
import { RNShake } from 'react-native-shake';
import { useNavigation } from '@react-navigation/native';

export const useFeedback = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const currentRoute = navigation.getState().routes[navigation.getState().index];

  useEffect(() => {
    const subscription = RNShake.addListener(() => {
      console.log('[Feedback] Shake detected');
      setModalVisible(true);
    });

    return () => subscription.remove();
  }, []);

  return {
    modalVisible,
    openModal: () => setModalVisible(true),
    closeModal: () => setModalVisible(false),
    currentScreenName: currentRoute?.name || 'Unknown',
  };
};
```

### 5.5 Supabase Edge Function: notify-feedback/index.ts

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  const { record } = await req.json();

  const emailBody = `
New feedback from beta tester:

Category: ${record.category.toUpperCase()}
Severity: ${record.severity || 'N/A'}
Screen: ${record.screen_name}

Description:
${record.description}

---
App Version: ${record.app_version}
Device: ${record.device_model} / ${record.os_version}
Timestamp: ${new Date(record.created_at).toISOString()}
Feedback ID: ${record.id}
${record.screenshot_url ? `Screenshot: ${record.screenshot_url}` : ''}
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'feedback@shiftwell.app',
        to: 'beta@shiftwell.app',
        subject: `[ShiftWell Beta] ${record.category.toUpperCase()}: ${record.description.substring(0, 50)}...`,
        text: emailBody,
      }),
    });

    if (!res.ok) throw new Error(`Resend error: ${res.statusText}`);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error('Notify error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
```

**Setup:**
1. Run: `supabase functions new notify-feedback`
2. Paste code above into `supabase/functions/notify-feedback/index.ts`
3. Set env var: `supabase secrets set RESEND_API_KEY=<your-resend-key>`
4. Deploy: `supabase functions deploy notify-feedback`
5. In Supabase dashboard, create a **Trigger** on `beta_feedback` table:
   - Event: INSERT
   - Function: `notify-feedback`

---

## 6. Integration Checklist

- [ ] Install `react-native-shake`
- [ ] Create Supabase `beta_feedback` table (run SQL above)
- [ ] Create Supabase Storage bucket `beta-feedback-screenshots` (set public)
- [ ] Create `FeedbackModal.tsx`
- [ ] Create `feedbackService.ts` with Supabase insert logic
- [ ] Create `deviceContext.ts` to collect version/device/OS info
- [ ] Create `useFeedback.ts` hook with shake listener
- [ ] Update `SettingsScreen.tsx`: add "Send Feedback" button
- [ ] Wrap `AppContainer.tsx` with `FeedbackShakeListener`
- [ ] Create Edge Function `notify-feedback`
- [ ] Sign up for Resend (free tier) or use SendGrid
- [ ] Test: shake device → modal opens; fill form → data in Supabase; receive email
- [ ] Add 6 unit tests to `__tests__/feedback.test.ts`

---

## 7. Email Setup: Resend vs. SendGrid

### Resend (Recommended for MVP)
- **Cost**: Free tier includes 100 emails/day
- **Setup**: 5 minutes, just need API key
- **Pro**: Lightweight, edge-function-friendly
- **Con**: Free tier limits for high-volume testers

### SendGrid (Alternative)
- **Cost**: Free tier includes 100 emails/day
- **Setup**: 10 minutes, same API pattern
- **Pro**: More scalable if testers grow
- **Con**: Slightly more setup

**For Phase 1 beta (< 200 testers): Resend is perfect.**

---

## 8. Alternatives Considered

### Option A: Instabug (Rejected)
**Why not?**
- **Cost**: $99–$999/month (overkill for 50–200 testers)
- **Bloat**: ~2 MB SDK added to bundle size
- **Overkill**: Built-in crash reports, session replay, etc. — not needed yet
- **Time**: Integration is faster than custom, but custom is only 8–10 hours

**When to upgrade:**
- If beta grows to 500+ testers
- If crash reporting becomes critical
- If Sim wants session replay for UX debugging

### Option B: Firebase Crashlytics + Custom Feedback Form
**Why not?**
- Crashlytics is crash-only; requires separate feedback form
- Double SDK bloat
- No cheaper than custom + Resend

### Option C: Slack Integration (Feedback → Slack channel)
**Why not (for now)?**
- Testers shouldn't need Slack account
- Slack API isn't user-friendly for anonymous feedback
- Keep feedback centralized in Supabase for data science later

**Future enhancement:** Add Slack forwarding for real-time alerts once > 100 testers.

---

## 9. Privacy & Compliance

**User Consent:**
- Feedback is explicitly opt-in (user taps "Send" button)
- Modal displays: "By sending feedback, you help us improve ShiftWell"

**Data Collected:**
- Anonymous user hash (not email, phone, or name)
- Device type (e.g., "iPhone14,2" — no serial number)
- App version (public info)
- Screenshot (optional, user-initiated only)
- Free-text feedback (user-provided)

**No PII collected.**

**GDPR/CCPA:**
- User can delete their feedback via future admin panel (not MVP)
- Hash-based anonymity satisfies "minimal data" principle
- Screenshots user-initiated (no auto-capture of private app state)

---

## 10. Testing Strategy

### Unit Tests (`__tests__/feedback.test.ts`)

```typescript
describe('Feedback System', () => {
  test('submitFeedback creates Supabase record with correct schema', async () => {
    // Mock payload → verify insert call matches schema
  });

  test('severity field only present for bugs', () => {
    // Submit feature request, verify severity is null
  });

  test('description validation: reject < 20 chars', () => {
    // Verify error on short description
  });

  test('screenshot upload to storage', async () => {
    // Mock upload → verify URL stored in DB
  });

  test('device context collected: app version, OS, device model', async () => {
    // Mock getDeviceInfo → verify all fields in record
  });

  test('useFeedback hook listens for shake gesture', () => {
    // Mock shake listener → verify modal opens
  });
});
```

### Manual Testing (Phase 1)

1. **Shake on HomeScreen** → Modal opens, screen name shows as "HomeScreen" ✓
2. **Select Bug + High severity** → Form validates, severity field visible ✓
3. **Select Feature Request** → Severity field hidden ✓
4. **Leave description blank** → Submit disabled or error shown ✓
5. **Submit with screenshot** → Screenshot uploaded to Storage, URL in DB ✓
6. **Submit without screenshot** → screenshot_url is NULL ✓
7. **Check email** → Feedback notification arrives at beta@shiftwell.app within 10 sec ✓
8. **Verify Supabase row** → All fields populated, status = 'new' ✓

---

## 11. Monitoring & Next Steps

### Week 1–2 (Early Beta)
- Monitor email for feedback
- Check Supabase `beta_feedback` table for issues
- Run weekly queries:
  ```sql
  SELECT category, COUNT(*) FROM beta_feedback GROUP BY category;
  SELECT severity, COUNT(*) FROM beta_feedback WHERE category='bug' GROUP BY severity;
  SELECT AVG(LENGTH(description)) FROM beta_feedback;
  ```

### Week 3+ (If Feedback Grows)
- Create simple dashboard in Supabase Studio (or Retool) to view feedback
- Add "View Feedback" link in admin panel
- Consider grouping duplicates (set `is_duplicate=true`, link parent)

### If Testers Exceed 200
- Evaluate Instabug or Sentry for crash reporting
- Add Slack forwarding for critical bugs
- Build internal feedback dashboard (Retool or custom)

---

## 12. Estimated Timeline

| Phase | Task | Hours | Owner |
|-------|------|-------|-------|
| Setup | Resend signup, Supabase table/storage bucket | 1 | Sim |
| Dev | FeedbackModal, service layer, hooks | 5 | Sim |
| Integration | Update SettingsScreen, AppContainer | 1 | Sim |
| Edge Fn | Create notify-feedback function | 1.5 | Sim |
| Testing | Manual + 6 unit tests | 2 | Sim |
| **Total** | | **10.5 hrs** | |

**Launch ready:** Within 2 days of starting.

---

## 13. Configuration & Secrets

### Environment Variables (.env.local)

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyxxx...
RESEND_API_KEY=re_xxx...
```

### Supabase Edge Function Secret

```bash
supabase secrets set RESEND_API_KEY=re_xxx...
```

### Storage Bucket Permissions

In Supabase dashboard:
1. Go to Storage → `beta-feedback-screenshots`
2. Policies → Allow anon/auth to INSERT, disallow DELETE (prevent abuse)

---

## 14. Success Metrics

By end of Week 1 beta:
- ✓ At least 3 bug reports via shake
- ✓ At least 2 feature requests
- ✓ Email notifications arriving within 10 seconds
- ✓ Zero data loss in Supabase
- ✓ No crashes related to feedback UI

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation — beta feedback mechanism specification for iOS TestFlight. Pragmatic, lightweight, solo-founder-friendly. Uses react-native-shake + Supabase + Resend. Ready to implement.
