# ShiftWell Watch Complication Specification

**Phase:** 33 — Apple Watch Integration  
**Status:** STUB — requires native watchOS development  
**Flag:** REQUIRES-NATIVE  
**Date:** 2026-04-07  

---

## Overview

A circular watch face complication showing shift countdown and recovery score,
keeping ShiftWell visible on the user's wrist 24/7 without requiring app launch.

---

## Complication Type

**Primary:** Circular complication — most universal, appears on all major watch face styles (Infograph Modular, Siri Face, Meridian, Explorer, etc.)

**Secondary (future):** Graphic Circular for richer watch faces that support it (Infograph, Infograph Modular)

---

## Data Displayed

| Element | Content | Priority |
|---------|---------|----------|
| Primary text | Recovery score percentage (e.g., "78") | Always shown |
| Secondary text | "ShiftWell" label normally | Default |
| Secondary text | Shift countdown when within 4h of next shift | Contextual |

**Example states:**
- Default: "78" / "ShiftWell"
- Pre-shift: "78" / "3:42"
- Active shift: "78" / "On Shift"

---

## Implementation Path

### Current (Expo Managed Workflow)

React Native does **not** support native watchOS complications directly from managed Expo workflow. Options:

1. **Expo Native Module** (Phase 34+): Build a custom Expo module with Swift code that registers a `WKExtension` + `CLKComplicationDataSource`
2. **CareKit Widget** (workaround): iOS 16+ App Clip or widget that appears on iPhone lock screen as a proxy for wrist access
3. **Widget notification stub** (interim): Use iOS Dynamic Island / Live Activity to surface score when app is in foreground

**Recommendation:** Defer native watchOS complication to a future phase — implement when enterprise demand justifies the engineering cost. Full watchOS target requires Expo ejection or native module.

### Native Swift (Phase 34+ Implementation Reference)

```swift
// WatchKit Extension — ShiftWellComplications.swift

import ClockKit
import SwiftUI

class ComplicationController: NSObject, CLKComplicationDataSource {

    // MARK: - Complication Configuration
    
    func getComplicationDescriptors(handler: @escaping ([CLKComplicationDescriptor]) -> Void) {
        let descriptors = [
            CLKComplicationDescriptor(
                identifier: "com.shiftwell.complication",
                displayName: "ShiftWell",
                supportedFamilies: [
                    .circularSmall,
                    .graphicCircular,
                    .graphicCorner,
                    .modularSmall,
                ]
            )
        ]
        handler(descriptors)
    }

    // MARK: - Timeline Population
    
    func getCurrentTimelineEntry(
        for complication: CLKComplication,
        withHandler handler: @escaping (CLKComplicationTimelineEntry?) -> Void
    ) {
        handler(makeTimelineEntry(for: complication))
    }

    private func makeTimelineEntry(for complication: CLKComplication) -> CLKComplicationTimelineEntry? {
        let recoveryScore = AppGroupData.shared.recoveryScore  // Read from AppGroup
        let nextShiftLabel = AppGroupData.shared.nextShiftLabel
        
        switch complication.family {
        case .circularSmall:
            let template = CLKComplicationTemplateCircularSmallSimpleText(
                textProvider: CLKSimpleTextProvider(text: "\(recoveryScore)")
            )
            return CLKComplicationTimelineEntry(date: Date(), complicationTemplate: template)
            
        case .graphicCircular:
            let template = CLKComplicationTemplateGraphicCircularStackText(
                line1TextProvider: CLKSimpleTextProvider(text: "\(recoveryScore)%"),
                line2TextProvider: CLKSimpleTextProvider(text: nextShiftLabel)
            )
            return CLKComplicationTimelineEntry(date: Date(), complicationTemplate: template)
            
        default:
            return nil
        }
    }
    
    // MARK: - Refresh Schedule
    
    func getTimelineEndDate(for complication: CLKComplication, withHandler handler: @escaping (Date?) -> Void) {
        // Refresh every 2 hours
        handler(Date().addingTimeInterval(2 * 60 * 60))
    }
}
```

---

## AppGroup Data Sharing

The watch extension reads data from a shared AppGroup container so the iOS app and watchOS extension share state without direct communication:

```swift
// AppGroupData.swift — shared between iOS app and watchOS extension

class AppGroupData {
    static let shared = AppGroupData()
    private let defaults = UserDefaults(suiteName: "group.app.shiftwell")!
    
    // Recovery score (0–100)
    var recoveryScore: Int {
        get { defaults.integer(forKey: "recoveryScore") }
        set { defaults.set(newValue, forKey: "recoveryScore") }
    }
    
    // Next shift label ("3:42" or "On Shift" or "ShiftWell")
    var nextShiftLabel: String {
        get { defaults.string(forKey: "nextShiftLabel") ?? "ShiftWell" }
        set { defaults.set(newValue, forKey: "nextShiftLabel") }
    }
    
    // HRV score (0–100, -1 = not available)
    var hrvScore: Int {
        get { defaults.integer(forKey: "hrvScore") }
        set { defaults.set(newValue, forKey: "hrvScore") }
    }
}
```

**iOS app writes to AppGroup** after `finalizeWithHRV()` completes:
```swift
// In AppDelegate or after score finalization
AppGroupData.shared.recoveryScore = newScore
CLKComplicationServer.sharedInstance().reloadTimeline(for: complication)
```

---

## Complication Refresh

- **Frequency:** Every 2 hours via `CLKComplicationServer.reloadTimeline()`
- **Budget:** watchOS allows ~50 reloads/day — 2-hour cadence uses ~12/day, within budget
- **On demand:** Reload triggered when recovery score changes (app finalization)
- **Background delivery:** HealthKit observer query triggers reload when new HRV samples arrive

---

## Data Flow Diagram

```
Apple Watch ──────► HealthKit ──────► iOS App (background delivery)
                                           │
                                           ▼
                                    finalizeWithHRV()
                                           │
                                           ▼
                                    score-store.ts
                                           │
                                           ▼
                               AppGroup UserDefaults
                               group.app.shiftwell
                                           │
                                           ▼
                                 watchOS Extension
                                           │
                                           ▼
                                  Watch Face Complication
```

---

## App Store Entitlements Required

```json
{
  "com.apple.developer.healthkit": true,
  "com.apple.developer.healthkit.background-delivery": true,
  "com.apple.security.application-groups": ["group.app.shiftwell"]
}
```

The `application-groups` entitlement enables AppGroup data sharing between iOS and watchOS targets.

---

## TestFlight Interim Workaround

Until native watchOS extension is built, surface key data via:

1. **iOS Lock Screen Widget** (WidgetKit, iOS 16+): Simpler to implement in Expo with `expo-widgets` or native module
2. **Live Activity** (iOS 16.1+ Dynamic Island): Already in Phase 5 — can surface recovery score there
3. **Push notification on finalization**: "Your recovery score: 78% — next shift in 3h"

---

## Future Phase Plan

| Phase | Deliverable |
|-------|-------------|
| Phase 36+ | Expo ejection or custom native module with watchOS extension |
| Phase 36+ | AppGroup setup + `group.app.shiftwell` container |
| Phase 36+ | CLKComplicationDataSource implementation |
| Phase 36+ | WidgetKit iOS lock screen widget (simpler proxy) |

---

*Specification created 2026-04-07. Implements WATCH-02 (background delivery config done; complication requires native development).*
