"""
Tests for Predefined Sourcing Scenarios.
Verifies all 14 procurement scenarios execute and produce valid recommendations.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.data_provider import get_data_provider
from app.core.decision_engine import calculate_decision_scores

def test_all_14_scenarios_execute():
    provider = get_data_provider()
    scenarios = provider.get_scenarios()
    assert len(scenarios) == 14

    for scen in scenarios:
        req_id = scen["requirement_id"]
        req = next((r for r in provider.get_requirements() if r["requirement_id"] == req_id), None)
        assert req is not None, f"Scenario {scen['scenario_id']} missing requirement {req_id}"

        res = calculate_decision_scores(req, custom_weights=scen["weights"])
        assert len(res["ranked_suppliers"]) > 0, f"Scenario {scen['scenario_id']} yielded no ranked suppliers"
        assert res["recommended_option"] is not None
        assert res["recommended_option"]["primary_supplier_id"] is not None
        assert res["recommended_option"]["decision_score"] > 0
