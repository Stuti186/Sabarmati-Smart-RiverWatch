# 🌡️ Multi-Device Temperature Sync Setup Guide

## ✅ How It Works

This system uses a **Leader-Follower** pattern for perfect temperature synchronization across all Expo Go devices on the same WiFi network:

1. **Leader Device**: The device that triggers heat/cool mode becomes the "leader"
   - Controls temperature changes
   - Broadcasts updates to backend every 300ms
   - Only one device can be leader at a time

2. **Follower Devices**: All other devices on the network
   - Poll backend every 200ms for updates
   - Display synced temperature values
   - Do NOT generate local temperature changes

3. **Backend Server**: Runs on one device/computer
   - Stores current temperature state
   - Broadcasts updates to all connected devices
   - Acts as the single source of truth

## 🚀 Setup Instructions

### Step 1: Start Backend Server

On **one device/computer** (can be a laptop or the leader phone's computer):

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:3000`

### Step 2: Find Backend IP Address

**If backend is on a computer:**
- Find the computer's local IP address:
  - **Windows**: `ipconfig` → Look for "IPv4 Address"
  - **Mac/Linux**: `ifconfig` or `ip addr` → Look for inet address
  - Example: `192.168.1.100`

**If backend is on the same phone (using Expo tunnel):**
- Use `localhost` or `127.0.0.1`

### Step 3: Configure Frontend Devices

On **each Expo Go device**, update the `.env` file:

```bash
cd frontend
```

Create or edit `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

Replace `192.168.1.100` with your actual backend IP address.

### Step 4: Start Frontend on All Devices

On **each device**:

```bash
cd frontend
npm start
```

Then scan the QR code with Expo Go on each phone.

## 🎯 How to Use

1. **All devices** will show the same temperature (starts at 25.7°C)

2. **On the leader device** (teammate's phone):
   - Secretly press and hold the invisible touch zone on the Temperature card
   - Temperature will start rising after 1-2 seconds
   - All other devices will sync within 200ms

3. **On follower devices** (judges' phones):
   - Temperature automatically updates to match leader
   - No interaction needed
   - Shows exact same value in real-time

## 🔧 Troubleshooting

### Devices showing different temperatures?

1. **Check backend is running:**
   ```bash
   curl http://192.168.1.100:3000/health
   ```
   Should return `{"status":"ok"}`

2. **Check all devices use same API URL:**
   - Verify `.env` file has correct IP
   - Restart Expo after changing `.env`

3. **Check WiFi connection:**
   - All devices must be on the same WiFi network
   - Backend device must be accessible from other devices

4. **Check firewall:**
   - Backend device's firewall might block port 3000
   - Allow incoming connections on port 3000

### Backend not accessible?

**Option 1: Use Expo Tunnel (if backend on phone)**
```bash
expo start --tunnel
```

**Option 2: Use ngrok (for external access)**
```bash
ngrok http 3000
```
Then use the ngrok URL in `.env`

**Option 3: Use computer's IP directly**
- Make sure computer and phones are on same WiFi
- Use computer's local IP (e.g., `192.168.1.100`)

## 📱 Quick Test

1. Start backend on computer: `cd backend && npm run dev`
2. Start frontend on Device A: `cd frontend && npm start`
3. Start frontend on Device B: `cd frontend && npm start` (on another device)
4. On Device A, trigger heat mode (press temperature card)
5. Check Device B - should show same temperature within 200ms

## 🎭 For SIH Demo

- **Teammate's phone**: Leader device (triggers fake temperature)
- **Judges' phones**: Follower devices (display synced values)
- **Backend**: Run on laptop or teammate's computer
- **Result**: All devices show identical temperature in real-time

## ⚡ Performance

- **Sync latency**: ~200ms (very fast)
- **Polling frequency**: 200ms (5 times per second)
- **Update frequency**: 300ms when leader (3.3 times per second)
- **Network usage**: Minimal (small JSON payloads)

## 🔒 Security Note

This setup is for **local intranet only**. The backend should NOT be exposed to the internet without proper authentication.

