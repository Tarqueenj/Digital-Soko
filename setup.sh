#!/bin/bash

# Digital Soko - Quick Setup Script
# This script helps you get the entire system running quickly

echo "🚀 Digital Soko - Quick Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if MongoDB URI is set
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  Warning: MONGODB_URI environment variable not set"
    echo "   Please set your MongoDB connection string"
    echo "   Example: export MONGODB_URI='mongodb://localhost:27017/digital-soko'"
    echo ""
fi

echo "✅ Prerequisites check passed"
echo ""

# Setup backend
echo "📦 Setting up backend..."
cd Backend

if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
else
    echo "   Dependencies already installed"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cat > .env << EOF
NODE_ENV=development
PORT=5000

# Database - UPDATE THIS WITH YOUR MONGODB URI
MONGODB_URI=${MONGODB_URI:-mongodb://localhost:27017/digital-soko}

# JWT Configuration
JWT_SECRET=digital-soko-secret-key-$(date +%s)
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=digital-soko-refresh-secret-$(date +%s)
JWT_REFRESH_EXPIRE=7d

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOF
    echo "   ✅ .env file created. Please update MONGODB_URI!"
else
    echo "   .env file already exists"
fi

# Create admin user
echo "   Creating admin user..."
node create-admin.js

echo "✅ Backend setup complete"
cd ..
echo ""

# Setup frontend
echo "🌐 Setting up frontend..."
echo "   Frontend uses vanilla JavaScript - no build process needed"
echo "   Files are ready to serve"
echo ""

# Start servers
echo "🚀 Starting servers..."
echo ""
echo "📋 Instructions:"
echo "   1. Start backend: cd Backend && npm run dev"
echo "   2. Start frontend: python3 -m http.server 3000 (or use live-server)"
echo "   3. Open: http://localhost:3000"
echo "   4. Admin login: admin@example.com / admin123"
echo ""

echo "🔗 Quick Links:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - Admin Dashboard: http://localhost:3000/admin-dashboard.html"
echo "   - API Documentation: Backend/API_EXAMPLES.md"
echo ""

echo "📚 For more details, see README.md"
echo ""
echo "🎉 Setup complete! Happy trading! 🌟"
