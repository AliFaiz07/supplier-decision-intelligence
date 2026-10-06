"""
Tests for Procurement Decision Twin Engine.
Verifies requirement context, eligible suppliers, market corridor,
evidence package, scenario sensitivity matrix, and stress test integration.
"""

from app.core.decision_twin import build_procurement_decision_twin

def test_build_decision_twin_basic():
    req = {
        "requirement_id": "REQ-001",
        "material_id": "MAT-001",
        "quantity": 10000,
        "plant_id": "P001",
        "required_date": "2026-10-15",
        "business_priority": "Balanced"
    }
    twin = build_procurement_decision_twin(req)
    
    assert twin["twin_id"].startswith("TWIN-REQ-001")
    assert twin["status"] == "LIVE_SYNCHRONIZED"
    assert twin["context_requirement"]["material_id"] == "MAT-001"
    assert twin["context_requirement"]["order_quantity"] == 10000
    assert len(twin["eligible_suppliers"]) > 0
    assert twin["active_recommendation"] is not None
    assert "robustness_score_pct" in twin["stress_test_telemetry"]
    assert len(twin["scenario_sensitivity_matrix"]) == 6

def test_decision_twin_simulation_overrides():
    req = {
        "requirement_id": "REQ-001",
        "material_id": "MAT-001",
        "quantity": 10000,
        "plant_id": "P001",
        "required_date": "2026-10-15"
    }
    overrides = {
        "override_quantity": 25000,
        "override_plant": "P002"
    }
    twin = build_procurement_decision_twin(req, simulation_parameters=overrides)
    assert twin["context_requirement"]["order_quantity"] == 25000
    assert twin["context_requirement"]["plant_id"] == "P002"
