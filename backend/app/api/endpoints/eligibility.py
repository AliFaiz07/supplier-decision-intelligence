"""
Eligibility Endpoint: Evaluates candidate suppliers against business constraints.
"""

from fastapi import APIRouter
from typing import Dict, Any
from app.core.eligibility_engine import evaluate_all_suppliers_for_requirement
from app.core.latency import apply_controlled_latency

router = APIRouter()

@router.post("/evaluate")
async def evaluate_eligibility(requirement: Dict[str, Any]):
    await apply_controlled_latency("general")
    return evaluate_all_suppliers_for_requirement(requirement)
