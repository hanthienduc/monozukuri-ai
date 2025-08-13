# Documentation Structure for DDD/TDD Workflow

This documentation structure supports strict Documentation-Driven Development (DDD) and Test-Driven Development (TDD) practices for the Manufacturing Inquiry Assistant project.

## 📁 Directory Structure

```
docs/
├── api/                    # API specifications (OpenAPI, GraphQL)
│   ├── openapi/           # OpenAPI 3.0 specifications
│   ├── graphql/           # GraphQL schemas
│   └── examples/          # Request/response examples
├── architecture/          # Architecture documentation
│   ├── decisions/         # ADRs (Architecture Decision Records)
│   ├── diagrams/          # System diagrams (Mermaid, PlantUML)
│   └── patterns/          # Design patterns and conventions
├── test-plans/            # Test specifications and plans
│   ├── unit/             # Unit test specifications
│   ├── integration/      # Integration test plans
│   ├── e2e/              # End-to-end test scenarios
│   └── performance/      # Performance test criteria
├── features/             # Feature documentation
│   └── [feature-name]/   # Per-feature documentation
│       ├── README.md     # Feature overview
│       ├── api-spec.yaml # API specification
│       ├── test-plan.md  # Test specification
│       └── workflow.md   # Implementation workflow
└── templates/            # Reusable templates

```

## 🔄 DDD/TDD Workflow

### Phase 1: Documentation (Before ANY code)
1. Create feature folder in `docs/features/[feature-name]/`
2. Write complete API specification
3. Document acceptance criteria
4. Get stakeholder approval

### Phase 2: Test Planning (Before implementation)
1. Create test specifications in `docs/test-plans/`
2. Write test scenarios based on documentation
3. Define performance criteria
4. Review with test-quality-engineer agent

### Phase 3: Implementation
1. Write failing tests first (TDD red phase)
2. Implement minimal code to pass tests (TDD green phase)
3. Refactor and optimize (TDD refactor phase)
4. Update documentation if needed

## 📋 Document Templates

- [API Specification Template](./templates/api-specification.yaml)
- [Test Plan Template](./templates/test-plan.md)
- [Architecture Decision Record](./templates/adr-template.md)
- [Feature Documentation](./templates/feature-template.md)

## ✅ Checklist Before Coding

- [ ] API specification complete and reviewed
- [ ] Test plan documented and approved
- [ ] Architecture decisions recorded
- [ ] Examples provided for all endpoints
- [ ] Error scenarios documented
- [ ] Performance requirements defined
- [ ] Security requirements specified

## 🚫 Anti-Patterns to Avoid

1. **Writing code before documentation** - Always document first
2. **Skipping test specifications** - Tests must be planned before writing
3. **Documentation drift** - Keep docs in sync with implementation
4. **Incomplete error documentation** - Document all error cases
5. **Missing examples** - Provide examples for every endpoint

## 📊 Documentation Quality Metrics

- **Completeness**: All endpoints, models, and errors documented
- **Accuracy**: Documentation matches implementation 100%
- **Examples**: At least 2 examples per endpoint
- **Test Coverage**: Test plans cover >95% of functionality
- **Review Status**: All docs reviewed before implementation

## 🔗 Quick Links

- [Current Features](./features/)
- [API Documentation](./api/)
- [Architecture Decisions](./architecture/decisions/)
- [Test Plans](./test-plans/)
- [Templates](./templates/)