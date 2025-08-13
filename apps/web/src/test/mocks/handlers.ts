import { http, HttpResponse } from 'msw'

// API base URL
const API_BASE = 'http://localhost:8000'

// Mock handlers for API endpoints
export const handlers = [
  // CSRF Token endpoint
  http.get(`${API_BASE}/api/v1/csrf-token`, () => {
    return HttpResponse.json({
      csrfToken: 'mock-csrf-token-123',
    })
  }),

  // Classification endpoint
  http.post(`${API_BASE}/api/v1/inquiries/classify`, async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      inquiry_id: 'INQ-2025-001',
      classification: {
        category: 'quote_request',
        confidence: 0.92,
        subcategories: [
          { name: 'bulk_order', confidence: 0.88 },
          { name: 'custom_manufacturing', confidence: 0.75 },
        ],
      },
      metadata: {
        processing_time_ms: 523,
        model_version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
      status: 'success',
    })
  }),

  // Inquiries list endpoint
  http.get(`${API_BASE}/api/v1/inquiries`, ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page') || '1'
    const limit = url.searchParams.get('limit') || '10'

    return HttpResponse.json({
      inquiries: [
        {
          id: 'INQ-2025-001',
          title: 'Bulk Order for Precision Bearings',
          description: 'We need 10,000 units of precision bearings...',
          category: 'quote_request',
          confidence: 0.92,
          status: 'pending',
          created_at: '2025-01-13T10:00:00Z',
          company_name: 'ABC Manufacturing',
          contact_email: 'contact@abc.com',
        },
        {
          id: 'INQ-2025-002',
          title: 'Technical Specifications Query',
          description: 'Can you provide detailed specifications...',
          category: 'technical_spec',
          confidence: 0.88,
          status: 'reviewed',
          created_at: '2025-01-13T09:30:00Z',
          company_name: 'XYZ Corp',
          contact_email: 'tech@xyz.com',
        },
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 50,
        total_pages: 5,
      },
    })
  }),

  // Analytics endpoint
  http.get(`${API_BASE}/api/v1/analytics`, () => {
    return HttpResponse.json({
      total_inquiries: 150,
      average_confidence: 0.87,
      category_distribution: {
        quote_request: 45,
        technical_spec: 35,
        capability: 40,
        partnership: 30,
      },
      response_times: {
        p50: 450,
        p95: 1200,
        p99: 2500,
      },
      daily_trend: [
        { date: '2025-01-07', count: 20 },
        { date: '2025-01-08', count: 25 },
        { date: '2025-01-09', count: 18 },
        { date: '2025-01-10', count: 30 },
        { date: '2025-01-11', count: 22 },
        { date: '2025-01-12', count: 15 },
        { date: '2025-01-13', count: 20 },
      ],
    })
  }),

  // Auth refresh endpoint
  http.post(`${API_BASE}/api/v1/auth/refresh`, () => {
    return HttpResponse.json({
      authToken: 'new-auth-token-456',
      expiresIn: 3600,
    })
  }),

  // Error simulation endpoints (for testing error handling)
  http.post(`${API_BASE}/api/v1/inquiries/classify-error`, () => {
    return HttpResponse.json(
      { error: 'Internal Server Error', message: 'Classification service unavailable' },
      { status: 500 }
    )
  }),

  http.get(`${API_BASE}/api/v1/inquiries/unauthorized`, () => {
    return HttpResponse.json(
      { error: 'Unauthorized', message: 'Invalid authentication token' },
      { status: 401 }
    )
  }),
]