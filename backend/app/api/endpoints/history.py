"""
Decision History & Procurement Memory Endpoint:
Retrieve decision audit log, inspect decision traces, evaluate expected vs actual outcomes,
and query the continuous learning procurement memory layer.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from pydantic import BaseModel
from app.core.decision_history_manager import get_history_manager
from app.core.latency import apply_controlled_latency

router = APIRouter()

class OutcomeRequest(BaseModel):
    actual_otif_pct: float
    actual_avg_unit_price_eur: float
    actual_lead_time_days: int
    actual_defect_rate_pct: float
    outcome_status: str
    procurement_lesson: str

@router.get("")
async def list_decision_history():
    await apply_controlled_latency("general")
    mgr = get_history_manager()
    return mgr.get_all_decisions()

@router.get("/memory")
async def get_procurement_memory():
    """Returns closed-loop learning summary comparing expected vs actual procurement outcomes."""
    mgr = get_history_manager()
    return mgr.get_procurement_memory_summary()

@router.get("/{decision_id}")
async def get_decision_trace(decision_id: str):
    mgr = get_history_manager()
    record = mgr.get_decision_by_id(decision_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Decision {decision_id} not found.")
    return record

@router.post("/{decision_id}/outcome")
async def record_decision_outcome(decision_id: str, request: OutcomeRequest):
    """Records post-award empirical procurement outcome observation for a decision."""
    mgr = get_history_manager()
    updated = mgr.record_outcome(decision_id, request.dict())
    if not updated:
        raise HTTPException(status_code=404, detail=f"Decision {decision_id} not found.")
    return updated
