# Inquiry Submission Examples

## Example 1: Quote Request Submission

### Request
```http
POST /api/v1/inquiries/classify
Content-Type: application/json
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

{
  "title": "Request for CNC machining quote",
  "description": "We are looking for a supplier who can manufacture 1000 units of aluminum brackets. Dimensions are 100x50x10mm with tolerance of ±0.1mm. Need anodized finish in black color. Delivery required within 30 days.",
  "urgency": "high",
  "contactEmail": "procurement@techcorp.com",
  "companyName": "Tech Corp International",
  "language": "en",
  "metadata": {
    "quantity": 1000,
    "material": "aluminum",
    "finish": "anodized black"
  }
}
```

### Response
```json
{
  "id": "inq_20250113_abc123",
  "category": "quote_request",
  "confidence": 0.92,
  "subcategories": [
    {
      "name": "cnc_machining",
      "confidence": 0.88
    },
    {
      "name": "aluminum_parts",
      "confidence": 0.75
    },
    {
      "name": "surface_treatment",
      "confidence": 0.65
    }
  ],
  "processingTime": 1.234,
  "timestamp": "2025-01-13T10:30:45.123Z"
}
```

## Example 2: Technical Specification Inquiry (Japanese)

### Request
```http
POST /api/v1/inquiries/classify
Content-Type: application/json
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

{
  "title": "射出成形の技術仕様について",
  "description": "ABS樹脂を使用した精密部品の製造を検討しています。寸法は50x30x20mm、肉厚2mm、公差±0.05mmの要求があります。年間生産量は約10万個を予定しています。金型設計から量産まで一貫して対応可能なサプライヤーを探しています。",
  "urgency": "medium",
  "contactEmail": "engineering@manufacturing.jp",
  "companyName": "製造技術株式会社",
  "language": "jp",
  "metadata": {
    "material": "ABS",
    "annual_volume": 100000,
    "tolerance": "0.05mm"
  }
}
```

### Response
```json
{
  "id": "inq_20250113_def456",
  "category": "technical_spec",
  "confidence": 0.89,
  "subcategories": [
    {
      "name": "injection_molding",
      "confidence": 0.94
    },
    {
      "name": "plastic_parts",
      "confidence": 0.82
    },
    {
      "name": "mold_design",
      "confidence": 0.71
    }
  ],
  "processingTime": 1.567,
  "timestamp": "2025-01-13T10:35:22.456Z"
}
```

## Example 3: File Upload with Multipart

### Request
```http
POST /api/v1/inquiries/classify
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="data"

{
  "title": "Custom PCB Assembly Quote",
  "description": "Need assembly services for custom PCB boards. Specifications attached in PDF. Required certifications: ISO 9001, IPC-A-610. Volume: 5000 units per month.",
  "urgency": "high",
  "contactEmail": "sourcing@electronics.com",
  "companyName": "Electronics Manufacturing Inc",
  "language": "en"
}
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="attachments"; filename="pcb_specs.pdf"
Content-Type: application/pdf

[Binary PDF data]
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

### Response
```json
{
  "id": "inq_20250113_ghi789",
  "category": "quote_request",
  "confidence": 0.87,
  "subcategories": [
    {
      "name": "pcb_assembly",
      "confidence": 0.91
    },
    {
      "name": "electronics_manufacturing",
      "confidence": 0.84
    },
    {
      "name": "certification_required",
      "confidence": 0.76
    }
  ],
  "processingTime": 2.145,
  "timestamp": "2025-01-13T10:40:15.789Z",
  "attachments": [
    {
      "id": "att_123",
      "filename": "pcb_specs.pdf",
      "size": 245678,
      "processed": true
    }
  ]
}
```

## Example 4: WebSocket Real-time Updates

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  // Send authentication
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGc...'
  }));
};
```

### Classification Start Event
```json
{
  "event": "classification_start",
  "data": {
    "inquiryId": "inq_20250113_xyz890",
    "progress": 0
  },
  "timestamp": "2025-01-13T10:45:00.000Z"
}
```

### Progress Update Events
```json
{
  "event": "classification_progress",
  "data": {
    "inquiryId": "inq_20250113_xyz890",
    "progress": 25,
    "stage": "text_analysis"
  },
  "timestamp": "2025-01-13T10:45:00.500Z"
}
```

```json
{
  "event": "classification_progress",
  "data": {
    "inquiryId": "inq_20250113_xyz890",
    "progress": 50,
    "stage": "category_detection"
  },
  "timestamp": "2025-01-13T10:45:01.000Z"
}
```

```json
{
  "event": "classification_progress",
  "data": {
    "inquiryId": "inq_20250113_xyz890",
    "progress": 75,
    "stage": "confidence_calculation"
  },
  "timestamp": "2025-01-13T10:45:01.500Z"
}
```

### Classification Complete Event
```json
{
  "event": "classification_complete",
  "data": {
    "inquiryId": "inq_20250113_xyz890",
    "progress": 100,
    "result": {
      "category": "capability",
      "confidence": 0.88,
      "subcategories": [
        {
          "name": "precision_machining",
          "confidence": 0.82
        }
      ]
    }
  },
  "timestamp": "2025-01-13T10:45:02.000Z"
}
```

## Example 5: Error Responses

### Validation Error
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "field": "description",
    "reason": "Minimum length is 20 characters, received 15"
  },
  "timestamp": "2025-01-13T10:50:00.123Z"
}
```

### Rate Limit Error
```json
{
  "code": "RATE_LIMITED",
  "message": "Too many requests. Please retry after 60 seconds.",
  "details": {
    "limit": 100,
    "window": "1h",
    "retryAfter": 60
  },
  "timestamp": "2025-01-13T10:51:00.456Z"
}
```

### Authentication Error
```json
{
  "code": "UNAUTHORIZED",
  "message": "Invalid or expired authentication token",
  "details": {
    "realm": "api",
    "error": "invalid_token"
  },
  "timestamp": "2025-01-13T10:52:00.789Z"
}
```

## Example 6: Batch Operations

### Get Inquiries with Filters
```http
GET /api/v1/inquiries?page=1&limit=20&category=quote_request&startDate=2025-01-01T00:00:00Z&sortBy=confidence&sortOrder=desc
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Response
```json
{
  "data": [
    {
      "id": "inq_20250113_001",
      "title": "CNC Machining Services",
      "category": "quote_request",
      "confidence": 0.95,
      "status": "classified",
      "createdAt": "2025-01-13T09:00:00Z",
      "companyName": "Manufacturing Co"
    },
    {
      "id": "inq_20250113_002",
      "title": "Aluminum Parts Production",
      "category": "quote_request",
      "confidence": 0.92,
      "status": "classified",
      "createdAt": "2025-01-13T09:15:00Z",
      "companyName": "Tech Industries"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  },
  "filters": {
    "category": "quote_request",
    "startDate": "2025-01-01T00:00:00Z"
  }
}
```

## Example 7: Analytics Request

### Request
```http
GET /api/v1/analytics?timeRange=week&metrics=total_inquiries,avg_confidence,category_distribution
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Response
```json
{
  "timeRange": "week",
  "metrics": {
    "totalInquiries": 234,
    "averageConfidence": 0.876,
    "categoryDistribution": {
      "quote_request": 102,
      "technical_spec": 67,
      "capability": 45,
      "partnership": 20
    },
    "responseTime": {
      "p50": 1.23,
      "p95": 2.45,
      "p99": 3.67
    }
  },
  "timeSeries": [
    {
      "timestamp": "2025-01-07T00:00:00Z",
      "value": 28
    },
    {
      "timestamp": "2025-01-08T00:00:00Z",
      "value": 35
    },
    {
      "timestamp": "2025-01-09T00:00:00Z",
      "value": 42
    },
    {
      "timestamp": "2025-01-10T00:00:00Z",
      "value": 31
    },
    {
      "timestamp": "2025-01-11T00:00:00Z",
      "value": 38
    },
    {
      "timestamp": "2025-01-12T00:00:00Z",
      "value": 29
    },
    {
      "timestamp": "2025-01-13T00:00:00Z",
      "value": 31
    }
  ]
}
```