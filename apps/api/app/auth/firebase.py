"""
Firebase authentication for the API
Minimal implementation to pass tests (TDD Green Phase)
"""

import os
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any


def create_test_token(user_id: str, role: str = "user", expires_at: Optional[datetime] = None) -> str:
    """
    Create a test JWT token for testing purposes
    
    Args:
        user_id: User identifier
        role: User role (user, admin)
        expires_at: Token expiration time
        
    Returns:
        JWT token string
    """
    if expires_at is None:
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": expires_at.timestamp()
    }
    
    secret_key = os.getenv('JWT_SECRET', 'test_secret_key')
    return jwt.encode(payload, secret_key, algorithm='HS256')


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode a JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        AuthenticationError: If token is invalid or expired
    """
    from app.exceptions import AuthenticationError
    
    try:
        secret_key = os.getenv('JWT_SECRET', 'test_secret_key')
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        
        # Check expiration
        if 'exp' in payload and datetime.fromtimestamp(payload['exp'], tz=timezone.utc) < datetime.now(timezone.utc):
            raise AuthenticationError("Token has expired")
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise AuthenticationError(f"Invalid token: {str(e)}")


class FirebaseAuth:
    """Firebase authentication service"""
    
    def __init__(self):
        self.project_id = os.getenv('FIREBASE_PROJECT_ID', 'test-project')
    
    async def verify_id_token(self, token: str) -> Dict[str, Any]:
        """
        Verify Firebase ID token
        
        For testing, this uses JWT verification
        In production, this would use Firebase Admin SDK
        """
        return verify_token(token)
    
    async def get_user(self, uid: str) -> Dict[str, Any]:
        """Get user information"""
        # Mock implementation for testing
        return {
            "uid": uid,
            "email": f"{uid}@example.com",
            "role": "user"
        }