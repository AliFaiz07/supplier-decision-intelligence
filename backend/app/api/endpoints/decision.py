"""
Decision Endpoint: Scoring, ranking, what-if analysis, AI explanation synthesis, audit logging.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.core.decision_engine import (
    calculate_decision_scores,
    stress_test_decision,
    simulate_supplier_failure,
    discover_alternative_suppliers,
    compute_decision_sensitivity_matrix,
    simulate_concentration_shock
)
from app.core.decision_twin import build_procurement_decision_twin
from app.core.data_provider import get_data_provider
from app.core.evidence_builder import build_supplier_evidence_package
from app.core.ai_explainer import generate_decision_explanation
from app.core.decision_history_manager import get_history_manager
from app.core.latency import apply_controlled_latency

router = APIRouter()

class DecisionTwinRequest(BaseModel):
    requirement: Dict[str, Any]
    custom_weights: Optional[Dict[str, float]] = None
    simulation_parameters: Optional[Dict[str, Any]] = None

class SensitivityMatrixRequest(BaseModel):
    requirement: Dict[str, Any]
    base_weights: Optional[Dict[str, float]] = None

class ConcentrationShockRequest(BaseModel):
    material_id: str = "MAT-001"
    plant_id: str = "P001"
    capacity_drop_pct: float = 20.0

class StressTestRequest(BaseModel):
    requirement: Dict[str, Any]
    custom_weights: Optional[Dict[str, float]] = None

class SupplierFailureRequest(BaseModel):
    requirement: Dict[str, Any]
    failed_supplier_id: str

class AnalyzeRequest(BaseModel):
    requirement: Dict[str, Any]
    custom_weights: Optional[Dict[str, float]] = None

class WhatIfRequest(BaseModel):
    requirement: Dict[str, Any]
    new_weights: Dict[str, float]
    previous_top_supplier_id: Optional[str] = None

class SaveDecisionRequest(BaseModel):
    requirement: Dict[str, Any]
    recommended_option: Dict[str, Any]
    weights_applied: Dict[str, float]
    user_action: Optional[str] = "Approved by User"
    user_notes: Optional[str] = ""

@router.post("/twin")
async def get_or_build_decision_twin(request: DecisionTwinRequest):
    """
    Builds or synchronizes a live Procurement Decision Twin representing the complete
    decision context: requirement, prices, contracts, delivery, quality, capacity,
    concentration, MCDA weights, evidence graph, and stress tests.
    """
    await apply_controlled_latency("analyze")
    return build_procurement_decision_twin(
        requirement=request.requirement,
        custom_weights=request.custom_weights,
        simulation_parameters=request.simulation_parameters
    )

@router.get("/twin/{requirement_id}")
async def get_decision_twin_by_req_id(requirement_id: str):
    """Retrieves decision twin for a specific registered requirement."""
    await apply_controlled_latency("analyze")
    provider = get_data_provider()
    reqs = provider.get_requirements()
    target_req = next((r for r in reqs if r.get("requirement_id") == requirement_id), None)
    if not target_req:
        target_req = {
            "requirement_id": requirement_id,
            "title": f"Procurement Demand {requirement_id}",
            "material_id": "MAT-001",
            "quantity": 10000,
            "plant_id": "P001",
            "required_date": "2026-10-15",
            "business_priority": "Balanced"
        }
    return build_procurement_decision_twin(requirement=target_req)

@router.post("/sensitivity-matrix")
async def execute_sensitivity_matrix(request: SensitivityMatrixRequest):
    """Generates a 2D sensitivity matrix across Price vs Delivery priority trade-offs."""
    await apply_controlled_latency("what_if")
    base_res = calculate_decision_scores(request.requirement, request.base_weights)
    return compute_decision_sensitivity_matrix(
        scored_candidates=base_res.get("ranked_suppliers", []),
        base_weights=base_res.get("weights", {})
    )

@router.post("/concentration-simulate")
async def execute_concentration_simulation(request: ConcentrationShockRequest):
    """Simulates portfolio concentration shift when a primary vendor capacity contracts."""
    await apply_controlled_latency("general")
    return simulate_concentration_shock(
        material_id=request.material_id,
        plant_id=request.plant_id,
        capacity_drop_pct=request.capacity_drop_pct
    )

@router.post("/analyze")
async def analyze_sourcing_decision(request: AnalyzeRequest):
    # Apply controlled latency for enterprise engine realism (Prompt Section 22)
    await apply_controlled_latency("analyze")
    
    # 1. Run deterministic decision scoring
    scoring_result = calculate_decision_scores(
        requirement=request.requirement,
        custom_weights=request.custom_weights
    )

    if not scoring_result["ranked_suppliers"]:
        return scoring_result

    # 2. Extract Evidence Package for the recommended supplier
    top_sup_id = scoring_result["recommended_option"]["primary_supplier_id"]
    mat_id = request.requirement.get("material_id", "MAT-001")
    evidence_package = build_supplier_evidence_package(supplier_id=top_sup_id, material_id=mat_id)

    # 3. Generate AI Explanation grounded in calculated evidence
    ai_explanation = generate_decision_explanation(
        recommended_option=scoring_result["recommended_option"],
        trade_off_analysis=scoring_result["trade_off_analysis"],
        evidence_package=evidence_package,
        weights=scoring_result["weights"]
    )

    return {
        **scoring_result,
        "evidence_package": evidence_package,
        "ai_explanation": ai_explanation
    }

@router.post("/what-if")
async def simulate_what_if(request: WhatIfRequest):
    await apply_controlled_latency("what_if")
    
    new_result = calculate_decision_scores(
        requirement=request.requirement,
        custom_weights=request.new_weights
    )

    if not new_result["ranked_suppliers"]:
        return new_result

    new_top = new_result["recommended_option"]["primary_supplier_id"]
    prev_top = request.previous_top_supplier_id

    changed = (prev_top is not None and prev_top != new_top)
    explanation = ""
    if changed:
        explanation = (
            f"Changing decision weights shifted the #1 recommendation from {prev_top} to {new_top} ({new_result['recommended_option']['primary_supplier_name']}). "
            f"The new scoring emphasizes dimensions where {new_top} possesses stronger empirical capability."
        )
    else:
        explanation = (
            f"Supplier {new_top} retains the top rank under the revised weight structure, "
            f"demonstrating robust multi-dimensional resilience across priority adjustments."
        )

    # Re-build evidence & explanation for the active top
    mat_id = request.requirement.get("material_id", "MAT-001")
    evidence = build_supplier_evidence_package(supplier_id=new_top, material_id=mat_id)
    ai_expl = generate_decision_explanation(
        recommended_option=new_result["recommended_option"],
        trade_off_analysis=new_result["trade_off_analysis"],
        evidence_package=evidence,
        weights=new_result["weights"]
    )

    return {
        **new_result,
        "what_if_analysis": {
            "weights_applied": new_result["weights"],
            "previous_top_supplier_id": prev_top,
            "new_top_supplier_id": new_top,
            "recommendation_changed": changed,
            "explanation": explanation
        },
        "evidence_package": evidence,
        "ai_explanation": ai_expl
    }

@router.post("/save")
async def save_decision(request: SaveDecisionRequest):
    mgr = get_history_manager()
    record = mgr.record_decision({
        "material_id": request.requirement.get("material_id"),
        "material_description": request.requirement.get("title"),
        "quantity": request.requirement.get("quantity"),
        "plant_id": request.requirement.get("plant_id"),
        "scenario": request.requirement.get("business_priority", "Custom"),
        "weights_applied": request.weights_applied,
        "recommended_supplier_id": request.recommended_option.get("primary_supplier_id"),
        "recommended_supplier_name": request.recommended_option.get("primary_supplier_name"),
        "decision_score": request.recommended_option.get("decision_score"),
        "effective_unit_cost_eur": request.recommended_option.get("effective_unit_cost_eur"),
        "total_cost_eur": request.recommended_option.get("total_estimated_cost_eur"),
        "status": request.user_action or "Approved",
        "action_taken": "Future SAP S/4HANA PO Simulation Placeholder",
        "user_notes": request.user_notes or "Saved from Sourcing Workspace"
    })
    return {"status": "SUCCESS", "saved_record": record}

@router.post("/stress-test")
async def execute_decision_stress_test(request: StressTestRequest):
    """Executes deterministic decision stress testing against 8 supply chain shocks."""
    await apply_controlled_latency("stress_test")
    res = stress_test_decision(request.requirement, request.custom_weights)
    return res

@router.post("/supplier-failure")
async def execute_supplier_failure_sim(request: SupplierFailureRequest):
    """Simulates sudden outage/unavailability of a specific supplier for a requirement."""
    await apply_controlled_latency("failure_sim")
    res = simulate_supplier_failure(request.requirement, request.failed_supplier_id)
    return res

@router.get("/alternatives")
async def get_material_alternatives(material_id: str, plant_id: Optional[str] = "P001"):
    """Discovers and ranks viable qualified alternative suppliers for a material."""
    return discover_alternative_suppliers(material_id, plant_id)

