"""
Requirements Endpoint: Manage, list, and create procurement requirements.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.core.data_provider import get_data_provider
from app.core.latency import apply_controlled_latency

router = APIRouter()

@router.get("")
async def list_requirements():
    await apply_controlled_latency("general")
    provider = get_data_provider()
    return provider.get_requirements()

@router.get("/{req_id}")
async def get_requirement(req_id: str):
    provider = get_data_provider()
    reqs = provider.get_requirements()
    for r in reqs:
        if r.get("requirement_id") == req_id:
            return r
    raise HTTPException(status_code=404, detail=f"Requirement {req_id} not found.")

@router.post("")
async def create_custom_requirement(requirement_data: Dict[str, Any]):
    provider = get_data_provider()
    # In a real app this would persist, here we return enriched requirement
    req_id = f"REQ-CUSTOM-{requirement_data.get('material_id', 'MAT')}"
    enriched = {
        "requirement_id": req_id,
        "title": requirement_data.get("title", f"Custom Sourcing for {requirement_data.get('material_id')}"),
        **requirement_data
    }
    return enriched
