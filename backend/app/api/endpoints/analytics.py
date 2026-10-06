"""
Dedicated Analytics Router for SAP Supplier Decision Intelligence Platform.
Exposes rich, deterministic procurement intelligence endpoints across:
Overview, Spend, Supplier Performance, Prices, Delivery, Quality, Contracts, Risk, Materials, Plants,
Procurement Anomaly Center, "What Changed?" Engine, and Predictive Forecasting.
"""

from fastapi import APIRouter, Query
from typing import Optional
from app.core.analytics import (
    get_overview_dashboard_kpis,
    get_spend_analytics,
    get_supplier_performance_analytics,
    get_price_intelligence,
    get_delivery_intelligence,
    get_quality_intelligence,
    get_contract_intelligence,
    get_risk_intelligence,
    get_material_intelligence,
    get_plant_intelligence,
    get_procurement_anomalies,
    get_what_changed_analytics,
    get_predictive_forecasts
)
from app.core.latency import apply_controlled_latency

router = APIRouter()

@router.get("/overview")
async def get_overview():
    await apply_controlled_latency("general")
    return get_overview_dashboard_kpis()

@router.get("/spend")
async def get_spend():
    await apply_controlled_latency("general")
    return get_spend_analytics()

@router.get("/suppliers")
async def get_supplier_performance():
    await apply_controlled_latency("general")
    return get_supplier_performance_analytics()

@router.get("/prices")
async def get_prices(material_id: Optional[str] = Query(None)):
    await apply_controlled_latency("general")
    return get_price_intelligence(material_id=material_id)

@router.get("/delivery")
async def get_delivery():
    await apply_controlled_latency("general")
    return get_delivery_intelligence()

@router.get("/quality")
async def get_quality():
    await apply_controlled_latency("general")
    return get_quality_intelligence()

@router.get("/contracts")
async def get_contracts():
    await apply_controlled_latency("general")
    return get_contract_intelligence()

@router.get("/risk")
async def get_risk():
    await apply_controlled_latency("general")
    return get_risk_intelligence()

@router.get("/materials")
async def get_materials(material_id: Optional[str] = Query(None)):
    await apply_controlled_latency("general")
    return get_material_intelligence(material_id=material_id)

@router.get("/plants")
async def get_plants(plant_id: Optional[str] = Query(None)):
    await apply_controlled_latency("general")
    return get_plant_intelligence(plant_id=plant_id)

@router.get("/anomalies")
async def get_anomalies():
    """Returns all active procurement anomalies detected across prices, delivery, quality, contracts, and spend."""
    await apply_controlled_latency("general")
    return get_procurement_anomalies()

@router.get("/what-changed")
async def get_what_changed():
    """Returns month-over-month and quarter-over-quarter procurement telemetry shifts."""
    await apply_controlled_latency("general")
    return get_what_changed_analytics()

@router.get("/forecasts")
async def get_forecasts(
    material_id: Optional[str] = Query(None),
    supplier_id: Optional[str] = Query(None)
):
    """Returns predictive model estimates for price trends, delivery reliability, and spend outlay."""
    await apply_controlled_latency("general")
    return get_predictive_forecasts(material_id=material_id, supplier_id=supplier_id)

@router.get("/leakage")
async def get_leakage():
    """Detects hidden costs, contract discrepancies, maverick spend, defect losses, and freight leakage."""
    await apply_controlled_latency("general")
    from app.core.leakage_detector import detect_procurement_leakage
    return detect_procurement_leakage()

@router.get("/early-warning")
async def get_early_warning():
    """Combines weak signals (price, OTIF, lead-time variance, defects) to detect emerging vendor stress."""
    await apply_controlled_latency("general")
    from app.core.early_warning import detect_early_warning_signals
    return detect_early_warning_signals()

@router.get("/attention-center")
async def get_attention_center():
    """Returns unified Attention Center items categorized by Critical, High, Medium, Informational."""
    await apply_controlled_latency("general")
    from app.core.early_warning import get_attention_center_items
    return get_attention_center_items()
