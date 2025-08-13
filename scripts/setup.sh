#!/bin/bash

# Manufacturing Inquiry Assistant - Setup Script

set -e

echo "🚀 Setting up Manufacturing Inquiry Assistant..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be 20 or higher. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check PNPM
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing PNPM..."
    npm install -g pnpm@8
fi
echo "✅ PNPM $(pnpm -v)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+"
    exit 1
fi
echo "✅ Python $(python3 --version)"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Docker is required for local development."
fi

# Setup environment files
echo "🔧 Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created root .env file"
fi

if [ ! -f apps/web/.env ]; then
    cp apps/web/.env.example apps/web/.env 2>/dev/null || echo "⚠️  apps/web/.env.example not found"
fi

if [ ! -f apps/api/.env ]; then
    cp apps/api/.env.example apps/api/.env
    echo "✅ Created apps/api/.env file"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
pnpm install

# Setup Python virtual environment
echo "🐍 Setting up Python environment..."
cd apps/api
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null || true
pip install --upgrade pip
pip install -r requirements.txt
cd ../..

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p apps/web/dist
mkdir -p apps/api/logs
mkdir -p infrastructure/terraform/environments/{dev,staging,prod}

# Initialize git hooks
echo "🪝 Setting up git hooks..."
if [ -d .git ]; then
    pnpm husky install 2>/dev/null || true
fi

echo "
✅ Setup complete!

📝 Next steps:
1. Update .env files with your configuration
2. Run 'pnpm dev' to start the development servers
3. Or use 'docker-compose up' for containerized development

🔧 Available commands:
- pnpm dev          : Start all development servers
- pnpm web:dev      : Start frontend only
- pnpm api:dev      : Start backend only
- pnpm test         : Run all tests
- pnpm build        : Build all applications

📚 Documentation:
- Project overview: README.md
- Development guide: docs/DEVELOPMENT.md
- API documentation: docs/api/

Happy coding! 🎉
"