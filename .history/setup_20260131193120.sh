#!/usr/bin/env bash

echo "🎯 Atmos - Real-time Team Wellness Monitor"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ npm $(npm -v) detected"
echo ""

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB CLI tools found"
else
    echo "⚠️  MongoDB CLI tools not found"
    echo "   (You still need MongoDB running - start 'mongod' in another terminal)"
fi
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..
echo ""

echo "✅ Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Make sure MongoDB is running (mongod)"
echo "   2. Open two terminal windows:"
echo "      Terminal 1: cd server && npm run dev"
echo "      Terminal 2: cd client && npm start"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "🧪 To seed test data:"
echo "   cd server && node seed.js"
echo ""
echo "Test accounts (after seeding):"
echo "   Manager: manager@test.com / test123"
echo "   Employee: employee1@test.com / test123"
echo ""
