# Bug Fixes Log

### [Dec 9, 2024] - Background Sound Cancellation Fix
**Status:** SUCCESS ✅
**Files:** SoundService.ts, AudioConfig.ts
**Result:** Fixed sounds stopping after certain time in background/lock mode. Root cause: conflicting audio configs + no sound restoration mechanism. Added keep-alive monitoring (30s intervals), sound restoration on app state changes, and centralized audio config.



### [Dec 10, 2024] - Reset Password Flow Rewrite
**Status:** SUCCESS ✅
**Files:** app/(auth)/reset-password.tsx
**Result:** Simplified forgot/reset UX with clear request/sent/reset steps, improved recovery token detection, and reliable Supabase reset/update handling so the new password screen is not skipped.

### [Dec 11, 2025] - Membership Skip Redirect
**Status:** SUCCESS ✅
**Files:** app/(auth)/membership.tsx, app/(auth)/email-confirmed.tsx, instructions/refresh.md
**Result:** Pointed membership skip and email-confirmed redirects to /(new-ui)/home to avoid unmatched route when the old /(tabs)/ stack is absent.

### [Dec 11, 2025] - Sounds Screen Navigation Bar Incomplete
**Status:** SUCCESS ✅
**Files:** app/(new-ui)/sounds.tsx
**Result:** Fixed incomplete navigation bar showing only one button. Added missing labels (Home, Session, Sounds), changed navItem from fixed width to flex:1, and added navLabel style to match other screens.





