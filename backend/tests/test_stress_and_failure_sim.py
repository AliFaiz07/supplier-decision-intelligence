"""
Tests for 14-condition Decision Stress Testing, Failure Simulation, and Sensitivity Matrix.
"""

from app.core.decision_engine import (
    stress_test_decision,
    simulate_supplier_failure,
    simulate_concentration_shock,
    compute_decision_sensitivity_matrix
)
from app.core.data_provider import get_data_provider

def test_14_shocks_and_robustness():
    req = get_data_provider().get_requirements()[0]
    res = stress_test_decision(req)
    
    assert res["tested_conditions_count"] == 14
    assert len(res["stress_tests"]) == 14
    assert res["robustness_score_pct"] >= 0.0
    assert len(res["critical_assumptions"]) >= 3
    assert len(res["sensitive_factors"]) >= 1

    # Verify shock fields
    for shock in res["stress_tests"]:
        assert "original_recommendation" in shock
        assert "new_recommendation" in shock
        assert "score_delta" in shock
        assert "effective_cost_delta_eur" in shock
        assert "is_stable" in shock
        assert "alternative_supplier" in shock

def test_failure_simulation_4_strategies():
    req = get_data_provider().get_requirements()[0]
    res = simulate_supplier_failure(req, "SUP-006")
    
    assert "strategies" in res
    assert "single_alternative" in res["strategies"]
    assert "multi_supplier_allocation" in res["strategies"]
    assert "new_sourcing" in res["strategies"]
    assert "safety_stock_strategy" in res["strategies"]
    assert "single_vs_multi_comparison" in res
    assert "deltas" in res["single_vs_multi_comparison"]

def test_concentration_shock_simulation():
    res = simulate_concentration_shock("MAT-001", "P001", 20.0)
    assert res["capacity_drop_pct"] == 20.0
    assert "current_concentration" in res
    assert "spillover_quantity" in res
    assert "reallocation_plan" in res

def test_sensitivity_matrix_grid():
    candidates = [
        {
            "supplier_id": "SUP-001",
            "supplier_name": "Supplier 1",
            "dimension_scores": {"price_score": 90, "delivery_score": 70, "quality_score": 80, "lead_time_score": 75, "contract_score": 60, "risk_score": 80},
            "confidence_factor": 1.0
        },
        {
            "supplier_id": "SUP-002",
            "supplier_name": "Supplier 2",
            "dimension_scores": {"price_score": 60, "delivery_score": 95, "quality_score": 85, "lead_time_score": 90, "contract_score": 80, "risk_score": 85},
            "confidence_factor": 1.0
        }
    ]
    matrix = compute_decision_sensitivity_matrix(candidates, {"price": 0.25, "delivery": 0.25, "quality": 0.2, "lead_time": 0.15, "contract": 0.1, "risk": 0.05})
    assert len(matrix["grid"]) == 4
    assert len(matrix["grid"][0]) == 4
