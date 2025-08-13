"""
Integration tests for Manufacturing Inquiry Classification API endpoints
These tests are written BEFORE implementation (TDD Red Phase)
All tests should FAIL initially
"""

import pytest
import json
from httpx import ASGITransport, AsyncClient
from datetime import datetime, timedelta
from unittest.mock import Mock, patch

# These imports will fail initially - that's expected in TDD
from app.main import app
from app.models.classification import CategoryType
from app.auth.firebase import create_test_token


class TestClassificationEndpoint:
    """Integration tests for POST /api/v1/inquiries/classify"""
    
    @pytest.fixture
    async def client(self):
        """Create async test client"""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac
    
    @pytest.fixture
    def valid_token(self):
        """Generate valid JWT token for testing"""
        return create_test_token(user_id="test_user", role="user")
    
    @pytest.fixture
    def admin_token(self):
        """Generate admin JWT token for testing"""
        return create_test_token(user_id="admin_user", role="admin")
    
    @pytest.fixture
    def valid_payload(self):
        """Valid request payload"""
        return {
            "text": "We need a quote for 1000 aluminum brackets with custom drilling",
            "metadata": {
                "source": "web_form",
                "customer_id": "cust_12345",
                "priority": "high"
            }
        }
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_success(self, client, valid_token, valid_payload):
        """Test successful classification request"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        
        # Act
        response = await client.post(
            "/api/v1/inquiries/classify",
            json=valid_payload,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "id" in data
        assert "primary_category" in data
        assert "confidence" in data
        assert "all_categories" in data
        assert "language" in data
        assert "processing_time_ms" in data
        
        # Validate response values
        assert data["primary_category"] == "QUOTE_REQUEST"
        assert data["confidence"] > 0.8
        assert data["language"] == "en"
        assert data["processing_time_ms"] < 200
        assert len(data["all_categories"]) >= 1
        
        # Validate optional fields
        assert "keywords" in data
        assert "suggested_actions" in data
        assert "metadata" in data
        assert data["metadata"]["model_version"]
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_minimal_request(self, client, valid_token):
        """Test classification with minimal request (only required fields)"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        payload = {"text": "Can you manufacture parts with 0.001mm tolerance?"}
        
        # Act
        response = await client.post(
            "/api/v1/inquiries/classify",
            json=payload,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["primary_category"] == "TECHNICAL_SPECIFICATION"
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_japanese_text(self, client, valid_token):
        """Test classification of Japanese text"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        payload = {"text": "アルミニウム部品500個の見積もりをお願いします"}
        
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
        assert data["language"] == "ja"
        assert data["confidence"] > 0.8
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_validation_text_too_short(self, client, valid_token):
        """Test validation error for text too short"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        payload = {"text": "Hi"}  # Less than 10 characters
        
        # Act
        response = await client.post(
            "/api/v1/inquiries/classify",
            json=payload,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["error"]["code"] == "VALIDATION_ERROR"
        assert "at least 10 characters" in data["error"]["message"]
        assert data["error"]["details"][0]["field"] == "text"
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_validation_text_too_long(self, client, valid_token):
        """Test validation error for text exceeding maximum length"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        payload = {"text": "x" * 5001}  # Exceeds 5000 characters
        
        # Act
        response = await client.post(
            "/api/v1/inquiries/classify",
            json=payload,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["error"]["code"] == "VALIDATION_ERROR"
        assert "exceeds maximum length" in data["error"]["message"]
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_missing_text(self, client, valid_token):
        """Test validation error for missing text field"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        payload = {"metadata": {"source": "web_form"}}  # Missing 'text'
        
        # Act
        response = await client.post(
            "/api/v1/inquiries/classify",
            json=payload,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["error"]["code"] == "VALIDATION_ERROR"
        assert "text" in data["error"]["message"].lower()
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_invalid_metadata(self, client, valid_token):
        """Test validation of metadata fields"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        payload = {
            "text": "Need a quote for parts",
            "metadata": {
                "source": "invalid_source",  # Invalid enum value
                "priority": "super_urgent"   # Invalid enum value
            }
        }
        
        # Act
        response = await client.post(
            "/api/v1/inquiries/classify",
            json=payload,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["error"]["code"] == "VALIDATION_ERROR"
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_no_authentication(self, client, valid_payload):
        """Test that authentication is required"""
        # Act
        response = await client.post(
            "/api/v1/inquiries/classify",
            json=valid_payload
        )
        
        # Assert
        assert response.status_code == 401
        data = response.json()
        assert data["error"]["code"] == "AUTHENTICATION_ERROR"
        assert "authentication" in data["error"]["message"].lower()
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_invalid_token(self, client, valid_payload):
        """Test invalid authentication token"""
        # Arrange
        headers = {"Authorization": "Bearer invalid_token_12345"}
        
        # Act
        response = await client.post(
            "/api/v1/inquiries/classify",
            json=valid_payload,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 401
        data = response.json()
        assert data["error"]["code"] == "AUTHENTICATION_ERROR"
        assert "invalid" in data["error"]["message"].lower()
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_expired_token(self, client, valid_payload):
        """Test expired authentication token"""
        # Arrange
        expired_token = create_test_token(
            user_id="test_user",
            role="user",
            expires_at=datetime.utcnow() - timedelta(hours=1)
        )
        headers = {"Authorization": f"Bearer {expired_token}"}
        
        # Act
        response = await client.post(
            "/api/v1/inquiries/classify",
            json=valid_payload,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 401
        data = response.json()
        assert data["error"]["code"] == "AUTHENTICATION_ERROR"
        assert "expired" in data["error"]["message"].lower()
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_rate_limiting(self, client, valid_token, valid_payload):
        """Test rate limiting (100 requests per minute)"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        
        # Act - Send 101 requests
        responses = []
        for i in range(101):
            response = await client.post(
                "/api/v1/inquiries/classify",
                json={**valid_payload, "text": f"Test inquiry {i}"},
                headers=headers
            )
            responses.append(response)
        
        # Assert
        # First 100 should succeed
        for i in range(100):
            assert responses[i].status_code == 200
        
        # 101st should be rate limited
        assert responses[100].status_code == 429
        data = responses[100].json()
        assert data["error"]["code"] == "RATE_LIMIT_EXCEEDED"
        
        # Check rate limit headers
        assert "X-RateLimit-Limit" in responses[100].headers
        assert "X-RateLimit-Remaining" in responses[100].headers
        assert "X-RateLimit-Reset" in responses[100].headers
        assert int(responses[100].headers["X-RateLimit-Remaining"]) == 0
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_concurrent_requests(self, client, valid_token):
        """Test handling of concurrent requests"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        payloads = [
            {"text": f"Quote request {i}"} for i in range(10)
        ]
        
        # Act - Send concurrent requests
        import asyncio
        tasks = [
            client.post("/api/v1/inquiries/classify", json=payload, headers=headers)
            for payload in payloads
        ]
        responses = await asyncio.gather(*tasks)
        
        # Assert
        for response in responses:
            assert response.status_code == 200
            data = response.json()
            assert "id" in data
            assert data["primary_category"] == "QUOTE_REQUEST"
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_special_characters(self, client, valid_token):
        """Test handling of special characters and emojis"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        payload = {
            "text": "Need quote! @#$% 😊 measurements: 10±0.1mm & tolerances"
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
        assert data["primary_category"] in ["QUOTE_REQUEST", "TECHNICAL_SPECIFICATION"]
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_model_fallback(self, client, valid_token, mocker):
        """Test fallback classification when OpenAI API fails"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        payload = {"text": "We need a quote for 1000 parts"}
        
        # Mock OpenAI failure
        mocker.patch('app.services.openai_client.call', side_effect=Exception("API Error"))
        
        # Act
        response = await client.post(
            "/api/v1/inquiries/classify",
            json=payload,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["primary_category"] != "UNKNOWN"
        assert data["metadata"]["fallback_used"] is True
        assert data["confidence"] < 0.9  # Fallback has lower confidence
    
    @pytest.mark.asyncio
    async def test_classify_endpoint_response_headers(self, client, valid_token, valid_payload):
        """Test that proper response headers are set"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        
        # Act
        response = await client.post(
            "/api/v1/inquiries/classify",
            json=valid_payload,
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        assert response.headers["Content-Type"] == "application/json"
        assert "X-Request-ID" in response.headers
        assert "X-Processing-Time" in response.headers


class TestInquiryRetrievalEndpoint:
    """Integration tests for GET /api/v1/inquiries/{id}"""
    
    @pytest.fixture
    async def client(self):
        async with AsyncClient(app=app, base_url="http://test") as client:
            yield client
    
    @pytest.fixture
    def valid_token(self):
        return create_test_token(user_id="test_user", role="user")
    
    @pytest.mark.asyncio
    async def test_get_inquiry_by_id_success(self, client, valid_token):
        """Test retrieving a classification result by ID"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        
        # First create an inquiry
        create_response = await client.post(
            "/api/v1/inquiries/classify",
            json={"text": "Need a quote for parts"},
            headers=headers
        )
        inquiry_id = create_response.json()["id"]
        
        # Act - Retrieve the inquiry
        response = await client.get(
            f"/api/v1/inquiries/{inquiry_id}",
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == inquiry_id
        assert data["primary_category"] == "QUOTE_REQUEST"
    
    @pytest.mark.asyncio
    async def test_get_inquiry_not_found(self, client, valid_token):
        """Test retrieving non-existent inquiry"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        fake_id = "123e4567-e89b-12d3-a456-426614174000"
        
        # Act
        response = await client.get(
            f"/api/v1/inquiries/{fake_id}",
            headers=headers
        )
        
        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["error"]["code"] == "NOT_FOUND"
    
    @pytest.mark.asyncio
    async def test_get_inquiry_invalid_id_format(self, client, valid_token):
        """Test retrieving inquiry with invalid ID format"""
        # Arrange
        headers = {"Authorization": f"Bearer {valid_token}"}
        invalid_id = "not-a-uuid"
        
        # Act
        response = await client.get(
            f"/api/v1/inquiries/{invalid_id}",
            headers=headers
        )
        
        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["error"]["code"] == "VALIDATION_ERROR"
    
    @pytest.mark.asyncio
    async def test_get_inquiry_requires_auth(self, client):
        """Test that authentication is required to retrieve inquiries"""
        # Act
        response = await client.get("/api/v1/inquiries/some-id")
        
        # Assert
        assert response.status_code == 401
        data = response.json()
        assert data["error"]["code"] == "AUTHENTICATION_ERROR"


class TestStatisticsEndpoint:
    """Integration tests for GET /api/v1/inquiries/stats"""
    
    @pytest.fixture
    async def client(self):
        async with AsyncClient(app=app, base_url="http://test") as client:
            yield client
    
    @pytest.fixture
    def admin_token(self):
        return create_test_token(user_id="admin_user", role="admin")
    
    @pytest.mark.asyncio
    async def test_get_statistics_success(self, client, admin_token):
        """Test retrieving classification statistics"""
        # Arrange
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Act
        response = await client.get(
            "/api/v1/inquiries/stats",
            headers=headers
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "total_classifications" in data
        assert "category_distribution" in data
        assert "average_confidence" in data
        assert "language_distribution" in data
        assert "average_processing_time_ms" in data
    
    @pytest.mark.asyncio
    async def test_get_statistics_requires_admin(self, client):
        """Test that admin role is required for statistics"""
        # Arrange
        user_token = create_test_token(user_id="regular_user", role="user")
        headers = {"Authorization": f"Bearer {user_token}"}
        
        # Act
        response = await client.get(
            "/api/v1/inquiries/stats",
            headers=headers
        )
        
        # Assert
        assert response.status_code == 403
        data = response.json()
        assert data["error"]["code"] == "AUTHORIZATION_ERROR"