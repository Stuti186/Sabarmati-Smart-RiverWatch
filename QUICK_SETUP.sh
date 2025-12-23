#!/bin/bash

# Quick Setup Script for Monorepo Temperature Sync
# This script helps you set up the backend and frontend for multi-device sync

echo "🚀 Smart River Watch - Monorepo Setup"
echo "======================================"
echo ""

# Step 1: Check if backend is running
echo "📦 Step 1: Checking Backend..."
if [ -d "backend" ]; then
    echo "✅ Backend directory found"
    
    # Check if node_modules exists
    if [ ! -d "backend/node_modules" ]; then
        echo "📥 Installing backend dependencies..."
        cd backend
        npm install
        cd ..
    else
        echo "✅ Backend dependencies installed"
    fi
else
    echo "❌ Backend directory not found!"
    exit 1
fi

# Step 2: Find IP address
echo ""
echo "🔍 Step 2: Finding Backend IP Address..."
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    IP=$(ipconfig | grep -i "IPv4" | grep -Eo '([0-9]*\.){3}[0-9]*' | head -n 1)
fi

if [ -z "$IP" ]; then
    echo "⚠️  Could not auto-detect IP. Please enter manually:"
    read -p "Enter backend IP address: " IP
fi

echo "✅ Backend IP: $IP"
echo ""

# Step 3: Create frontend .env
echo "📝 Step 3: Configuring Frontend..."
if [ -d "frontend" ]; then
    echo "✅ Frontend directory found"
    
    # Create .env file
    ENV_FILE="frontend/.env"
    echo "EXPO_PUBLIC_API_URL=http://$IP:3000" > "$ENV_FILE"
    echo "✅ Created $ENV_FILE"
    echo "   Contents: EXPO_PUBLIC_API_URL=http://$IP:3000"
    
    # Check if node_modules exists
    if [ ! -d "frontend/node_modules" ]; then
        echo "📥 Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    else
        echo "✅ Frontend dependencies installed"
    fi
else
    echo "❌ Frontend directory not found!"
    exit 1
fi

# Step 4: Instructions
echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start Backend Server:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. Start Frontend (on each device):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Scan QR code with Expo Go on each device"
echo ""
echo "4. Test Temperature Sync:"
echo "   - On one device, trigger heat mode (press temperature card)"
echo "   - All other devices should sync within 200ms"
echo ""
echo "🔧 Troubleshooting:"
echo "   - Make sure all devices are on the same WiFi"
echo "   - Check backend is running: curl http://$IP:3000/health"
echo "   - Check .env file: cat frontend/.env"
echo ""

