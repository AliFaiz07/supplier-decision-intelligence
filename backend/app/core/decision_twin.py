"""
Procurement Decision Twin Engine for SAP Supplier Decision Intelligence Platform.
Constructs a holistic, live Decision Twin representing the complete procurement decision context:
Requirement, eligible candidates, historical price corridors, contracts, verified delivery,
quality defect PPM, capacity headroom, spend concentration, multi-criteria decision weights,
deterministic MCDA recommendation, auditable evidence graph, what-if scenarios, and stress tests.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.data_provider import get_data_provider
from app.core.analytics import calculate_supplier_metrics, get_price_intelligence
from app.core.effective_cost import calculate_effective_procurement_cost
from app.core.eligibility_engine import evaluate_all_suppliers_for_requirement
from app.core.decision_engine import (
    calculate_decision_scores,
    stress_test_decision,
    simulate_supplier_failure,
    compute_decision_sensitivity,
    DEFAULT_WEIGHTS,
    PRIORITY_PRESETS
)
from app.core.evidence_builder import build_supplier_evidence_package

def build_procurement_decision_twin(
    requirement: Dict[str, Any],
    custom_weights: Optional[Dict[str, float]] = None,
    simulation_parameters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Builds the complete Procurement Decision Twin.
    Updates deterministically whenever requirements, weights, or simulation parameters shift.
    """
    provider = get_data_provider()
    sim_params = simulation_parameters or {}

    mat_id = requirement.get("material_id", "MAT-001")
    plant_id = requirement.get("plant_id", "P001")
    quantity = int(requirement.get("quantity", 10000))
    req_date = requirement.get("required_date", "2026-10-15")
    priority = requirement.get("business_priority", "Balanced")

    # Apply parameter overrides if present in simulation_parameters
    if "override_quantity" in sim_params and sim_params["override_quantity"] is not None:
        quantity = int(sim_params["override_quantity"])
    if "override_plant" in sim_params and sim_params["override_plant"]:
        plant_id = sim_params["override_plant"]
    if "override_required_date" in sim_params and sim_params["override_required_date"]:
        req_date = sim_params["override_required_date"]

    active_req = {
        **requirement,
        "material_id": mat_id,
        "plant_id": plant_id,
        "quantity": quantity,
        "required_date": req_date,
        "business_priority": priority
    }

    # 1. Decision scoring & ranking
    scoring_result = calculate_decision_scores(active_req, custom_weights=custom_weights)
    ranked = scoring_result.get("ranked_suppliers", [])
    weights = scoring_result.get("weights", DEFAULT_WEIGHTS.copy())
    rec_option = scoring_result.get("recommended_option")

    # 2. Material & Plant master data
    mat_obj = provider.get_material_by_id(mat_id) or {}
    plant_obj = next((p for p in provider.get_plants() if p.get("plant_id") == plant_id), {})
    
    # Historical price corridor for material
    price_intel = get_price_intelligence(material_id=mat_id)
    price_band = price_intel.get("price_bands", [{}])[0] if price_intel.get("price_bands") else {}

    # 3. Rich Supplier Context per candidate
    eligible_supplier_twins: List[Dict[str, Any]] = []
    for cand in ranked:
        s_id = cand["supplier_id"]
        s_obj = provider.get_supplier_by_id(s_id) or {}
        m = cand["metrics"]
        c = cand["cost_breakdown"]
        pir = provider.get_pir(s_id, mat_id) or {}
        contracts = provider.get_contracts(supplier_id=s_id, material_id=mat_id)
        active_contract = next((ctr for ctr in contracts if ctr.get("status") == "Active"), None)

        practical_cap = pir.get("maximum_order_quantity", 12000)
        cap_utilization_pct = round((quantity / max(1, practical_cap)) * 100.0, 1)

        eligible_supplier_twins.append({
            "supplier_id": s_id,
            "supplier_name": cand["supplier_name"],
            "country": s_obj.get("country", "DE"),
            "strategic_tier": s_obj.get("strategic_tier", "Standard"),
            "eligibility_status": cand["eligibility_status"],
            "eligibility_conditions": cand.get("eligibility_conditions", []),
            "composite_score": cand["final_score"],
            "rank": ranked.index(cand) + 1,
            "commercial": {
                "quoted_unit_price_eur": c.get("quoted_unit_price_eur", 0.0),
                "effective_unit_cost_eur": c.get("effective_unit_cost_eur", 0.0),
                "total_effective_cost_eur": round(c.get("effective_unit_cost_eur", 0.0) * quantity, 2),
                "has_active_contract": bool(active_contract),
                "contract_id": active_contract.get("contract_id") if active_contract else None,
                "contract_price_eur": active_contract.get("contract_price_eur") if active_contract else None,
                "contract_valid_to": active_contract.get("valid_to") if active_contract else None,
                "freight_unit_cost_eur": c.get("freight_unit_cost_eur", 0.0),
                "tariff_cost_eur": c.get("tariff_cost_eur", 0.0),
                "discount_rebate_unit_eur": c.get("discount_rebate_unit_eur", 0.0)
            },
            "delivery": {
                "otd_rate_pct": m.get("on_time_delivery_rate_pct", 0.0),
                "average_delay_days": m.get("average_delay_days", 0.0),
                "planned_lead_time_days": pir.get("planned_delivery_time_days", 14),
                "delivery_trajectory": "Deteriorating" if m.get("delivery_deteriorated") else "Stable / Improving"
            },
            "quality": {
                "rejection_rate_pct": m.get("quality_rejection_rate_pct", 0.0),
                "ppm": int(m.get("quality_rejection_rate_pct", 0.0) * 10000),
                "quality_trajectory": "Defect Spike" if m.get("quality_deteriorated") else "Certified"
            },
            "risk_and_capacity": {
                "risk_rating": s_obj.get("risk_rating", "Low"),
                "practical_capacity_ea": practical_cap,
                "capacity_utilization_pct": cap_utilization_pct,
                "is_capacity_constrained": cap_utilization_pct > 100.0,
                "current_concentration_pct": m.get("spend_concentration_pct", 0.0),
                "active_risks_count": m.get("active_risks_count", 0)
            },
            "dimension_scores": cand["dimension_scores"]
        })

    # 4. Top Recommendation Evidence & Rationale
    top_sup_id = rec_option.get("primary_supplier_id") if rec_option else None
    evidence_package = None
    if top_sup_id:
        evidence_package = build_supplier_evidence_package(supplier_id=top_sup_id, material_id=mat_id)

    # 5. Fast Pre-calibrated Scenario Profile Comparison
    scenario_matrix = []
    for sc_name, sc_weights in PRIORITY_PRESETS.items():
        sim_res = calculate_decision_scores(active_req, custom_weights=sc_weights)
        top_opt = sim_res.get("recommended_option")
        scenario_matrix.append({
            "scenario_name": sc_name,
            "weights": sc_weights,
            "winner_supplier_id": top_opt.get("primary_supplier_id") if top_opt else "N/A",
            "winner_supplier_name": top_opt.get("primary_supplier_name") if top_opt else "N/A",
            "decision_score": top_opt.get("decision_score") if top_opt else 0.0,
            "effective_unit_cost_eur": top_opt.get("effective_unit_cost_eur") if top_opt else 0.0
        })

    # 6. Inline Stress Test summary
    stress_summary = stress_test_decision(active_req, custom_weights=weights)

    # 7. Decision Sensitivity & Practical Thresholds
    thresholds = compute_decision_sensitivity(
        scored_candidates=ranked,
        current_weights=weights,
        top_supplier_id=top_sup_id or ""
    )

    # 8. Twin Structure Assembly
    twin_id = f"TWIN-{active_req.get('requirement_id', 'REQ')}-{datetime.now().strftime('%H%M%S')}"

    return {
        "twin_id": twin_id,
        "status": "LIVE_SYNCHRONIZED",
        "timestamp": datetime.now().isoformat(),
        "context_requirement": {
            "requirement_id": active_req.get("requirement_id", "REQ-001"),
            "material_id": mat_id,
            "material_name": mat_obj.get("material_name", mat_id),
            "material_group": mat_obj.get("material_group", "Mechanical Components"),
            "base_unit": mat_obj.get("base_uom", "EA"),
            "plant_id": plant_id,
            "plant_name": plant_obj.get("plant_name", f"Plant {plant_id}"),
            "plant_location": plant_obj.get("location", "Germany"),
            "order_quantity": quantity,
            "required_date": req_date,
            "business_priority": priority,
            "selection_mode": active_req.get("selection_mode", "Single Supplier")
        },
        "market_and_history_corridor": {
            "historical_min_price_eur": price_band.get("historical_min_eur", 0.0),
            "historical_avg_price_eur": price_band.get("historical_avg_eur", 0.0),
            "historical_max_price_eur": price_band.get("historical_max_eur", 0.0),
            "volatility_score": price_band.get("volatility_score", "Moderate"),
            "reference_currency": "EUR"
        },
        "applied_decision_weights": weights,
        "eligible_suppliers": eligible_supplier_twins,
        "active_recommendation": rec_option,
        "trade_off_vs_runner_up": scoring_result.get("trade_off_analysis", {}),
        "evidence_package": evidence_package,
        "scenario_sensitivity_matrix": scenario_matrix,
        "stress_test_telemetry": {
            "robustness_score_pct": stress_summary.get("robustness_score_pct", 0.0),
            "robustness_rating": stress_summary.get("robustness_rating", "Unknown"),
            "stable_tests_count": stress_summary.get("stable_tests_count", 0),
            "total_tests_count": stress_summary.get("total_tests_count", 14),
            "top_vulnerabilities": stress_summary.get("vulnerability_factors", [])[:3]
        },
        "what_would_change_thresholds": thresholds,
        "assumptions_metadata": {
            "freight_formula": "Distance-weighted synthetic freight (POC Assumption)",
            "tariff_basis": "EU Common Customs Tariff by Country (POC Assumption)",
            "defect_cost_multiplier": "15x unit cost per defective piece (POC Assumption)",
            "cash_discount_terms": "2% 14 Days, Net 30 Days (SAP Standard Term 0002)"
        }
    }
