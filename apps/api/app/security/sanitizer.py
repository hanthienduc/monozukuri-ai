"""
Input sanitization for Manufacturing Inquiry Classification
Phase 4: Security Hardening
"""

import re
import html
from typing import Any, Dict


class InputSanitizer:
    """Sanitize user inputs to prevent injection attacks"""
    
    # Patterns that might indicate prompt injection
    INJECTION_PATTERNS = [
        r"ignore\s+all\s+previous",
        r"disregard\s+instructions",
        r"system\s*:\s*",
        r"assistant\s*:\s*",
        r"###\s*instruction",
        r"<\|.*?\|>",
        r"\[INST\].*?\[/INST\]",
    ]
    
    # Maximum allowed lengths
    MAX_TEXT_LENGTH = 5000
    MAX_METADATA_SIZE = 1024
    
    @classmethod
    def sanitize_text(cls, text: str) -> str:
        """
        Sanitize inquiry text input
        
        Args:
            text: Raw text input
            
        Returns:
            Sanitized text
            
        Raises:
            ValueError: If text contains injection attempts
        """
        if not text:
            return ""
        
        # Check length
        if len(text) > cls.MAX_TEXT_LENGTH:
            text = text[:cls.MAX_TEXT_LENGTH]
        
        # HTML escape
        text = html.escape(text)
        
        # Check for injection patterns
        text_lower = text.lower()
        for pattern in cls.INJECTION_PATTERNS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                # Log potential injection attempt (in production)
                # For now, sanitize by removing the pattern
                text = re.sub(pattern, "", text, flags=re.IGNORECASE)
        
        # Remove control characters except newlines and tabs
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]', '', text)
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    @classmethod
    def sanitize_metadata(cls, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sanitize metadata dictionary
        
        Args:
            metadata: Raw metadata
            
        Returns:
            Sanitized metadata
        """
        if not metadata:
            return {}
        
        # Check size
        import json
        if len(json.dumps(metadata)) > cls.MAX_METADATA_SIZE:
            return {}  # Reject oversized metadata
        
        # Sanitize each value
        sanitized = {}
        for key, value in metadata.items():
            # Only allow alphanumeric keys with underscores
            if not re.match(r'^[a-zA-Z0-9_]+$', key):
                continue
            
            # Sanitize values based on type
            if isinstance(value, str):
                sanitized[key] = html.escape(value)[:256]  # Limit string length
            elif isinstance(value, (int, float, bool)):
                sanitized[key] = value
            elif isinstance(value, list):
                # Only allow simple lists
                sanitized[key] = [
                    html.escape(str(item))[:100] 
                    for item in value[:10]  # Limit list size
                ]
            # Skip complex objects
        
        return sanitized
    
    @classmethod
    def validate_api_key(cls, api_key: str) -> bool:
        """
        Validate API key format
        
        Args:
            api_key: API key to validate
            
        Returns:
            True if valid format
        """
        if not api_key:
            return False
        
        # Check format (alphanumeric with dashes/underscores)
        if not re.match(r'^[a-zA-Z0-9_-]{20,100}$', api_key):
            return False
        
        return True
    
    @classmethod
    def sanitize_query_param(cls, param: str, max_length: int = 100) -> str:
        """
        Sanitize query parameters
        
        Args:
            param: Query parameter value
            max_length: Maximum allowed length
            
        Returns:
            Sanitized parameter
        """
        if not param:
            return ""
        
        # HTML escape and limit length
        param = html.escape(param)[:max_length]
        
        # Remove dangerous characters
        param = re.sub(r'[<>\'\"\\]', '', param)
        
        return param.strip()