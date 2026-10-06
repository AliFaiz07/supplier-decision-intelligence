"""
System Endpoint: Data health status, validation checks, and cache reload.
"""

from fastapi import APIRouter
from app.core.data_validator import check_data_health
from app.core.data_provider import get_data_provider

router = APIRouter()

@router.get("/health")
async def get_system_health():
    return check_data_health()

@router.post("/reload")
async def reload_system_data():
    provider = get_data_provider()
    provider.reload_data()
    health = check_data_health()
    return {
        "status": "RELOADED",
        "data_health": health
    }
