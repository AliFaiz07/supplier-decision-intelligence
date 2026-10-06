"""
Tests for Extended Analytics Engine, Sensitivity Analysis, and Intelligence Domains.
"""

from app.core.analytics import (
    get_spend_analytics,
    get_supplier_performance_analytics,
    get_price_intelligence,
    get_delivery_intelligence,
    get_quality_intelligence,
    get_contract_intelligence,
    get_risk_intelligence,
    get_material_intelligence,
    get_plant_intelligence
)
from app.core.decision_engine import calculate_decision_scores
from app.core.data_provider import get_data_provider

def test_spend_analytics():
    spend = get_spend_analytics()
    assert spend["summary"]["total_spend_eur"] > 0
    assert len(spend["spend_by_supplier"]) > 0
    assert len(spend["spend_by_material_category"]) > 0
    assert len(spend["spend_trend"]) > 0
    assert len(spend["spend_by_plant"]) > 0

def test_supplier_performance_analytics():
    perf = get_supplier_performance_analytics()
    assert len(perf["performance_matrix"]) > 0
    assert len(perf["supplier_rankings"]) > 0
    assert len(perf["supplier_benchmarks"]) > 0

def test_price_intelligence():
    prices = get_price_intelligence()
    assert len(prices["materials_summary"]) > 0
    assert prices["price_spread"]["min_price_eur"] > 0
    assert len(prices["supplier_comparison_chart"]) > 0

def test_delivery_intelligence():
    deliv = get_delivery_intelligence()
    assert 0 <= deliv["kpis"]["otif_pct"] <= 100
    assert len(deliv["delivery_by_supplier"]) > 0
    assert len(deliv["lead_time_distribution"]) > 0

def test_quality_intelligence():
    qual = get_quality_intelligence()
    assert qual["kpis"]["total_inspected_quantity"] if "total_inspected_quantity" in qual["kpis"] else True
    assert len(qual["quality_by_supplier"]) > 0
    assert len(qual["defect_categories"]) > 0

def test_contract_intelligence():
    contracts = get_contract_intelligence()
    assert contracts["kpis"]["active_contracts_count"] > 0
    assert len(contracts["contract_expiry_timeline"]) > 0
    assert len(contracts["contract_coverage_by_supplier"]) > 0

def test_risk_intelligence():
    risk = get_risk_intelligence()
    assert len(risk["supplier_risk_matrix"]) > 0
    assert risk["concentration_shares"]["top_1_share_pct"] > 0
    assert len(risk["material_single_source_exposure"]) > 0

def test_decision_sensitivity_and_concentration():
    provider = get_data_provider()
    req = provider.get_requirements()[0]
    res = calculate_decision_scores(req)
    
    assert "sensitivity_analysis" in res
    assert "projected_concentration" in res
    assert res["projected_concentration"]["projected_concentration_pct"] > 0
