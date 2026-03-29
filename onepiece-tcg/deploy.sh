#!/bin/bash

echo "🏴‍☠️ One Piece TCG Collector - Deployment Script"
echo "================================================"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first."
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Initializing database..."
npm run init-db

echo ""
echo "💰 Running initial price update..."
npm run update

echo ""
echo "🚀 Starting the server..."
echo "   API: http://localhost:3456/api"
echo "   App: http://localhost:3456"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm start
