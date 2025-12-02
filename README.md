# Smart River Watch - Monorepo

A comprehensive IoT-powered river monitoring and environmental protection platform.

## 📁 Repository Structure

```
.
├── frontend/          # React Native + Expo mobile application
│   ├── app/           # Expo Router screens
│   ├── components/    # Reusable UI components
│   ├── screens/       # Main screen components
│   ├── services/      # API services and Firebase
│   ├── contexts/      # React contexts (Auth, etc.)
│   ├── hooks/         # Custom React hooks
│   ├── theme/         # Design system and styling
│   ├── utils/         # Utility functions
│   └── package.json   # Frontend dependencies
│
└── backend/           # Node.js + Express + MongoDB API server
    ├── src/
    │   ├── models/    # Mongoose data models
    │   ├── controllers/ # Route controllers
    │   ├── routes/    # API route definitions
    │   ├── middleware/ # Express middleware
    │   ├── sockets/   # WebSocket handlers
    │   └── jobs/      # Scheduled cron jobs
    └── package.json   # Backend dependencies
```

## 🚀 Quick Start

### Frontend (React Native + Expo)

```powershell
cd frontend
npm install
npx expo start
```

### Backend (Node.js + Express)

```powershell
cd backend
npm install
npm run dev
```

## 🔧 Technologies

### Frontend
- React Native + Expo
- TypeScript
- Expo Router (file-based routing)
- NativeWind (TailwindCSS)
- React Native Maps
- Firebase Authentication

### Backend
- Node.js + Express
- TypeScript
- MongoDB (Mongoose)
- Socket.IO (real-time)
- JWT Authentication
- Node-cron (scheduled jobs)

## 📱 Features

- Real-time water quality monitoring
- IoT sensor data visualization
- Flood prediction and alerts
- Waste detection and reporting
- Interactive maps (sensors, unsafe zones, waste hotspots)
- User rewards and gamification
- Volunteer event management
- CCTV safety monitoring
- Environmental awareness blog

## 🔗 API Documentation

Backend API runs on `http://localhost:3000` by default.

Key endpoints:
- `/api/auth/*` - Authentication
- `/api/sensors/*` - Sensor management
- `/api/water-quality/*` - Water quality data
- `/api/reports/*` - User reports
- `/api/alerts/*` - Alerts and notifications

## 📄 Environment Variables

Create `.env` files in both `frontend/` and `backend/` directories. See `.env.example` files for required variables.

## 👥 Contributing

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Commit with descriptive messages
5. Push and create a Pull Request

## 📝 License

[Add your license here]
