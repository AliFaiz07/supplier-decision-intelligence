"""
Tests for Decision Engine, Scoring, Weights, and Quota Allocation.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.decision_engine import calculate_decision_scores, PRIORITY_PRESETS
from app.core.data_provider import get_data_provider

def test_decision_scores_ranking():
    provider = get_data_provider()
    req = provider.get_requirements()[0]
    
    result = calculate_decision_scores(req)
    assert len(result["ranked_suppliers"]) > 0
    # verify descending order of scores
    scores = [s["final_score"] for s in result["ranked_suppliers"]]
    assert scores == sorted(scores, reverse=True)
    assert result["recommended_option"] is not None
    assert result["recommended_option"]["primary_supplier_id"] == result["ranked_suppliers"][0]["supplier_id"]

def test_weight_change_shifts_priority():
    provider = get_data_provider()
    req = provider.get_requirements()[0] # REQ-001 MAT-001

    # Delivery-focused vs Cost-focused
    del_res = calculate_decision_scores(req, custom_weights=PRIORITY_PRESETS["Delivery-Focused"])
    cost_res = calculate_decision_scores(req, custom_weights=PRIORITY_PRESETS["Cost-Focused"])

    # High delivery weight should favor reliable suppliers
    top_del = del_res["ranked_suppliers"][0]
    assert top_del["dimension_scores"]["delivery_score"] >= 80.0

def test_multi_supplier_quota_allocation():
    provider = get_data_provider()
    req_quota = [r for r in provider.get_requirements() if r.get("selection_mode") == "Multi-Supplier Allocation (Quota)"][0]
    
    result = calculate_decision_scores(req_quota)
    assert result["recommended_option"]["mode"] == "Quota Allocation"
    assert result["recommended_option"]["allocation_plan"] is not None
    assert len(result["recommended_option"]["allocation_plan"]) >= 2
    # Verify sum of allocated quantities matches total requirement quantity
    total_alloc = sum(item["allocated_quantity"] for item in result["recommended_option"]["allocation_plan"])
    assert abs(total_alloc - req_quota["quantity"]) < 50
