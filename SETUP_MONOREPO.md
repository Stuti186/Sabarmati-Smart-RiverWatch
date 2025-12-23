# 🏗️ Monorepo Setup Guide for Temperature Sync

## 📁 Project Structure

```
Sabarmati/
├── backend/          # Node.js/Express backend server
├── frontend/         # Expo React Native app
└── ...
```

## 🚀 Quick Setup (3 Steps)

### Step 1: Start Backend Server

**On your computer (or one device):**

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:3000`

**Find your computer's IP address:**
- **Windows**: Run `ipconfig` → Look for "IPv4 Address" (e.g., `192.168.1.100`)
- **Mac/Linux**: Run `ifconfig` or `ip addr` → Look for inet address (e.g., `192.168.1.100`)

### Step 2: Configure Frontend

**On each Expo Go device, create `.env` file in `frontend/` directory:**

```bash
cd frontend
```

Create `.env` file:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

**Replace `192.168.1.100` with your actual backend IP address!**

### Step 3: Start Frontend on All Devices

**On each device:**

```bash
cd frontend
npm start
```

Then scan QR code with Expo Go.

## ✅ Verification

### Check Backend is Running

```bash
curl http://192.168.1.100:3000/health
```

Should return: `{"status":"ok"}`

### Check Frontend Can Connect

1. Open Expo Go on device
2. Check console logs - should see:
   ```
   🌐 Backend URL Configuration:
     - Platform: ios/android
     - Final Backend URL: http://192.168.1.100:3000
   ```

3. Check temperature sync logs:
   ```
   🌡️ Temperature Sync Request: GET /water-quality/temperature-state
   🌡️ Temperature Sync Response: { temperature: 25.7, ... }
   ```

## 🔧 Troubleshooting

### Problem: Devices showing different temperatures

**Solution 1: Check Backend is Running**
```bash
# On backend computer
cd backend
npm run dev
# Should see: "🚀 Server running on port 3000"
```

**Solution 2: Check IP Address**
```bash
# On backend computer, find IP:
# Windows:
ipconfig

# Mac/Linux:
ifconfig | grep "inet "
# or
ip addr | grep "inet "
```

**Solution 3: Check Frontend .env File**
```bash
# On each device, verify .env exists:
cd frontend
cat .env
# Should show: EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

**Solution 4: Restart After Changing .env**
```bash
# After changing .env, restart Expo:
cd frontend
# Stop current process (Ctrl+C)
npm start
```

**Solution 5: Check Firewall**
- Backend computer's firewall might block port 3000
- Allow incoming connections on port 3000
- Or temporarily disable firewall for testing

**Solution 6: Check WiFi Network**
- All devices must be on the **same WiFi network**
- Backend computer and phones must be on same network
- Cannot use mobile data on phones

### Problem: "Network Error" in console

**Check:**
1. Backend is running: `curl http://192.168.1.100:3000/health`
2. IP address is correct in `.env`
3. Devices are on same WiFi
4. Firewall allows port 3000

### Problem: Temperature not syncing

**Check console logs:**
- Should see `🌡️ Temperature Sync Request` every 200ms
- Should see `🌡️ Temperature Sync Response` with temperature data
- If not, backend is not reachable

**Debug steps:**
1. Open Expo Go console (shake device → "Debug Remote JS")
2. Look for temperature sync logs
3. Check for error messages

## 📱 For SIH Demo

### Setup:
1. **Laptop/Computer**: Run backend (`cd backend && npm run dev`)
2. **Teammate's Phone**: Leader device (triggers fake temperature)
3. **Judges' Phones**: Follower devices (display synced temperature)

### Configuration:
- All devices use same `.env` with backend IP
- All devices on same WiFi network
- Backend accessible from all devices

### Result:
- All devices show **identical temperature**
- Changes sync within **200ms**
- Perfect for demo! 🎯

## 🎯 Quick Test

1. Start backend: `cd backend && npm run dev`
2. Start frontend on Device A: `cd frontend && npm start`
3. Start frontend on Device B: `cd frontend && npm start` (another device)
4. On Device A, trigger heat mode (press temperature card)
5. Check Device B - should show same temperature within 200ms ✅

## 📝 Environment Variables

### Backend `.env` (optional, uses defaults):
```env
PORT=3000
CORS_ORIGIN=http://localhost:8081,http://localhost:19006
```

### Frontend `.env` (REQUIRED):
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

**Important:** Replace `192.168.1.100` with your actual backend IP!

## 🔍 Debugging Commands

```bash
# Check backend health
curl http://192.168.1.100:3000/health

# Check temperature state
curl http://192.168.1.100:3000/api/v1/water-quality/temperature-state

# Test from phone browser
# Open: http://192.168.1.100:3000/health
```

## ⚡ Performance

- **Sync latency**: ~200ms
- **Polling frequency**: 200ms (5 times/second)
- **Update frequency**: 300ms when leader (3.3 times/second)
- **Network usage**: Minimal (~1KB per request)

