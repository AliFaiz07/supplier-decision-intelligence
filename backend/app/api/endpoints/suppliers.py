"""
Suppliers Endpoint: Supplier portfolio, Supplier 360 detailed view, comparison data.
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from app.core.data_provider import get_data_provider
from app.core.analytics import calculate_supplier_metrics
from app.core.evidence_builder import build_supplier_evidence_package
from app.core.latency import apply_controlled_latency

router = APIRouter()

@router.get("")
async def list_suppliers(material_id: Optional[str] = None):
    await apply_controlled_latency("general")
    provider = get_data_provider()
    suppliers = provider.get_suppliers()
    
    summarized = []
    for s in suppliers:
        s_id = s["supplier_id"]
        m = calculate_supplier_metrics(s_id, material_id=material_id)
        summarized.append({
            **s,
            "metrics": m
        })
    return summarized

@router.get("/{supplier_id}")
async def get_supplier_360(supplier_id: str, material_id: Optional[str] = None):
    await apply_controlled_latency("supplier_360")
    provider = get_data_provider()
    supplier = provider.get_supplier_by_id(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail=f"Supplier {supplier_id} not found.")

    metrics = calculate_supplier_metrics(supplier_id, material_id=material_id)
    pos = provider.get_pushed_pos(supplier_id=supplier_id, material_id=material_id)
    grs = provider.get_goods_receipts(supplier_id=supplier_id, material_id=material_id)
    qms = provider.get_quality_records(supplier_id=supplier_id, material_id=material_id)
    contracts = provider.get_contracts(supplier_id=supplier_id, material_id=material_id)
    p_hist = provider.get_price_history(supplier_id=supplier_id, material_id=material_id)
    risks = provider.get_risk_events(supplier_id=supplier_id)
    quotes = provider.get_quotations(material_id=material_id)
    sup_quotes = [q for q in quotes if q.get("supplier_id") == supplier_id]

    return {
        "profile": supplier,
        "metrics": metrics,
        "recent_purchase_orders": pos[-8:],
        "recent_goods_receipts": grs[-8:],
        "recent_quality_records": qms[-8:],
        "contracts": contracts,
        "price_history": p_hist[-24:],
        "risk_events": risks,
        "active_quotations": sup_quotes
    }

@router.get("/{supplier_id}/evidence/{material_id}")
async def get_evidence(supplier_id: str, material_id: str):
    await apply_controlled_latency("general")
    return build_supplier_evidence_package(supplier_id=supplier_id, material_id=material_id)
