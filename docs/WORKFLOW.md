# DDD/TDD Development Workflow Guide

## Quick Start: New Feature Development

### Step 1: Documentation Phase (Before ANY Code!)
```bash
# 1. Create feature folder
mkdir -p docs/features/my-feature

# 2. Copy templates
cp docs/templates/feature-template.md docs/features/my-feature/README.md
cp docs/templates/api-specification.yaml docs/features/my-feature/api-spec.yaml
cp docs/templates/test-plan.md docs/features/my-feature/test-plan.md

# 3. Fill out documentation completely
# 4. Get review from tech-lead-architect agent
```

### Step 2: Test Development Phase
```bash
# 1. Write failing tests based on documentation
# 2. No implementation yet - tests MUST fail
# 3. Get review from test-quality-engineer agent
```

### Step 3: Implementation Phase
```bash
# 1. Write minimal code to pass tests
# 2. Follow API specification exactly
# 3. Run tests continuously
# 4. Get code review
```

### Step 4: Refactoring Phase
```bash
# 1. Optimize performance
# 2. Improve code quality
# 3. Ensure all tests still pass
# 4. Update documentation if needed
```

## Agent Usage for Each Phase

### Documentation Phase
```bash
# Use tech-lead-architect for API design
"Review my API specification for the inquiry processing feature"

# Use ddd-tdd-coordinator to verify workflow
"Validate that my documentation is complete for starting tests"
```

### Test Phase
```bash
# Use test-quality-engineer for test planning
"Create comprehensive tests for the inquiry API based on the specification"

# Tests must fail initially (RED phase)
"Verify all tests are failing as expected before implementation"
```

### Implementation Phase
```bash
# Use backend-api-engineer for API implementation
"Implement the inquiry endpoint following the specification"

# Use react-frontend-engineer for UI
"Build the inquiry form component based on the API contract"
```

### Validation Phase
```bash
# Use database-performance-engineer for optimization
"Optimize the Firestore queries for the inquiry feature"

# Use security-auth-engineer for security review
"Review the inquiry endpoint for security vulnerabilities"
```

## Workflow Gates (Mandatory Checkpoints)

### Gate 1: Documentation Complete
- [ ] API specification reviewed
- [ ] Test scenarios identified
- [ ] ADR written if needed
- [ ] Examples provided
- **Blocker**: Cannot proceed to tests without approval

### Gate 2: Tests Written
- [ ] All tests written and failing
- [ ] Test coverage plan > 95%
- [ ] Performance criteria defined
- [ ] Security tests included
- **Blocker**: Cannot proceed to implementation without failing tests

### Gate 3: Implementation Complete
- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Performance targets met
- **Blocker**: Cannot merge without all tests passing

### Gate 4: Production Ready
- [ ] Security review passed
- [ ] Performance validated
- [ ] Monitoring configured
- [ ] Rollback plan ready
- **Blocker**: Cannot deploy without final approval

## Common Commands

### Check Documentation Status
```bash
ls -la docs/features/[feature-name]/
# Should see: README.md, api-spec.yaml, test-plan.md
```

### Run Tests
```bash
# Frontend tests
pnpm test:frontend

# Backend tests
pytest tests/

# E2E tests
pnpm test:e2e

# All tests with coverage
pnpm test:coverage
```

### Validate API Specification
```bash
# Validate OpenAPI spec
npx @apidevtools/swagger-cli validate docs/api/openapi/[feature].yaml
```

### Performance Testing
```bash
# Run K6 load tests
k6 run tests/performance/[feature].js
```

## Red Flags That Block Progress

### Documentation Phase
- ❌ Incomplete API specification
- ❌ Missing error documentation
- ❌ No examples provided
- ❌ Acceptance criteria unclear

### Test Phase
- ❌ Tests passing before implementation (should fail!)
- ❌ Missing edge case tests
- ❌ No performance benchmarks
- ❌ Security tests absent

### Implementation Phase
- ❌ Code not matching specification
- ❌ Tests modified to pass (instead of fixing code)
- ❌ Performance targets not met
- ❌ Security vulnerabilities found

## Tips for Success

1. **Use the right agent for each task** - They have specialized knowledge
2. **Don't skip documentation** - It saves time later
3. **Write tests first** - It clarifies requirements
4. **Keep tests failing initially** - Ensures they actually test something
5. **Refactor regularly** - Don't accumulate technical debt
6. **Update docs continuously** - Prevent documentation drift
7. **Use templates** - Ensures consistency
8. **Get reviews early** - Catch issues before they compound
9. **Track progress** - Use the workflow status in feature docs
10. **Communicate blockers** - Don't work in isolation

## Example: Complete Feature Flow

### 1. Start Feature
```
Agent: ddd-tdd-coordinator
Task: "Start new feature: bulk inquiry processing"
```

### 2. Document API
```
Agent: tech-lead-architect
Task: "Review my bulk processing API specification"
```

### 3. Write Tests
```
Agent: test-quality-engineer
Task: "Create test suite for bulk processing based on spec"
```

### 4. Implement Backend
```
Agent: backend-api-engineer
Task: "Implement bulk processing endpoint to pass tests"
```

### 5. Build Frontend
```
Agent: react-frontend-engineer
Task: "Create bulk upload UI component"
```

### 6. Optimize Performance
```
Agent: database-performance-engineer
Task: "Optimize bulk insert operations"
```

### 7. Security Review
```
Agent: security-auth-engineer
Task: "Review bulk processing for security issues"
```

### 8. Deploy
```
Agent: devops-cloud-engineer
Task: "Deploy bulk processing feature to staging"
```

## Metrics for Success

- **Documentation Completeness**: 100% before coding
- **Test Coverage**: > 95%
- **Tests Written First**: 100% of features
- **API Contract Adherence**: 100%
- **Performance Targets Met**: > 95% of features
- **Security Issues**: 0 critical/high
- **Documentation Drift**: < 5%
- **Rework Due to Missing Specs**: < 10%

---

Remember: **Documentation → Tests → Code → Refactor**

No shortcuts. No exceptions. Quality through process.