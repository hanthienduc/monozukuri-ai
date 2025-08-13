"""
Rate limiting for Manufacturing Inquiry Classification API
Phase 4: Security Hardening
"""

import time
from typing import Dict, Optional
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio


class RateLimiter:
    """Token bucket rate limiter"""
    
    def __init__(
        self,
        requests_per_minute: int = 100,
        burst_size: int = 10,
        cleanup_interval: int = 300
    ):
        """
        Initialize rate limiter
        
        Args:
            requests_per_minute: Allowed requests per minute
            burst_size: Maximum burst size
            cleanup_interval: Seconds between cleanup runs
        """
        self.rate = requests_per_minute / 60  # Requests per second
        self.burst_size = burst_size
        self.cleanup_interval = cleanup_interval
        
        # Token buckets per client
        self.buckets: Dict[str, TokenBucket] = defaultdict(
            lambda: TokenBucket(self.rate, self.burst_size)
        )
        
        # Last cleanup time
        self.last_cleanup = time.time()
    
    async def check_rate_limit(self, client_id: str) -> bool:
        """
        Check if request is allowed
        
        Args:
            client_id: Client identifier (IP, user ID, etc.)
            
        Returns:
            True if allowed, False if rate limited
        """
        # Periodic cleanup of old buckets
        if time.time() - self.last_cleanup > self.cleanup_interval:
            self._cleanup_old_buckets()
        
        bucket = self.buckets[client_id]
        return bucket.consume()
    
    def _cleanup_old_buckets(self):
        """Remove inactive buckets to save memory"""
        current_time = time.time()
        inactive_threshold = 600  # 10 minutes
        
        to_remove = [
            client_id for client_id, bucket in self.buckets.items()
            if current_time - bucket.last_access > inactive_threshold
        ]
        
        for client_id in to_remove:
            del self.buckets[client_id]
        
        self.last_cleanup = current_time
    
    def get_retry_after(self, client_id: str) -> int:
        """
        Get seconds until next request allowed
        
        Args:
            client_id: Client identifier
            
        Returns:
            Seconds to wait
        """
        bucket = self.buckets.get(client_id)
        if not bucket:
            return 0
        
        return bucket.get_retry_after()


class TokenBucket:
    """Token bucket implementation"""
    
    def __init__(self, rate: float, capacity: int):
        """
        Initialize token bucket
        
        Args:
            rate: Token refill rate per second
            capacity: Maximum tokens
        """
        self.rate = rate
        self.capacity = capacity
        self.tokens = capacity
        self.last_refill = time.time()
        self.last_access = time.time()
    
    def consume(self, tokens: int = 1) -> bool:
        """
        Try to consume tokens
        
        Args:
            tokens: Number of tokens to consume
            
        Returns:
            True if successful, False if not enough tokens
        """
        self._refill()
        self.last_access = time.time()
        
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        
        return False
    
    def _refill(self):
        """Refill tokens based on elapsed time"""
        current_time = time.time()
        elapsed = current_time - self.last_refill
        
        # Add tokens based on rate
        tokens_to_add = elapsed * self.rate
        self.tokens = min(self.capacity, self.tokens + tokens_to_add)
        self.last_refill = current_time
    
    def get_retry_after(self) -> int:
        """Get seconds until next token available"""
        if self.tokens >= 1:
            return 0
        
        tokens_needed = 1 - self.tokens
        seconds_needed = tokens_needed / self.rate
        
        return int(seconds_needed + 1)  # Round up


# Global rate limiter instance
rate_limiter = RateLimiter(
    requests_per_minute=100,
    burst_size=10
)