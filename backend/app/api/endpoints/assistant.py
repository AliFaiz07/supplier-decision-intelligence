"""
Assistant Endpoint: Controlled procurement AI assistant endpoint.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.assistant_service import answer_procurement_question, investigate_procurement_issue
from app.core.latency import apply_controlled_latency

router = APIRouter()

class AssistantRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

@router.post("/ask")
async def ask_assistant(request: AssistantRequest):
    await apply_controlled_latency("ai_explanation")
    return answer_procurement_question(query=request.query, context=request.context)

@router.post("/investigate")
async def execute_structured_investigation(request: AssistantRequest):
    """Executes a structured, grounded root-cause procurement investigation."""
    await apply_controlled_latency("ai_explanation")
    return investigate_procurement_issue(query=request.query, context=request.context)
