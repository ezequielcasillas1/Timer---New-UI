🚀 EAS_Build_Checklist.md (GENERAL APP VERSION)
✔️ Exact structure preserved
✔️ Every section preserved
✔️ All “PDF Farm” references removed
✔️ Clean, universal wording
# 🚀 EAS_Build_Checklist.md

## 🧭 Purpose
This document defines the exact step-by-step sequence to prepare, build, and publish a general Expo iOS application for TestFlight or the App Store using Expo Application Services (EAS).

It integrates stability checks, environment validation, and post-build testing to maintain high reliability across all releases.

---

## 🧱 1. Pre-Build Preparation

### ✅ Development Requirements

Before starting any build:

- Apple Developer Account active and linked to Expo.
- Expo CLI and EAS CLI installed globally:
  npm install -g expo-cli eas-cli
- Node version verified (use .nvmrc to enforce consistency):
  node -v  
  Must be Node 18.x or newer.

### Dependencies clean and up-to-date:


rm -rf node_modules
npm install
npx expo doctor


### Clear Expo cache:


expo start -c


---

## 🔑 2. Verify Configuration Files

### ✅ app.json / app.config.js
Ensure it includes:


{
"expo": {
"name": "YourAppName",
"slug": "your-app-slug",
"version": "1.0.0",
"ios": {
"bundleIdentifier": "com.yourcompany.yourapp"
},
"extra": {
"eas": {
"projectId": "your-expo-project-id"
}
}
}
}


---

### ✅ eas.json
Confirm both build profiles exist and contain environment variables:


{
"build": {
"preview": {
"distribution": "internal",
"env": {
"EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co
",
"EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
}
},
"production": {
"distribution": "store",
"env": {
"EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co
",
"EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
}
}
}
}


---

### ✅ .env Verification


cat .env

Ensure it matches values used in `eas.json`.

Never hardcode values directly in source files.

---

## 🧩 3. Validate Project Health

Run all validation commands before building:



npx expo doctor
expo config --type public
npx expo prebuild


If any warnings appear, resolve them.

If native modules are missing:


npx expo prebuild --clean


---

## ⚙️ 4. Build Type Selection

| Environment | Command | Description |
|-------------|---------|-------------|
| Preview (Internal Testing) | eas build -p ios --profile preview | Creates internal TestFlight build (no review) |
| Production (App Store) | eas build -p ios --profile production | Creates public release build (requires review) |

💡 Always test a preview build first.

---

## 🧪 5. Build Process Automation

### Step 1 — Log in


eas login


### Step 2 — Configure


eas build:configure


### Step 3 — Start Build


eas build -p ios --profile preview

or

eas build -p ios --profile production


### Step 4 — Monitor Progress


eas build:list


Download .ipa or allow automatic delivery to App Store Connect.

---

## 🔍 6. Post-Build Verification

### ✅ Simulate Production Behavior Locally


expo start --no-dev --minify


Verify:
- App launches successfully  
- No white screen or instant crash  
- Backend auth connects or fails gracefully  
- Assets and fonts load correctly  
- Navigation works  
- Core features operate smoothly  

---

### ✅ Internal Testing (Before TestFlight)
Install .ipa via EAS build link.

Confirm:
- Permission prompts work  
- All major features function  

---

## 🧰 7. Submit to TestFlight

### Step 1 — Submit Build


eas submit -p ios


### Step 2 — Review in App Store Connect
App Store Connect → My Apps → Your App → TestFlight

Confirm:
- App metadata (icon, name, version)
- “What to Test” notes
- Privacy Policy URL
- Correct bundle identifier

### Step 3 — Add Testers
- Internal testers → instant  
- External testers → Apple review required  

---

## 🧠 8. Stability Checks Before TestFlight Upload

Category        | Check                              | Command
----------------|-------------------------------------|------------------------------
Environment     | Verify env vars load                | expo config --type public
Dependencies    | Confirm stable install              | npm ls --depth=0
Native Modules  | Ensure prebuild success             | npx expo prebuild
Assets          | Export static files                 | npx expo export-assets
iOS Permissions | Present in infoPlist                | Check app.json
Backend         | Verify URLs + keys valid            | Test API manually
Logs            | No console errors                   | expo start --no-dev --minify

---

## 🧩 9. Troubleshooting & Recovery Commands

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| App crashes on launch | Missing env variable | Add to eas.json or EAS secrets |
| Prebuild errors | Conflicting package versions | expo prebuild --clean |
| App stuck at splash | Missing assets/fonts | Use expo-asset & expo-font |
| TestFlight rejected build | Missing iOS permissions | Add to infoPlist |
| Auth fails | Missing redirect URL | Add in backend auth settings |
| Slow performance | Debug logs enabled | Disable console logs |

---

## 🧠 10. Post-Submission Maintenance

After submitting to TestFlight:

- Monitor crash logs  
- Gather tester feedback  
- Fix issues  
- Increment build number  



expo version:sync


Rebuild and resubmit when stable.

---

## 🔄 11. Agent Instructions

If this file conflicts with any other file:

- **EAS_Build_Checklist.md is the source of truth.**

The AI agent must:
- Regenerate `eas.json`
- Regenerate `.env`
- Regenerate `app.json`
- Ensure required infoPlist permissions exist
- Run `expo doctor` and confirm no warnings

---

## 🧾 12. Optional Automation Commands (Advanced)

Example CI/CD script:



#!/bin/bash

rm -rf node_modules
npm install
expo doctor

expo config --type public
npx expo prebuild --clean

eas build -p ios --profile preview
eas submit -p ios


---

## 🧠 13. Optional Integrations

Integration | Purpose | Setup
-----------|----------|-------
Sentry | Crash reporting | npx expo install sentry-expo
EAS Update | Push OTA updates | eas update --branch production
Expo App Insights | Build/error stats | Enabled in EAS Dashboard

---

## 🧩 14. Completion Confirmation

App is TestFlight-ready when:

- Build uploaded  
- App opens without crash  
- Permissions working  
- No console errors  
- Backend/API calls succeed  
- Privacy Policy linked  



✅ End of EAS_Build_Checklist.md (General App Version)