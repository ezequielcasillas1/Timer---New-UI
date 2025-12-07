📘 TestFlight.md (General App Version — Copy & Paste)
📘 TestFlight.md

🚀 Purpose
This document defines the full checklist, configuration, and readiness requirements for deploying a general Expo iOS application to TestFlight.
It ensures every build is stable, production-aligned, and compliant with Apple’s standards while maintaining development consistency across the app lifecycle.

---

🧱 1. Overview
TestFlight allows internal and external testers to download and test the iOS version of the app before public release.

The goal is to ensure the app:

• Runs smoothly without crashes  
• Has valid environment configurations  
• Meets Apple App Store Connect policies  
• Connects to backend services such as Supabase (optional but recommended)

---

⚙️ 2. Expo Build Environment

✅ Required Tools
- Expo CLI (npx expo)
- EAS CLI (npm install -g eas-cli)
- Apple Developer Account
- App Store Connect access
- Expo Project ID linked to your Apple ID

---

⚙️ 3. Build Profiles (eas.json)

Add the following to your eas.json:

{
  "build": {
    "preview": {
      "developmentClient": false,
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-supabase-anon-key"
      }
    },
    "production": {
      "developmentClient": false,
      "distribution": "store",
      "ios": {
        "simulator": false
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-supabase-anon-key"
      }
    }
  }
}

---

🔑 4. Environment Variables

Public variables (required if using Supabase or other backends):

Variable | Description
-------- | -----------
EXPO_PUBLIC_SUPABASE_URL | Backend project URL
EXPO_PUBLIC_SUPABASE_ANON_KEY | Public anon key for backend access

Optional variables:

Variable | Description
-------- | -----------
EXPO_PUBLIC_APP_ENV | preview or production
EXPO_PUBLIC_API_BASE_URL | Custom backend / cloud function endpoint

⚠️ Do NOT hardcode any values in components.  
Use `process.env` references only.

---

🧩 5. App.json Configuration

Ensure app.json or app.config.js includes:

{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "yourappscheme",
    "userInterfaceStyle": "light",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.yourapp",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses your camera for scanning or media features.",
        "NSPhotoLibraryAddUsageDescription": "This app saves files or images to your device.",
        "NSPhotoLibraryUsageDescription": "This app imports files or images from your library."
      }
    },
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}

---

💥 6. Common Crash Prevention Guide

Problem | Cause | Fix
--------|--------|-----
Missing .env variables | Expo Go loads local envs but EAS does not | Add env vars to eas.json or EAS secrets
Missing native module | Expo Go auto-loads modules | Run `npx expo prebuild`
Missing permission strings | iOS enforces permission descriptions | Add missing fields to infoPlist
Backend crash | Wrong URL or key | Verify backend settings
Image/font crash | Assets not bundled | Run `npx expo export-assets`
Debug tools enabled | Dev tools active | Build using preview/production profiles
Large assets | Memory overflow | Compress or lazy-load images

---

🧪 7. Testing Strategy

Internal Testers (fast)
- Up to 100 testers  
- No Apple review required  
- TestFlight → “Internal Testing”

External Testers (public)
- Up to 10,000 testers  
- Requires Apple review (1–2 days)  
- Must fill out:  
  • What to Test  
  • App Description  
  • Contact Information  

---

🔐 8. Privacy & Security Compliance

Even during testing:
- Provide a Privacy Policy URL  
- Ensure App Tracking Transparency compliance if analytics/tracking are used  
- Include clear permission usage explanations in infoPlist  

Example:  
“This app requires storage access to import and save documents.”

---

🧱 9. Pre-Flight Checklist

Before running:


eas build -p ios --profile preview


Confirm:

✅ App runs without Expo Go  
✅ Environment variables configured  
✅ No unhandled console errors  
✅ iOS permissions included  
✅ Fonts and images load correctly  
✅ Bundle ID matches App Store Connect  
✅ Build version incremented  
✅ Icon & splash screens included  
✅ Screenshots uploaded to App Store Connect  

---

🧰 10. Upload to TestFlight

Build:


eas build -p ios --profile preview


Submit:


eas submit -p ios


Then go to:  
App Store Connect → My Apps → Your App → TestFlight

Add internal testers or submit for external review.

---

🧩 11. Error Monitoring (Optional but Recommended)

Install Sentry:


npx expo install sentry-expo


Then:

import * as Sentry from 'sentry-expo';
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: true,
  debug: true
});

---

📡 12. Backend Connectivity Notes

If testing authentication:

- Ensure backend auth URL is active  
- Add iOS bundle ID redirect inside backend provider settings  

Example redirect:


yourappscheme://auth/callback


---

🧠 13. Troubleshooting

Symptom | Likely Cause | Fix
--------|-------------|------
Instant crash | Missing env var | Add env to EAS + rebuild
Black screen | JS error | Run `expo start --no-dev --minify`
Login fails | Missing redirect | Add OAuth redirect URL
No camera access | Missing plist key | Add NSCameraUsageDescription
App stuck loading | Bad API key or CORS issue | Fix backend configuration
Build fails | Corrupted node_modules | Run expo doctor + reinstall

---

🌐 14. Production Readiness Add-ons

Before App Store release:
- App Privacy Manifest  
- App Icon variations  
- Review Notes (if using special access)  
- Marketing & Support URLs  
- Test on iOS 15, 16, 17  

---

🧭 15. Command Summary

Command | Description
--------|------------
eas login | Sign in to EAS
eas build:configure | Link project to EAS
eas build -p ios --profile preview | Create TestFlight build
eas submit -p ios | Upload to App Store Connect
expo start --no-dev --minify | Simulate production locally
expo doctor | Diagnose issues

---

🧾 16. Document Notes
This file is intended to guide human developers and AI agents.

If any file conflicts with TestFlight.md:

- TestFlight.md is the **source of truth**  
- The agent should regenerate:  
  • app.json  
  • eas.json  
  • .env  
  • Any missing configuration  

---

✅ End of TestFlight.md (General App Version)