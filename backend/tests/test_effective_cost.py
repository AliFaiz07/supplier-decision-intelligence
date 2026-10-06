"""
Tests for Effective Procurement Cost Engine.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.effective_cost import calculate_effective_procurement_cost

def test_effective_cost_with_freight_and_customs():
    # SUP-011 is in Taiwan (TW) - non-EU
    c11 = calculate_effective_procurement_cost("SUP-011", "MAT-001", order_quantity=1000)
    assert c11["quoted_unit_price_eur"] > 0
    assert c11["synthetic_freight_eur"] > 0
    assert c11["synthetic_customs_tariff_eur"] > 0
    # Landed cost must exceed quoted price
    assert c11["effective_unit_cost_eur"] > c11["quoted_unit_price_eur"]

def test_contract_rebate_reduction():
    # SUP-006 has active contract with rebate
    c6 = calculate_effective_procurement_cost("SUP-006", "MAT-001", order_quantity=1000)
    assert c6["contractual_rebate_eur"] < 0 # negative adjustment = savings
