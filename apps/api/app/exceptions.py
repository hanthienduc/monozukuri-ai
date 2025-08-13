"""
Custom exceptions for the Manufacturing Inquiry Classification API
"""


class RateLimitError(Exception):
    """Raised when rate limit is exceeded"""
    pass


class AuthenticationError(Exception):
    """Raised when authentication fails"""
    pass


class AuthorizationError(Exception):
    """Raised when authorization fails"""
    pass


class ValidationError(Exception):
    """Raised when validation fails"""
    pass


class ClassificationError(Exception):
    """Raised when classification fails"""
    pass