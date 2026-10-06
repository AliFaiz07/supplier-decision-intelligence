"""
Tests for Supplier Eligibility Engine.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.eligibility_engine import evaluate_all_suppliers_for_requirement, evaluate_supplier_eligibility
from app.core.data_provider import get_data_provider

def test_inactive_supplier_is_not_eligible():
    provider = get_data_provider()
    sup_15 = provider.get_supplier_by_id("SUP-015") # Rhone Polymeres (Inactive)
    res = evaluate_supplier_eligibility(
        supplier=sup_15,
        material_id="MAT-001",
        plant_id="P001",
        quantity=5000,
        required_date_str="2026-10-15"
    )
    assert res["eligibility_status"] == "NOT_ELIGIBLE"
    assert not res["is_eligible"]
    assert any("Inactive" in r for r in res["reasons"])

def test_active_capable_supplier_is_eligible():
    provider = get_data_provider()
    sup_1 = provider.get_supplier_by_id("SUP-001")
    res = evaluate_supplier_eligibility(
        supplier=sup_1,
        material_id="MAT-001",
        plant_id="P001",
        quantity=5000,
        required_date_str="2026-10-15"
    )
    assert res["eligibility_status"] == "ELIGIBLE"
    assert res["is_eligible"]

def test_capacity_exceeded_creates_conditional_eligibility():
    provider = get_data_provider()
    sup_5 = provider.get_supplier_by_id("SUP-005") # capacity 12,000
    res = evaluate_supplier_eligibility(
        supplier=sup_5,
        material_id="MAT-001",
        plant_id="P001",
        quantity=20000, # exceeds 12,000
        required_date_str="2026-10-15"
    )
    assert res["eligibility_status"] == "CONDITIONALLY_ELIGIBLE"
    assert any("capacity" in c.lower() for c in res["conditions"])
