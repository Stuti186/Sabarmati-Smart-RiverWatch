#!/bin/bash

# Find Backend IP Address Script
# Helps configure EXPO_PUBLIC_API_URL for monorepo setup

echo "🔍 Finding Backend IP Address..."
echo ""

# Detect OS and get IP
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    # Linux or Mac
    IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    IP=$(ipconfig | grep -i "IPv4" | grep -Eo '([0-9]*\.){3}[0-9]*' | head -n 1)
else
    echo "❌ Unsupported OS"
    exit 1
fi

if [ -z "$IP" ]; then
    echo "❌ Could not detect IP address"
    echo "Please find your IP manually:"
    echo "  Windows: ipconfig"
    echo "  Mac/Linux: ifconfig"
    exit 1
fi

echo "✅ Found IP Address: $IP"
echo ""
echo "📝 Add this to frontend/.env file:"
echo ""
echo "EXPO_PUBLIC_API_URL=http://$IP:3000"
echo ""
echo "💡 To create the file automatically, run:"
echo "   echo 'EXPO_PUBLIC_API_URL=http://$IP:3000' > frontend/.env"
echo ""

# Ask if user wants to create .env file
read -p "Create frontend/.env file automatically? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "EXPO_PUBLIC_API_URL=http://$IP:3000" > frontend/.env
    echo "✅ Created frontend/.env file"
    echo ""
    echo "📋 Contents:"
    cat frontend/.env
    echo ""
    echo "🚀 Now restart Expo: cd frontend && npm start"
fi

