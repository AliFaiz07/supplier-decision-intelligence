"""
Controlled Processing Latency Utility for Enterprise POC Realism (Prompt Section 22).
Simulates realistic backend enterprise pipeline computation time (500ms - 1200ms).
"""

import asyncio
import random
from app.config import settings

async def apply_controlled_latency(operation_type: str = "general"):
    """
    Applies brief, realistic processing pause (500ms - 1200ms).
    Can be toggled via ENABLE_ARTIFICIAL_LATENCY in settings.
    """
    if not settings.ENABLE_ARTIFICIAL_LATENCY:
        return

    # Operation-specific latency ranges (in seconds)
    ranges = {
        "analyze": (0.7, 1.2),
        "what_if": (0.4, 0.7),
        "supplier_360": (0.5, 0.9),
        "ai_explanation": (0.6, 1.1),
        "data_explorer": (0.3, 0.5),
        "general": (0.4, 0.8)
    }
    low, high = ranges.get(operation_type, (0.4, 0.8))
    delay = random.uniform(low, high)
    await asyncio.sleep(delay)
