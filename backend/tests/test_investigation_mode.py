"""
Tests for AI Procurement Investigation Mode and Structured Natural Language Analytics.
Verifies structured investigation findings, primary/secondary drivers, and citation grounding.
"""

from app.core.assistant_service import investigate_procurement_issue, answer_procurement_question

def test_structured_investigation_mode():
    res = investigate_procurement_issue("Why did M-003 procurement cost increase?")
    assert res["status"] == "COMPLETED"
    assert res["target_material_id"] == "MAT-003"
    assert "structured_findings" in res
    assert "primary_driver" in res["structured_findings"]
    assert "secondary_driver" in res["structured_findings"]
    assert "operational_impact" in res["structured_findings"]
    assert "citations" in res["supporting_evidence"]
    assert len(res["supporting_evidence"]["citations"]) >= 3

def test_nl_analytics_queries():
    # OTIF above 90%
    r1 = answer_procurement_question("Show suppliers for M-001 with OTIF above 90%")
    assert "MAT-001" in r1["answer"]
    assert "structured_filters" in r1

    # Contracts expiring within 60 days
    r2 = answer_procurement_question("Which contracts expire within 60 days?")
    assert "CTR-" in r2["answer"] or "expire" in r2["answer"]

    # Proven wrong decisions
    r3 = answer_procurement_question("Which decisions were later proven wrong?")
    assert "DEC-" in r3["answer"]
    assert "Lesson" in r3["answer"]
