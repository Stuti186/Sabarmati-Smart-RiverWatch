# 🌊 Smart Sabarmati Riverfront - AI-Powered Monitoring System

> **Built for Smart India Hackathon 2025**  
> Comprehensive IoT + AI solution for real-time river monitoring, biodiversity tracking, and emergency response

[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

---

## 🎯 Problem Statement

Urban riverfronts like **Sabarmati Riverfront in Ahmedabad** face critical challenges:
- ❌ **No real-time water quality monitoring** - Delayed pollution detection
- ❌ **Inefficient waste management** - Manual inspections, delayed cleanup
- ❌ **Lack of biodiversity tracking** - No ecosystem health monitoring
- ❌ **Safety concerns** - No AI-based drowning detection or emergency response
- ❌ **Limited citizen engagement** - No platform for community participation

---

## ✨ Solution Overview

A **comprehensive IoT + AI platform** featuring:
- 🔬 **Real-time sensor monitoring** for water quality
- 🤖 **AI-powered waste detection** and biodiversity identification
- 🚨 **Emergency SOS system** with AI drowning detection (85% accuracy)
- 🦋 **Hyper-local biodiversity tracking** (Sabarmati Riverfront exclusive, 8km radius)
- 📱 **Citizen engagement platform** with gamification

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase project (see [backend/FIREBASE_SETUP.md](./backend/FIREBASE_SETUP.md))

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd Sabarmati
   ```

2. **Quick Setup (Automated)**
   ```bash
   # Run the setup script (auto-detects IP and creates .env)
   ./QUICK_SETUP.sh
   ```
   
   OR manually:

2. **Start Backend** (Required - uses real data only)
   ```bash
   cd backend
   npm install
   # Create .env file (see BACKEND_SETUP.md)
   npm run dev
   ```
   ✅ Backend runs on `http://localhost:3000`

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   # Create .env file with EXPO_PUBLIC_API_URL=http://localhost:3000
   npx expo start
   ```

4. **Run on Device**
   - Scan QR code with Expo Go app
   - Or press `a` for Android / `i` for iOS

📖 **Detailed Setup**: See [BACKEND_SETUP.md](./BACKEND_SETUP.md)

---

## 🆕 Key Features (Hackathon Highlights)

### 1. **AI Drowning Detection System** ⭐
- Real-time CCTV camera analysis (5 cameras across Sabarmati Riverfront)
- 85% accuracy threshold (industry standard)
- Automatic SOS alerts to authorities and lifeguards
- Zone-based response routing
- Incident tracking and history

**Test it:**
```bash
curl -X POST http://localhost:3000/api/v1/sos/test-detection/cam-001
```

📖 **Details**: See [AI_DROWNING_DETECTION_TEST_GUIDE.md](./AI_DROWNING_DETECTION_TEST_GUIDE.md)

### 2. **Biodiversity Intelligence - Sabarmati Exclusive** ⭐
- **Hyper-local species tracking** (8km radius: 23.0300, 72.5800)
- Real-time GBIF API integration (no keys needed)
- **AI species identification** using Google Gemini Vision API
- Species validation (rejects non-Sabarmati species)
- Ecosystem health scoring
- Seasonal migration patterns

**Test it:**
```bash
# Search Sabarmati species only
curl "http://localhost:3000/api/v1/biodiversity/species?q=bird&limit=5"

# Validate species
curl -X POST http://localhost:3000/api/v1/biodiversity/validate-species \
  -H "Content-Type: application/json" \
  -d '{"speciesName": "Egret"}'
```

📖 **Details**: See [BIODIVERSITY_GUIDE.md](./BIODIVERSITY_GUIDE.md)

### 3. **Real-Time Water Quality Monitoring** ⭐
- Live sensor data (pH, DO, BOD, COD, Turbidity, TDS)
- Historical trends and graphs
- Automated alerts for critical thresholds
- Interactive sensor map
- **Multi-Device Temperature Sync** - All Expo Go devices show identical temperature in real-time (200ms sync latency)

**Multi-Device Setup:**
```bash
# 1. Start backend on one device/computer
cd backend && npm run dev

# 2. Find backend IP (e.g., 192.168.1.100)
./find-backend-ip.sh

# 3. Configure frontend on all devices
echo "EXPO_PUBLIC_API_URL=http://192.168.1.100:3000" > frontend/.env

# 4. Start frontend on each device
cd frontend && npm start
```

📖 **Details**: See [SETUP_MONOREPO.md](./SETUP_MONOREPO.md) and [TEMPERATURE_SYNC_SETUP.md](./TEMPERATURE_SYNC_SETUP.md)

### 4. **Emergency SOS System**
- One-tap SOS button with GPS location
- 3-second countdown with cancel option
- Emergency contacts management
- Incident history tracking

### 5. **Waste Management**
- AI-powered waste detection from photos
- Hotspot mapping and density analysis
- Community reporting
- Trend analysis

### 6. **Citizen Engagement**
- Reward points and leaderboard
- Volunteer event coordination
- Community reporting
- Awareness blog

---

## 🏗️ Architecture

```
Mobile App (React Native)
    ↓ REST API + WebSocket
Backend API (Node.js/Express)
    ↓
Services:
  - GBIF API → Real species data (Sabarmati-filtered)
  - Firestore → Real sightings & health scores
  - AI Detection → CCTV monitoring
  - Sensor Data → Real-time water quality
```

---

## 🛠️ Tech Stack

**Frontend:**
- React Native + Expo SDK 54
- TypeScript
- Expo Router (file-based navigation)
- Zustand (state management)
- Firebase SDK

**Backend:**
- Node.js 18+ + Express.js
- TypeScript
- Firebase Firestore
- Socket.IO (real-time)
- GBIF API integration

---

## 📊 API Endpoints

### Emergency SOS
- `POST /api/v1/sos/emergency` - Trigger SOS
- `POST /api/v1/sos/drowning-detection` - AI detection alert
- `GET /api/v1/sos/incidents` - Incident history
- `POST /api/v1/sos/test-detection/:cameraId` - Test detection

### Biodiversity (Sabarmati-Only)
- `GET /api/v1/biodiversity/species?q={query}` - Search species (8km radius)
- `POST /api/v1/biodiversity/sightings` - Submit sighting
- `GET /api/v1/biodiversity/health-score` - Ecosystem health
- `POST /api/v1/biodiversity/validate-species` - Validate Sabarmati species

### Water Quality
- `GET /api/v1/water-quality` - Latest readings
- `GET /api/v1/sensors` - Sensor locations

📖 **Full API Docs**: See [backend/README.md](./backend/README.md)

---

## ⚠️ Important Notes

### Real Data Only
- **No mock data** - Backend must be running
- All data from GBIF API, Firestore, and real sensors
- If backend unavailable, app shows errors (not mock data)

### Sabarmati-Exclusive
- Biodiversity module filters to **8km radius** (23.0300, 72.5800)
- Only species found in Sabarmati Riverfront are accepted
- Non-Sabarmati species are rejected with validation message

---

## 🧪 Testing

### Verify Backend
```bash
# Health check
curl http://localhost:3000/api/v1/biodiversity/health

# Test species search
curl "http://localhost:3000/api/v1/biodiversity/species?q=bird&limit=5"
```

### Test AI Detection
```bash
# Trigger test detection
curl -X POST http://localhost:3000/api/v1/sos/test-detection/cam-001
```

---

## 📁 Project Structure

```
Sabarmati/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic (GBIF, AI detection)
│   │   ├── routes/       # API routes
│   │   └── sockets/      # WebSocket handlers
│   └── README.md
│
├── frontend/             # React Native app
│   ├── app/              # Expo Router pages
│   ├── screens/          # Screen components
│   ├── components/       # Reusable components
│   ├── services/         # API clients
│   └── README.md
│
└── README.md             # This file
```

---

## 📚 Documentation

### Quick Start
- **[HACKATHON_QUICK_START.md](./HACKATHON_QUICK_START.md)** - 5-minute setup for judges
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Complete setup verification
- **[FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)** - Frontend-Backend integration guide

### Setup Guides
- **[ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)** - Complete environment variables setup guide
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Backend setup (real data configuration)
- **[backend/FIREBASE_SETUP.md](./backend/FIREBASE_SETUP.md)** - Firebase configuration
- **[GOOGLE_GEMINI_SETUP.md](./GOOGLE_GEMINI_SETUP.md)** - Google Gemini AI setup (for species identification)
- **[backend/.env.example](./backend/.env.example)** - Backend environment template
- **[frontend/.env.example](./frontend/.env.example)** - Frontend environment template

### Feature Documentation
- **[BIODIVERSITY_GUIDE.md](./BIODIVERSITY_GUIDE.md)** - Biodiversity module (Sabarmati-exclusive)
- **[AI_DROWNING_DETECTION_TEST_GUIDE.md](./AI_DROWNING_DETECTION_TEST_GUIDE.md)** - AI detection testing
- **[AI_DROWNING_DETECTION_ACCURACY.md](./AI_DROWNING_DETECTION_ACCURACY.md)** - Accuracy metrics

### Technical Documentation
- **[backend/README.md](./backend/README.md)** - Backend API documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend documentation
- **[CODEBASE_REVIEW.md](./CODEBASE_REVIEW.md)** - Codebase analysis
- **[MONOREPO_REVIEW.md](./MONOREPO_REVIEW.md)** - Architecture review

---

## 🎯 Hackathon Submission

### Problem Statement
**Smart Sabarmati Riverfront & Urban Water Bodies**

### Solution Categories
- IoT & Sensor Integration
- AI/ML for Environmental Monitoring
- Mobile Application
- Real-time Data Analytics

### Key Differentiators
1. **AI Drowning Detection** - First-of-its-kind for riverfront safety
2. **Hyper-Local Biodiversity** - Sabarmati-exclusive (8km radius)
3. **Real-Time Monitoring** - WebSocket streaming
4. **Citizen Engagement** - Gamified platform

---

## 🏆 Technical Achievements

- ✅ Full-stack TypeScript
- ✅ Real-time WebSocket communication
- ✅ AI/ML integration (drowning detection, species identification)
- ✅ Offline-first architecture
- ✅ Production-ready (error handling, security, logging)
- ✅ Scalable architecture

---

## 👥 Team

**Smart River Watch Team**  
Building technology for a cleaner, safer Sabarmati Riverfront.

---

## 📄 License

Built for **Smart India Hackathon 2025**.

---

<p align="center">
  <b>Made with ❤️ for Smart India Hackathon 2025</b><br>
  <i>Protecting Sabarmati Riverfront through Technology</i>
</p>
