# Test Plan: Manufacturing Inquiry Classification

## Overview
**Feature**: Manufacturing Inquiry Classification API  
**API Specification**: [api-spec.yaml](./api-spec.yaml)  
**Test Coverage Target**: 95%  
**Performance Target**: < 200ms p95  
**Test Phase Duration**: 3 days  

## Test Strategy

### Scope
- **In Scope**: 
  - Classification accuracy validation
  - API endpoint functionality
  - Performance under load
  - Multi-language support (EN/JP)
  - Error handling and edge cases
  - Security validation
- **Out of Scope**: 
  - UI testing (separate test plan)
  - Batch processing (future feature)
  - Voice/audio processing
- **Test Environment**: Docker containers with mocked OpenAI API
- **Test Data Requirements**: 
  - 500+ labeled manufacturing inquiries
  - Mix of EN/JP content
  - Edge cases and malformed inputs

### Test Types
- [x] Unit Tests (Target: 95% coverage)
- [x] Integration Tests
- [x] E2E Tests
- [x] Performance Tests
- [x] Security Tests
- [ ] Accessibility Tests (N/A for API)

## Unit Test Specifications

### Test Suite: Classification Engine

#### Test Case 1: Classify Quote Request
**Given**: A clear quote request text  
**When**: Classification is performed  
**Then**: Returns QUOTE_REQUEST with >0.9 confidence  

```python
# test_classification_engine.py
import pytest
from app.services.classification import ClassificationEngine

@pytest.mark.asyncio
async def test_should_classify_quote_request_with_high_confidence():
    # Arrange
    engine = ClassificationEngine()
    inquiry_text = "We need a quote for 1000 aluminum brackets with custom drilling"
    
    # Act
    result = await engine.classify(inquiry_text)
    
    # Assert
    assert result.primary_category == "QUOTE_REQUEST"
    assert result.confidence > 0.9
    assert result.language == "en"
```

#### Test Case 2: Classify Japanese Technical Spec
**Given**: Japanese technical specification text  
**When**: Classification is performed  
**Then**: Correctly identifies language and category  

```python
@pytest.mark.asyncio
async def test_should_classify_japanese_technical_spec():
    # Arrange
    engine = ClassificationEngine()
    inquiry_text = "SUS304ステンレス鋼で0.001mmの公差で製造できますか？"
    
    # Act
    result = await engine.classify(inquiry_text)
    
    # Assert
    assert result.primary_category == "TECHNICAL_SPECIFICATION"
    assert result.confidence > 0.8
    assert result.language == "ja"
```

#### Test Case 3: Handle Ambiguous Classification
**Given**: Text that could fit multiple categories  
**When**: Classification is performed  
**Then**: Returns multiple categories with similar confidence  

```python
@pytest.mark.asyncio
async def test_should_handle_ambiguous_classification():
    # Arrange
    engine = ClassificationEngine()
    inquiry_text = "Can you provide pricing for parts that meet ISO 9001 standards?"
    
    # Act
    result = await engine.classify(inquiry_text)
    
    # Assert
    assert len(result.all_categories) >= 2
    # Check top two categories have close confidence scores
    top_two = sorted(result.all_categories, key=lambda x: x.confidence, reverse=True)[:2]
    assert abs(top_two[0].confidence - top_two[1].confidence) < 0.2
```

### Edge Cases
- [x] Empty input handling
- [x] Maximum length validation (5000 chars)
- [x] Minimum length validation (10 chars)
- [x] Special characters and emojis
- [x] Mixed language input
- [x] Null/undefined handling
- [x] Concurrent request handling
- [x] Rate limiting behavior
- [x] Timeout scenarios

### Error Cases
- [x] Invalid input format
- [x] Authentication failure
- [x] Authorization failure
- [x] OpenAI API unavailable
- [x] Weaviate connection failure
- [x] Redis cache miss
- [x] Network timeout
- [x] Token limit exceeded

## Integration Test Specifications

### API Endpoint Tests

#### POST /inquiries/classify

**Scenario 1: Happy Path**
```python
# test_api_integration.py
@pytest.mark.integration
async def test_classify_endpoint_success():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        payload = {
            "text": "We need 500 CNC machined aluminum parts",
            "metadata": {
                "source": "web_form",
                "customer_id": "cust_12345"
            }
        }
        
        # Act
        response = await client.post(
            "/api/v1/inquiries/classify",
            json=payload,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["primary_category"] == "QUOTE_REQUEST"
        assert data["confidence"] > 0.8
        assert data["processing_time_ms"] < 200
```

**Scenario 2: Validation Errors**
```python
@pytest.mark.integration
async def test_classify_endpoint_validation_error():
    async with AsyncClient(app=app) as client:
        # Test text too short
        response = await client.post(
            "/api/v1/inquiries/classify",
            json={"text": "Hi"},
            headers=headers
        )
        assert response.status_code == 400
        assert response.json()["error"]["code"] == "VALIDATION_ERROR"
```

**Scenario 3: Authentication/Authorization**
```python
@pytest.mark.integration
async def test_classify_endpoint_auth_required():
    async with AsyncClient(app=app) as client:
        # No token
        response = await client.post(
            "/api/v1/inquiries/classify",
            json={"text": "Test inquiry"}
        )
        assert response.status_code == 401
        
        # Invalid token
        response = await client.post(
            "/api/v1/inquiries/classify",
            json={"text": "Test inquiry"},
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401
```

**Scenario 4: Rate Limiting**
```python
@pytest.mark.integration
async def test_classify_endpoint_rate_limiting():
    async with AsyncClient(app=app) as client:
        # Send 101 requests (limit is 100/min)
        for i in range(101):
            response = await client.post(
                "/api/v1/inquiries/classify",
                json={"text": f"Test inquiry {i}"},
                headers=headers
            )
            if i < 100:
                assert response.status_code == 200
            else:
                assert response.status_code == 429
                assert "X-RateLimit-Reset" in response.headers
```

### Database Integration
- [x] Firestore document creation
- [x] Composite index usage verification
- [x] Transaction rollback on error
- [x] Concurrent writes handling
- [x] Query performance < 100ms

### External Service Integration
- [x] OpenAI API calls with retry logic
- [x] Weaviate vector search queries
- [x] Redis caching (get/set/expire)
- [x] Firebase Auth token validation
- [x] Fallback to simple classification

## E2E Test Scenarios

### Scenario 1: Complete Inquiry Processing Flow
**User Story**: As a manufacturer, I submit an inquiry and receive proper classification

**Steps**:
1. Submit inquiry via API
2. System validates input
3. Classification occurs
4. Result stored in Firestore
5. Cache updated
6. Response returned < 200ms

**Playwright Test**:
```javascript
test('Complete inquiry classification flow', async ({ request }) => {
  // Submit inquiry
  const response = await request.post('/api/v1/inquiries/classify', {
    headers: { 'Authorization': `Bearer ${token}` },
    data: {
      text: 'Need quote for 1000 steel brackets',
      metadata: { source: 'web_form' }
    }
  });
  
  expect(response.status()).toBe(200);
  const result = await response.json();
  
  // Verify classification
  expect(result.primary_category).toBe('QUOTE_REQUEST');
  expect(result.confidence).toBeGreaterThan(0.8);
  expect(result.processing_time_ms).toBeLessThan(200);
  
  // Verify stored in database
  const doc = await firestore.collection('inquiries').doc(result.id).get();
  expect(doc.exists).toBe(true);
});
```

### Scenario 2: Multi-language Support
**User Story**: As a Japanese manufacturer, I can submit inquiries in Japanese

**Validation**:
- [x] Japanese text correctly processed
- [x] Language detected as 'ja'
- [x] Classification accuracy maintained
- [x] Response includes Japanese keywords

## Performance Test Criteria

### Load Testing (K6)
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Spike to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95% of requests under 200ms
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
    'http_req_duration{type:classification}': ['p(95)<200'],
  },
};

export default function() {
  const payload = JSON.stringify({
    text: `Manufacturing inquiry ${Math.random()}`,
    metadata: { source: 'load_test' }
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.TEST_TOKEN}`,
    },
    tags: { type: 'classification' },
  };
  
  const response = http.post(
    'https://api.manufacturing-assistant.com/v1/inquiries/classify',
    payload,
    params
  );
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
    'classification confidence > 0.7': (r) => {
      const body = JSON.parse(r.body);
      return body.confidence > 0.7;
    },
  });
  
  sleep(1);
}
```

### Metrics to Track
- **Response Time**: p50 < 100ms, p95 < 200ms, p99 < 500ms
- **Throughput**: > 100 requests per second
- **Error Rate**: < 1%
- **CPU Usage**: < 80%
- **Memory Usage**: No memory leaks over 24h
- **Database Query Time**: < 100ms
- **Cache Hit Rate**: > 60%
- **OpenAI API Latency**: < 150ms p95

## Security Test Requirements

### Input Validation
- [x] Text length limits enforced
- [x] UTF-8 encoding validation
- [x] Special character handling
- [x] Prompt injection prevention
- [x] SQL injection not applicable (NoSQL)

### Authentication/Authorization
- [x] JWT token validation
- [x] Token expiration handling
- [x] Role-based access control
- [x] API key rotation support
- [x] Rate limiting per client

### Data Security
- [x] TLS 1.3 in transit
- [x] Firestore encryption at rest
- [x] PII masking in logs
- [x] Secure environment variables
- [x] No sensitive data in responses

## Test Data Management

### Test Fixtures
```python
# fixtures/test_data.py
import pytest
from datetime import datetime

@pytest.fixture
def sample_quote_inquiry():
    return {
        "text": "We need a quote for 1000 aluminum brackets with custom drilling",
        "expected_category": "QUOTE_REQUEST",
        "min_confidence": 0.9
    }

@pytest.fixture
def sample_technical_inquiry():
    return {
        "text": "Can you manufacture parts with 0.001mm tolerance?",
        "expected_category": "TECHNICAL_SPECIFICATION",
        "min_confidence": 0.85
    }

@pytest.fixture
def sample_japanese_inquiry():
    return {
        "text": "アルミニウム部品500個の見積もりをお願いします",
        "expected_category": "QUOTE_REQUEST",
        "expected_language": "ja",
        "min_confidence": 0.85
    }
```

### Data Setup/Teardown
- **Before Each Test**: 
  - Clear Redis cache
  - Reset rate limiter
  - Create test Firebase token
- **After Each Test**: 
  - Clean up test documents from Firestore
  - Clear test cache entries
- **Test Database**: Firestore emulator on localhost:8080
- **Mock Services**: 
  - OpenAI API (returns deterministic responses)
  - Weaviate (in-memory test instance)

## Acceptance Criteria

### Definition of Done
- [x] All unit tests pass (95% coverage)
- [x] All integration tests pass
- [x] All E2E tests pass
- [x] Performance targets met (< 200ms p95)
- [x] Security scan clean
- [x] No critical bugs
- [x] Documentation updated
- [x] Code reviewed

### Sign-off Requirements
- [ ] Test Engineer approval
- [ ] Tech Lead approval
- [ ] Product Owner acceptance
- [ ] Security review complete

## Risk Assessment

### High Risk Areas
1. **OpenAI API Dependency**: Service outage impacts classification
   - **Mitigation**: Implement fallback rule-based classification
2. **Token Costs**: High volume could exceed budget
   - **Mitigation**: Aggressive caching, optimize prompts
3. **Multi-language Accuracy**: JP classification less accurate
   - **Mitigation**: Additional JP training data, specialized prompts

### Dependencies
- OpenAI API availability (99.9% SLA)
- Weaviate cluster stability
- Redis cache availability
- Firebase Auth service

## Test Execution Schedule

| Phase | Duration | Owner | Status |
|-------|----------|-------|--------|
| Test Writing | 2 days | Test Engineer | 🔴 Not Started |
| Unit Test Execution | 4 hours | Developer | ⏸️ Blocked |
| Integration Testing | 1 day | Test Engineer | ⏸️ Blocked |
| E2E Testing | 4 hours | QA Team | ⏸️ Blocked |
| Performance Testing | 4 hours | DevOps | ⏸️ Blocked |
| Security Testing | 2 hours | Security | ⏸️ Blocked |

## Appendix

### Test Tools
- **Unit Testing**: pytest, pytest-asyncio
- **Integration**: pytest with FastAPI test client
- **E2E**: Playwright for API testing
- **Performance**: K6 load testing
- **Security**: OWASP ZAP, Snyk
- **Coverage**: coverage.py, pytest-cov

### References
- [API Specification](./api-spec.yaml)
- [Architecture Documentation](../../architecture/)
- [CLAUDE.md](../../../CLAUDE.md)
- [OpenAI API Docs](https://platform.openai.com/docs)