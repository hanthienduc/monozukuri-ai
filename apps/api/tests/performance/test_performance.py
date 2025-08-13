"""
Performance tests for Manufacturing Inquiry Classification API
Phase 4: Performance Optimization
"""

import pytest
import asyncio
import time
from statistics import mean, stdev, quantiles
from app.services.classification import ClassificationEngine


class TestPerformance:
    """Performance tests for classification engine"""
    
    @pytest.fixture
    def engine(self):
        """Create classification engine"""
        return ClassificationEngine(enable_cache=True)
    
    @pytest.fixture
    def test_inquiries(self):
        """Sample inquiries for performance testing"""
        return [
            "We need a quote for 1000 aluminum brackets",
            "Can you manufacture parts with 0.001mm tolerance?",
            "Do you have 5-axis CNC machines?",
            "Looking for a long-term manufacturing partner",
            "What are your business hours?",
            "アルミニウム部品500個の見積もりをお願いします",
            "Can you provide pricing for ISO 9001 parts?",
            "We need technical specifications for steel components",
            "Do you offer anodizing services?",
            "Interested in partnership opportunities"
        ]
    
    @pytest.mark.asyncio
    async def test_response_time_p95(self, engine, test_inquiries):
        """Test that 95th percentile response time is under 200ms"""
        response_times = []
        
        # Warm up cache
        for inquiry in test_inquiries[:3]:
            await engine.classify(inquiry)
        
        # Measure response times
        for _ in range(5):  # 5 iterations
            for inquiry in test_inquiries:
                start = time.perf_counter()
                await engine.classify(inquiry)
                end = time.perf_counter()
                response_times.append((end - start) * 1000)  # Convert to ms
        
        # Calculate statistics
        p95 = quantiles(response_times, n=20)[18]  # 95th percentile
        avg = mean(response_times)
        std = stdev(response_times) if len(response_times) > 1 else 0
        
        print(f"\nPerformance Metrics:")
        print(f"  Average: {avg:.2f}ms")
        print(f"  Std Dev: {std:.2f}ms")
        print(f"  P95: {p95:.2f}ms")
        print(f"  Min: {min(response_times):.2f}ms")
        print(f"  Max: {max(response_times):.2f}ms")
        
        # Assert performance requirement
        assert p95 < 200, f"P95 response time {p95:.2f}ms exceeds 200ms requirement"
    
    @pytest.mark.asyncio
    async def test_concurrent_requests_performance(self, engine, test_inquiries):
        """Test performance under concurrent load"""
        async def classify_inquiry(inquiry):
            start = time.perf_counter()
            await engine.classify(inquiry)
            return (time.perf_counter() - start) * 1000
        
        # Run 10 concurrent requests
        tasks = [classify_inquiry(inquiry) for inquiry in test_inquiries]
        response_times = await asyncio.gather(*tasks)
        
        avg = mean(response_times)
        max_time = max(response_times)
        
        print(f"\nConcurrent Performance:")
        print(f"  Average: {avg:.2f}ms")
        print(f"  Max: {max_time:.2f}ms")
        
        # All requests should complete within reasonable time
        assert max_time < 500, f"Max response time {max_time:.2f}ms too high under load"
    
    @pytest.mark.asyncio
    async def test_cache_performance(self, engine):
        """Test that cached responses are significantly faster"""
        inquiry = "We need a quote for 1000 aluminum brackets"
        
        # First call (not cached)
        start = time.perf_counter()
        result1 = await engine.classify(inquiry)
        time1 = (time.perf_counter() - start) * 1000
        
        # Second call (should be cached)
        start = time.perf_counter()
        result2 = await engine.classify(inquiry)
        time2 = (time.perf_counter() - start) * 1000
        
        print(f"\nCache Performance:")
        print(f"  First call: {time1:.2f}ms")
        print(f"  Cached call: {time2:.2f}ms")
        print(f"  Speedup: {time1/time2:.1f}x")
        
        # Cached should be at least 2x faster
        assert time2 < time1 / 2, f"Cache not providing expected speedup"