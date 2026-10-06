"""
Supplier Eligibility Engine for SAP Supplier Decision Intelligence Platform.
Evaluates suppliers against business constraints before scoring.
Returns: ELIGIBLE, CONDITIONALLY_ELIGIBLE, or NOT_ELIGIBLE with auditable reasons.
"""

from datetime import datetime, date
from typing import Dict, Any, List
from app.core.data_provider import get_data_provider

REFERENCE_DATE = date(2026, 9, 25)

def evaluate_supplier_eligibility(
    supplier: Dict[str, Any],
    material_id: str,
    plant_id: str,
    quantity: int,
    required_date_str: str,
    max_acceptable_lead_time_days: int = 30
) -> Dict[str, Any]:
    provider = get_data_provider()
    supplier_id = supplier["supplier_id"]
    
    reasons: List[str] = []
    condition_flags: List[str] = []
    
    # 1. Vendor Status Check
    status = supplier.get("status", "Active")
    if status == "Inactive":
        return {
            "supplier_id": supplier_id,
            "supplier_name": supplier.get("name"),
            "eligibility_status": "NOT_ELIGIBLE",
            "is_eligible": False,
            "reasons": [f"Vendor Master Status is '{status}' (Blocked in SAP master data for quality audit failure)."],
            "conditions": []
        }
    elif status == "Under Evaluation":
        condition_flags.append("Supplier is Under Evaluation (Onboarded recently, limited transactional sample).")

    # 2. Material Capability Check
    mat = provider.get_material_by_id(material_id)
    mat_group = mat.get("material_group") if mat else ""
    supported_groups = supplier.get("supported_material_groups", [])
    
    pirs = provider.get_puchase_info_records(material_id=material_id)
    has_pir = any(p["supplier_id"] == supplier_id for p in pirs)
    quotes = provider.get_quotations(material_id=material_id)
    has_quote = any(q["supplier_id"] == supplier_id for q in quotes)
    
    if not (has_pir or has_quote or mat_group in supported_groups):
        return {
            "supplier_id": supplier_id,
            "supplier_name": supplier.get("name"),
            "eligibility_status": "NOT_ELIGIBLE",
            "is_eligible": False,
            "reasons": [f"Material {material_id} ({mat_group}) outside supplier certified technical capabilities."],
            "conditions": []
        }

    # 3. Capacity Feasibility Check
    monthly_capacity = supplier.get("max_capacity_units_per_month", 50000)
    if quantity > monthly_capacity:
        condition_flags.append(
            f"Requested quantity ({quantity:,} EA) exceeds supplier monthly capacity limit ({monthly_capacity:,} EA). Quota split recommended."
        )

    # 4. Lead Time & Delivery Date Feasibility
    try:
        req_d = date.fromisoformat(required_date_str)
        available_days = (req_d - REFERENCE_DATE).days
    except Exception:
        available_days = 30

    # Get quote or PIR lead time
    sup_quote = next((q for q in quotes if q.get("supplier_id") == supplier_id), None)
    sup_pir = next((p for p in pirs if p.get("supplier_id") == supplier_id), None)
    
    offered_lt = 14
    if sup_quote:
        offered_lt = sup_quote.get("offered_lead_time_days", 14)
    elif sup_pir:
        offered_lt = sup_pir.get("standard_lead_time_days", 14)

    if offered_lt > max_acceptable_lead_time_days:
        condition_flags.append(
            f"Offered lead time ({offered_lt} days) exceeds maximum acceptable lead time threshold ({max_acceptable_lead_time_days} days)."
        )

    if offered_lt > available_days:
        condition_flags.append(
            f"Offered lead time ({offered_lt} days) cannot fulfill delivery by required date ({required_date_str}, {available_days} days available)."
        )

    # 5. Determine Overall Eligibility
    if condition_flags:
        return {
            "supplier_id": supplier_id,
            "supplier_name": supplier.get("name"),
            "eligibility_status": "CONDITIONALLY_ELIGIBLE",
            "is_eligible": True,
            "reasons": ["Supplier meets core technical criteria but has operational constraints."],
            "conditions": condition_flags
        }
    else:
        return {
            "supplier_id": supplier_id,
            "supplier_name": supplier.get("name"),
            "eligibility_status": "ELIGIBLE",
            "is_eligible": True,
            "reasons": ["Meets all SAP vendor master, material capability, plant, and lead time requirements."],
            "conditions": []
        }

def evaluate_all_suppliers_for_requirement(requirement: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    provider = get_data_provider()
    suppliers = provider.get_suppliers()
    
    mat_id = requirement.get("material_id", "MAT-001")
    plant_id = requirement.get("plant_id", "P001")
    qty = requirement.get("quantity", 1000)
    req_date = requirement.get("required_date", "2026-10-15")
    max_lt = requirement.get("max_acceptable_lead_time_days", 30)

    results = []
    for s in suppliers:
        res = evaluate_supplier_eligibility(
            supplier=s,
            material_id=mat_id,
            plant_id=plant_id,
            quantity=qty,
            required_date_str=req_date,
            max_acceptable_lead_time_days=max_lt
        )
        results.append(res)

    eligible = [r for r in results if r["eligibility_status"] == "ELIGIBLE"]
    conditionally = [r for r in results if r["eligibility_status"] == "CONDITIONALLY_ELIGIBLE"]
    not_eligible = [r for r in results if r["eligibility_status"] == "NOT_ELIGIBLE"]

    return {
        "all_results": results,
        "eligible": eligible,
        "conditionally_eligible": conditionally,
        "not_eligible": not_eligible,
        "total_suppliers_evaluated": len(suppliers),
        "total_eligible_or_conditional": len(eligible) + len(conditionally)
    }
