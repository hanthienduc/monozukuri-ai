/**
 * K6 Load Test for Manufacturing Inquiry Classification API
 * Written BEFORE implementation (TDD Red Phase)
 * Tests should establish performance baselines
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const classificationRate = new Rate('successful_classifications');

// Test configuration
export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users  
    { duration: '2m', target: 200 },  // Spike to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    // Response time thresholds
    http_req_duration: ['p(95)<200', 'p(99)<500'],  // 95% under 200ms, 99% under 500ms
    
    // Error rate threshold
    http_req_failed: ['rate<0.01'],  // Error rate under 1%
    errors: ['rate<0.01'],            // Custom error metric
    
    // Throughput threshold
    http_reqs: ['rate>100'],          // At least 100 requests per second
    
    // Classification-specific thresholds
    'http_req_duration{type:classification}': ['p(95)<200'],
    'successful_classifications': ['rate>0.95'],  // 95% success rate
  },
};

// Test data generator
function generateInquiryText() {
  const inquiryTypes = [
    "We need a quote for 1000 aluminum brackets with custom drilling",
    "Can you manufacture parts with 0.001mm tolerance using SUS304 steel?",
    "Do you have 5-axis CNC machines for complex geometries?",
    "We're looking for a long-term manufacturing partner in Japan",
    "What are your minimum order quantities for custom parts?",
    "アルミニウム部品500個の見積もりをお願いします",
    "SUS304ステンレス鋼で0.001mmの公差で製造できますか？",
    "ISO 9001認証を取得していますか？",
    "Can you provide pricing for parts that meet ISO 9001 standards?",
    "We need rapid prototyping services for new product development"
  ];
  
  return inquiryTypes[Math.floor(Math.random() * inquiryTypes.length)];
}

// Generate metadata
function generateMetadata() {
  const sources = ['web_form', 'email', 'chat', 'api'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  
  return {
    source: sources[Math.floor(Math.random() * sources.length)],
    customer_id: `cust_${Math.floor(Math.random() * 10000)}`,
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    timestamp: new Date().toISOString()
  };
}

// Setup function (runs once per VU)
export function setup() {
  // Verify API is accessible
  const healthCheck = http.get(`${__ENV.API_URL || 'http://localhost:8000'}/health`);
  
  if (healthCheck.status !== 200) {
    throw new Error('API is not healthy');
  }
  
  // Get auth token for tests
  // In real scenario, this would authenticate and get a token
  return {
    token: __ENV.TEST_TOKEN || 'test_token_placeholder'
  };
}

// Main test function (runs repeatedly for each VU)
export default function(data) {
  const baseUrl = __ENV.API_URL || 'http://localhost:8000';
  const token = data.token;
  
  // Prepare request
  const payload = JSON.stringify({
    text: generateInquiryText(),
    metadata: generateMetadata()
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { type: 'classification' },
    timeout: '30s'
  };
  
  // Make classification request
  const response = http.post(
    `${baseUrl}/api/v1/inquiries/classify`,
    payload,
    params
  );
  
  // Validate response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has classification result': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.primary_category !== undefined;
      } catch (e) {
        return false;
      }
    },
    'confidence > 0.7': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.confidence > 0.7;
      } catch (e) {
        return false;
      }
    },
    'processing time < 200ms': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.processing_time_ms < 200;
      } catch (e) {
        return false;
      }
    },
    'has all required fields': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id && 
               body.primary_category && 
               body.confidence !== undefined &&
               body.all_categories &&
               body.language &&
               body.processing_time_ms !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  // Record custom metrics
  errorRate.add(!success);
  classificationRate.add(success);
  
  // Log errors for debugging
  if (!success) {
    console.error(`Request failed: ${response.status} - ${response.body}`);
  }
  
  // Simulate user think time
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

// Test different inquiry types
export function testVariousInquiryTypes() {
  const baseUrl = __ENV.API_URL || 'http://localhost:8000';
  const token = __ENV.TEST_TOKEN || 'test_token_placeholder';
  
  const testCases = [
    { text: "Quote request", expectedCategory: "QUOTE_REQUEST" },
    { text: "Technical specs needed", expectedCategory: "TECHNICAL_SPECIFICATION" },
    { text: "Can you do this?", expectedCategory: "CAPABILITY_QUESTION" },
    { text: "Partnership opportunity", expectedCategory: "PARTNERSHIP_INQUIRY" },
    { text: "General question", expectedCategory: "GENERAL_INQUIRY" }
  ];
  
  testCases.forEach(testCase => {
    const response = http.post(
      `${baseUrl}/api/v1/inquiries/classify`,
      JSON.stringify({ text: testCase.text }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      }
    );
    
    check(response, {
      [`${testCase.text} classified correctly`]: (r) => {
        const body = JSON.parse(r.body);
        return body.primary_category === testCase.expectedCategory;
      }
    });
  });
}

// Test rate limiting
export function testRateLimiting() {
  const baseUrl = __ENV.API_URL || 'http://localhost:8000';
  const token = __ENV.TEST_TOKEN || 'test_token_placeholder';
  
  // Send rapid requests to trigger rate limiting
  let rateLimitHit = false;
  
  for (let i = 0; i < 150; i++) {
    const response = http.post(
      `${baseUrl}/api/v1/inquiries/classify`,
      JSON.stringify({ text: `Test inquiry ${i}` }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      }
    );
    
    if (response.status === 429) {
      rateLimitHit = true;
      
      // Check rate limit headers
      check(response, {
        'has rate limit headers': (r) => 
          r.headers['X-RateLimit-Limit'] &&
          r.headers['X-RateLimit-Remaining'] &&
          r.headers['X-RateLimit-Reset']
      });
      
      break;
    }
  }
  
  check(rateLimitHit, {
    'rate limiting works': (hit) => hit === true
  });
}

// Test cache effectiveness
export function testCaching() {
  const baseUrl = __ENV.API_URL || 'http://localhost:8000';
  const token = __ENV.TEST_TOKEN || 'test_token_placeholder';
  
  const testText = "Standard quote request for testing cache";
  
  // First request (cache miss)
  const response1 = http.post(
    `${baseUrl}/api/v1/inquiries/classify`,
    JSON.stringify({ text: testText }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  
  const time1 = response1.timings.duration;
  
  // Second request (should hit cache)
  const response2 = http.post(
    `${baseUrl}/api/v1/inquiries/classify`,
    JSON.stringify({ text: testText }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  
  const time2 = response2.timings.duration;
  
  check({ time1, time2 }, {
    'cache is faster': (times) => times.time2 < times.time1 * 0.5  // Cache should be at least 50% faster
  });
}

// Teardown function (runs once after all tests)
export function teardown(data) {
  // Clean up any test data if needed
  console.log('Load test completed');
}