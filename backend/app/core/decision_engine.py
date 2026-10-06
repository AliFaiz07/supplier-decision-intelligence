"""
Decision Engine for SAP Supplier Decision Intelligence Platform.
Performs Multi-Criteria Decision Analysis (MCDA), normalized dimension scoring,
configurable weight adjustments, multi-supplier quota allocation, and what-if simulation.
Strictly deterministic - zero hardcoding of recommendations.
"""

from typing import Dict, Any, List, Optional
from app.core.data_provider import get_data_provider
from app.core.analytics import calculate_supplier_metrics
from app.core.effective_cost import calculate_effective_procurement_cost
from app.core.eligibility_engine import evaluate_all_suppliers_for_requirement

DEFAULT_WEIGHTS = {
    "price": 0.25,
    "delivery": 0.25,
    "quality": 0.20,
    "lead_time": 0.15,
    "contract": 0.10,
    "risk": 0.05
}

PRIORITY_PRESETS = {
    "Balanced": {"price": 0.25, "delivery": 0.25, "quality": 0.20, "lead_time": 0.15, "contract": 0.10, "risk": 0.05},
    "Cost-Focused": {"price": 0.50, "delivery": 0.15, "quality": 0.15, "lead_time": 0.10, "contract": 0.05, "risk": 0.05},
    "Delivery-Focused": {"price": 0.10, "delivery": 0.45, "quality": 0.15, "lead_time": 0.20, "contract": 0.05, "risk": 0.05},
    "Quality-Critical": {"price": 0.10, "delivery": 0.15, "quality": 0.50, "lead_time": 0.10, "contract": 0.05, "risk": 0.10},
    "Risk-Sensitive": {"price": 0.15, "delivery": 0.20, "quality": 0.20, "lead_time": 0.10, "contract": 0.10, "risk": 0.25},
    "Contract-Focused": {"price": 0.20, "delivery": 0.20, "quality": 0.15, "lead_time": 0.10, "contract": 0.30, "risk": 0.05}
}

def normalize_weights(weights: Dict[str, float]) -> Dict[str, float]:
    total = sum(weights.values())
    if total <= 0:
        return DEFAULT_WEIGHTS.copy()
    return {k: round(v / total, 4) for k, v in weights.items()}

def calculate_decision_scores(
    requirement: Dict[str, Any],
    custom_weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    provider = get_data_provider()
    
    mat_id = requirement.get("material_id", "MAT-001")
    plant_id = requirement.get("plant_id", "P001")
    quantity = requirement.get("quantity", 10000)
    req_date = requirement.get("required_date", "2026-10-15")
    max_lt = requirement.get("max_acceptable_lead_time_days", 30)
    selection_mode = requirement.get("selection_mode", "Single Supplier")
    business_priority = requirement.get("business_priority", "Balanced")

    # 1. Weights determination
    if custom_weights:
        weights = normalize_weights(custom_weights)
    elif business_priority in PRIORITY_PRESETS:
        weights = PRIORITY_PRESETS[business_priority].copy()
    else:
        weights = DEFAULT_WEIGHTS.copy()

    # 2. Eligibility evaluation
    eligibility_data = evaluate_all_suppliers_for_requirement(requirement)
    eligible_candidates = eligibility_data["eligible"] + eligibility_data["conditionally_eligible"]
    
    if not eligible_candidates:
        return {
            "requirement": requirement,
            "weights": weights,
            "ranked_suppliers": [],
            "recommended_option": None,
            "decision_trace": {},
            "eligibility_summary": eligibility_data
        }

    # 3. Gather raw metrics for all eligible suppliers
    candidate_records = []
    effective_costs = []
    
    for cand in eligible_candidates:
        s_id = cand["supplier_id"]
        supplier_obj = provider.get_supplier_by_id(s_id)
        metrics = calculate_supplier_metrics(s_id, material_id=mat_id)
        cost_info = calculate_effective_procurement_cost(s_id, material_id=mat_id, order_quantity=quantity)
        
        effective_costs.append(cost_info["effective_unit_cost_eur"])
        candidate_records.append({
            "supplier_id": s_id,
            "supplier_name": cand["supplier_name"],
            "eligibility_status": cand["eligibility_status"],
            "eligibility_conditions": cand.get("conditions", []),
            "supplier_obj": supplier_obj,
            "metrics": metrics,
            "cost_info": cost_info
        })

    # Range for min-max normalization
    min_cost = min(effective_costs) if effective_costs else 1.0
    max_cost = max(effective_costs) if effective_costs else 1.0

    # 4. Dimension Scoring (Scale 0 - 100)
    scored_suppliers = []
    for rec in candidate_records:
        s_id = rec["supplier_id"]
        m = rec["metrics"]
        c = rec["cost_info"]
        s_obj = rec["supplier_obj"]
        
        # A. Price Score: Inverted normalized scale
        eff_cost = c["effective_unit_cost_eur"]
        if max_cost > min_cost:
            # Lowest cost gets 100, highest gets 50
            price_score = round(100.0 - ((eff_cost - min_cost) / (max_cost - min_cost)) * 50.0, 1)
        else:
            price_score = 90.0

        # B. Delivery Reliability Score (0 - 100)
        # Factor in historical OTD, average delay, and trailing deterioration
        base_otd = m.get("on_time_delivery_rate_pct", 85.0)
        avg_delay = m.get("average_delay_days", 0.0)
        delivery_score = base_otd
        if avg_delay > 2.0:
            delivery_score -= (avg_delay - 2.0) * 3.0
        if m.get("delivery_deteriorated"):
            delivery_score -= 18.0  # Significant penalty for recent downward trajectory
        delivery_score = max(20.0, min(100.0, round(delivery_score, 1)))

        # C. Quality Score (0 - 100)
        # Factor in rejection rate, recent quality deterioration, and ISO certs
        rejection_rate = m.get("quality_rejection_rate_pct", 0.5)
        quality_score = 100.0 - (rejection_rate * 16.0)
        if m.get("quality_deteriorated"):
            quality_score -= 22.0  # Penalty for recent spike in defect notifications
        if "IATF 16949" in s_obj.get("certifications", []):
            quality_score += 4.0
        quality_score = max(15.0, min(100.0, round(quality_score, 1)))

        # D. Lead Time Score (0 - 100)
        offered_lt = c.get("offered_lead_time_days", 14)
        if offered_lt <= 7:
            lt_score = 98.0
        elif offered_lt <= 12:
            lt_score = 92.0
        elif offered_lt <= 16:
            lt_score = 84.0
        elif offered_lt <= 25:
            lt_score = 70.0
        elif offered_lt <= 35:
            lt_score = 55.0
        else:
            lt_score = 40.0
        lt_score = round(lt_score, 1)

        # E. Contract Advantage Score (0 - 100)
        if m.get("has_active_contract"):
            if m.get("has_expiring_contract"):
                contract_score = 65.0 # Expiring soon
            else:
                contract_score = 100.0 # Full active master contract
        else:
            contract_score = 45.0 # No existing outline contract

        # F. Risk Score (0 - 100)
        r_rating = s_obj.get("risk_rating", "Low")
        base_risk_score = {"Low": 95.0, "Medium": 75.0, "High": 45.0, "Critical": 15.0}.get(r_rating, 80.0)
        
        # Extra penalty if spend concentration > 40%
        if m.get("is_concentrated"):
            base_risk_score -= 20.0
        # Deduction for active risk events count
        base_risk_score -= (m.get("active_risks_count", 0) * 8.0)
        risk_score = max(10.0, min(100.0, round(base_risk_score, 1)))

        # Confidence Factor: Downweight slightly if evidence is sparse (e.g. new supplier SUP-014)
        confidence_factor = 0.92 if not m.get("evidence_sufficient") else 1.0

        # Weighted Final Score
        raw_final_score = (
            price_score * weights["price"] +
            delivery_score * weights["delivery"] +
            quality_score * weights["quality"] +
            lt_score * weights["lead_time"] +
            contract_score * weights["contract"] +
            risk_score * weights["risk"]
        )
        final_score = round(raw_final_score * confidence_factor, 1)

        scored_suppliers.append({
            "supplier_id": s_id,
            "supplier_name": rec["supplier_name"],
            "eligibility_status": rec["eligibility_status"],
            "eligibility_conditions": rec["eligibility_conditions"],
            "country": s_obj.get("country"),
            "strategic_tier": s_obj.get("strategic_tier"),
            "final_score": final_score,
            "confidence_factor": confidence_factor,
            "evidence_sufficient": m.get("evidence_sufficient"),
            "dimension_scores": {
                "price_score": price_score,
                "delivery_score": delivery_score,
                "quality_score": quality_score,
                "lead_time_score": lt_score,
                "contract_score": contract_score,
                "risk_score": risk_score
            },
            "metrics": m,
            "cost_breakdown": c,
            "applied_weights": weights
        })

    # 5. Rank candidates by final_score descending
    ranked = sorted(scored_suppliers, key=lambda x: x["final_score"], reverse=True)

    # 6. Recommendation formulation
    top_supplier = ranked[0]
    runner_up = ranked[1] if len(ranked) > 1 else None

    # Multi-Supplier Quota Allocation if mode requested or batch > capacity
    allocation_plan = None
    if selection_mode == "Multi-Supplier Allocation (Quota)" or quantity >= 20000:
        quota_arrangements = provider.get_quota_arrangements(material_id=mat_id)
        if quota_arrangements and len(ranked) >= 2:
            # Respect SAP quota arrangement definition
            items = quota_arrangements[0].get("items", [])
            item_map = {it["supplier_id"]: it["quota"] for it in items}
            
            # Select top matching candidates
            alloc_suppliers = [s for s in ranked if s["supplier_id"] in item_map]
            if not alloc_suppliers:
                alloc_suppliers = ranked[:3]
                split_pcts = [50, 30, 20] if len(alloc_suppliers) == 3 else [60, 40]
            else:
                total_quota = sum(item_map.get(s["supplier_id"], 30) for s in alloc_suppliers)
                split_pcts = [round((item_map.get(s["supplier_id"], 30) / total_quota) * 100) for s in alloc_suppliers]

            allocation_plan = []
            for idx, sup in enumerate(alloc_suppliers):
                pct = split_pcts[idx] if idx < len(split_pcts) else 10
                alloc_qty = int(quantity * (pct / 100.0))
                alloc_cost = round(sup["cost_breakdown"]["effective_unit_cost_eur"] * alloc_qty, 2)
                allocation_plan.append({
                    "supplier_id": sup["supplier_id"],
                    "supplier_name": sup["supplier_name"],
                    "allocation_pct": pct,
                    "allocated_quantity": alloc_qty,
                    "effective_unit_cost_eur": sup["cost_breakdown"]["effective_unit_cost_eur"],
                    "subtotal_cost_eur": alloc_cost,
                    "score": sup["final_score"]
                })

    # Recommended Sourcing Option Structure
    recommended_option = {
        "mode": "Quota Allocation" if allocation_plan else "Single Supplier",
        "primary_supplier_id": top_supplier["supplier_id"],
        "primary_supplier_name": top_supplier["supplier_name"],
        "decision_score": top_supplier["final_score"],
        "effective_unit_cost_eur": top_supplier["cost_breakdown"]["effective_unit_cost_eur"],
        "total_estimated_cost_eur": top_supplier["cost_breakdown"]["total_effective_cost_eur"],
        "offered_lead_time_days": top_supplier["cost_breakdown"]["offered_lead_time_days"],
        "delivery_reliability_pct": top_supplier["metrics"]["on_time_delivery_rate_pct"],
        "quality_rejection_rate_pct": top_supplier["metrics"]["quality_rejection_rate_pct"],
        "contract_status": "Active Master Contract" if top_supplier["metrics"]["has_active_contract"] else "No Outline Contract",
        "allocation_plan": allocation_plan
    }

    # Trade-off analysis against runner-up
    trade_off_analysis = {}
    if runner_up:
        price_diff = round(top_supplier["cost_breakdown"]["effective_unit_cost_eur"] - runner_up["cost_breakdown"]["effective_unit_cost_eur"], 2)
        score_diff = round(top_supplier["final_score"] - runner_up["final_score"], 1)
        otd_diff = round(top_supplier["metrics"]["on_time_delivery_rate_pct"] - runner_up["metrics"]["on_time_delivery_rate_pct"], 1)
        qual_diff = round(top_supplier["metrics"]["quality_rejection_rate_pct"] - runner_up["metrics"]["quality_rejection_rate_pct"], 2)

        trade_off_analysis = {
            "runner_up_id": runner_up["supplier_id"],
            "runner_up_name": runner_up["supplier_name"],
            "runner_up_score": runner_up["final_score"],
            "score_differential": score_diff,
            "price_differential_eur": price_diff,
            "delivery_differential_otd_pct": otd_diff,
            "quality_differential_rejection_pct": qual_diff,
            "summary": (
                f"{top_supplier['supplier_name']} ranks #{1} with score {top_supplier['final_score']} vs "
                f"{runner_up['supplier_name']} ({runner_up['final_score']}). "
                f"Trade-off: {'€' + str(abs(price_diff)) + (' cheaper' if price_diff < 0 else ' cost premium')}, "
                f"{'+' + str(otd_diff) if otd_diff > 0 else str(otd_diff)}% on-time delivery variance, "
                f"and {top_supplier['metrics']['quality_rejection_rate_pct']}% vs {runner_up['metrics']['quality_rejection_rate_pct']}% defect rate."
            )
        }

    # Dynamic Sensitivity Analysis ("What would change the recommendation?" - Prompt Section 22)
    sensitivity_analysis = compute_decision_sensitivity(
        scored_candidates=ranked,
        current_weights=weights,
        top_supplier_id=top_supplier["supplier_id"]
    )

    # Projected Concentration Analysis (Prompt Section 24)
    projected_concentration = compute_projected_concentration(
        supplier_id=top_supplier["supplier_id"],
        material_id=mat_id,
        order_quantity=quantity,
        unit_cost=top_supplier["cost_breakdown"]["effective_unit_cost_eur"],
        provider=provider
    )

    return {
        "requirement": requirement,
        "weights": weights,
        "ranked_suppliers": ranked,
        "recommended_option": recommended_option,
        "trade_off_analysis": trade_off_analysis,
        "sensitivity_analysis": sensitivity_analysis,
        "projected_concentration": projected_concentration,
        "decision_trace": {
            "model_version": "MCDA-v1.4",
            "weights_used": weights,
            "evaluated_supplier_count": len(ranked),
            "scoring_matrix": [
                {
                    "supplier_id": s["supplier_id"],
                    "supplier_name": s["supplier_name"],
                    "scores": s["dimension_scores"],
                    "final_score": s["final_score"],
                    "confidence_factor": s["confidence_factor"]
                }
                for s in ranked
            ]
        },
        "eligibility_summary": eligibility_data
    }

def compute_decision_sensitivity(
    scored_candidates: List[Dict[str, Any]],
    current_weights: Dict[str, float],
    top_supplier_id: str
) -> List[Dict[str, Any]]:
    """Calculates exact dynamic priority weight thresholds where another supplier overtakes top rank."""
    sensitivity_insights = []
    dimension_labels = {
        "price": "cost / price",
        "delivery": "delivery reliability",
        "quality": "quality standard",
        "lead_time": "lead time urgency",
        "contract": "contractual synergy",
        "risk": "risk aversion"
    }
    score_keys = {
        "price": "price_score",
        "delivery": "delivery_score",
        "quality": "quality_score",
        "lead_time": "lead_time_score",
        "contract": "contract_score",
        "risk": "risk_score"
    }

    if len(scored_candidates) < 2:
        return []

    for dim, score_key in score_keys.items():
        base_w = current_weights.get(dim, 0.20)
        found_shift = False

        # Try increasing weight up to 0.95
        test_w = base_w + 0.02
        while test_w <= 0.95:
            remaining_w = 1.0 - test_w
            other_dims = [d for d in score_keys.keys() if d != dim]
            other_sum = sum(current_weights.get(d, 0.2) for d in other_dims)
            
            sim_weights = {dim: test_w}
            for d in other_dims:
                sim_weights[d] = (current_weights.get(d, 0.2) / max(0.001, other_sum)) * remaining_w

            sim_scores = []
            for cand in scored_candidates:
                dims = cand["dimension_scores"]
                sc = sum(dims[score_keys[d]] * sim_weights[d] for d in score_keys) * cand["confidence_factor"]
                sim_scores.append((cand["supplier_id"], cand["supplier_name"], sc))
            
            sim_scores.sort(key=lambda x: x[2], reverse=True)
            new_top_id, new_top_name, _ = sim_scores[0]

            if new_top_id != top_supplier_id:
                thresh_pct = round(test_w * 100, 1)
                sensitivity_insights.append({
                    "dimension": dim,
                    "dimension_label": dimension_labels[dim],
                    "direction": "increase",
                    "threshold_weight_pct": thresh_pct,
                    "overtaking_supplier_id": new_top_id,
                    "overtaking_supplier_name": new_top_name,
                    "insight": f"If {dimension_labels[dim]} weight increases above {thresh_pct}%: {new_top_name} ({new_top_id}) becomes preferred."
                })
                found_shift = True
                break

            test_w += 0.02

        if not found_shift:
            # Check if decreasing weight shifts leadership
            test_w = max(0.02, base_w - 0.02)
            while test_w >= 0.02:
                remaining_w = 1.0 - test_w
                other_dims = [d for d in score_keys.keys() if d != dim]
                other_sum = sum(current_weights.get(d, 0.2) for d in other_dims)
                sim_weights = {dim: test_w}
                for d in other_dims:
                    sim_weights[d] = (current_weights.get(d, 0.2) / max(0.001, other_sum)) * remaining_w

                sim_scores = []
                for cand in scored_candidates:
                    dims = cand["dimension_scores"]
                    sc = sum(dims[score_keys[d]] * sim_weights[d] for d in score_keys) * cand["confidence_factor"]
                    sim_scores.append((cand["supplier_id"], cand["supplier_name"], sc))
                
                sim_scores.sort(key=lambda x: x[2], reverse=True)
                new_top_id, new_top_name, _ = sim_scores[0]

                if new_top_id != top_supplier_id:
                    thresh_pct = round(test_w * 100, 1)
                    sensitivity_insights.append({
                        "dimension": dim,
                        "dimension_label": dimension_labels[dim],
                        "direction": "decrease",
                        "threshold_weight_pct": thresh_pct,
                        "overtaking_supplier_id": new_top_id,
                        "overtaking_supplier_name": new_top_name,
                        "insight": f"If {dimension_labels[dim]} weight decreases below {thresh_pct}%: {new_top_name} ({new_top_id}) becomes preferred."
                    })
                    break
                test_w -= 0.02

    if not sensitivity_insights and len(scored_candidates) > 1:
        runner_up = scored_candidates[1]
        sensitivity_insights.append({
            "dimension": "composite",
            "dimension_label": "overall priority balance",
            "direction": "stable",
            "threshold_weight_pct": 0,
            "overtaking_supplier_id": runner_up["supplier_id"],
            "overtaking_supplier_name": runner_up["supplier_name"],
            "insight": f"Supplier demonstrates strong multi-dimensional dominance. Runner-up {runner_up['supplier_name']} requires combined priority shifts to overcome the current score lead."
        })

    return sensitivity_insights

def compute_projected_concentration(
    supplier_id: str,
    material_id: str,
    order_quantity: int,
    unit_cost: float,
    provider: Any
) -> Dict[str, Any]:
    """Calculates supplier concentration before and after proposed requirement allocation."""
    all_pos = provider.get_pushed_pos()
    mat_obj = provider.get_material_by_id(material_id)
    mat_group = mat_obj.get("material_group") if mat_obj else None

    if mat_group:
        group_mats = {m["material_id"] for m in provider.get_materials() if m.get("material_group") == mat_group}
        group_pos = [p for p in all_pos if p.get("material_id") in group_mats]
        current_base_spend = sum(p.get("total_net_value_eur", 0.0) for p in group_pos)
        supplier_base_spend = sum(p.get("total_net_value_eur", 0.0) for p in group_pos if p.get("supplier_id") == supplier_id)
        scope_name = f"Material Group '{mat_group}'"
    else:
        current_base_spend = sum(p.get("total_net_value_eur", 0.0) for p in all_pos)
        supplier_base_spend = sum(p.get("total_net_value_eur", 0.0) for p in all_pos if p.get("supplier_id") == supplier_id)
        scope_name = "Global Spend"

    req_spend = order_quantity * unit_cost
    current_share_pct = round((supplier_base_spend / max(1.0, current_base_spend)) * 100.0, 1)
    
    projected_supplier_spend = supplier_base_spend + req_spend
    projected_total_spend = current_base_spend + req_spend
    projected_share_pct = round((projected_supplier_spend / max(1.0, projected_total_spend)) * 100.0, 1)
    
    is_high_risk = projected_share_pct >= 40.0
    return {
        "scope": scope_name,
        "current_spend_eur": round(supplier_base_spend, 2),
        "current_concentration_pct": current_share_pct,
        "requirement_spend_eur": round(req_spend, 2),
        "projected_spend_eur": round(projected_supplier_spend, 2),
        "projected_concentration_pct": projected_share_pct,
        "is_concentration_risk": is_high_risk,
        "alert_message": (
            f"Sourcing this requirement increases supplier share to {projected_share_pct}% in {scope_name} "
            f"({'WARNING: Exceeds 40% concentration threshold' if is_high_risk else 'Within acceptable bounds <40%'})."
        )
    }

def compute_decision_sensitivity_matrix(
    scored_candidates: List[Dict[str, Any]],
    base_weights: Dict[str, float]
) -> Dict[str, Any]:
    """
    Computes a 2D sensitivity grid comparing Cost Priority vs Delivery Priority
    to visually map how the preferred supplier shifts across trade-off spectrums.
    """
    if len(scored_candidates) < 2:
        return {"grid": [], "cost_levels": [], "delivery_levels": []}

    cost_levels = ["Low (10%)", "Balanced (25%)", "High (40%)", "Critical (55%)"]
    delivery_levels = ["Low (10%)", "Balanced (25%)", "High (40%)", "Critical (55%)"]
    cost_weights = [0.10, 0.25, 0.40, 0.55]
    delivery_weights = [0.10, 0.25, 0.40, 0.55]

    grid = []
    for c_idx, c_w in enumerate(cost_weights):
        row = []
        for d_idx, d_w in enumerate(delivery_weights):
            rem = max(0.01, 1.0 - (c_w + d_w))
            other_base = base_weights.get("quality", 0.2) + base_weights.get("lead_time", 0.15) + base_weights.get("contract", 0.1) + base_weights.get("risk", 0.05)
            q_w = (base_weights.get("quality", 0.2) / max(0.01, other_base)) * rem
            lt_w = (base_weights.get("lead_time", 0.15) / max(0.01, other_base)) * rem
            ctr_w = (base_weights.get("contract", 0.10) / max(0.01, other_base)) * rem
            r_w = (base_weights.get("risk", 0.05) / max(0.01, other_base)) * rem

            sim_w = {"price": c_w, "delivery": d_w, "quality": q_w, "lead_time": lt_w, "contract": ctr_w, "risk": r_w}
            scores = []
            for cand in scored_candidates:
                dims = cand["dimension_scores"]
                sc = (
                    dims["price_score"] * sim_w["price"] +
                    dims["delivery_score"] * sim_w["delivery"] +
                    dims["quality_score"] * sim_w["quality"] +
                    dims["lead_time_score"] * sim_w["lead_time"] +
                    dims["contract_score"] * sim_w["contract"] +
                    dims["risk_score"] * sim_w["risk"]
                ) * cand["confidence_factor"]
                scores.append((cand["supplier_id"], cand["supplier_name"], round(sc, 1)))

            scores.sort(key=lambda x: x[2], reverse=True)
            winner_id, winner_name, win_score = scores[0]
            row.append({
                "cost_level": cost_levels[c_idx],
                "delivery_level": delivery_levels[d_idx],
                "cost_weight": c_w,
                "delivery_weight": d_w,
                "preferred_supplier_id": winner_id,
                "preferred_supplier_name": winner_name,
                "score": win_score
            })
        grid.append(row)

    return {
        "cost_levels": cost_levels,
        "delivery_levels": delivery_levels,
        "grid": grid
    }

def stress_test_decision(
    requirement: Dict[str, Any],
    custom_weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Executes a deterministic Decision Stress Test against all 14 required supply chain conditions:
    1. Price Inflation (+5%)
    2. Price Inflation (+10%)
    3. Severe Price Escalation (+20%)
    4. Minor Delivery Delay (+1 Day)
    5. Moderate Delivery Delay (+3 Days)
    6. Severe Delivery Delay (+5 Days)
    7. Capacity Contraction (-10%)
    8. Capacity Contraction (-20%)
    9. Severe Capacity Crunch (-30%)
    10. Quality Deterioration (+3% Defect Rate / +3000 PPM)
    11. Supplier Unavailable (Force Majeure Outage)
    12. Contract Expires / Spot Purchasing
    13. Freight Surcharge Increase (+25%)
    14. Lead Time Increase (+7 Days)

    Calculates for EVERY condition:
    - Original recommendation
    - New recommendation
    - Original score
    - New score
    - Score delta
    - Effective cost delta
    - Delivery impact
    - Quality impact
    - Risk impact
    - Alternative supplier
    - Stability flag (is_stable)

    Deterministic Decision Robustness metrics:
    - Number of tested conditions (14)
    - Number of unchanged outcomes
    - Number of changed outcomes
    - Robustness percentage
    - Critical assumptions
    - Sensitive factors
    """
    provider = get_data_provider()
    base_result = calculate_decision_scores(requirement, custom_weights)
    if not base_result.get("recommended_option"):
        return {
            "requirement": requirement,
            "baseline_recommendation": None,
            "stress_tests": [],
            "tested_conditions_count": 0,
            "unchanged_outcomes_count": 0,
            "changed_outcomes_count": 0,
            "robustness_score_pct": 0.0,
            "robustness_rating": "N/A - No Eligible Baseline",
            "critical_assumptions": ["No eligible candidates available to stress test"],
            "sensitive_factors": [],
            "vulnerability_factors": ["No eligible candidates available to stress test"],
            "ai_robustness_summary": "Insufficient eligible suppliers found to perform stress testing."
        }

    base_rec = base_result["recommended_option"]
    top_sup_id = base_rec["primary_supplier_id"]
    top_sup_name = base_rec["primary_supplier_name"]
    base_score = base_rec["decision_score"]
    base_unit_cost = base_rec["effective_unit_cost_eur"]
    qty = requirement.get("quantity", 10000)
    candidates = base_result["ranked_suppliers"]
    weights = base_result["weights"]

    tests: List[Dict[str, Any]] = []

    def evaluate_shock(
        shock_id: str,
        shock_name: str,
        category: str,
        shock_param: str,
        score_mod_fn,
        cost_mod_fn=None,
        del_impact_str="Normal verified dock delivery",
        qual_impact_str="Standard verified defect PPM",
        risk_impact_str="Within baseline risk boundaries",
        hedging_str=""
    ) -> Dict[str, Any]:
        sim_cand = []
        for c in candidates:
            dim = c["dimension_scores"].copy()
            unit_c = c.get("cost_breakdown", {}).get("effective_unit_cost_eur", base_unit_cost)
            is_top = (c["supplier_id"] == top_sup_id)
            dim, sc_cost = score_mod_fn(c["supplier_id"], is_top, dim, unit_c)
            sc = round(sum(dim[f"{d}_score"] * weights[d] for d in weights) * c["confidence_factor"], 1)
            sim_cand.append((c["supplier_id"], c["supplier_name"], sc, sc_cost, dim))

        sim_cand.sort(key=lambda x: x[2], reverse=True)
        new_id, new_name, new_sc, new_c, _ = sim_cand[0]
        stable = (new_id == top_sup_id)
        cost_delta = round((new_c - base_unit_cost) * qty, 2)
        score_delta = round(new_sc - base_score, 1)

        # Identify alternative supplier
        other_candidates = [x for x in sim_cand if x[0] != top_sup_id]
        alt_name = other_candidates[0][1] if other_candidates else "None"
        alt_id = other_candidates[0][0] if other_candidates else None

        return {
            "shock_id": shock_id,
            "shock_name": shock_name,
            "category": category,
            "shock_parameter": shock_param,
            "original_recommendation": top_sup_name,
            "new_recommendation": new_name,
            "baseline_top_supplier": top_sup_name,
            "stress_top_supplier": new_name,
            "original_score": base_score,
            "new_score": new_sc,
            "stress_decision_score": new_sc,
            "score_delta": score_delta,
            "effective_cost_delta_eur": cost_delta,
            "delivery_impact": del_impact_str,
            "quality_impact": qual_impact_str,
            "risk_impact": risk_impact_str,
            "alternative_supplier": alt_name,
            "alternative_supplier_id": alt_id,
            "is_stable": stable,
            "impact_severity": "Low" if stable else ("High" if abs(score_delta) > 10 else "Medium"),
            "impact_description": "Primary recommendation remains preferred" if stable else f"Overtaken by {new_name} ({alt_id})",
            "hedging_mitigation": hedging_str
        }

    # 1. Price +5%
    def mod_price_5(s_id, is_top, dim, c):
        if is_top:
            dim["price_score"] = max(0.0, round(dim["price_score"] - 6.0, 1))
            return dim, c * 1.05
        return dim, c
    tests.append(evaluate_shock(
        "PRICE_5", "Price Inflation (+5%)", "Price",
        "+5% unit price increase on primary supplier",
        mod_price_5,
        del_impact_str="No delivery impact",
        qual_impact_str="No quality impact",
        risk_impact_str="Margin erosion",
        hedging_str="Enforce index-based ceiling or price lock"
    ))

    # 2. Price +10%
    def mod_price_10(s_id, is_top, dim, c):
        if is_top:
            dim["price_score"] = max(0.0, round(dim["price_score"] - 12.0, 1))
            return dim, c * 1.10
        return dim, c
    tests.append(evaluate_shock(
        "PRICE_10", "Price Escalation (+10%)", "Price",
        "+10% unit price increase on primary supplier",
        mod_price_10,
        del_impact_str="No delivery impact",
        qual_impact_str="No quality impact",
        risk_impact_str="Cost buffer challenged",
        hedging_str="Enforce long-term fixed price or volume rebate agreement"
    ))

    # 3. Price +20%
    def mod_price_20(s_id, is_top, dim, c):
        if is_top:
            dim["price_score"] = max(0.0, round(dim["price_score"] - 25.0, 1))
            return dim, c * 1.20
        return dim, c
    tests.append(evaluate_shock(
        "PRICE_20", "Severe Price Escalation (+20%)", "Price",
        "+20% severe price spike from supplier",
        mod_price_20,
        del_impact_str="No delivery impact",
        qual_impact_str="No quality impact",
        risk_impact_str="Severe margin contraction",
        hedging_str="Dual-sourcing framework or RFQ re-negotiation"
    ))

    # 4. Delivery Delay +1 Day
    def mod_del_1d(s_id, is_top, dim, c):
        if is_top:
            dim["delivery_score"] = max(0.0, round(dim["delivery_score"] - 5.0, 1))
            dim["lead_time_score"] = max(0.0, round(dim["lead_time_score"] - 4.0, 1))
        return dim, c
    tests.append(evaluate_shock(
        "DEL_DELAY_1D", "Minor Delivery Delay (+1 Day)", "Delivery",
        "+1 day dock receipt delay past scheduled delivery date",
        mod_del_1d,
        del_impact_str="+1 day dock arrival variance",
        qual_impact_str="No quality impact",
        risk_impact_str="Absorbed by assembly buffer",
        hedging_str="Standard dock receipt safety buffer"
    ))

    # 5. Delivery Delay +3 Days
    def mod_del_3d(s_id, is_top, dim, c):
        if is_top:
            dim["delivery_score"] = max(0.0, round(dim["delivery_score"] - 16.0, 1))
            dim["lead_time_score"] = max(0.0, round(dim["lead_time_score"] - 12.0, 1))
        return dim, c
    tests.append(evaluate_shock(
        "DEL_DELAY_3D", "Moderate Delivery Delay (+3 Days)", "Delivery",
        "+3 days dock delivery slippage",
        mod_del_3d,
        del_impact_str="+3 days dock arrival variance",
        qual_impact_str="No quality impact",
        risk_impact_str="Production scheduling friction",
        hedging_str="Increase plant warehouse safety stock by 3 days demand"
    ))

    # 6. Delivery Delay +5 Days
    def mod_del_5d(s_id, is_top, dim, c):
        if is_top:
            dim["delivery_score"] = max(0.0, round(dim["delivery_score"] - 30.0, 1))
            dim["lead_time_score"] = max(0.0, round(dim["lead_time_score"] - 25.0, 1))
        return dim, c
    tests.append(evaluate_shock(
        "DEL_DELAY_5D", "Severe Delivery Delay (+5 Days)", "Delivery",
        "+5 days critical late shipment risking assembly shutdown",
        mod_del_5d,
        del_impact_str="+5 days critical delivery slippage",
        qual_impact_str="No quality impact",
        risk_impact_str="Critical assembly line stoppage risk",
        hedging_str="Mandatory expedited transit clause or secondary source split"
    ))

    # 7. Capacity Contraction -10%
    def mod_cap_10(s_id, is_top, dim, c):
        if is_top:
            dim["risk_score"] = max(0.0, round(dim["risk_score"] - 10.0, 1))
        return dim, c
    tests.append(evaluate_shock(
        "CAPACITY_10", "Capacity Contraction (-10%)", "Capacity",
        "-10% operational capacity contraction at vendor plant",
        mod_cap_10,
        del_impact_str="Potential queue backlog at vendor",
        qual_impact_str="No quality impact",
        risk_impact_str="Capacity utilization rises to 90%",
        hedging_str="Reserve dedicated manufacturing capacity line"
    ))

    # 8. Capacity Contraction -20%
    def mod_cap_20(s_id, is_top, dim, c):
        if is_top:
            dim["risk_score"] = max(0.0, round(dim["risk_score"] - 22.0, 1))
        return dim, c
    tests.append(evaluate_shock(
        "CAPACITY_20", "Capacity Contraction (-20%)", "Capacity",
        "-20% capacity reduction tightening fulfillment headroom",
        mod_cap_20,
        del_impact_str="Possible fulfillment batch splitting",
        qual_impact_str="No quality impact",
        risk_impact_str="Capacity constrained for orders > 10,000 EA",
        hedging_str="Implement SAP Quota Arrangement split (60/40 allocation)"
    ))

    # 9. Severe Capacity Crunch -30%
    def mod_cap_30(s_id, is_top, dim, c):
        if is_top:
            dim["risk_score"] = max(0.0, round(dim["risk_score"] - 38.0, 1))
            dim["delivery_score"] = max(0.0, round(dim["delivery_score"] - 15.0, 1))
        return dim, c
    tests.append(evaluate_shock(
        "CAPACITY_30", "Severe Capacity Crunch (-30%)", "Capacity",
        "-30% severe machine outage at supplier facility",
        mod_cap_30,
        del_impact_str="Major fulfillment delays due to equipment outage",
        qual_impact_str="Risk of hurried rework batches",
        risk_impact_str="Volume spills over to secondary vendors",
        hedging_str="Pre-approve secondary qualified vendor on SAP Source List"
    ))

    # 10. Quality Deterioration (+3% Defect Rate / +3000 PPM)
    def mod_qual_drop(s_id, is_top, dim, c):
        if is_top:
            dim["quality_score"] = max(0.0, round(dim["quality_score"] - 35.0, 1))
        return dim, c
    tests.append(evaluate_shock(
        "QUAL_DROP", "Quality Deterioration (+3.0% Defects)", "Quality",
        "+3000 PPM defect rate spike during receiving inspection",
        mod_qual_drop,
        del_impact_str="Inspection lot quarantine delays (+2d)",
        qual_impact_str="+3.0% incoming defect rate spike",
        risk_impact_str="Scrap and rework costs incurred",
        hedging_str="Mandate pre-dispatch Certificate of Analysis (CoA)"
    ))

    # 11. Supplier Unavailable (Force Majeure Outage)
    def mod_outage(s_id, is_top, dim, c):
        if is_top:
            dim["risk_score"] = 0.0
            dim["delivery_score"] = 0.0
            dim["price_score"] = 0.0
            dim["quality_score"] = 0.0
            dim["lead_time_score"] = 0.0
            dim["contract_score"] = 0.0
        return dim, c
    tests.append(evaluate_shock(
        "SUPPLIER_UNAVAILABLE", "Supplier Disruption (Force Majeure Outage)", "Disruption",
        "Complete unexpected operational shutdown of primary supplier facility",
        mod_outage,
        del_impact_str="100% shipment failure from primary vendor",
        qual_impact_str="N/A - Zero supply",
        risk_impact_str="Critical single-source supply chain failure",
        hedging_str="Immediate failover to runner-up in SAP Source List"
    ))

    # 12. Contract Expires / Spot Purchasing
    def mod_contract_exp(s_id, is_top, dim, c):
        if is_top:
            dim["contract_score"] = 20.0
            dim["price_score"] = max(0.0, round(dim["price_score"] - 8.0, 1))
        return dim, c
    tests.append(evaluate_shock(
        "CONTRACT_EXPIRES", "Contract Expiry / Spot Purchasing", "Contract",
        "Loss of outline purchasing agreement discount and terms",
        mod_contract_exp,
        del_impact_str="Loss of guaranteed dock slot SLA",
        qual_impact_str="No immediate quality change",
        risk_impact_str="Commercial exposure to spot market volatility",
        hedging_str="Execute early contract renewal with 60-day horizon"
    ))

    # 13. Freight Surcharge Increase (+25%)
    def mod_freight_inc(s_id, is_top, dim, c):
        if is_top:
            dim["price_score"] = max(0.0, round(dim["price_score"] - 7.0, 1))
            return dim, c + 1.25
        return dim, c
    tests.append(evaluate_shock(
        "FREIGHT_INCREASE", "Freight Surcharge (+25%)", "Freight",
        "+25% logistics and transport fuel surcharge",
        mod_freight_inc,
        del_impact_str="Transit bottlenecks on regional freight lane",
        qual_impact_str="No quality impact",
        risk_impact_str="Landed procurement cost escalation",
        hedging_str="Contract with regional freight forwarder or ex-works terms"
    ))

    # 14. Lead Time Increase (+7 Days)
    def mod_lt_inc(s_id, is_top, dim, c):
        if is_top:
            dim["lead_time_score"] = max(0.0, round(dim["lead_time_score"] - 20.0, 1))
            dim["delivery_score"] = max(0.0, round(dim["delivery_score"] - 8.0, 1))
        return dim, c
    tests.append(evaluate_shock(
        "LEAD_TIME_INCREASE", "Lead Time Increase (+7 Days)", "Lead Time",
        "+7 days extended manufacturing turnaround at supplier",
        mod_lt_inc,
        del_impact_str="+7 days order-to-delivery lead time extension",
        qual_impact_str="No quality impact",
        risk_impact_str="MRP order placement window must advance",
        hedging_str="Adjust SAP Material Master planned delivery time"
    ))

    # Compute deterministic robustness metrics
    total_tests = len(tests)
    stable_count = sum(1 for t in tests if t["is_stable"])
    changed_count = total_tests - stable_count
    robustness_pct = round((stable_count / max(1, total_tests)) * 100.0, 1)

    if robustness_pct >= 75.0:
        robustness_rating = "Highly Robust (Resilient Recommendation)"
    elif robustness_pct >= 50.0:
        robustness_rating = "Moderately Robust (Vulnerable to Specific Shocks)"
    else:
        robustness_rating = "Fragile / High Sensitivity (Immediate Hedging Advised)"

    # Identify critical assumptions
    critical_assumptions = [
        f"{top_sup_name} maintains price escalation within +5%",
        f"Dock receipt delivery delay does not exceed 2 days",
        f"Operating manufacturing capacity exceeds {qty:,} EA demand",
        f"Incoming inspection defect rate remains below 1.5%",
        f"Outline purchasing agreement remains valid and enforceable"
    ]

    # Identify sensitive factors
    sensitive_factors = list(set([
        t["category"] for t in tests if not t["is_stable"]
    ]))
    if not sensitive_factors:
        sensitive_factors = ["Composite multi-dimensional stability (no single vulnerability)"]

    vulnerabilities = [
        f"{t['shock_name']}: {t['impact_description']}"
        for t in tests if not t["is_stable"] or t["score_delta"] <= -12.0
    ]

    ai_summary = (
        f"Recommendation {top_sup_name} demonstrates a deterministic robustness score of {robustness_pct}% "
        f"(stable under {stable_count} of {total_tests} tested supply chain shocks). "
        f"The sourcing decision is rated as '{robustness_rating}'. "
        f"Sensitive factors: {', '.join(sensitive_factors)}. "
        + (f"Key vulnerabilities: {'; '.join(vulnerabilities[:2])}. " if vulnerabilities else "Recommendation maintains structural dominance. ")
        + f"Strategic mitigation: {tests[0]['hedging_mitigation']}."
    )

    return {
        "requirement": requirement,
        "baseline_top_supplier_id": top_sup_id,
        "baseline_top_supplier_name": top_sup_name,
        "baseline_decision_score": base_score,
        "tested_conditions_count": total_tests,
        "unchanged_outcomes_count": stable_count,
        "changed_outcomes_count": changed_count,
        "robustness_score_pct": robustness_pct,
        "robustness_rating": robustness_rating,
        "stable_tests_count": stable_count,
        "total_tests_count": total_tests,
        "critical_assumptions": critical_assumptions,
        "sensitive_factors": sensitive_factors,
        "vulnerability_factors": vulnerabilities,
        "stress_tests": tests,
        "ai_robustness_summary": ai_summary
    }

def simulate_supplier_failure(
    requirement: Dict[str, Any],
    failed_supplier_id: str
) -> Dict[str, Any]:
    """
    Simulates a sudden failure/unavailability of a specific supplier for a requirement.
    Calculates capacity gap, cost impact, delivery impact, risk impact, and formulates 4 distinct strategies:
    1. Single Alternative
    2. Multi-Supplier Allocation (Quota Split)
    3. New Sourcing (Urgent RFQ Pipeline)
    4. Safety-Stock Strategy (Buffer Stock Coverage)
    Also computes a Single vs Multi-Supplier Comparison matrix (Cost, Delivery, Quality, Risk, Concentration before vs after).
    """
    provider = get_data_provider()
    mat_id = requirement.get("material_id", "MAT-001")
    req_qty = requirement.get("quantity", 10000)

    failed_sup = provider.get_supplier_by_id(failed_supplier_id)
    failed_sup_name = failed_sup.get("name", failed_supplier_id) if failed_sup else failed_supplier_id

    # Baseline evaluation
    base_res = calculate_decision_scores(requirement)
    base_rec = base_res.get("recommended_option", {})
    base_cost_eur = base_rec.get("total_estimated_cost_eur", 0.0)
    base_unit_cost = base_rec.get("effective_unit_cost_eur", 0.0)
    base_otd = base_rec.get("delivery_reliability_pct", 92.0)
    base_quality_defect = base_rec.get("quality_rejection_rate_pct", 0.5)

    # Remaining eligible candidates
    elig = evaluate_all_suppliers_for_requirement(requirement)
    available_cands = [
        s for s in (elig["eligible"] + elig["conditionally_eligible"])
        if s["supplier_id"] != failed_supplier_id
    ]

    if not available_cands:
        return {
            "requirement": requirement,
            "failed_supplier_id": failed_supplier_id,
            "failed_supplier_name": failed_sup_name,
            "status": "Critical Sourcing Failure",
            "capacity_gap": req_qty,
            "coverage_pct": 0.0,
            "total_alternative_capacity": 0,
            "uncovered_quantity": req_qty,
            "cost_variance_eur": 0.0,
            "delivery_impact": "Complete fulfillment halt (0% delivery)",
            "quality_impact": "Zero incoming inspection data",
            "risk_impact": "Critical stockout / production line stoppage",
            "strategies": {
                "single_alternative": None,
                "multi_supplier_allocation": None,
                "new_sourcing": {
                    "strategy_name": "Emergency Market Sourcing (Spot RFQ)",
                    "description": f"Broadcast urgent RFQ to global supplier network for {mat_id}.",
                    "estimated_lead_time_days": 21
                },
                "safety_stock_strategy": {
                    "strategy_name": "Safety Stock Buffer Consumption",
                    "description": f"Deplete plant inventory buffer; covers approx 14 days of assembly demand.",
                    "stock_buffer_days": 14
                }
            },
            "single_vs_multi_comparison": None,
            "ai_failure_assessment": (
                f"CRITICAL SINGLE-SOURCE EXPOSURE: Supplier {failed_sup_name} ({failed_supplier_id}) has no qualified "
                f"alternative sources for material {mat_id}. 100% of requirement volume ({req_qty:,} EA) is uncovered."
            )
        }

    # Gather candidate metrics
    alt_records = []
    total_alt_cap = 0
    for cand in available_cands:
        s_id = cand["supplier_id"]
        pir = provider.get_pir(s_id, mat_id) or {}
        pir_max = pir.get("maximum_order_quantity", 5000)
        total_alt_cap += pir_max
        cost_info = calculate_effective_procurement_cost(s_id, material_id=mat_id, order_quantity=min(pir_max, req_qty))
        metrics = calculate_supplier_metrics(s_id, material_id=mat_id)
        
        alt_records.append({
            "supplier_id": s_id,
            "supplier_name": cand["supplier_name"],
            "practical_capacity_ea": pir_max,
            "effective_unit_cost_eur": cost_info["effective_unit_cost_eur"],
            "delivery_reliability_pct": metrics.get("on_time_delivery_rate_pct", 85.0),
            "quality_rejection_rate_pct": metrics.get("quality_rejection_rate_pct", 1.0),
            "lead_time_days": pir.get("planned_delivery_time_days", 14),
            "risk_rating": cand.get("supplier_obj", {}).get("risk_rating", "Low"),
            "spend_concentration_pct": metrics.get("spend_concentration_pct", 15.0)
        })

    alt_records.sort(key=lambda x: (x["effective_unit_cost_eur"], -x["delivery_reliability_pct"]))

    # 1. Strategy: Single Alternative
    best_single = alt_records[0]
    single_coverage = min(best_single["practical_capacity_ea"], req_qty)
    single_cost = round(single_coverage * best_single["effective_unit_cost_eur"], 2)
    strategy_single = {
        "strategy_name": f"Single Alternative ({best_single['supplier_name']})",
        "supplier_id": best_single["supplier_id"],
        "supplier_name": best_single["supplier_name"],
        "max_allocatable_quantity": single_coverage,
        "coverage_pct": round((single_coverage / req_qty) * 100.0, 1),
        "effective_unit_cost_eur": best_single["effective_unit_cost_eur"],
        "total_cost_eur": single_cost,
        "cost_variance_eur": round(single_cost - base_cost_eur, 2),
        "lead_time_days": best_single["lead_time_days"],
        "feasibility": "Fully Viable" if single_coverage >= req_qty else f"Partial Fulfillment ({single_coverage:,}/{req_qty:,} EA)"
    }

    # 2. Strategy: Multi-Supplier Allocation (Quota Split)
    allocated_qty = 0
    multi_plan = []
    multi_total_cost = 0.0
    for rec in alt_records:
        if allocated_qty >= req_qty:
            break
        alloc = min(rec["practical_capacity_ea"], req_qty - allocated_qty)
        if alloc > 0:
            subtotal = round(alloc * rec["effective_unit_cost_eur"], 2)
            multi_total_cost += subtotal
            allocated_qty += alloc
            multi_plan.append({
                "supplier_id": rec["supplier_id"],
                "supplier_name": rec["supplier_name"],
                "allocated_quantity": alloc,
                "allocation_pct": round((alloc / req_qty) * 100.0, 1),
                "effective_unit_cost_eur": rec["effective_unit_cost_eur"],
                "subtotal_cost_eur": subtotal,
                "otd_pct": rec["delivery_reliability_pct"],
                "defect_pct": rec["quality_rejection_rate_pct"]
            })

    uncovered_qty = max(0, req_qty - allocated_qty)
    coverage_pct = round((allocated_qty / req_qty) * 100.0, 1)
    cost_delta = round(multi_total_cost - base_cost_eur, 2)

    strategy_multi = {
        "strategy_name": "Multi-Supplier Allocation (Quota Balancing)",
        "allocation_plan": multi_plan,
        "total_allocated_quantity": allocated_qty,
        "coverage_pct": coverage_pct,
        "uncovered_quantity": uncovered_qty,
        "total_cost_eur": round(multi_total_cost, 2),
        "cost_variance_eur": cost_delta,
        "feasibility": "Recommended Hedge Strategy"
    }

    # 3. Strategy: New Sourcing Pipeline
    strategy_new_sourcing = {
        "strategy_name": "New Sourcing Qualification (RFQ Broadcast)",
        "description": f"Publish RFQ to qualify 2 additional European precision vendors for {mat_id}.",
        "estimated_lead_time_days": 18,
        "target_cost_corridor_eur": f"€{best_single['effective_unit_cost_eur'] * 0.95:.2f} - €{best_single['effective_unit_cost_eur'] * 1.05:.2f}"
    }

    # 4. Strategy: Safety Stock Strategy
    daily_burn_rate = round(req_qty / 30.0)
    safety_stock_required_units = daily_burn_rate * best_single["lead_time_days"]
    strategy_safety_stock = {
        "strategy_name": "Safety-Stock Buffer Consumption",
        "buffer_days": best_single["lead_time_days"],
        "recommended_buffer_units": safety_stock_required_units,
        "description": f"Hold {safety_stock_required_units:,} EA safety buffer at Plant warehouse to absorb {best_single['lead_time_days']}-day turnaround."
    }

    # Single vs Multi-Supplier Comparison Matrix (Prompt Section 13)
    # Calculate weighted delivery and quality for multi-plan
    if multi_plan:
        multi_otd = round(sum(p["otd_pct"] * (p["allocated_quantity"] / max(1, allocated_qty)) for p in multi_plan), 1)
        multi_qual = round(sum(p["defect_pct"] * (p["allocated_quantity"] / max(1, allocated_qty)) for p in multi_plan), 2)
        multi_conc = round(max(p["allocation_pct"] for p in multi_plan), 1)
    else:
        multi_otd = best_single["delivery_reliability_pct"]
        multi_qual = best_single["quality_rejection_rate_pct"]
        multi_conc = 100.0

    comparison_matrix = {
        "single_supplier": {
            "supplier_id": best_single["supplier_id"],
            "supplier_name": best_single["supplier_name"],
            "total_cost_eur": single_cost,
            "effective_unit_cost_eur": best_single["effective_unit_cost_eur"],
            "delivery_reliability_pct": best_single["delivery_reliability_pct"],
            "quality_rejection_rate_pct": best_single["quality_rejection_rate_pct"],
            "risk_rating": best_single["risk_rating"],
            "concentration_pct": 100.0,
            "uncovered_units": max(0, req_qty - single_coverage)
        },
        "multi_supplier": {
            "allocation_summary": f"{len(multi_plan)} qualified suppliers (" + ", ".join(f"{p['supplier_name']}: {p['allocation_pct']}%" for p in multi_plan) + ")",
            "total_cost_eur": round(multi_total_cost, 2),
            "effective_unit_cost_eur": round(multi_total_cost / max(1, allocated_qty), 2),
            "delivery_reliability_pct": multi_otd,
            "quality_rejection_rate_pct": multi_qual,
            "risk_rating": "Low (Diversified)",
            "concentration_pct": multi_conc,
            "uncovered_units": uncovered_qty
        },
        "deltas": {
            "cost_variance_eur": round(multi_total_cost - single_cost, 2),
            "delivery_delta_pts": round(multi_otd - best_single["delivery_reliability_pct"], 1),
            "quality_delta_pts": round(multi_qual - best_single["quality_rejection_rate_pct"], 2),
            "concentration_reduction_pts": round(100.0 - multi_conc, 1)
        }
    }

    ai_assessment = (
        f"In the event of {failed_sup_name} outage, {coverage_pct}% of the {req_qty:,} EA demand "
        f"can be absorbed across {len(multi_plan)} qualified alternative suppliers ({', '.join(p['supplier_name'] for p in multi_plan)}). "
        + (f"WARNING: An uncovered deficit of {uncovered_qty:,} EA remains due to practical capacity ceilings. " if uncovered_qty > 0 else "Full volume coverage achieved without capacity shortfall. ")
        + f"Cost impact: {'+' if cost_delta >= 0 else ''}€{cost_delta:,.2f} versus baseline. "
        f"Multi-supplier allocation reduces maximum supplier concentration from 100% down to {multi_conc}%."
    )

    return {
        "requirement": requirement,
        "failed_supplier_id": failed_supplier_id,
        "failed_supplier_name": failed_sup_name,
        "required_quantity": req_qty,
        "total_alternative_capacity": total_alt_cap,
        "allocated_quantity": allocated_qty,
        "uncovered_quantity": uncovered_qty,
        "capacity_gap": uncovered_qty,
        "coverage_pct": coverage_pct,
        "cost_variance_eur": cost_delta,
        "emergency_allocation_plan": multi_plan,
        "alternative_candidates": alt_records,
        "strategies": {
            "single_alternative": strategy_single,
            "multi_supplier_allocation": strategy_multi,
            "new_sourcing": strategy_new_sourcing,
            "safety_stock_strategy": strategy_safety_stock
        },
        "single_vs_multi_comparison": comparison_matrix,
        "ai_failure_assessment": ai_assessment
    }

def simulate_concentration_shock(
    material_id: str,
    plant_id: str,
    capacity_drop_pct: float = 20.0
) -> Dict[str, Any]:
    """
    Simulates a supplier concentration shock (Prompt Section 20).
    Displays current portfolio concentration shares, then simulates:
    "What if top supplier capacity drops by X%?"
    Calculates: New allocation shares, capacity gap, additional cost, delivery impact, and risk.
    """
    provider = get_data_provider()
    pos = provider.get_pushed_pos()
    mat_pos = [p for p in pos if p.get("material_id") == material_id]
    
    # Calculate current supplier shares
    total_spend = sum(p.get("total_net_value_eur", 0.0) for p in mat_pos)
    spend_by_sup: Dict[str, float] = {}
    for p in mat_pos:
        s_id = p.get("supplier_id")
        spend_by_sup[s_id] = spend_by_sup.get(s_id, 0.0) + p.get("total_net_value_eur", 0.0)

    suppliers = {s["supplier_id"]: s for s in provider.get_suppliers()}
    current_shares = []
    for s_id, sp in sorted(spend_by_sup.items(), key=lambda x: x[1], reverse=True):
        share_pct = round((sp / max(1.0, total_spend)) * 100.0, 1)
        current_shares.append({
            "supplier_id": s_id,
            "supplier_name": suppliers.get(s_id, {}).get("name", s_id),
            "spend_eur": round(sp, 2),
            "share_pct": share_pct
        })

    top_sup = current_shares[0] if current_shares else {"supplier_id": "SUP-004", "supplier_name": "Primary Vendor", "share_pct": 60.0, "spend_eur": 100000}
    top_sup_id = top_sup["supplier_id"]

    # Capacity shock simulation on standard 10,000 requirement
    req = {
        "material_id": material_id,
        "plant_id": plant_id,
        "quantity": 10000,
        "required_date": "2026-10-15"
    }
    
    # Primary capacity drops by capacity_drop_pct
    pir = provider.get_pir(top_sup_id, material_id) or {}
    base_cap = pir.get("maximum_order_quantity", 10000)
    reduced_cap = int(base_cap * (1.0 - (capacity_drop_pct / 100.0)))
    
    spillover_qty = max(0, 10000 - reduced_cap)
    
    # Discover alternatives to absorb spillover
    alternatives = discover_alternative_suppliers(material_id, plant_id)
    alt_absorbed = []
    absorbed_qty = 0
    add_cost_eur = 0.0
    primary_cost = calculate_effective_procurement_cost(top_sup_id, material_id=material_id, order_quantity=10000)["effective_unit_cost_eur"]

    for alt in alternatives:
        if alt["supplier_id"] == top_sup_id:
            continue
        if absorbed_qty >= spillover_qty:
            break
        alloc = min(4000, spillover_qty - absorbed_qty)
        if alloc > 0:
            cost_diff = (alt["effective_unit_cost_eur"] - primary_cost) * alloc
            add_cost_eur += max(0.0, cost_diff)
            absorbed_qty += alloc
            alt_absorbed.append({
                "supplier_id": alt["supplier_id"],
                "supplier_name": alt["supplier_name"],
                "absorbed_quantity": alloc,
                "effective_unit_cost_eur": alt["effective_unit_cost_eur"]
            })

    capacity_gap = max(0, spillover_qty - absorbed_qty)

    return {
        "material_id": material_id,
        "plant_id": plant_id,
        "capacity_drop_pct": capacity_drop_pct,
        "current_concentration": current_shares,
        "shocked_supplier_id": top_sup_id,
        "shocked_supplier_name": top_sup["supplier_name"],
        "baseline_capacity_ea": base_cap,
        "reduced_capacity_ea": reduced_cap,
        "spillover_quantity": spillover_qty,
        "absorbed_quantity": absorbed_qty,
        "capacity_gap": capacity_gap,
        "additional_cost_eur": round(add_cost_eur, 2),
        "reallocation_plan": alt_absorbed,
        "delivery_impact": f"Spillover absorbed across {len(alt_absorbed)} secondary suppliers with average lead time +3 days.",
        "risk_assessment": f"Reducing {top_sup['supplier_name']} share from {top_sup['share_pct']}% mitigates single-source exposure, but adds €{add_cost_eur:,.2f} in fulfillment cost."
    }

def discover_alternative_suppliers(
    material_id: str,
    plant_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Discovers and ranks all viable qualified alternatives for a specific material and plant."""
    provider = get_data_provider()
    mats = provider.get_materials()
    mat_obj = next((m for m in mats if m["material_id"] == material_id), None)
    if not mat_obj:
        return []

    req = {
        "material_id": material_id,
        "plant_id": plant_id or "P001",
        "quantity": 5000,
        "required_date": "2026-11-01"
    }
    elig = evaluate_all_suppliers_for_requirement(req)
    cands = elig["eligible"] + elig["conditionally_eligible"]

    results = []
    for c in cands:
        s_id = c["supplier_id"]
        metrics = calculate_supplier_metrics(s_id, material_id=material_id)
        cost_info = calculate_effective_procurement_cost(s_id, material_id=material_id, order_quantity=5000)
        pir = provider.get_pir(s_id, material_id)
        results.append({
            "supplier_id": s_id,
            "supplier_name": c["supplier_name"],
            "eligibility_status": c["eligibility_status"],
            "effective_unit_cost_eur": cost_info["effective_unit_cost_eur"],
            "otd_rate_pct": metrics.get("on_time_delivery_rate_pct", 0.0),
            "rejection_rate_pct": metrics.get("quality_rejection_rate_pct", 0.0),
            "lead_time_days": pir.get("planned_delivery_time_days", 14) if pir else 14,
            "contract_status": cost_info.get("contract_status", "No Active Contract")
        })

    results.sort(key=lambda x: (x["effective_unit_cost_eur"], -x["otd_rate_pct"]))
    return results



