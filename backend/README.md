# Smart River Watch Backend API

A comprehensive Node.js + TypeScript backend for the Smart River Watch application, providing REST APIs and real-time WebSocket communication for river monitoring, water quality tracking, waste management, and volunteer coordination.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Water Quality Monitoring**: Real-time sensor data processing and quality index calculation
- **Unsafe Zone Management**: Track contaminated and hazardous river zones
- **Waste Hotspot Tracking**: Monitor and manage waste accumulation points
- **User Reports**: Community-driven reporting with AI-powered image analysis
- **Alert System**: Real-time notifications for critical water quality issues
- **Volunteer Events**: Coordinate cleanup activities and track participation
- **Reward Points**: Gamification system to encourage community engagement
- **Real-time Updates**: WebSocket support via Socket.IO
- **File Uploads**: Image upload handling with Multer
- **Scheduled Jobs**: Automated cleanup and maintenance tasks

## 📋 Prerequisites

- Node.js >= 16.x
- MongoDB >= 5.x
- npm or yarn

## 🛠️ Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your environment variables:
   - Database connection (MongoDB URI)
   - JWT secrets
   - CORS origins
   - Third-party API keys (Firebase, AWS, etc.)

4. **Create necessary directories**
   ```bash
   mkdir -p uploads/avatars uploads/reports uploads/events uploads/zones logs
   ```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### TypeScript Compilation
```bash
npm run build
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/
│   │   └── config.ts          # Environment configuration
│   ├── controllers/
│   │   └── auth.controller.ts # Authentication controllers
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication middleware
│   │   ├── errorHandler.ts   # Global error handler
│   │   ├── notFoundHandler.ts# 404 handler
│   │   └── rateLimiter.ts    # Rate limiting
│   ├── models/
│   │   ├── User.model.ts      # User schema
│   │   ├── Sensor.model.ts    # Sensor schema
│   │   ├── WaterQuality.model.ts
│   │   ├── UnsafeZone.model.ts
│   │   ├── WasteHotspot.model.ts
│   │   ├── Report.model.ts
│   │   ├── Alert.model.ts
│   │   └── VolunteerEvent.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts     # Authentication routes
│   │   ├── sensor.routes.ts   # Sensor endpoints
│   │   ├── waterQuality.routes.ts
│   │   ├── unsafeZone.routes.ts
│   │   ├── wasteHotspot.routes.ts
│   │   ├── report.routes.ts
│   │   ├── alert.routes.ts
│   │   ├── user.routes.ts
│   │   ├── reward.routes.ts
│   │   └── volunteer.routes.ts
│   ├── sockets/
│   │   └── socketHandlers.ts  # WebSocket event handlers
│   ├── jobs/
│   │   └── scheduledJobs.ts   # Cron jobs
│   └── utils/
│       ├── logger.ts          # Winston logger
│       └── multer.ts          # File upload configuration
├── uploads/                   # Uploaded files
├── logs/                      # Application logs
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/update-profile` - Update user profile
- `PUT /api/v1/auth/update-password` - Change password
- `POST /api/v1/auth/upload-avatar` - Upload profile picture

### Sensors
- `GET /api/v1/sensors` - Get all sensors
- `GET /api/v1/sensors/:id` - Get sensor details
- `GET /api/v1/sensors/nearby` - Get sensors near location
- `POST /api/v1/sensors` - Create sensor (Admin)
- `PUT /api/v1/sensors/:id` - Update sensor (Admin)
- `DELETE /api/v1/sensors/:id` - Delete sensor (Admin)

### Water Quality
- `GET /api/v1/water-quality` - Get water quality readings
- `GET /api/v1/water-quality/sensor/:id` - Get readings by sensor
- `POST /api/v1/water-quality` - Submit reading (IoT devices)

### Unsafe Zones
- `GET /api/v1/unsafe-zones` - Get all unsafe zones
- `GET /api/v1/unsafe-zones/:id` - Get zone details
- `POST /api/v1/unsafe-zones` - Report unsafe zone
- `PUT /api/v1/unsafe-zones/:id` - Update zone (Moderator)
- `DELETE /api/v1/unsafe-zones/:id` - Delete zone (Admin)

### Waste Hotspots
- `GET /api/v1/waste-hotspots` - Get all hotspots
- `GET /api/v1/waste-hotspots/:id` - Get hotspot details
- `POST /api/v1/waste-hotspots` - Report hotspot
- `PUT /api/v1/waste-hotspots/:id` - Update hotspot

### Reports
- `GET /api/v1/reports` - Get all reports
- `GET /api/v1/reports/my` - Get user's reports
- `POST /api/v1/reports` - Submit report
- `PUT /api/v1/reports/:id/verify` - Verify report (Moderator)

### Alerts
- `GET /api/v1/alerts` - Get active alerts
- `GET /api/v1/alerts/nearby` - Get alerts near location
- `POST /api/v1/alerts` - Create alert (Admin)

### Volunteer Events
- `GET /api/v1/volunteers` - Get all events
- `GET /api/v1/volunteers/:id` - Get event details
- `POST /api/v1/volunteers` - Create event
- `POST /api/v1/volunteers/:id/register` - Register for event
- `PUT /api/v1/volunteers/:id/attendance` - Mark attendance

### Rewards
- `GET /api/v1/rewards/leaderboard` - Get leaderboard
- `GET /api/v1/rewards/my-points` - Get user points

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🌐 WebSocket Events

Connect to WebSocket server:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Client Events
- `subscribe:sensor` - Subscribe to sensor updates
- `unsubscribe:sensor` - Unsubscribe from sensor
- `subscribe:alerts` - Subscribe to alerts
- `subscribe:location` - Subscribe to location-based updates

### Server Events
- `sensor:update` - Real-time sensor data
- `alert:new` - New alert notification
- `water_quality:update` - Water quality update
- `unsafe_zone:update` - Unsafe zone update
- `waste_hotspot:update` - Waste hotspot update
- `report:update` - Report status update

## 🛡️ Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation
- Role-based access control

## 📊 Database Models

### User
- Authentication and profile information
- Reward points and statistics
- Notification preferences
- Location data

### Sensor
- IoT sensor metadata
- Location coordinates
- Calibration information
- Alert thresholds

### WaterQuality
- Sensor readings (pH, DO, BOD, turbidity, etc.)
- Quality index calculation
- Timestamp and location
- Validation status

### UnsafeZone
- Contamination zones
- Severity levels
- Risk assessment
- Verification workflow

### WasteHotspot
- Waste accumulation points
- Density measurements
- Cleanup events
- Trend analysis

### Report
- User-submitted reports
- AI analysis results
- Verification status
- Community engagement (upvotes, comments)

### Alert
- Alert type and severity
- Location and affected radius
- Expiration handling
- Recipient targeting

### VolunteerEvent
- Event details and schedule
- Participant registration
- Attendance tracking
- Results and statistics

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available configuration options.

### Alert Thresholds
Configure water quality thresholds in `.env`:
- pH range: 6.5 - 8.5
- Dissolved Oxygen: min 4.0 mg/L
- BOD: max 5.0 mg/L
- Turbidity: max 5.0 NTU

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests (to be implemented)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is part of the Smart River Watch application.

## 📞 Support

For support and questions, please contact the development team.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - User authentication
  - Sensor management
  - Water quality monitoring
  - Real-time alerts
  - WebSocket support
  - Report submission
  - Volunteer events

## 🚀 Deployment

### Production Checklist
- [ ] Set strong JWT secrets
- [ ] Configure MongoDB replica set
- [ ] Set up Redis for caching
- [ ] Configure AWS S3 for file storage
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment variables
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Configure backup strategy
- [ ] Set up CDN for static assets
- [ ] Enable production logging

### Docker Deployment (Optional)
```bash
docker build -t smart-river-watch-backend .
docker run -p 3000:3000 --env-file .env smart-river-watch-backend
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
