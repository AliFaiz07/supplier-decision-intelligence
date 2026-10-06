"""
Tests for Procurement Analytics Engine.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.analytics import calculate_supplier_metrics, get_overview_dashboard_kpis

def test_supplier_metrics_calculation():
    # SUP-003 has stellar performance
    m3 = calculate_supplier_metrics("SUP-003", material_id="MAT-001")
    assert m3["supplier_id"] == "SUP-003"
    assert m3["on_time_delivery_rate_pct"] >= 95.0
    assert m3["quality_rejection_rate_pct"] <= 0.5
    assert m3["total_orders"] >= 10

    # SUP-002 has delivery issues
    m2 = calculate_supplier_metrics("SUP-002", material_id="MAT-001")
    assert m2["on_time_delivery_rate_pct"] < 90.0

def test_deterioration_detection():
    # SUP-009 deteriorates in trailing 90 days
    m9 = calculate_supplier_metrics("SUP-009", material_id="MAT-002")
    assert m9["delivery_deteriorated"] == True
    assert m9["trailing_90d_otd_pct"] < m9["on_time_delivery_rate_pct"]

def test_overview_kpis():
    kpis = get_overview_dashboard_kpis()
    assert kpis["active_suppliers_count"] >= 14
    assert kpis["open_requirements_count"] >= 5
    assert len(kpis["procurement_alerts"]) > 0
