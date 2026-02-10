#!/usr/bin/env pwsh

Write-Host "🎯 Atmos - Real-time Team Wellness Monitor" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

try {
    $npmVersion = npm -v
    Write-Host "✅ npm $npmVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
if (Get-Command mongod -ErrorAction SilentlyContinue) {
    Write-Host "✅ MongoDB CLI tools found" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB not found in PATH" -ForegroundColor Yellow
    Write-Host "   (Make sure MongoDB is running: mongod)" -ForegroundColor Yellow
}
Write-Host ""

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
Push-Location server
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Pop-Location
Write-Host ""

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
Push-Location client
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Pop-Location
Write-Host ""

Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Make sure MongoDB is running (mongod in another terminal)" -ForegroundColor White
Write-Host "   2. Open two terminal windows:" -ForegroundColor White
Write-Host "      Terminal 1: cd server && npm run dev" -ForegroundColor White
Write-Host "      Terminal 2: cd client && npm start" -ForegroundColor White
Write-Host "   3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "🧪 To seed test data:" -ForegroundColor Cyan
Write-Host "   cd server && node seed.js" -ForegroundColor White
Write-Host ""
Write-Host "Test accounts (after seeding):" -ForegroundColor Cyan
Write-Host "   Manager: manager@test.com / test123" -ForegroundColor Yellow
Write-Host "   Employee: employee1@test.com / test123" -ForegroundColor Yellow
Write-Host ""
