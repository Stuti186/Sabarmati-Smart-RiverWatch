# Firebase Setup Guide

This backend has been fully migrated to **Firebase Firestore** for database operations.

## Prerequisites

1. Firebase project with Firestore enabled
2. Service account credentials (JSON file)

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Firestore Database** (in Build > Firestore Database)
4. Start in **Production mode** or **Test mode** based on your needs

### 2. Get Service Account Credentials

1. Go to Project Settings (gear icon) > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file (keep it secure!)

### 3. Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` file** with the following:

```env
# Server
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_ACCESS_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d

# Firebase Service Account (paste entire JSON as single-line string)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"...@....iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

# App Configuration
CLEANUP_OLD_REPORTS_DAYS=90
CLEANUP_OLD_ALERTS_DAYS=30

# CORS
CORS_ORIGIN=http://localhost:8081
```

**Important**: The `FIREBASE_SERVICE_ACCOUNT` value must be:
- The entire JSON content from the downloaded service account file
- Converted to a single-line string (no line breaks)
- Wrapped in single quotes
- Newlines in the private key should be escaped as `\\n`

### 4. Firestore Collections

The backend uses the following Firestore collections:

- **users** - User accounts (email, password, role, rewardPoints, etc.)
- **sensors** - IoT sensor devices
- **waterQuality** - Water quality readings from sensors
- **reports** - User-submitted reports (pollution, issues, etc.)
- **unsafeZones** - Dangerous/contaminated areas
- **wasteHotspots** - Waste accumulation points
- **alerts** - System alerts and notifications
- **volunteerEvents** - Cleanup and volunteer events
- **rewardTransactions** - Reward points transaction history

### 5. Firestore Security Rules (Recommended)

Go to Firestore Database > Rules and add appropriate security rules. Example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow backend with service account full access
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Firebase Authentication (Optional)

If you want to sync backend users with Firebase Authentication:

1. Enable **Email/Password** provider in Authentication
2. The backend already creates Firebase Auth users on registration
3. Users are stored in both Firebase Auth and Firestore `users` collection

## Running the Backend

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## API Endpoints

All endpoints are documented in the route files:

- **Auth**: `/api/auth` - register, login, refresh token
- **Sensors**: `/api/sensors` - sensor management
- **Water Quality**: `/api/water-quality` - water quality data
- **Reports**: `/api/reports` - user reports
- **Unsafe Zones**: `/api/unsafe-zones` - dangerous areas
- **Waste Hotspots**: `/api/waste-hotspots` - waste accumulation
- **Alerts**: `/api/alerts` - system alerts
- **Users**: `/api/users` - user management (admin)
- **Rewards**: `/api/rewards` - reward points system
- **Volunteer Events**: `/api/volunteer` - volunteer activities

## Migration from MongoDB

This project was originally built with MongoDB/Mongoose and has been **fully migrated** to Firebase Firestore.

Key changes:
- All Mongoose models removed
- All controllers converted to Firestore queries
- Auth middleware updated for Firestore
- Scheduled jobs updated for Firestore
- Mongoose package uninstalled

## Troubleshooting

### Error: "Failed to initialize Firebase"

- Check that `FIREBASE_SERVICE_ACCOUNT` env variable is set correctly
- Verify the JSON is properly formatted (use online JSON validator)
- Ensure newlines in private key are escaped as `\\n`

### Error: "Missing or insufficient permissions"

- Check Firestore security rules
- Verify service account has proper permissions in Firebase Console

### Error: "Cannot find module 'mongoose'"

- Good! Mongoose has been removed. All database operations now use Firestore.

## Development Notes

### Firestore Query Patterns

```typescript
// Get collection reference
const db = getFirestore();
const usersRef = db.collection('users');

// Query documents
const snapshot = await usersRef.where('status', '==', 'active').get();

// Get single document
const userDoc = await usersRef.doc(userId).get();

// Create document
await usersRef.add(data);  // Auto-generated ID
await usersRef.doc(userId).set(data);  // Custom ID

// Update document
await userDoc.ref.update({ field: value });

// Delete document
await userDoc.ref.delete();
```

### Geoqueries

Firestore doesn't have built-in geospatial queries. The backend fetches all documents and filters by distance in memory. For production with many records, consider using [GeoFirestore](https://github.com/MichaelSolati/geofirestore) library.

## Support

For Firebase-specific issues, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
