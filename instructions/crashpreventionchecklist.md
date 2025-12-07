🧰 Crash\_Prevention\_Checklist.md

🧰 Crash\_Prevention\_Checklist.md



🎯 Purpose



This document ensures PDF Farm builds remain stable in TestFlight and Production by identifying and resolving all common and advanced crash sources.



Every checklist item must pass before uploading a new build.



⚙️ 1. Environment \& Configuration Stability



✅ Environment Variables



Confirm all environment variables exist in EAS dashboard or eas.json:



EXPO\_PUBLIC\_SUPABASE\_URL



EXPO\_PUBLIC\_SUPABASE\_ANON\_KEY



EXPO\_PUBLIC\_APP\_ENV



EXPO\_PUBLIC\_API\_BASE\_URL



Verify they are prefixed with EXPO\_PUBLIC\_ for Expo-managed builds.



No direct use of process.env without fallback defaults.



Run:



expo config — type public



to confirm variables load correctly.



✅ .env File Practices



.env included in .gitignore



.env.example file exists (for team clarity)



Never expose secrets like service keys, admin tokens, or passwords.



Validate .env values before build:



cat .env



📦 2. Dependencies and Native Modules



✅ Dependency Health



Run npm install or yarn install cleanly.



Remove unused dependencies with:



npx depcheck



No duplicate React Native or Expo versions.



✅ Native Module Integrity



For each native library (e.g. expo-camera, expo-notifications, react-native-reanimated), confirm it’s listed in package.json.



Prebuild after adding/removing any native library:



npx expo prebuild



Verify all native modules are linked correctly:



npx react-native config



✅ Version Locking



Commit a package-lock.json or yarn.lock file.



Lock Node version via .nvmrc (example: 18.18.0).



Avoid auto-updating packages without manual review.



💻 3. Code Integrity \& Logic



✅ Error Handling



Wrap async functions in try/catch blocks.



Global error boundary present:



import { ErrorBoundary } from ‘react-error-boundary’;



Supabase API calls gracefully handle network failures.



Add fallback UI when Supabase or APIs fail to connect.



✅ Rendering Safety



Guard every conditional render (e.g., user \&\& <View>…</View>).



Avoid undefined/null props causing React render errors.



Check hooks:



No use of hooks inside loops or conditions.



All hook dependencies explicitly declared.



✅ State Management



Validate initial states (no undefined values).



Reset state on logout or navigation transitions.



Avoid memory leaks by cleaning up listeners:



useEffect(() => {



const sub = subscribe();



return () => sub.unsubscribe();



}, \[]);



🧩 4. Permissions \& InfoPlist



✅ Required iOS Permissions



Check your app.json / app.config.js under ios.infoPlist:



Permission Key Description



Camera NSCameraUsageDescription “PDF Farm uses your camera for document scanning.”



Photo Library NSPhotoLibraryUsageDescription “PDF Farm imports and saves documents.”



Storage NSPhotoLibraryAddUsageDescription “PDF Farm exports your PDFs to storage.”



Microphone (if used) NSMicrophoneUsageDescription “PDF Farm uses your microphone for audio notes.”



✅ Run:



npx expo prebuild



after editing permissions.



🧠 5. Asset \& Font Management



✅ Asset Loading



All assets imported via require() or import statements.



No remote asset URLs unless handled with Image.prefetch().



Run:



npx expo export-assets



to confirm all bundled.



✅ Fonts



Use expo-font for font management.



Fonts loaded before main render using AppLoading or SplashScreen.



🧩 6. Supabase Connectivity (Optional but Recommended)



✅ Authentication



Supabase client initialized only after environment variables are verified.



Handle failed logins gracefully:



if (error) Alert.alert(“Login Failed”, error.message);



Redirect URLs added to Supabase:



pdffarm://auth/callback



under → Authentication → Redirect URLs



✅ Database Safety



Use Row Level Security (RLS) on tables.



Never expose service\_role keys on client.



Test Supabase endpoints using real TestFlight builds.



🔄 7. Build Stability



✅ Pre-Build Cleanup



Run before every build:



rm -rf node\_modules



expo doctor



expo prebuild



✅ EAS Config



Verify all profiles in eas.json are valid.



Ensure no missing env vars in eas.json.



Run:



eas build:configure



✅ Build Verification



Simulate production locally:



expo start — no-dev — minify



If app launches without error, it’s ready for TestFlight.



🧩 8. iOS Device \& Version Testing



✅ Test Devices



iPhone SE (small screen)



iPhone 14+ (large screen)



iPad (if supported)



✅ iOS Versions



iOS 16.x



iOS 17.x (latest public version)



✅ Functional Areas



Feature Test Criteria



PDF Creation App doesn’t crash on document rendering



PDF Upload Handles large file gracefully



AI Generated PDFs API failure handled safely



Drag \& Drop Editor No visual freezing or UI lag



File Storage Permissions prompt functions properly



🧾 9. Performance Optimization



✅ Startup



Lazy-load non-critical screens.



Use SplashScreen.preventAutoHideAsync() properly.



Compress large images and icons.



✅ Memory



Unmount unused components.



Remove console logs and heavy state watchers.



Profile app using:



npx react-native performance



✅ Network



Implement caching for static data.



Retry failed API calls with exponential backoff.



🧩 10. Debugging \& Monitoring



✅ Logging



Replace all console.log() with a centralized logger.



Disable logging for production builds:



if (!\_\_DEV\_\_) console.log = () => {};



✅ Error Reporting



Add Sentry or Bugsnag for crash reporting.



Add device info tracking (Expo Constants).



✅ Native Logs



Use Xcode or macOS Console app to read live logs:



Connect device.



Open Devices \& Simulators.



Watch for crash logs at app launch.



🔐 11. Privacy \& Policy Readiness



Include Privacy Policy URL in App Store Connect.



Add data usage clarifications:



“No personal data collected.”



“App stores PDFs locally and optionally to Supabase.”



No usage of IDFA or advertising SDKs unless declared.



🧭 12. TestFlight Upload Checklist



Before running the final build:



Step Command Description



Clean old builds expo start -c Clears Metro cache



Run prebuild npx expo prebuild Syncs native files



Validate envs eas secrets:list Confirms all keys exist



Production simulate expo start — no-dev — minify Local production test



Build eas build -p ios — profile preview Create TestFlight-ready build



Submit eas submit -p ios Upload to App Store Connect



🧱 13. Final Review Before Release



App icon and splash screens verified.



Bundle ID matches App Store Connect.



Version and build number incremented.



Screenshots added to App Store Connect.



Contact email and support link added.



Internal testing confirmed on at least 3 devices.



📘 14. Agent Instructions



If the AI agent detects:



Missing env variables → auto-generate .env based on values here.



Conflicts in app.json or eas.json → regenerate using the latest values from this file.



Incomplete permission strings → auto-append missing keys to infoPlist.



Build errors → run diagnostics (expo doctor, expo prebuild, eas build:inspect).



The Crash\_Prevention\_Checklist.md takes priority over any outdated configurations across all system files.



✅ Completion



Once every checkbox above is ✅ verified and the app runs without console or build errors, PDF Farm is considered fully stable and ready for TestFlight release or App Store review.

🎯 Purpose



This document ensures PDF Farm builds remain stable in TestFlight and Production by identifying and resolving all common and advanced crash sources.



Every checklist item must pass before uploading a new build.



⚙️ 1. Environment \& Configuration Stability



✅ Environment Variables



Confirm all environment variables exist in EAS dashboard or eas.json:



EXPO\_PUBLIC\_SUPABASE\_URL



EXPO\_PUBLIC\_SUPABASE\_ANON\_KEY



EXPO\_PUBLIC\_APP\_ENV



EXPO\_PUBLIC\_API\_BASE\_URL



Verify they are prefixed with EXPO\_PUBLIC\_ for Expo-managed builds.



No direct use of process.env without fallback defaults.



Run:



expo config — type public



to confirm variables load correctly.



✅ .env File Practices



.env included in .gitignore



.env.example file exists (for team clarity)



Never expose secrets like service keys, admin tokens, or passwords.



Validate .env values before build:



cat .env



📦 2. Dependencies and Native Modules



✅ Dependency Health



Run npm install or yarn install cleanly.



Remove unused dependencies with:



npx depcheck



No duplicate React Native or Expo versions.



✅ Native Module Integrity



For each native library (e.g. expo-camera, expo-notifications, react-native-reanimated), confirm it’s listed in package.json.



Prebuild after adding/removing any native library:



npx expo prebuild



Verify all native modules are linked correctly:



npx react-native config



✅ Version Locking



Commit a package-lock.json or yarn.lock file.



Lock Node version via .nvmrc (example: 18.18.0).



Avoid auto-updating packages without manual review.



💻 3. Code Integrity \& Logic



✅ Error Handling



Wrap async functions in try/catch blocks.



Global error boundary present:



import { ErrorBoundary } from ‘react-error-boundary’;



Supabase API calls gracefully handle network failures.



Add fallback UI when Supabase or APIs fail to connect.



✅ Rendering Safety



Guard every conditional render (e.g., user \&\& <View>…</View>).



Avoid undefined/null props causing React render errors.



Check hooks:



No use of hooks inside loops or conditions.



All hook dependencies explicitly declared.



✅ State Management



Validate initial states (no undefined values).



Reset state on logout or navigation transitions.



Avoid memory leaks by cleaning up listeners:



useEffect(() => {



const sub = subscribe();



return () => sub.unsubscribe();



}, \[]);



🧩 4. Permissions \& InfoPlist



✅ Required iOS Permissions



Check your app.json / app.config.js under ios.infoPlist:



Permission Key Description



Camera NSCameraUsageDescription “PDF Farm uses your camera for document scanning.”



Photo Library NSPhotoLibraryUsageDescription “PDF Farm imports and saves documents.”



Storage NSPhotoLibraryAddUsageDescription “PDF Farm exports your PDFs to storage.”



Microphone (if used) NSMicrophoneUsageDescription “PDF Farm uses your microphone for audio notes.”



✅ Run:



npx expo prebuild



after editing permissions.



🧠 5. Asset \& Font Management



✅ Asset Loading



All assets imported via require() or import statements.



No remote asset URLs unless handled with Image.prefetch().



Run:



npx expo export-assets



to confirm all bundled.



✅ Fonts



Use expo-font for font management.



Fonts loaded before main render using AppLoading or SplashScreen.



🧩 6. Supabase Connectivity (Optional but Recommended)



✅ Authentication



Supabase client initialized only after environment variables are verified.



Handle failed logins gracefully:



if (error) Alert.alert(“Login Failed”, error.message);



Redirect URLs added to Supabase:



pdffarm://auth/callback



under → Authentication → Redirect URLs



✅ Database Safety



Use Row Level Security (RLS) on tables.



Never expose service\_role keys on client.



Test Supabase endpoints using real TestFlight builds.



🔄 7. Build Stability



✅ Pre-Build Cleanup



Run before every build:



rm -rf node\_modules



expo doctor



expo prebuild



✅ EAS Config



Verify all profiles in eas.json are valid.



Ensure no missing env vars in eas.json.



Run:



eas build:configure



✅ Build Verification



Simulate production locally:



expo start — no-dev — minify



If app launches without error, it’s ready for TestFlight.



🧩 8. iOS Device \& Version Testing



✅ Test Devices



iPhone SE (small screen)



iPhone 14+ (large screen)



iPad (if supported)



✅ iOS Versions



iOS 16.x



iOS 17.x (latest public version)



✅ Functional Areas



Feature Test Criteria



PDF Creation App doesn’t crash on document rendering



PDF Upload Handles large file gracefully



AI Generated PDFs API failure handled safely



Drag \& Drop Editor No visual freezing or UI lag



File Storage Permissions prompt functions properly



🧾 9. Performance Optimization



✅ Startup



Lazy-load non-critical screens.



Use SplashScreen.preventAutoHideAsync() properly.



Compress large images and icons.



✅ Memory



Unmount unused components.



Remove console logs and heavy state watchers.



Profile app using:



npx react-native performance



✅ Network



Implement caching for static data.



Retry failed API calls with exponential backoff.



🧩 10. Debugging \& Monitoring



✅ Logging



Replace all console.log() with a centralized logger.



Disable logging for production builds:



if (!\_\_DEV\_\_) console.log = () => {};



✅ Error Reporting



Add Sentry or Bugsnag for crash reporting.



Add device info tracking (Expo Constants).



✅ Native Logs



Use Xcode or macOS Console app to read live logs:



Connect device.



Open Devices \& Simulators.



Watch for crash logs at app launch.



🔐 11. Privacy \& Policy Readiness



Include Privacy Policy URL in App Store Connect.



Add data usage clarifications:



“No personal data collected.”



“App stores PDFs locally and optionally to Supabase.”



No usage of IDFA or advertising SDKs unless declared.



🧭 12. TestFlight Upload Checklist



Before running the final build:



Step Command Description



Clean old builds expo start -c Clears Metro cache



Run prebuild npx expo prebuild Syncs native files



Validate envs eas secrets:list Confirms all keys exist



Production simulate expo start — no-dev — minify Local production test



Build eas build -p ios — profile preview Create TestFlight-ready build



Submit eas submit -p ios Upload to App Store Connect



🧱 13. Final Review Before Release



App icon and splash screens verified.



Bundle ID matches App Store Connect.



Version and build number incremented.



Screenshots added to App Store Connect.



Contact email and support link added.



Internal testing confirmed on at least 3 devices.



📘 14. Agent Instructions



If the AI agent detects:



Missing env variables → auto-generate .env based on values here.



Conflicts in app.json or eas.json → regenerate using the latest values from this file.



Incomplete permission strings → auto-append missing keys to infoPlist.



Build errors → run diagnostics (expo doctor, expo prebuild, eas build:inspect).



The Crash\_Prevention\_Checklist.md takes priority over any outdated configurations across all system files.



✅ Completion



Once every checkbox above is ✅ verified and the app runs without console or build errors, Your Application is considered fully stable and ready for TestFlight release or App Store review.

