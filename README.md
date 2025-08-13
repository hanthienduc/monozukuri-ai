# 🏭 Manufacturing Inquiry Assistant

An AI-powered full-stack application that connects manufacturers with international markets through intelligent inquiry processing and multilingual support.

## 🎯 Overview

The Manufacturing Inquiry Assistant helps manufacturers:
- Classify and route customer inquiries automatically
- Process multi-language inquiries (English/Japanese)
- Provide real-time responses with AI assistance
- Track and analyze inquiry patterns
- Connect with global markets efficiently

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│   FastAPI   │────▶│   OpenAI    │
│   Frontend  │     │   Backend   │     │     LLM     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Zustand   │     │  Firestore  │     │   Weaviate  │
│    Store    │     │   Database  │     │  Vector DB  │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- PNPM 8+
- Docker (optional, for containerized development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/monozukuri-ai.git
cd monozukuri-ai

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start all services (frontend + backend)
pnpm dev

# Or start services individually
pnpm web:dev  # Frontend only
pnpm api:dev  # Backend only

# Using Docker Compose
docker-compose -f infrastructure/docker/docker-compose.yml up
```

## 📁 Project Structure

See [CLAUDE.md](./CLAUDE.md) for the complete mandatory project structure that all developers and agents must follow.

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for data fetching

### Backend
- **FastAPI** (Python) for REST API
- **OpenAI GPT-4** for LLM capabilities
- **Firestore** for document storage
- **Redis** for caching
- **Weaviate** for vector search

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

---

Built with ❤️ for the manufacturing industry