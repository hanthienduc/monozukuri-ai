# Frontend UI Test Plan

## Test Overview

**Feature**: Manufacturing Inquiry Frontend UI  
**Test Coverage Target**: 95% (Unit), 100% (Critical Flows)  
**Test Framework**: Vitest + React Testing Library + Playwright  
**Last Updated**: 2025-01-13  

## Test Strategy

### Testing Pyramid
```
         /\
        /E2E\       (10%) - Critical user journeys
       /------\
      /  Integ  \    (30%) - API integrations, WebSocket
     /----------\
    /    Unit     \  (60%) - Components, hooks, utilities
   /--------------\
```

## Unit Tests (60% of tests)

### 1. Component Tests

#### InquiryForm Component
```typescript
describe('InquiryForm', () => {
  // Setup
  beforeEach(() => {
    // Reset form state
    // Mock API calls
  });

  describe('Rendering', () => {
    it('should render all required form fields');
    it('should display labels in selected language (EN/JP)');
    it('should show urgency selector with correct options');
    it('should render file upload area');
    it('should display character count for description');
  });

  describe('Validation', () => {
    it('should validate title minimum length (5 chars)');
    it('should validate title maximum length (200 chars)');
    it('should validate description minimum length (20 chars)');
    it('should validate description maximum length (5000 chars)');
    it('should validate email format');
    it('should validate company name required');
    it('should show inline error messages');
    it('should prevent submission with invalid data');
    it('should validate file size limit (10MB)');
    it('should validate file type restrictions');
  });

  describe('User Interactions', () => {
    it('should update form state on input change');
    it('should toggle language and update labels');
    it('should handle file selection via click');
    it('should handle file drag and drop');
    it('should remove selected files');
    it('should show loading state during submission');
    it('should disable form during submission');
    it('should clear form after successful submission');
  });

  describe('Error Handling', () => {
    it('should display API error messages');
    it('should handle network errors gracefully');
    it('should retry failed submissions');
    it('should maintain form data on error');
  });
});
```

#### ResultsDisplay Component
```typescript
describe('ResultsDisplay', () => {
  describe('Rendering', () => {
    it('should display classification category');
    it('should show confidence score as percentage');
    it('should render confidence meter visualization');
    it('should list subcategories with scores');
    it('should show processing time');
    it('should display appropriate category icon');
  });

  describe('Real-time Updates', () => {
    it('should show streaming indicator when processing');
    it('should update progressively with WebSocket data');
    it('should transition from loading to complete state');
    it('should handle WebSocket disconnection');
  });

  describe('Confidence Visualization', () => {
    it('should color-code confidence levels (red/yellow/green)');
    it('should animate confidence meter on load');
    it('should show tooltips with detailed explanations');
  });
});
```

#### DashboardLayout Component
```typescript
describe('DashboardLayout', () => {
  describe('Data Loading', () => {
    it('should fetch dashboard data on mount');
    it('should show loading skeletons while fetching');
    it('should display error state on fetch failure');
    it('should implement retry mechanism');
  });

  describe('Metrics Display', () => {
    it('should display total inquiries count');
    it('should show average confidence score');
    it('should render category distribution chart');
    it('should display response time metrics');
  });

  describe('Filtering', () => {
    it('should filter by date range');
    it('should filter by category');
    it('should filter by confidence threshold');
    it('should update data on filter change');
    it('should maintain filter state in URL');
  });
});
```

### 2. Hook Tests

#### useInquiry Hook
```typescript
describe('useInquiry', () => {
  it('should initialize with empty inquiry state');
  it('should handle inquiry submission');
  it('should update loading state during submission');
  it('should return classification result');
  it('should handle submission errors');
  it('should provide retry functionality');
  it('should track submission analytics');
});
```

#### useWebSocket Hook
```typescript
describe('useWebSocket', () => {
  it('should establish WebSocket connection');
  it('should handle connection events');
  it('should process incoming messages');
  it('should implement reconnection logic');
  it('should handle connection errors');
  it('should clean up on unmount');
  it('should queue messages when disconnected');
});
```

#### useTranslation Hook
```typescript
describe('useTranslation', () => {
  it('should return translations for current language');
  it('should switch between EN and JP');
  it('should handle missing translations gracefully');
  it('should persist language preference');
  it('should load language files dynamically');
});
```

### 3. Store Tests (Zustand)

#### inquiryStore
```typescript
describe('inquiryStore', () => {
  it('should initialize with empty inquiries array');
  it('should add new inquiry to store');
  it('should update inquiry status');
  it('should remove inquiry from store');
  it('should handle pagination');
  it('should implement optimistic updates');
  it('should sync with backend');
});
```

#### uiStore
```typescript
describe('uiStore', () => {
  it('should manage language preference');
  it('should toggle theme (light/dark)');
  it('should control sidebar visibility');
  it('should manage notification queue');
  it('should persist UI preferences');
});
```

### 4. Utility Tests

#### validators.ts
```typescript
describe('validators', () => {
  describe('validateEmail', () => {
    it('should accept valid email formats');
    it('should reject invalid email formats');
    it('should handle edge cases');
  });

  describe('validateFileSize', () => {
    it('should accept files under limit');
    it('should reject files over limit');
    it('should handle multiple files');
  });

  describe('validateInquiryText', () => {
    it('should check minimum length');
    it('should check maximum length');
    it('should handle special characters');
    it('should validate against XSS patterns');
  });
});
```

## Integration Tests (30% of tests)

### 1. API Integration Tests

```typescript
describe('API Integration', () => {
  describe('Inquiry Classification', () => {
    it('should successfully submit inquiry to API');
    it('should handle API validation errors');
    it('should retry on network failure');
    it('should handle rate limiting');
    it('should include authentication headers');
  });

  describe('Data Fetching', () => {
    it('should fetch inquiry list with pagination');
    it('should apply filters to API requests');
    it('should cache responses appropriately');
    it('should invalidate cache on mutations');
  });

  describe('File Upload', () => {
    it('should upload files with multipart/form-data');
    it('should show upload progress');
    it('should handle upload failures');
    it('should validate file types on server');
  });
});
```

### 2. WebSocket Integration

```typescript
describe('WebSocket Integration', () => {
  it('should connect to WebSocket server');
  it('should authenticate WebSocket connection');
  it('should receive real-time classification updates');
  it('should handle reconnection on disconnect');
  it('should queue messages during disconnection');
  it('should handle malformed messages');
});
```

### 3. React Query Integration

```typescript
describe('React Query Integration', () => {
  it('should cache API responses');
  it('should implement stale-while-revalidate');
  it('should handle mutation optimistic updates');
  it('should retry failed queries');
  it('should invalidate related queries on mutation');
});
```

## E2E Tests (10% of tests)

### Critical User Journeys (Playwright)

#### 1. Complete Inquiry Submission Flow
```typescript
test('Complete inquiry submission flow', async ({ page }) => {
  // Navigate to submission page
  await page.goto('/submit');
  
  // Fill in form fields
  await page.fill('[data-testid="inquiry-title"]', 'CNC Machining Quote Request');
  await page.fill('[data-testid="inquiry-description"]', 'Need 1000 aluminum parts...');
  await page.selectOption('[data-testid="urgency-select"]', 'high');
  await page.fill('[data-testid="contact-email"]', 'buyer@company.com');
  await page.fill('[data-testid="company-name"]', 'Tech Corp');
  
  // Upload file
  await page.setInputFiles('[data-testid="file-upload"]', 'test-specs.pdf');
  
  // Submit form
  await page.click('[data-testid="submit-button"]');
  
  // Wait for classification result
  await page.waitForSelector('[data-testid="classification-result"]');
  
  // Verify result display
  expect(await page.textContent('[data-testid="category"]')).toBe('Quote Request');
  expect(await page.textContent('[data-testid="confidence"]')).toMatch(/\d+%/);
});
```

#### 2. Dashboard Analytics View
```typescript
test('Dashboard analytics view', async ({ page }) => {
  // Navigate to dashboard
  await page.goto('/');
  
  // Wait for data load
  await page.waitForSelector('[data-testid="metrics-loaded"]');
  
  // Apply date filter
  await page.selectOption('[data-testid="date-range"]', 'week');
  
  // Verify chart renders
  await page.waitForSelector('[data-testid="analytics-chart"]');
  
  // Check data export
  await page.click('[data-testid="export-button"]');
  
  // Verify download started
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toMatch(/inquiries.*\.csv/);
});
```

#### 3. Multi-language Support
```typescript
test('Multi-language support', async ({ page }) => {
  await page.goto('/submit');
  
  // Default should be English
  expect(await page.textContent('h1')).toBe('Submit Inquiry');
  
  // Switch to Japanese
  await page.click('[data-testid="language-toggle"]');
  await page.click('[data-testid="language-jp"]');
  
  // Verify Japanese labels
  expect(await page.textContent('h1')).toBe('お問い合わせ送信');
  
  // Submit form in Japanese
  await page.fill('[data-testid="inquiry-title"]', 'CNC加工見積もり依頼');
  // ... continue flow
});
```

#### 4. Real-time Updates via WebSocket
```typescript
test('Real-time classification updates', async ({ page }) => {
  await page.goto('/submit');
  
  // Fill and submit form
  // ... form filling code
  
  await page.click('[data-testid="submit-button"]');
  
  // Verify streaming indicator appears
  await page.waitForSelector('[data-testid="streaming-indicator"]');
  
  // Verify progressive updates
  const progressElement = page.locator('[data-testid="progress"]');
  await expect(progressElement).toHaveText('0%');
  
  // Wait for progress updates
  await page.waitForTimeout(1000);
  await expect(progressElement).not.toHaveText('0%');
  
  // Verify completion
  await page.waitForSelector('[data-testid="classification-complete"]');
});
```

#### 5. Error Recovery Flow
```typescript
test('Error recovery flow', async ({ page }) => {
  // Simulate network error
  await page.route('**/api/v1/inquiries/classify', route => {
    route.abort('failed');
  });
  
  await page.goto('/submit');
  
  // Submit form
  // ... form filling
  await page.click('[data-testid="submit-button"]');
  
  // Verify error message
  await page.waitForSelector('[data-testid="error-message"]');
  
  // Enable network
  await page.unroute('**/api/v1/inquiries/classify');
  
  // Retry submission
  await page.click('[data-testid="retry-button"]');
  
  // Verify success
  await page.waitForSelector('[data-testid="classification-result"]');
});
```

## Performance Tests

### Lighthouse CI Configuration
```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/submit',
        'http://localhost:3000/inquiries'
      ],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }]
      }
    }
  }
};
```

### Bundle Size Monitoring
```javascript
// Maximum bundle sizes
const budgets = {
  'main.js': 250 * 1024,      // 250KB
  'vendor.js': 150 * 1024,     // 150KB
  'main.css': 50 * 1024,       // 50KB
  'total': 500 * 1024          // 500KB total
};
```

## Accessibility Tests

### Automated Testing with axe-core
```typescript
describe('Accessibility', () => {
  it('should have no accessibility violations on home page');
  it('should have no violations on inquiry form');
  it('should support keyboard navigation');
  it('should have proper ARIA labels');
  it('should maintain focus management');
  it('should have sufficient color contrast');
  it('should support screen readers');
});
```

## Security Tests

### Input Validation
```typescript
describe('Security - Input Validation', () => {
  it('should sanitize HTML in text inputs');
  it('should prevent XSS in form submissions');
  it('should validate file types on upload');
  it('should enforce file size limits');
  it('should prevent SQL injection attempts');
  it('should handle malformed JSON');
});
```

### Authentication Tests
```typescript
describe('Security - Authentication', () => {
  it('should require authentication for protected routes');
  it('should handle expired tokens');
  it('should implement CSRF protection');
  it('should secure sensitive data in localStorage');
});
```

## Test Data Management

### Test Fixtures
```typescript
// fixtures/inquiries.ts
export const mockInquiry = {
  title: "Test Inquiry",
  description: "This is a test inquiry for unit testing purposes",
  urgency: "medium",
  contactEmail: "test@example.com",
  companyName: "Test Corp",
  language: "en"
};

export const mockClassificationResult = {
  id: "inq_test_123",
  category: "quote_request",
  confidence: 0.92,
  subcategories: [
    { name: "cnc_machining", confidence: 0.88 }
  ],
  processingTime: 1.23,
  timestamp: new Date().toISOString()
};
```

### Mock API Responses
```typescript
// mocks/api.ts
export const mockHandlers = [
  rest.post('/api/v1/inquiries/classify', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockClassificationResult)
    );
  }),
  
  rest.get('/api/v1/inquiries', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [mockInquiry],
        pagination: { page: 1, limit: 20, total: 1 }
      })
    );
  })
];
```

## Test Execution Strategy

### Continuous Integration
```yaml
# .github/workflows/test.yml
name: Frontend Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v2
```

### Local Development
```bash
# Run all tests
npm test

# Run unit tests in watch mode
npm run test:unit:watch

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test InquiryForm.test.tsx
```

## Test Coverage Requirements

| Test Type | Coverage Target | Current | Status |
|-----------|----------------|---------|--------|
| Unit Tests | 95% | 0% | 🔴 Not Started |
| Integration | 100% (critical paths) | 0% | 🔴 Not Started |
| E2E | 100% (user journeys) | 0% | 🔴 Not Started |
| Accessibility | WCAG 2.1 AA | 0% | 🔴 Not Started |
| Performance | Lighthouse > 90 | 0% | 🔴 Not Started |

## Risk Mitigation

### High-Risk Areas
1. **WebSocket Connection Stability**: Implement robust reconnection logic
2. **File Upload Handling**: Validate size and type on both client and server
3. **Multi-language Support**: Ensure all text is properly internationalized
4. **API Rate Limiting**: Implement exponential backoff
5. **Browser Compatibility**: Test on all target browsers

### Contingency Plans
- Fallback to polling if WebSocket fails
- Progressive enhancement for older browsers
- Graceful degradation for missing features
- Error boundaries to prevent app crashes

## Test Review Checklist

- [ ] All unit tests written and passing
- [ ] Integration tests cover all API endpoints
- [ ] E2E tests cover critical user journeys
- [ ] Performance budgets met
- [ ] Accessibility standards met
- [ ] Security vulnerabilities addressed
- [ ] Test coverage > 95%
- [ ] No console errors or warnings
- [ ] Tests run in CI/CD pipeline
- [ ] Test documentation updated

---

**Prepared by**: DDD/TDD Coordinator  
**Review Required by**: test-quality-engineer  
**Approval Required by**: tech-lead-architect