"""
Overview Endpoint: High-level procurement intelligence, active signals, KPIs, alerts.
"""

from fastapi import APIRouter
from app.core.analytics import get_overview_dashboard_kpis
from app.core.latency import apply_controlled_latency

router = APIRouter()

@router.get("/kpis")
async def get_overview():
    await apply_controlled_latency("general")
    return get_overview_dashboard_kpis()
