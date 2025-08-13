"""
Test fixtures and sample data for Manufacturing Inquiry Classification tests
These fixtures provide consistent test data across all test suites
"""

import pytest
from datetime import datetime, timedelta
from typing import Dict, List

# Sample inquiry texts by category
SAMPLE_INQUIRIES = {
    "quote_requests": [
        "We need a quote for 1000 aluminum brackets with custom drilling",
        "Please provide pricing for 500 steel components",
        "Can you quote us for manufacturing 10,000 plastic housings?",
        "Request for quotation: CNC machined parts, quantity 250",
        "Price inquiry for custom metal fabrication project"
    ],
    "technical_specifications": [
        "Can you manufacture parts with 0.001mm tolerance using SUS304 steel?",
        "We need components that meet ASTM A36 specifications",
        "Required: Parts with surface roughness Ra 0.8 micrometers",
        "Looking for manufacturer capable of ±0.005 inch tolerances",
        "Need heat treatment to achieve 45-50 HRC hardness"
    ],
    "capability_questions": [
        "Do you have 5-axis CNC machines for complex geometries?",
        "Can your facility handle titanium machining?",
        "What is your maximum part size for injection molding?",
        "Do you offer anodizing and powder coating services?",
        "Are you ISO 9001 and AS9100 certified?"
    ],
    "partnership_inquiries": [
        "We're looking for a long-term manufacturing partner in Japan",
        "Interested in establishing strategic partnership for automotive parts",
        "Seeking reliable supplier for ongoing production needs",
        "Want to discuss exclusive manufacturing agreement",
        "Looking for OEM partner with engineering support capabilities"
    ],
    "general_inquiries": [
        "What are your business hours?",
        "Do you ship internationally?",
        "What payment terms do you offer?",
        "Can we schedule a factory tour?",
        "What is your typical lead time?"
    ],
    "japanese_inquiries": [
        "アルミニウム部品500個の見積もりをお願いします",
        "SUS304ステンレス鋼で0.001mmの公差で製造できますか？",
        "5軸CNC加工機はありますか？",
        "長期的な製造パートナーを探しています",
        "ISO 9001認証を取得していますか？"
    ],
    "ambiguous_inquiries": [
        "Can you provide pricing for parts that meet ISO 9001 standards?",
        "We need help with our manufacturing project",
        "Looking for a supplier who can handle our requirements",
        "Interested in your services for a new product",
        "Can you assist with technical specifications and pricing?"
    ],
    "edge_cases": [
        "Hi",  # Too short
        "x" * 5001,  # Too long
        "",  # Empty
        "   ",  # Whitespace only
        "!!!@@@###$$$%%%",  # Special characters only
        "😊🔧⚙️",  # Emojis only
        "Quote 見積もり mixed language 製造",  # Mixed languages
    ]
}

# Expected classifications for validation
EXPECTED_CLASSIFICATIONS = {
    "We need a quote for 1000 aluminum brackets with custom drilling": {
        "category": "QUOTE_REQUEST",
        "min_confidence": 0.9,
        "language": "en"
    },
    "Can you manufacture parts with 0.001mm tolerance using SUS304 steel?": {
        "category": "TECHNICAL_SPECIFICATION",
        "min_confidence": 0.85,
        "language": "en"
    },
    "Do you have 5-axis CNC machines for complex geometries?": {
        "category": "CAPABILITY_QUESTION",
        "min_confidence": 0.8,
        "language": "en"
    },
    "We're looking for a long-term manufacturing partner in Japan": {
        "category": "PARTNERSHIP_INQUIRY",
        "min_confidence": 0.85,
        "language": "en"
    },
    "What are your business hours?": {
        "category": "GENERAL_INQUIRY",
        "min_confidence": 0.8,
        "language": "en"
    },
    "アルミニウム部品500個の見積もりをお願いします": {
        "category": "QUOTE_REQUEST",
        "min_confidence": 0.85,
        "language": "ja"
    }
}

# Mock OpenAI responses for testing
MOCK_OPENAI_RESPONSES = {
    "quote_request": {
        "choices": [{
            "message": {
                "content": '{"category": "QUOTE_REQUEST", "confidence": 0.95, "keywords": ["quote", "aluminum", "brackets", "1000", "custom"]}'
            }
        }]
    },
    "technical_spec": {
        "choices": [{
            "message": {
                "content": '{"category": "TECHNICAL_SPECIFICATION", "confidence": 0.88, "keywords": ["tolerance", "0.001mm", "SUS304", "steel"]}'
            }
        }]
    },
    "capability": {
        "choices": [{
            "message": {
                "content": '{"category": "CAPABILITY_QUESTION", "confidence": 0.82, "keywords": ["5-axis", "CNC", "complex", "geometries"]}'
            }
        }]
    },
    "partnership": {
        "choices": [{
            "message": {
                "content": '{"category": "PARTNERSHIP_INQUIRY", "confidence": 0.87, "keywords": ["long-term", "partner", "manufacturing", "Japan"]}'
            }
        }]
    },
    "general": {
        "choices": [{
            "message": {
                "content": '{"category": "GENERAL_INQUIRY", "confidence": 0.75, "keywords": ["business", "hours"]}'
            }
        }]
    }
}

@pytest.fixture
def sample_quote_inquiry():
    """Fixture for a standard quote request inquiry"""
    return {
        "text": "We need a quote for 1000 aluminum brackets with custom drilling",
        "expected_category": "QUOTE_REQUEST",
        "min_confidence": 0.9,
        "expected_language": "en",
        "expected_keywords": ["quote", "aluminum", "brackets", "1000"]
    }

@pytest.fixture
def sample_technical_inquiry():
    """Fixture for a technical specification inquiry"""
    return {
        "text": "Can you manufacture parts with 0.001mm tolerance using SUS304 steel?",
        "expected_category": "TECHNICAL_SPECIFICATION",
        "min_confidence": 0.85,
        "expected_language": "en",
        "expected_keywords": ["tolerance", "0.001mm", "SUS304", "steel"]
    }

@pytest.fixture
def sample_japanese_inquiry():
    """Fixture for a Japanese language inquiry"""
    return {
        "text": "アルミニウム部品500個の見積もりをお願いします",
        "expected_category": "QUOTE_REQUEST",
        "expected_language": "ja",
        "min_confidence": 0.85,
        "expected_keywords": ["アルミニウム", "500個", "見積もり"]
    }

@pytest.fixture
def sample_ambiguous_inquiry():
    """Fixture for an ambiguous inquiry that could fit multiple categories"""
    return {
        "text": "Can you provide pricing for parts that meet ISO 9001 standards?",
        "possible_categories": ["QUOTE_REQUEST", "TECHNICAL_SPECIFICATION", "CAPABILITY_QUESTION"],
        "min_confidence": 0.6,
        "max_confidence": 0.85
    }

@pytest.fixture
def valid_metadata():
    """Fixture for valid metadata"""
    return {
        "source": "web_form",
        "customer_id": "cust_12345",
        "priority": "high",
        "timestamp": datetime.utcnow().isoformat()
    }

@pytest.fixture
def valid_auth_token():
    """Fixture for a valid authentication token"""
    # In real implementation, this would generate a proper JWT
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdF91c2VyIiwicm9sZSI6InVzZXIiLCJleHAiOjE3MzYwMDAwMDB9.test_signature"

@pytest.fixture
def expired_auth_token():
    """Fixture for an expired authentication token"""
    # In real implementation, this would generate an expired JWT
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdF91c2VyIiwicm9sZSI6InVzZXIiLCJleHAiOjE2MDAwMDAwMDB9.expired_signature"

@pytest.fixture
def admin_auth_token():
    """Fixture for an admin authentication token"""
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW5fdXNlciIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTczNjAwMDAwMH0.admin_signature"

@pytest.fixture
def mock_firestore_document():
    """Fixture for a mock Firestore document"""
    return {
        "id": "clf_123e4567-e89b-12d3-a456-426614174000",
        "text": "We need a quote for 1000 aluminum brackets",
        "language": "en",
        "classification": {
            "primary_category": "QUOTE_REQUEST",
            "confidence": 0.95,
            "all_categories": [
                {"category": "QUOTE_REQUEST", "confidence": 0.95},
                {"category": "TECHNICAL_SPECIFICATION", "confidence": 0.12}
            ],
            "model_version": "v1.2.0"
        },
        "metadata": {
            "source": "web_form",
            "customer_id": "cust_12345",
            "processed_at": datetime.utcnow(),
            "processing_time_ms": 145
        },
        "embeddings": [0.1, 0.2, 0.3],  # Simplified embedding vector
        "keywords": ["quote", "aluminum", "brackets", "1000"],
        "suggested_actions": ["Route to sales team", "Generate quote template"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

@pytest.fixture
def mock_weaviate_response():
    """Fixture for a mock Weaviate vector search response"""
    return {
        "data": {
            "Get": {
                "ManufacturingInquiry": [
                    {
                        "text": "Need quote for aluminum parts",
                        "category": "QUOTE_REQUEST",
                        "confidence": 0.92,
                        "_additional": {
                            "distance": 0.15,
                            "certainty": 0.85
                        }
                    },
                    {
                        "text": "Aluminum fabrication pricing request",
                        "category": "QUOTE_REQUEST",
                        "confidence": 0.89,
                        "_additional": {
                            "distance": 0.18,
                            "certainty": 0.82
                        }
                    }
                ]
            }
        }
    }

@pytest.fixture
def mock_redis_cache():
    """Fixture for mock Redis cache operations"""
    class MockRedis:
        def __init__(self):
            self.cache = {}
        
        async def get(self, key: str):
            return self.cache.get(key)
        
        async def set(self, key: str, value: str, ex: int = None):
            self.cache[key] = value
            return True
        
        async def delete(self, key: str):
            if key in self.cache:
                del self.cache[key]
                return 1
            return 0
        
        async def exists(self, key: str):
            return key in self.cache
    
    return MockRedis()

@pytest.fixture
def performance_test_config():
    """Fixture for performance test configuration"""
    return {
        "target_response_time_ms": 200,
        "target_throughput_rps": 100,
        "max_error_rate": 0.01,
        "test_duration_seconds": 300,
        "concurrent_users": 100,
        "ramp_up_time_seconds": 120
    }

@pytest.fixture
def batch_test_data():
    """Fixture for batch testing with multiple inquiries"""
    inquiries = []
    for category, texts in SAMPLE_INQUIRIES.items():
        if category != "edge_cases":
            for text in texts[:2]:  # Take first 2 from each category
                inquiries.append({
                    "text": text,
                    "category": category
                })
    return inquiries

# Helper functions for test data generation

def generate_random_inquiry(category: str = None) -> str:
    """Generate a random inquiry text, optionally from a specific category"""
    import random
    
    if category and category in SAMPLE_INQUIRIES:
        return random.choice(SAMPLE_INQUIRIES[category])
    
    all_inquiries = []
    for cat, texts in SAMPLE_INQUIRIES.items():
        if cat != "edge_cases":
            all_inquiries.extend(texts)
    
    return random.choice(all_inquiries)

def generate_test_metadata() -> Dict:
    """Generate random metadata for testing"""
    import random
    
    sources = ["web_form", "email", "chat", "phone", "api"]
    priorities = ["low", "medium", "high", "urgent"]
    
    return {
        "source": random.choice(sources),
        "customer_id": f"cust_{random.randint(10000, 99999)}",
        "priority": random.choice(priorities),
        "timestamp": datetime.utcnow().isoformat()
    }

def create_mock_classification_response(
    category: str = "QUOTE_REQUEST",
    confidence: float = 0.95,
    language: str = "en",
    processing_time_ms: int = 145
) -> Dict:
    """Create a mock classification response for testing"""
    return {
        "id": f"clf_{datetime.utcnow().timestamp()}",
        "primary_category": category,
        "confidence": confidence,
        "all_categories": [
            {"category": category, "confidence": confidence},
            {"category": "GENERAL_INQUIRY", "confidence": 0.1}
        ],
        "language": language,
        "keywords": ["test", "keyword"],
        "suggested_actions": ["Test action"],
        "processing_time_ms": processing_time_ms,
        "metadata": {
            "model_version": "v1.2.0",
            "processed_at": datetime.utcnow().isoformat(),
            "fallback_used": False
        }
    }