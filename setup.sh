#!/bin/bash

echo "🚀 NugVerse ChatAI Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"
cd ..
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"
cd ..
echo ""

# Check for backend .env file
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo "⚠️  IMPORTANT: Edit backend/.env and add your OpenAI API key!"
    echo ""
fi

# Check for frontend .env.local file
if [ ! -f "frontend/.env.local" ]; then
    echo "✅ Creating frontend/.env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > frontend/.env.local
fi

echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Add your OpenAI API key to backend/.env"
echo "   Edit: backend/.env"
echo "   Add: OPENAI_API_KEY=your_actual_key_here"
echo ""
echo "2. Start the backend (in one terminal):"
echo "   cd backend && npm run start:dev"
echo ""
echo "3. Start the frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed instructions, see README.md"
echo ""

