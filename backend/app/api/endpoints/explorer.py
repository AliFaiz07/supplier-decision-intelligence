"""
Data Explorer Endpoint: Inspect underlying mock data across all 22 datasets for audit & validation.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.core.data_provider import get_data_provider
from app.core.latency import apply_controlled_latency

router = APIRouter()

DATASET_DESCRIPTIONS = {
    "suppliers.json": "SAP Vendor Master / Business Partner profiles with risk ratings and capacity",
    "materials.json": "SAP Material Master (MARA/MARC) records, criticality, and standard lead times",
    "plants.json": "SAP Plant and storage location definitions",
    "purchase_orders.json": "Historical SAP Purchase Orders (EKKO/EKPO) spanning 24 months",
    "goods_receipts.json": "Historical SAP Goods Receipts (MSEG/MKPF) recording on-time deviations",
    "delivery_history.json": "Granular delivery deviation and logistics root-cause logs",
    "quality_records.json": "SAP Quality Management (QM) inspection lots, PPM, and defect classes",
    "invoices.json": "SAP Vendor Invoices (RBKP/RSEG) recording 3-way match and price variances",
    "contracts.json": "SAP Purchasing Outline Agreements / Framework Contracts with volume rebates",
    "purchasing_info_records.json": "SAP Purchasing Info Records (PIR/EINA/EINE) with standard prices",
    "source_list.json": "SAP Source List (EORD) entries with fixed and blocked vendor flags",
    "quota_arrangements.json": "SAP Quota Arrangement (EQUK/EQUP) multi-sourcing split allocations",
    "price_history.json": "Monthly historical unit price records over 24-month horizon",
    "risk_events.json": "Active and historical supply chain risk signals and alerts",
    "supplier_performance.json": "Periodic SAP-style supplier evaluation scorecard snapshots",
    "purchase_requisitions.json": "Open SAP Purchase Requisitions (EBAN) awaiting sourcing",
    "rfqs.json": "SAP Requests for Quotation (RFQ) distributed to eligible suppliers",
    "supplier_quotations.json": "Active formal quotations received from suppliers with lead times",
    "country_information.json": "Country trade zone, freight factors, and synthetic customs benchmarks",
    "currency_information.json": "Exchange rates and currency formatting benchmarks",
    "procurement_requirements.json": "Predefined standard procurement requirements matching scenarios",
    "scenario_definitions.json": "Predefined decision scenario definitions and priority weights"
}

@router.get("/datasets")
async def list_datasets():
    provider = get_data_provider()
    result = []
    for filename, desc in DATASET_DESCRIPTIONS.items():
        records = provider.get_raw_dataset(filename)
        result.append({
            "filename": filename,
            "display_name": filename.replace(".json", "").replace("_", " ").title(),
            "description": desc,
            "record_count": len(records) if isinstance(records, list) else len(records.keys())
        })
    return result

@router.get("/dataset/{filename}")
async def get_dataset_records(
    filename: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
    search: Optional[str] = None
):
    await apply_controlled_latency("data_explorer")
    provider = get_data_provider()
    records = provider.get_raw_dataset(filename)
    
    if not records and filename not in DATASET_DESCRIPTIONS:
        raise HTTPException(status_code=404, detail=f"Dataset {filename} not found.")

    if not isinstance(records, list):
        return {"filename": filename, "total_records": 1, "page": 1, "data": records}

    # Filter by search string if provided
    filtered = records
    if search:
        s_term = search.lower()
        filtered = [
            r for r in records
            if any(s_term in str(v).lower() for v in r.values())
        ]

    total = len(filtered)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_data = filtered[start_idx:end_idx]

    return {
        "filename": filename,
        "total_records": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
        "data": page_data
    }

@router.get("/knowledge-graph")
async def get_knowledge_graph(
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    depth: int = Query(2, ge=1, le=4)
):
    """
    Returns the canonical Procurement Knowledge Graph mapping entities and relationships:
    Supplier, Material, Plant, PO, GR, Invoice, Contract, Quality, Risk, Decision, Outcome.
    """
    await apply_controlled_latency("data_explorer")
    from app.core.knowledge_graph import build_procurement_knowledge_graph
    return build_procurement_knowledge_graph(
        center_entity_type=entity_type,
        center_entity_id=entity_id,
        depth=depth
    )
