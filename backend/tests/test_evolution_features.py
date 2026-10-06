"""
Unit tests for Product Evolution Features:
- Decision Stress Testing & Robustness Analysis
- Supplier Failure & Alternative Allocation
- Procurement Memory (Expected vs Actual Closed-Loop Learning)
- Procurement Anomaly Center
- "What Changed?" Engine
- Predictive Analytics & Forecasting
- AI Assistant Evolution Queries
"""

import pytest
from app.core.decision_engine import stress_test_decision, simulate_supplier_failure, discover_alternative_suppliers
from app.core.decision_history_manager import get_history_manager
from app.core.analytics import get_procurement_anomalies, get_what_changed_analytics, get_predictive_forecasts
from app.core.assistant_service import answer_procurement_question

def test_decision_stress_testing():
    req = {
        "material_id": "MAT-001",
        "quantity": 10000,
        "plant_id": "P001",
        "required_date": "2026-10-15",
        "business_priority": "Balanced"
    }
    res = stress_test_decision(req)
    assert "robustness_score_pct" in res
    assert res["total_tests_count"] in [8, 14]
    assert res["stable_tests_count"] >= 0
    assert len(res["stress_tests"]) in [8, 14]
    assert res["baseline_top_supplier_name"] is not None
    assert "ai_robustness_summary" in res

def test_supplier_failure_simulation():
    req = {
        "material_id": "MAT-001",
        "quantity": 10000,
        "plant_id": "P001",
        "required_date": "2026-10-15"
    }
    # Simulate failure of SUP-004
    res = simulate_supplier_failure(req, "SUP-004")
    assert res["failed_supplier_id"] == "SUP-004"
    assert "coverage_pct" in res
    assert "emergency_allocation_plan" in res
    assert "ai_failure_assessment" in res

def test_discover_alternative_suppliers():
    alts = discover_alternative_suppliers("MAT-001", "P001")
    assert isinstance(alts, list)
    assert len(alts) >= 1
    assert "supplier_id" in alts[0]
    assert "effective_unit_cost_eur" in alts[0]

def test_procurement_memory_summary():
    mgr = get_history_manager()
    mem = mgr.get_procurement_memory_summary()
    assert mem["total_decisions"] >= 3
    assert mem["evaluated_decisions_count"] >= 3
    assert mem["decision_accuracy_pct"] >= 0.0
    assert len(mem["lessons_learned"]) >= 3

def test_procurement_anomalies():
    res = get_procurement_anomalies()
    assert res["total_anomalies_count"] >= 3
    cats = {a["category"] for a in res["anomalies"]}
    assert "Price Anomaly" in cats or "Delivery Anomaly" in cats

def test_what_changed_analytics():
    res = get_what_changed_analytics()
    assert "total_spend_delta" in res
    assert "overall_otif_delta" in res
    assert len(res["supplier_shifts"]) >= 2
    assert "ai_summary" in res

def test_predictive_forecasts():
    res = get_predictive_forecasts(material_id="MAT-001", supplier_id="SUP-004")
    p_fc = res["material_price_forecast"]
    assert p_fc["has_sufficient_history"] is True
    assert len(p_fc["forecast_points"]) == 6
    assert p_fc["is_model_estimate"] is True
    assert res["disclaimer"] is not None

def test_assistant_evolution_queries():
    # Stress test query
    q1 = answer_procurement_question("How robust is this decision?")
    assert "Robustness Score" in q1["answer"]

    # Supplier failure query
    q2 = answer_procurement_question("What if SUP-004 fails?")
    assert "Outage Simulation" in q2["answer"]

    # Procurement memory query
    q3 = answer_procurement_question("What did we learn from previous decisions?")
    assert "Procurement Memory" in q3["answer"]

    # Anomaly query
    q4 = answer_procurement_question("Show active procurement anomalies")
    assert "Anomaly Summary" in q4["answer"]

    # Forecast query
    q5 = answer_procurement_question("Forecast price for MAT-001")
    assert "Price Projection" in q5["answer"]
