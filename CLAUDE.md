# Manufacturing Inquiry Assistant - AI Project Context

## Project Overview
You are helping build a **Manufacturing Inquiry Assistant**, an AI-powered full-stack application that connects manufacturers with international markets through intelligent inquiry processing and multilingual support. This project demonstrates capabilities aligned with Monoya's tech stack and mission.

**Target Company**: Monoya - A startup digitizing OEM workflows and connecting Japanese manufacturers with global markets.

## 🔄 Development Methodology: DDD/TDD

### Documentation-Driven Development (DDD)
We follow strict Documentation-Driven Development where **NO CODE** is written without complete documentation.

### Test-Driven Development (TDD) 
We follow the Red-Green-Refactor cycle where **NO IMPLEMENTATION** begins without failing tests.

### Development Phases (MANDATORY)

#### Phase 1: Documentation (20-30% of time)
- Create feature folder: `docs/features/[feature-name]/`
- Write complete API specification using `docs/templates/api-specification.yaml`
- Document all requirements, edge cases, and acceptance criteria
- Create ADRs for architectural decisions
- **Gate**: Documentation reviewed and approved by tech-lead-architect

#### Phase 2: Test Specification (25-35% of time)
- Create comprehensive test plan using `docs/templates/test-plan.md`
- Write failing unit tests (RED phase)
- Write integration test specifications
- Define performance criteria
- **Gate**: All tests written, failing, and reviewed by test-quality-engineer

#### Phase 3: Implementation (30-40% of time)
- Write minimal code to pass tests (GREEN phase)
- Follow documented API contracts exactly
- No features beyond specifications
- **Gate**: All tests passing, code reviewed

#### Phase 4: Refactoring (15-20% of time)
- Optimize performance
- Improve code quality
- Update documentation if needed
- **Gate**: Performance targets met, final review complete

### 🤖 Agent Coordination
Specialized agents enforce this workflow:
- **ddd-tdd-coordinator**: Orchestrates entire workflow
- **tech-lead-architect**: Reviews documentation and architecture (Uses Context7 for latest patterns)
- **test-quality-engineer**: Ensures TDD compliance
- **backend-api-engineer**: Implements to specification (Uses Context7 for FastAPI best practices)
- **react-frontend-engineer**: Builds UI per API contracts (Uses Context7 for React patterns)
- **ai-ml-rag-engineer**: Implements AI/ML features (Uses Context7 for OpenAI/Weaviate docs)
- **devops-cloud-engineer**: Infrastructure and deployment (Uses Context7 for cloud services)
- **security-auth-engineer**: Security implementation (Uses Context7 for auth libraries)
- **database-performance-engineer**: Database optimization (Uses Context7 for DB best practices)
- **Other agents**: Support their specialized domains

**Note**: All agents leverage Context7 MCP for real-time access to latest library documentation, ensuring use of current best practices and avoiding deprecated patterns.

### 📁 Documentation Structure
```
docs/
├── api/                    # API specifications
├── architecture/          # ADRs and system design
├── test-plans/           # Test specifications
├── features/             # Feature documentation
│   └── [feature-name]/
│       ├── README.md     # Feature overview
│       ├── api-spec.yaml # API specification
│       ├── test-plan.md  # Test specification
│       └── workflow.md   # Implementation status
└── templates/            # Standard templates
```

## 📁 MANDATORY PROJECT STRUCTURE

All agents MUST follow this exact structure. Any deviation requires explicit approval from tech-lead-architect.

```
monozukuri-ai/
├── apps/                          # Application packages
│   ├── web/                       # React frontend application
│   │   ├── src/
│   │   │   ├── components/       # React components
│   │   │   │   ├── inquiry/      # Inquiry submission components
│   │   │   │   ├── classification/ # Classification result components
│   │   │   │   ├── dashboard/    # Dashboard components
│   │   │   │   ├── common/       # Shared components
│   │   │   │   └── layout/       # Layout components
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   ├── stores/           # Zustand state stores
│   │   │   ├── services/         # API service layer
│   │   │   ├── utils/            # Utility functions
│   │   │   ├── types/            # TypeScript type definitions
│   │   │   ├── styles/           # Global styles
│   │   │   ├── test/             # Test utilities and mocks
│   │   │   ├── App.tsx           # Main App component
│   │   │   ├── main.tsx          # Entry point
│   │   │   └── index.css         # Global CSS
│   │   ├── public/               # Static assets
│   │   ├── package.json          # Frontend dependencies
│   │   ├── tsconfig.json         # TypeScript config
│   │   ├── vite.config.ts        # Vite configuration
│   │   ├── tailwind.config.js    # Tailwind CSS config
│   │   ├── postcss.config.js     # PostCSS config
│   │   └── .env.example          # Environment variables example
│   │
│   ├── api/                       # FastAPI backend application
│   │   ├── app/
│   │   │   ├── api/              # API endpoints
│   │   │   │   ├── v1/           # API version 1
│   │   │   │   │   ├── endpoints/ # Endpoint modules
│   │   │   │   │   └── router.py # API router
│   │   │   ├── core/             # Core functionality
│   │   │   │   ├── config.py     # Configuration
│   │   │   │   ├── security.py   # Security utilities
│   │   │   │   └── exceptions.py # Custom exceptions
│   │   │   ├── models/           # Pydantic models
│   │   │   ├── services/         # Business logic services
│   │   │   ├── db/               # Database layer
│   │   │   │   ├── firestore.py  # Firestore client
│   │   │   │   └── redis.py      # Redis client
│   │   │   ├── ml/               # Machine learning services
│   │   │   │   ├── classification.py # Classification engine
│   │   │   │   └── embeddings.py # Embedding generation
│   │   │   ├── main.py           # FastAPI app entry
│   │   │   └── __init__.py
│   │   ├── tests/                # Backend tests
│   │   │   ├── unit/             # Unit tests
│   │   │   ├── integration/      # Integration tests
│   │   │   └── fixtures/         # Test fixtures
│   │   ├── requirements.txt      # Python dependencies
│   │   ├── Dockerfile            # Container configuration
│   │   └── .env.example          # Environment variables
│   │
│   └── services/                  # Microservices
│       ├── websocket/            # WebSocket server (Go)
│       │   ├── cmd/              # Command entry points
│       │   ├── internal/         # Internal packages
│       │   ├── pkg/              # Public packages
│       │   ├── go.mod            # Go module file
│       │   └── Dockerfile
│       └── processor/            # Data processor (Rust)
│           ├── src/              # Rust source code
│           ├── Cargo.toml        # Rust dependencies
│           └── Dockerfile
│
├── packages/                      # Shared packages
│   ├── ui/                       # Shared UI components
│   │   ├── src/
│   │   └── package.json
│   ├── types/                    # Shared TypeScript types
│   │   ├── src/
│   │   └── package.json
│   └── utils/                    # Shared utilities
│       ├── src/
│       └── package.json
│
├── infrastructure/               # Infrastructure as Code
│   ├── terraform/                # Terraform configurations
│   │   ├── modules/              # Terraform modules
│   │   ├── environments/         # Environment configs
│   │   └── main.tf
│   ├── k8s/                      # Kubernetes manifests
│   │   ├── base/                 # Base configurations
│   │   └── overlays/             # Environment overlays
│   └── docker/                   # Docker configurations
│       └── docker-compose.yml    # Local development
│
├── docs/                         # Documentation (DDD/TDD MANDATORY)
│   ├── api/                      # API documentation
│   │   ├── openapi/              # OpenAPI specifications
│   │   └── examples/             # API usage examples
│   ├── architecture/             # Architecture decisions
│   │   └── adr/                  # ADR documents
│   ├── features/                 # Feature documentation
│   │   └── [feature-name]/       # Per-feature docs
│   │       ├── README.md         # Feature overview
│   │       ├── api-spec.yaml     # API specification
│   │       ├── test-plan.md      # Test specification
│   │       └── workflow.md       # Development status
│   ├── test-plans/               # Test specifications
│   │   ├── unit/                 # Unit test plans
│   │   ├── integration/          # Integration test plans
│   │   ├── e2e/                  # E2E test plans
│   │   └── performance/          # Performance test plans
│   └── templates/                # Document templates
│       ├── api-specification.yaml
│       ├── test-plan.md
│       └── feature-template.md
│
├── scripts/                      # Build and deployment scripts
│   ├── setup.sh                  # Initial setup script
│   ├── deploy.sh                 # Deployment script
│   └── test.sh                   # Test runner script
│
├── .github/                      # GitHub configurations
│   ├── workflows/                # GitHub Actions
│   │   ├── ci.yml                # CI pipeline
│   │   ├── cd.yml                # CD pipeline
│   │   └── security.yml          # Security scanning
│   └── CODEOWNERS               # Code ownership
│
├── .claude/                      # Claude-specific configurations
│   ├── agents/                   # Agent configurations
│   └── settings.json             # Claude settings
│
├── CLAUDE.md                     # THIS FILE - Project context
├── PROJECT_ROADMAP.md           # Development roadmap
├── README.md                     # Project overview
├── package.json                  # Root package.json (monorepo)
├── pnpm-workspace.yaml          # PNPM workspace config
├── turbo.json                   # Turborepo config
├── .gitignore                   # Git ignore file
├── .env.example                 # Root environment example
└── LICENSE                      # License file
```

### 🚨 CRITICAL RULES FOR ALL AGENTS

1. **NEVER** create files outside this structure without explicit approval
2. **ALWAYS** use the exact paths specified above
3. **NEVER** mix backend code in frontend directories or vice versa
4. **ALWAYS** put tests next to the code they test (except for backend which uses separate test directory)
5. **NEVER** put implementation code in docs/ directory
6. **ALWAYS** use TypeScript for frontend, Python for backend API, Go for websocket, Rust for data processing

### 📦 Package Management Rules

- **Frontend (apps/web/)**: Use PNPM for package management
- **Backend (apps/api/)**: Use pip with requirements.txt or poetry
- **Go services**: Use go.mod
- **Rust services**: Use Cargo.toml
- **Monorepo**: Managed by PNPM workspaces and Turborepo

### 🔧 Configuration Files Location

| Config File | Location | Purpose |
|------------|----------|---------|
| package.json | apps/web/ | Frontend dependencies |
| requirements.txt | apps/api/ | Backend dependencies |
| tsconfig.json | apps/web/ | TypeScript config |
| vite.config.ts | apps/web/ | Vite bundler config |
| tailwind.config.js | apps/web/ | Tailwind CSS config |
| .env | Root and each app | Environment variables |
| docker-compose.yml | infrastructure/docker/ | Local development |

## Technical Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand/React Query
- **Real-time**: WebSocket for chat, Firestore streams for data sync
- **Performance**: Code splitting, lazy loading, bundle optimization

### Backend
- **Primary API**: Python with FastAPI
- **Microservices**: Go for high-performance services, Rust for data processing
- **API Design**: RESTful with GraphQL for complex queries
- **Authentication**: Firebase Auth with custom claims
- **Real-time**: WebSocket server for chat functionality

### AI/ML Infrastructure
- **LLM Integration**: OpenAI API, Ollama for local models
- **RAG Implementation**: 
  - Vector DB: Weaviate for semantic search
  - Embeddings: OpenAI text-embedding-3-small
  - Document chunking with overlap
- **Features**:
  - Inquiry classification
  - Content summarization
  - Multi-language translation
  - Semantic search

### Documentation & Library Management
- **Context7 MCP**: Integrated for real-time library documentation access
- **Library Updates**: Automated dependency tracking and version recommendations
- **Best Practices**: Context-aware code patterns and performance optimizations
- **Documentation Access**: Direct access to latest library docs via MCP server

### Database & Storage
- **Primary DB**: Firestore (NoSQL)
- **Vector Storage**: Weaviate
- **File Storage**: Google Cloud Storage
- **Caching**: Redis for session management
- **Search Index**: Algolia for full-text search (optional)

### Infrastructure
- **Container**: Docker/Podman
- **Orchestration**: Google Cloud Run
- **CI/CD**: GitHub Actions
- **IaC**: Terraform
- **Monitoring**: OpenTelemetry, Sentry
- **Logging**: Google Cloud Logging

## Core Features

### 1. Intelligent Inquiry Processing
```python
# Example: Classify manufacturing inquiries
async def classify_inquiry(text: str) -> InquiryClassification:
    """
    Classify inquiries into categories:
    - Quote Request
    - Technical Specification
    - Capability Question
    - Partnership Inquiry
    """
    # Implementation with LLM + confidence scoring
```

### 2. RAG-Powered Knowledge Base
- Index manufacturing specifications, standards, and documentation
- Semantic search across multi-language content
- Context-aware responses with source citations

### 3. Real-time Chat System
- WebSocket-based communication
- Streaming LLM responses
- Conversation memory management
- Multi-language support (EN/JP)

### 4. Performance Optimizations
- **Cold Start Mitigation**: Keep-alive pings, min instances
- **Bundle Optimization**: Dynamic imports, tree shaking
- **Query Optimization**: Composite indexes, query cursors
- **Caching Strategy**: Edge caching, memoization

## Project Structure
```
manufacturing-assistant/
├── apps/
│   ├── web/                 # React frontend
│   ├── api/                 # FastAPI backend
│   └── services/            # Go/Rust microservices
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── types/               # TypeScript definitions
│   └── utils/               # Shared utilities
├── infrastructure/
│   ├── terraform/           # IaC configurations
│   └── docker/              # Container configs
└── docs/
    ├── api/                 # API documentation
    └── architecture/        # System design docs
```

## Development Workflow

### Environment Setup
```bash
# Required: Node.js 20+, Python 3.11+, Go 1.21+, Docker
# Optional: Rust for data processing services
```

### Key Commands
- `pnpm dev` - Start development servers
- `pnpm test` - Run test suites
- `pnpm build` - Build for production
- `pnpm deploy` - Deploy to staging/production

### Git Workflow with DDD/TDD
1. Create feature branch from `develop`
2. **Document first**: Complete API specs and requirements
3. **Test second**: Write failing tests
4. **Code third**: Implement to pass tests
5. PR requires:
   - Documentation complete
   - All tests passing (>95% coverage)
   - Code review approved
   - Performance validated
6. Squash merge to `main`
7. Automatic deployment on merge

### Feature Development Checklist
- [ ] Feature documented in `docs/features/[name]/`
- [ ] API specification reviewed
- [ ] Test plan approved
- [ ] Tests written and failing
- [ ] Implementation complete
- [ ] All tests passing
- [ ] Performance targets met
- [ ] Security review passed
- [ ] Documentation updated

## Performance Requirements
- **API Response Time**: < 200ms p95
- **LLM Streaming**: First token < 1s
- **Bundle Size**: < 300KB initial load
- **Cold Start**: < 3s
- **Firestore Queries**: < 100ms

## Security Considerations
- Firebase Auth with role-based access
- API rate limiting
- Input sanitization for LLM prompts
- Secure storage of API keys
- CORS configuration
- Content Security Policy

## Testing Strategy (TDD Mandatory)

### Test-First Development
**RULE**: Write tests BEFORE implementation. No exceptions.

### Test Coverage Requirements
- **Unit Tests**: 95% coverage (Vitest for frontend, pytest for backend)
- **Integration**: All API endpoints must have tests
- **E2E**: Critical user flows with Playwright
- **Performance**: Lighthouse CI for frontend, K6 for load testing
- **Security**: OWASP ZAP scanning, input validation tests

### TDD Cycle
1. **RED**: Write failing test based on documentation
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Improve code while keeping tests green

### Test Documentation
- Test plans in `docs/test-plans/`
- Use `docs/templates/test-plan.md` template
- Document test scenarios before writing tests
- Include performance benchmarks

## Deployment
- **Staging**: Automatic on PR merge to develop
- **Production**: Manual approval required
- **Rollback**: One-click rollback via GitHub Actions
- **Monitoring**: Real-time alerts via Sentry

## Key Implementation Details

### LLM Integration
```python
# Streaming response pattern
async def stream_llm_response(prompt: str):
    async for chunk in llm.stream(prompt):
        yield chunk
```

### Vector Search
```python
# Semantic search implementation
def semantic_search(query: str, limit: int = 10):
    embedding = get_embedding(query)
    results = weaviate_client.query(
        vector=embedding,
        limit=limit
    )
    return results
```

### Firestore Optimization
```typescript
// Efficient query with composite index
const inquiries = await db
  .collection('inquiries')
  .where('status', '==', 'active')
  .where('createdAt', '>', lastWeek)
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();
```

## Mobile Roadmap
- Native iOS (Swift) and Android (Kotlin) apps
- Shared backend via REST/GraphQL APIs
- Push notifications for inquiry updates
- Offline-first architecture

## Success Metrics
- Query classification accuracy > 95%
- User satisfaction score > 4.5/5
- Response time improvement > 50%
- Multi-language accuracy > 90%

## Current Focus Areas
1. Optimizing RAG pipeline for manufacturing domain
2. Reducing cold start latency on Cloud Run
3. Implementing real-time collaborative features
4. Expanding language support beyond EN/JP

## Technical Decisions

### Why Firestore?
- Real-time synchronization capabilities
- Offline support for mobile apps
- Seamless integration with Firebase Auth
- Scalable NoSQL for varied document structures

### Why Weaviate?
- Native vector search capabilities
- Multi-tenancy support
- GraphQL API for complex queries
- Hybrid search (vector + keyword)

### Why FastAPI + Go/Rust?
- FastAPI: Rapid development with Python, async support
- Go: High-performance microservices, excellent concurrency
- Rust: Memory safety for data processing, WebAssembly potential

## Common Pitfalls to Avoid

### Technical Pitfalls
1. Don't index sensitive manufacturing data in vector DB
2. Implement proper rate limiting for LLM calls
3. Cache embeddings to reduce API costs
4. Use Firestore security rules, not just API validation
5. Monitor bundle size growth with each feature
6. **Avoid outdated library patterns** - Always check Context7 for current best practices
7. **Don't use deprecated APIs** - Verify library versions against Context7 recommendations
8. **Prevent version conflicts** - Follow docs/LIBRARY_UPDATE_RECOMMENDATIONS.md

### Process Pitfalls (DDD/TDD)
1. **Writing code before documentation** - Always document first
2. **Writing tests after implementation** - Tests must come first
3. **Skipping test specifications** - Plan tests before writing them
4. **Documentation drift** - Keep docs synchronized with code
5. **Incomplete error documentation** - Document all error cases
6. **Missing examples** - Provide examples for every API endpoint
7. **Skipping refactor phase** - Always refactor after green tests
8. **Not using templates** - Always use docs/templates/
9. **Working in isolation** - Coordinate with specialized agents
10. **Bypassing gates** - Each phase must be reviewed and approved

## References
- [Monoya Tech Stack](https://www.tokyodev.com/companies/monoya/jobs/full-stack-engineer)
- [Firebase Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [RAG Implementation Guide](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [Cloud Run Optimization](https://cloud.google.com/run/docs/tips)

## Questions to Consider
1. How should we handle multi-tenant data isolation?
2. What's the optimal chunking strategy for manufacturing documents?
3. Should we implement a feedback loop for classification accuracy?
4. How do we handle seasonal traffic spikes?
5. What's our strategy for LLM cost optimization?

---

*Last Updated: August 2025*
*Project Status: Initial Development Phase*