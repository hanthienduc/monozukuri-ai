"""
Data models for Manufacturing Inquiry Classification
Minimal implementation to pass tests (TDD Green Phase)
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict


class CategoryType(str, Enum):
    """Classification categories for manufacturing inquiries"""
    QUOTE_REQUEST = "QUOTE_REQUEST"
    TECHNICAL_SPECIFICATION = "TECHNICAL_SPECIFICATION"
    CAPABILITY_QUESTION = "CAPABILITY_QUESTION"
    PARTNERSHIP_INQUIRY = "PARTNERSHIP_INQUIRY"
    GENERAL_INQUIRY = "GENERAL_INQUIRY"
    UNKNOWN = "UNKNOWN"


class InquirySource(str, Enum):
    """Source of the inquiry"""
    WEB_FORM = "web_form"
    EMAIL = "email"
    CHAT = "chat"
    PHONE = "phone"
    API = "api"


class Priority(str, Enum):
    """Business priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Language(str, Enum):
    """Supported languages"""
    EN = "en"
    JA = "ja"
    OTHER = "other"


class InquiryMetadata(BaseModel):
    """Optional metadata for inquiries"""
    source: Optional[InquirySource] = None
    customer_id: Optional[str] = None
    timestamp: Optional[datetime] = None
    priority: Optional[Priority] = None


class ClassificationRequest(BaseModel):
    """Request model for classification API"""
    text: str = Field(..., min_length=10, max_length=5000)
    metadata: Optional[InquiryMetadata] = None
    
    @field_validator('text')
    @classmethod
    def validate_text(cls, v):
        if not v or v.isspace():
            raise ValueError("Inquiry text cannot be empty")
        return v.strip()


class CategoryScore(BaseModel):
    """Category with confidence score"""
    category: CategoryType
    confidence: float = Field(..., ge=0.0, le=1.0)


class ClassificationResponse(BaseModel):
    """Response model for classification API"""
    id: str
    primary_category: CategoryType
    confidence: float = Field(..., ge=0.0, le=1.0)
    all_categories: List[CategoryScore]
    language: Language
    suggested_actions: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    processing_time_ms: int
    metadata: Dict[str, Any]
    
    model_config = ConfigDict(
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )