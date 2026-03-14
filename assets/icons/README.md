# App Icon Generation Guide

## Design Direction

- A moon or crescent sleep symbol on a dark navy background (#0A0E1A)
- Professional and minimal -- avoid clutter or excessive detail
- The icon should read well at small sizes (29x29 pt) and large sizes (1024x1024 px)
- Consider a subtle gradient or glow effect to convey "night" without looking gimmicky
- No text in the icon itself (Apple rejects icons with embedded text that becomes illegible at small sizes)

## Required Assets

### App Icon
- **Size:** 1024x1024 px, PNG format, no transparency, no rounded corners (iOS applies these automatically)
- **Location:** Save the final file to `assets/images/icon.png`
- Expo automatically generates all required smaller sizes from this single 1024x1024 source

### Splash Screen
- **Background color:** #0A0E1A (matches the app theme)
- **Content:** App name "NightShift" centered, optionally with the icon above it
- **Size:** 1284x2778 px recommended (iPhone 15 Pro Max resolution); Expo scales it for other devices
- **Location:** Save to `assets/images/splash.png` (update `app.json` splash.image path if the filename differs from the current `splash-icon.png`)

### Android Adaptive Icon
- **Foreground:** The icon graphic on a transparent background, 108x108 dp (432x432 px at xxxhdpi). Keep the main graphic within the inner 72x72 dp safe zone.
- **Background:** A solid #0A0E1A layer or a matching background image
- **Location:** Save to `assets/images/android-icon-foreground.png` and `assets/images/android-icon-background.png`

## Recommended Tools

1. **Midjourney or DALL-E** -- Generate initial concepts with a prompt like: "Minimal app icon, crescent moon on dark navy background, clean modern design, no text, iOS app icon style"
2. **Canva** -- Refine the generated image, adjust colors to match #0A0E1A, and export at 1024x1024
3. **Figma** -- If you want precise control over the vector shapes and gradients
4. **AppIcon.co** -- Upload your 1024x1024 PNG to generate all platform-specific sizes if you ever need them outside of Expo

## Checklist

- [ ] 1024x1024 icon.png saved to `assets/images/icon.png`
- [ ] Splash image saved to `assets/images/splash-icon.png` (or update path in app.json)
- [ ] Android adaptive icon foreground saved to `assets/images/android-icon-foreground.png`
- [ ] Android adaptive icon background saved to `assets/images/android-icon-background.png`
- [ ] Verified icon looks good at small sizes (preview at 60x60 px)
- [ ] No transparency in the iOS icon
- [ ] No embedded text in the icon
