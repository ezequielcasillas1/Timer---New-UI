📘 TestFlight.md
🚀 Purpose

This document defines the full checklist, configuration, and readiness requirements for deploying PDF Farm to TestFlight.
It ensures that every build is stable, production-aligned, and compliant with Apple’s standards while maintaining development consistency across the app lifecycle.

🧱 1. Overview

TestFlight allows internal and external testers to download and test the iOS version of PDF Farm before public release.
The goal is to ensure the app:

Runs smoothly without crashes

Has valid environment configurations

Meets Apple App Store Connect policies

Is connected to Supabase (optional but recommended for real data testing)

⚙️ 2. Expo Build Environment
✅ Required Tools

Expo CLI (npx expo)

EAS CLI (npm install -g eas-cli)

Apple Developer Account

App Store Connect access

Expo Project ID linked to your Apple ID

⚙️ 3. Build Profiles

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

🔑 4. Environment Variables
Public variables (required if Supabase used)
Variable	Description
EXPO_PUBLIC_SUPABASE_URL	Supabase project URL
EXPO_PUBLIC_SUPABASE_ANON_KEY	Supabase public anon key
Optional variables
Variable	Description
EXPO_PUBLIC_APP_ENV	preview or production
EXPO_PUBLIC_API_BASE_URL	Custom backend or cloud function endpoint

⚠️ Never hardcode these values inside your components. Always use process.env references.

🧩 5. App.json Configuration

Ensure app.json or app.config.js includes:

{
  "expo": {
    "name": "PDF Farm",
    "slug": "pdf-farm",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "pdffarm",
    "userInterfaceStyle": "light",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourname.pdffarm",
      "infoPlist": {
        "NSCameraUsageDescription": "PDF Farm uses your camera for document scanning.",
        "NSPhotoLibraryAddUsageDescription": "PDF Farm saves your generated PDFs to your device.",
        "NSPhotoLibraryUsageDescription": "PDF Farm imports images for PDF creation."
      }
    },
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}

💥 6. Common Crash Prevention Guide
Problem	Cause	Fix
Missing .env variables	Expo Go uses local envs, but EAS build doesn’t	Add env vars to eas.json or EAS dashboard
Missing native module	Expo Go preloads some packages	Run npx expo prebuild
Missing permission strings	iOS enforces usage description	Add to infoPlist
Supabase crash	Wrong URL or key	Double-check Supabase settings
Image/font crash	Assets not bundled	Run npx expo export-assets
Debug tools left enabled	Dev client only	Use --profile preview or disable dev modules
Large assets	Memory overflow on iOS	Compress or lazy-load assets
🧪 7. Testing Strategy
Internal Testers (fast)

Up to 100 testers

No Apple review needed

Invite via App Store Connect → TestFlight → “Internal Testing”

External Testers (public)

Up to 10,000 testers

Apple performs a short review (1–2 days)

Requires Test Information form filled out:

“What to Test”

“App Description”

Contact info for testers

🔐 8. Privacy & Security Compliance

Even during testing:

Provide a Privacy Policy URL (even if hosted on Notion or GitHub)

Ensure compliance with Apple’s App Tracking Transparency if analytics are used

Include clear permission usage in infoPlist

Example: “PDF Farm requires storage access to generate and save documents.”

🧱 9. Pre-Flight Checklist

Before running eas build -p ios --profile preview, confirm:

✅ App launches without Expo Go
✅ Supabase .env variables configured
✅ No unhandled errors in logs
✅ Permissions exist for camera/storage
✅ All fonts and images load properly
✅ Bundle ID matches App Store Connect record
✅ Build version incremented
✅ Icon + splash screens included
✅ Screenshots uploaded to App Store Connect

🧰 10. Upload to TestFlight

Build your app:

eas build -p ios --profile preview


Once complete, run:

eas submit -p ios


Go to App Store Connect → My Apps → PDF Farm → TestFlight

Add internal testers or send for external review.

🧩 11. Error Monitoring (Optional but Recommended)

Install Sentry for error tracking:

npx expo install sentry-expo


Then configure in App.js:

import * as Sentry from 'sentry-expo';
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: true,
  debug: true
});

📡 12. Supabase Connectivity Notes

If you plan to test auth flows:

Ensure Supabase Auth URL is live and accessible.

Add your iOS bundle ID under Supabase → Authentication → Redirect URLs.

Example redirect:

pdffarm://auth/callback

🧠 13. Troubleshooting
Symptom	Likely Cause	Fix
Crashes instantly	Env var missing / bad module	Check .env + rebuild
Black screen	JS error before render	Use expo start --no-dev --minify
Supabase login fails	Missing redirect URL	Add under Supabase settings
No camera access	Permission missing	Add NSCameraUsageDescription
App stuck loading	API key or CORS issue	Verify Supabase CORS origins
Build fails	Cached node_modules	Run expo doctor + reinstall
🌐 14. Production Readiness Add-ons

After stable TestFlight testing, prepare for App Store release:

Create App Privacy Manifest

Add App Icon variations (iPad/iPhone)

Add App Review Notes if special access is needed

Prepare Marketing URL and Support URL

Test across iOS 15, 16, 17

🧭 15. Command Summary
Command	Description
eas login	Sign in to Expo account
eas build:configure	Link project to EAS
eas build -p ios --profile preview	Create internal TestFlight build
eas submit -p ios	Upload build to App Store Connect
expo start --no-dev --minify	Simulate production locally
expo doctor	Diagnose config issues
🧾 16. Document Notes

This file is meant to be read by the AI agent.
If conflicts occur between TestFlight.md and other files:

The agent should prioritize TestFlight.md as the source of truth for build configuration.

It should regenerate any conflicting config files (app.json, .env, eas.json, etc.) according to the values in this document.

✅ End of TestFlight.md
LLPKJ