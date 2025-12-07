# Flow Focus - ADHD Timer App

A comprehensive focus timer application built with React Native and Expo, designed to help users maintain focus through customizable sound presets, time manipulation features, and session tracking.

## Project Overview

This is a frontend UI implementation of a focus session management system. The app includes pre-session configuration, real-time session tracking, sound preset management, and comprehensive analytics. The application follows a flow state UX philosophy where all decisions happen before the session starts, ensuring a distraction-free experience during active sessions.

**Important**: This is a frontend UI implementation. Backend integration with Supabase is required for data persistence. See Backend Integration section below.

## Features

### Core Functionality
- Pre-Session Panel: Complete configuration screen for setting up sessions before starting
- Preset System: Three-tiered sound category system (Ticking, Nature, Breathing) with expandable categories
- Session Management: Minimal, distraction-free session mode with optional settings adjustment
- Sound Library: Comprehensive sound management with preview, favorites, and volume controls
- Analytics Dashboard: Weekly progress tracking with streak monitoring
- Automated Scheduler: Session scheduling with preset integration

### Key Features
- Preset selection and auto-save functionality
- Category expand/collapse for sound selection
- Volume/intensity controls per sound
- Favorites system for quick sound access
- Time speed multiplier (0.8x, 1x, 1.2x, 1.5x)
- Duration selector (10m, 20m, 30m, 45m, 60m)
- Session summary preview before starting
- Post-session summary with preset save option
- Weekly analytics chart with streak health indicator
- Settings adjustment during active sessions

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18 or higher
- npm or yarn package manager
- Expo CLI (optional, but recommended)
- iOS Simulator (for Mac) or Android Emulator
- Expo Go app on physical device (for testing)

## Installation

1. Clone or navigate to the project directory:
```bash
cd Timer---New-UI
```

2. Install dependencies:
```bash
npm install
```

If you encounter dependency conflicts, try:
```bash
npm install --legacy-peer-deps
```

3. Verify installation:
```bash
npm run type-check
```

## Running the App

### Development Server

Start the Expo development server:
```bash
npm start
```

This will open the Expo DevTools in your browser. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your physical device

### Platform-Specific Commands

Run on iOS simulator:
```bash
npm run ios
```

Run on Android emulator:
```bash
npm run android
```

Run on web browser:
```bash
npm run web
```

### Using Expo Go

1. Install Expo Go app on your iOS or Android device
2. Start the development server with `npm start`
3. Scan the QR code displayed in the terminal or browser
4. The app will load on your device

## Project Structure

```
Timer---New-UI/
├── app/
│   ├── (new-ui)/              # Main app screens
│   │   ├── home.tsx           # Home screen with analytics
│   │   ├── session.tsx       # Session configuration & running
│   │   ├── sounds.tsx        # Sound library & presets
│   │   ├── favorites.tsx     # Favorites management
│   │   ├── analytics.tsx     # Analytics dashboard
│   │   ├── scheduler.tsx    # Session scheduler
│   │   ├── profile.tsx      # User profile
│   │   └── settings.tsx     # App settings
│   ├── (auth)/               # Authentication screens
│   └── config/               # Configuration files
├── components/                # Reusable components
│   ├── ClockDisplay.tsx      # Timer display
│   ├── WeeklyProgressChart.tsx
│   ├── SoundPresetCard.tsx
│   ├── StartSessionModal.tsx
│   └── SavePresetModal.tsx
├── src/
│   ├── context/              # State management
│   │   ├── AppContext.tsx    # Main app state
│   │   └── AuthContext.tsx   # Authentication state
│   └── services/             # Business logic
│       ├── ClockService.ts   # Timer functionality
│       ├── SoundService.ts   # Audio management
│       └── DataService.ts    # Data persistence
├── constants/                # App constants
│   ├── Colors.ts
│   └── Theme.ts
├── styles/                   # Shared styles
│   └── commonStyles.ts
└── assets/                   # Static assets
    ├── fonts/
    └── images/
```

## Key Screens

### Home Screen
- Weekly progress chart with streak indicator
- Start session card with configuration modal
- Automated scheduler integration
- Progress statistics display
- Navigation to all major sections

### Session Screen
- Pre-session configuration panel
- Preset selection with three sound categories
- Duration selector (10m-60m)
- Time speed multiplier (0.8x-1.5x)
- Favorites row for quick sound access
- Session summary preview
- Minimal running session view
- Settings panel during active sessions
- Post-session summary with preset save

### Sounds Screen
- Sound library organized by category
- Sound preview functionality
- Favorites system
- Preset management
- Preset duplication
- Volume controls per sound
- Active sound layers display

## Configuration

### Environment Variables

The app is configured with Supabase credentials in `app.json`:
- Supabase URL: Set in `extra.supabaseUrl`
- Supabase Anon Key: Set in `extra.supabaseAnonKey`

**Action Required**: Verify these credentials match your Supabase project before connecting the backend.

### App Configuration

Edit `app.json` for:
- App name and version
- Bundle identifier
- Splash screen settings
- Icon configuration

## State Management

The app uses React Context API for state management:

- **AppContext**: Manages session state, presets, sounds, progress, and analytics
- **AuthContext**: Handles user authentication and profile data

Key state actions:
- `UPDATE_SESSION`: Update session configuration
- `UPDATE_SOUNDS`: Modify sound settings
- `ADD_SOUND_PRESET`: Create new preset
- `UPDATE_SOUND_PRESET`: Auto-save preset modifications
- `TOGGLE_FAVORITE_SOUND`: Manage favorites
- `END_SESSION`: Complete session and update streaks

## Services

### ClockService
Manages timer functionality including:
- Time manipulation (speed multiplier)
- Time slot advancement
- Session elapsed time tracking

### SoundService
Handles audio playback:
- Sound preview functionality
- Multi-layer sound mixing
- Volume control
- Haptic feedback

### DataService
Manages data persistence:
- Supabase integration (ready for connection)
- Session history
- User analytics
- Streak calculation

## Backend Integration

**Important**: This is a frontend UI implementation. Backend integration is required for data persistence.

### Current State
- All UI screens and components are complete
- Client-side state management is implemented
- Backend service files exist (`src/services/DataService.ts`)
- Supabase configuration is in `app.json`
- Backend connection is pending

### Integration Steps

See `OrderReport.md` for detailed 10-step backend integration guide. The integration involves:

1. Verifying Supabase connection
2. Connecting AppContext to backend
3. Connecting preset management to backend
4. Connecting session tracking to backend
5. Connecting analytics to backend
6. Connecting favorites to backend
7. Connecting scheduler to backend
8. Verifying DataService methods
9. Testing backend integration
10. Handling offline/online states

All backend service files are ready in `src/services/` and can be connected following the integration guide.

## Development

### Type Checking

Run TypeScript type checking:
```bash
npm run type-check
```

### Linting

Run ESLint:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

### Building for Production

#### iOS Build
```bash
npm run build:ios
```

#### Android Build
```bash
npm run build:android-store
```

#### EAS Build
```bash
eas build --platform all --profile production
```

## Testing

### Testing Checklist

Before backend integration:
- Test all navigation flows
- Test preset creation and duplication
- Test sound preview and favorites
- Test volume controls
- Test session configuration
- Test analytics display

After backend integration:
- Test data persistence
- Test streak syncing
- Test analytics data retrieval
- Test scheduled sessions
- Test offline/online sync

## Troubleshooting

### Common Issues

**Dependency conflicts**: Use `npm install --legacy-peer-deps`

**Metro bundler issues**: Clear cache with `npx expo start -c`

**Type errors**: Run `npm run type-check` to identify issues

**Navigation errors**: Ensure Expo Router is properly configured in `app/_layout.tsx`

**Audio playback issues**: Check device permissions and ensure expo-av is properly installed

## Requirements Compliance

All requirements from `MoreRequirements.md` have been implemented:

- Pre-Session Panel with preset selection
- Three sound categories (Ticking, Nature, Breathing)
- Category expand/collapse functionality
- Sound preview and heart icon system
- Volume/intensity controls per sound
- Favorites system and favorites row
- Duration selector (10m-60m, max 1 hour)
- Time speed multiplier (0.8x, 1x, 1.2x, 1.5x)
- Session summary preview
- Clean session mode UI
- Post-session summary with preset save
- Preset auto-save after modifications
- Preset duplication feature
- Settings adjustment during active sessions
- Weekly analytics chart

## Next Steps

1. **Backend Integration** (Required): Follow the integration guide in `OrderReport.md`
2. **Testing**: Test on physical devices via Expo Go
3. **Custom Icons**: Replace placeholder icons with custom designs
4. **Production Build**: Configure EAS Build for app store submission
5. **Analytics Enhancement**: Add advanced learning features to scheduler

## Support

For detailed implementation information, see `OrderReport.md`.

For issues or questions, refer to the project documentation or contact the development team.

## License

Private project - All rights reserved

