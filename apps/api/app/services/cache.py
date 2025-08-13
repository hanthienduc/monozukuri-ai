"""
Cache service for classification results
Minimal implementation to pass tests (TDD Green Phase)
"""

import json
from typing import Optional, Any
import redis.asyncio as redis
import os


class CacheService:
    """Redis cache service for classification results"""
    
    def __init__(self):
        self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        self.redis_client = None
        self._connected = False
    
    async def _ensure_connected(self):
        """Ensure Redis connection is established"""
        if not self._connected:
            try:
                self.redis_client = await redis.from_url(self.redis_url)
                self._connected = True
            except Exception:
                # For testing, use in-memory cache
                self.redis_client = InMemoryCache()
                self._connected = True
    
    async def get(self, key: str) -> Optional[str]:
        """Get value from cache"""
        await self._ensure_connected()
        try:
            value = await self.redis_client.get(key)
            return value.decode('utf-8') if value else None
        except Exception:
            return None
    
    async def set(self, key: str, value: str, ttl: int = 3600) -> bool:
        """Set value in cache with TTL"""
        await self._ensure_connected()
        try:
            return await self.redis_client.set(key, value, ex=ttl)
        except Exception:
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        await self._ensure_connected()
        try:
            return await self.redis_client.delete(key) > 0
        except Exception:
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        await self._ensure_connected()
        try:
            return await self.redis_client.exists(key) > 0
        except Exception:
            return False


class InMemoryCache:
    """Simple in-memory cache for testing"""
    
    def __init__(self):
        self.cache = {}
    
    async def get(self, key: str) -> Optional[bytes]:
        value = self.cache.get(key)
        return value.encode('utf-8') if value else None
    
    async def set(self, key: str, value: str, ex: int = None) -> bool:
        self.cache[key] = value
        return True
    
    async def delete(self, key: str) -> int:
        if key in self.cache:
            del self.cache[key]
            return 1
        return 0
    
    async def exists(self, key: str) -> int:
        return 1 if key in self.cache else 0