"""
Scenarios Endpoint: Predefined demo scenarios and real-engine scenario execution.
"""

from fastapi import APIRouter, HTTPException
from app.core.data_provider import get_data_provider
from app.core.decision_engine import calculate_decision_scores
from app.core.evidence_builder import build_supplier_evidence_package
from app.core.ai_explainer import generate_decision_explanation
from app.core.latency import apply_controlled_latency

router = APIRouter()

@router.get("")
async def list_scenarios():
    provider = get_data_provider()
    return provider.get_scenarios()

@router.get("/{scenario_id}")
async def get_scenario(scenario_id: str):
    provider = get_data_provider()
    scenarios = provider.get_scenarios()
    for s in scenarios:
        if s.get("scenario_id") == scenario_id:
            return s
    raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found.")

@router.post("/{scenario_id}/run")
async def run_scenario(scenario_id: str):
    await apply_controlled_latency("analyze")
    provider = get_data_provider()
    
    # 1. Fetch scenario definition
    scenarios = provider.get_scenarios()
    scenario = next((s for s in scenarios if s.get("scenario_id") == scenario_id), None)
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario {scenario_id} not found.")

    # 2. Fetch associated requirement
    req_id = scenario.get("requirement_id")
    reqs = provider.get_requirements()
    requirement = next((r for r in reqs if r.get("requirement_id") == req_id), reqs[0])

    # 3. Execute REAL decision engine with scenario weights
    result = calculate_decision_scores(
        requirement=requirement,
        custom_weights=scenario.get("weights")
    )

    # 4. Generate evidence and explanation for recommended supplier
    if result["ranked_suppliers"]:
        top_id = result["recommended_option"]["primary_supplier_id"]
        evidence = build_supplier_evidence_package(supplier_id=top_id, material_id=requirement.get("material_id", "MAT-001"))
        ai_expl = generate_decision_explanation(
            recommended_option=result["recommended_option"],
            trade_off_analysis=result["trade_off_analysis"],
            evidence_package=evidence,
            weights=result["weights"]
        )
    else:
        evidence = {}
        ai_expl = {}

    return {
        "scenario": scenario,
        "requirement": requirement,
        "decision_results": result,
        "evidence_package": evidence,
        "ai_explanation": ai_expl
    }
