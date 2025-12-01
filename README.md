# 🌊 Smart River Watch

**Sabarmati Riverfront Monitoring App** — A comprehensive real-time environmental monitoring mobile application built for Smart India Hackathon 2024.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Setup](#-environment-setup)
- [Navigation Architecture](#-navigation-architecture)
- [Theme System](#-theme-system)
- [UI Components](#-ui-components)
- [Services](#-services)
- [Building for Production](#-building-for-production)
- [Contributing](#-contributing)

---

## ✨ Features

### 🌡️ Water Quality Monitoring
- Real-time water quality data visualization
- pH, Dissolved Oxygen, BOD, TDS, COD, Turbidity readings
- Historical trends and graphs
- Water level monitoring

### 🗺️ Interactive Maps
- Water sensor locations with real-time data
- Unsafe zone mapping
- Waste hotspot visualization
- Interactive markers with detailed info sheets

### ⚠️ Alert System
- Flood alerts with severity levels
- 48-hour flood prediction
- Safety alerts for riverfront areas
- CCTV feed monitoring

### 📝 Citizen Engagement
- Submit environmental reports with photos
- AI-powered waste detection
- Track submitted reports
- View waste trends and analytics

### 🏆 Gamification
- Reward points system
- Volunteer event participation
- Community leaderboard
- Achievement badges

### 📚 Awareness
- Educational blog articles
- Environmental tips
- River conservation guides

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native + Expo SDK 52 |
| **Language** | TypeScript |
| **Navigation** | Expo Router (File-based) |
| **State Management** | Zustand with persist middleware |
| **Styling** | NativeWind (Tailwind CSS) + StyleSheet |
| **Authentication** | Firebase Auth |
| **Database** | Firebase Firestore |
| **Storage** | Firebase Storage |
| **Maps** | react-native-maps (Google Maps) |
| **Charts** | react-native-chart-kit |
| **Animations** | react-native-reanimated |
| **Icons** | @expo/vector-icons (Ionicons) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Firebase project (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/smart-river-watch.git
   cd smart-river-watch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp ENV_TEMPLATE.txt .env
   # Edit .env with your Firebase credentials
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web
   - Scan QR code with Expo Go app

---

## 📁 Project Structure

```
smart-river-watch/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout
│   ├── index.tsx                 # Entry redirect
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main tab navigator
│   │   ├── _layout.tsx           # Tab layout
│   │   ├── index.tsx             # Dashboard/Home
│   │   ├── monitor/              # Water quality module
│   │   │   ├── index.tsx         # Overview
│   │   │   ├── graphs.tsx        # Detailed graphs
│   │   │   └── water-level.tsx   # Water level
│   │   ├── map/                  # Map module
│   │   │   ├── index.tsx         # Sensor map
│   │   │   ├── unsafe-zones.tsx  # Unsafe areas
│   │   │   └── waste-hotspots.tsx
│   │   ├── reports/              # Reports module
│   │   │   ├── index.tsx         # Waste feed
│   │   │   ├── upload.tsx        # AI waste upload
│   │   │   ├── trends.tsx        # Waste trends
│   │   │   └── my-reports.tsx    # User reports
│   │   └── profile/              # Profile module
│   │       ├── index.tsx         # User profile
│   │       ├── rewards.tsx       # Reward points
│   │       └── volunteer.tsx     # Volunteer events
│   ├── alerts/                   # Alerts module
│   │   ├── flood.tsx             # Flood alerts
│   │   ├── flood-prediction.tsx  # 48-hour prediction
│   │   ├── safety.tsx            # Safety alerts
│   │   └── cctv.tsx              # CCTV monitoring
│   ├── submit-report.tsx         # Report submission
│   └── awareness.tsx             # Blog/awareness
│
├── screens/                      # Screen components
│   ├── WaterQualityOverviewScreen.tsx
│   ├── WaterQualityGraphsScreen.tsx
│   ├── WaterLevelScreen.tsx
│   ├── WaterSensorMapScreen.tsx
│   ├── UnsafeZoneMapScreen.tsx
│   ├── WasteHotspotMapScreen.tsx
│   ├── WasteFeedScreen.tsx
│   ├── WasteUploadScreen.tsx
│   ├── WasteTrendsScreen.tsx
│   ├── MyReportsScreen.tsx
│   ├── FloodAlertsScreen.tsx
│   ├── FloodPredictionScreen.tsx
│   ├── SafetyAlertsScreen.tsx
│   ├── SafetyCCTVScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── RewardPointsScreen.tsx
│   ├── VolunteerEventsScreen.tsx
│   ├── SubmitReportScreen.tsx
│   └── AwarenessBlogScreen.tsx
│
├── components/                   # Reusable components
│   ├── ui/                       # UI components
│   │   ├── GlassCard.tsx
│   │   ├── GradientCard.tsx
│   │   ├── StatusChip.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── InputField.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── ChartContainer.tsx
│   │   ├── WaterQualityChart.tsx
│   │   ├── MapBottomSheet.tsx
│   │   ├── MapMarkerIcon.tsx
│   │   └── ...more
│   └── LoadingScreen.tsx
│
├── contexts/                     # React contexts
│   └── AuthContext.tsx           # Authentication context
│
├── services/                     # Business logic
│   ├── firebase.ts               # Firebase configuration
│   ├── auth.ts                   # Auth service
│   ├── api.ts                    # HTTP client
│   ├── store.ts                  # Zustand store
│   ├── notifications.ts          # Push notifications
│   ├── reports.ts                # Report submission
│   ├── fakeData.ts               # Mock data generator
│   └── autoAlerts.ts             # Auto alert triggers
│
├── hooks/                        # Custom hooks
│   ├── useFakeDataUpdates.ts     # Mock data updates
│   ├── useAutoAlerts.ts          # Auto alert hook
│   └── useScreenAnimation.ts     # Screen animations
│
├── utils/                        # Utility functions
│   ├── aiDetection.ts            # AI detection (mock)
│   ├── waterQuality.ts           # Water quality helpers
│   ├── floodPrediction.ts        # Flood prediction
│   ├── sensorData.ts             # Sensor data
│   └── ...more
│
├── theme/                        # Design system
│   ├── colors.ts                 # Color palette
│   ├── typography.ts             # Typography system
│   ├── shadows.ts                # Shadow presets
│   ├── gradients.ts              # Gradient configs
│   ├── designSystem.ts           # Design tokens
│   └── uiSystem.ts               # UI constants
│
├── constants/                    # App constants
│   ├── index.ts                  # API config, enums
│   └── theme.ts                  # Theme constants
│
├── assets/                       # Static assets
│   └── images/                   # App icons, images
│
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build config
├── tailwind.config.js            # Tailwind config
├── metro.config.js               # Metro bundler config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

---

## 🔐 Environment Setup

Create a `.env` file in the project root:

```env
# Firebase Configuration (Required)
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# API Configuration (Optional)
EXPO_PUBLIC_API_URL=https://api.smartriverwatch.com

# Google Maps (Optional - for custom map styling)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=your-android-key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=your-ios-key
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Authentication** → Sign-in method → Email/Password
4. Enable **Firestore Database** (start in test mode)
5. Enable **Storage** (start in test mode)
6. Get config from Project Settings → Your apps → Web app
7. Add values to your `.env` file

---

## 🧭 Navigation Architecture

The app uses **Expo Router** with file-based routing:

```
┌─────────────────────────────────────────────────────────────┐
│                        ROOT LAYOUT                           │
│                     (app/_layout.tsx)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────────────────────────┐   │
│  │   (auth)     │    │            (tabs)                 │   │
│  │   Stack      │    │         Tab Navigator             │   │
│  ├──────────────┤    ├──────────────────────────────────┤   │
│  │ • login      │    │ Home │Monitor│ Map │Reports│Profile│   │
│  │ • register   │    │      │ Stack │Stack│ Stack │ Stack │   │
│  │ • forgot-pwd │    │      │       │     │       │       │   │
│  └──────────────┘    └──────────────────────────────────┘   │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   /alerts    │    │/submit-report│    │  /awareness  │   │
│  │    Stack     │    │    Screen    │    │    Screen    │   │
│  ├──────────────┤    └──────────────┘    └──────────────┘   │
│  │ • flood      │                                            │
│  │ • prediction │                                            │
│  │ • safety     │                                            │
│  │ • cctv       │                                            │
│  └──────────────┘                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Navigation Routes

| Route | Screen | Description |
|-------|--------|-------------|
| `/(tabs)` | Dashboard | Main home screen |
| `/(tabs)/monitor` | Water Quality Overview | Water monitoring hub |
| `/(tabs)/monitor/graphs` | Water Quality Graphs | Detailed charts |
| `/(tabs)/monitor/water-level` | Water Level | River levels |
| `/(tabs)/map` | Sensor Map | Interactive map |
| `/(tabs)/map/unsafe-zones` | Unsafe Zones | Danger areas |
| `/(tabs)/map/waste-hotspots` | Waste Hotspots | Waste density |
| `/(tabs)/reports` | Waste Feed | Detection feed |
| `/(tabs)/reports/upload` | AI Upload | Waste detection |
| `/(tabs)/reports/my-reports` | My Reports | User's reports |
| `/(tabs)/reports/trends` | Waste Trends | Analytics |
| `/(tabs)/profile` | Profile | User settings |
| `/(tabs)/profile/rewards` | Rewards | Points & badges |
| `/(tabs)/profile/volunteer` | Volunteer Events | Community events |
| `/alerts/flood` | Flood Alerts | Current alerts |
| `/alerts/flood-prediction` | Flood Prediction | 48-hour forecast |
| `/alerts/safety` | Safety Alerts | Safety warnings |
| `/alerts/cctv` | CCTV Feed | Camera monitoring |
| `/submit-report` | Submit Report | Report issues |
| `/awareness` | Awareness Blog | Educational content |

---

## 🎨 Theme System

The app uses a comprehensive design system located in `/theme`:

### Colors

```typescript
import { colors } from '@/theme';

// Primary palette
colors.primary[500]     // #3B82F6 - Main blue
colors.success[500]     // #22C55E - Green
colors.warning[500]     // #F59E0B - Yellow
colors.danger[500]      // #EF4444 - Red

// Usage in StyleSheet
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary[500],
  },
});
```

### Typography

```typescript
import { typography } from '@/theme';

// Predefined text styles
typography.textStyles.h1      // 32px, bold
typography.textStyles.h2      // 24px, semibold
typography.textStyles.body    // 16px, regular
typography.textStyles.caption // 12px, regular
```

### Shadows

```typescript
import { shadows } from '@/theme';

// Shadow presets (cross-platform)
shadows.sm    // Small shadow
shadows.md    // Medium shadow
shadows.lg    // Large shadow
shadows.xl    // Extra large shadow
```

### Gradients

```typescript
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/theme';

<LinearGradient
  colors={gradients.primary.colors}
  start={gradients.primary.start}
  end={gradients.primary.end}
/>
```

---

## 🧩 UI Components

### GlassCard
Glassmorphism card with blur effect:
```tsx
<GlassCard intensity={80} tint="light">
  <Text>Content</Text>
</GlassCard>
```

### GradientCard
Card with gradient background:
```tsx
<GradientCard gradient="water">
  <Text>Water Quality Data</Text>
</GradientCard>
```

### StatusChip
Status indicator with icon:
```tsx
<StatusChip status="success" label="Excellent" />
<StatusChip status="warning" label="Fair" />
<StatusChip status="danger" label="Critical" />
```

### PrimaryButton
Gradient button with loading state:
```tsx
<PrimaryButton
  title="Submit"
  onPress={handleSubmit}
  loading={isLoading}
  icon="send"
/>
```

### InputField
Styled input with label and validation:
```tsx
<InputField
  label="Email"
  icon="mail"
  error={errors.email}
  value={email}
  onChangeText={setEmail}
/>
```

---

## 🔧 Services

### Authentication (`contexts/AuthContext.tsx`)

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, login, logout, register, loading } = useAuth();

// Login
await login(email, password);

// Register
await register(email, password);

// Logout
await logout();
```

### State Management (`services/store.ts`)

```typescript
import { useStore } from '@/services/store';

// Access state
const sensors = useStore((state) => state.sensors);
const setSensors = useStore((state) => state.setSensors);

// Update state
setSensors(newSensorData);
```

### API Service (`services/api.ts`)

```typescript
import { apiService } from '@/services/api';

// GET request
const data = await apiService.get('/endpoint');

// POST request
const response = await apiService.post('/endpoint', { data });
```

---

## 📱 Building for Production

### Using EAS Build

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Build Android APK**
   ```bash
   npm run build:android:preview
   # or for production
   npm run build:android:production
   ```

4. **Build iOS**
   ```bash
   npm run build:ios:preview
   # or for production
   npm run build:ios:production
   ```

### Build Profiles (eas.json)

| Profile | Use Case | Output |
|---------|----------|--------|
| `development` | Local development | Development build |
| `preview` | Testing/Demo | APK (Android) / Simulator (iOS) |
| `production` | App Store release | AAB (Android) / IPA (iOS) |

---

## 🔮 Future Enhancements

The following features are ready in UI but need backend integration:

| Feature | Current State | Needs |
|---------|---------------|-------|
| Water Quality Data | Mock data | IoT sensor integration |
| AI Waste Detection | Simulated | ML model endpoint |
| Flood Prediction | Basic algorithm | Weather API + ML model |
| CCTV Streaming | Static images | RTSP stream integration |
| Push Notifications | Local only | Firebase Cloud Messaging |
| Report Submission | UI ready | Backend API |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project was built for **Smart India Hackathon 2025**.

---

## 👥 Team

**Smart River Watch Team** — Building technology for a cleaner, safer Sabarmati Riverfront.

---

<p align="center">
  Made with ❤️ for Smart India Hackathon 2025
</p>
