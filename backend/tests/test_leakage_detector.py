"""
Tests for Procurement Leakage & Hidden Cost Detector.
Verifies identification of contract discrepancies, maverick spend, defect losses,
and potential excess spend quantification with POC assumption tags.
"""

from app.core.leakage_detector import detect_procurement_leakage

def test_detect_procurement_leakage():
    res = detect_procurement_leakage()
    
    assert res["status"] == "ANALYZED"
    assert res["total_leakage_incidents"] > 0
    assert res["total_excess_spend_eur"] > 0.0
    assert len(res["leakage_incidents"]) > 0
    
    first = res["leakage_incidents"][0]
    assert "leakage_id" in first
    assert "excess_spend_eur" in first
    assert "root_cause" in first
    assert "recommended_action" in first
    assert "assumption_tag" in first
    assert "POC Assumption" in first["assumption_tag"]

def test_leakage_material_summary():
    res = detect_procurement_leakage()
    assert len(res["material_leakage_summary"]) > 0
    mat_summary = res["material_leakage_summary"][0]
    assert "material_id" in mat_summary
    assert "total_leakage_eur" in mat_summary
