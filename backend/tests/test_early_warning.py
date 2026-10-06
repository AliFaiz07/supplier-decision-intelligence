"""
Tests for Procurement Early Warning & Attention Center Engine.
Verifies multi-signal pattern combiner and categorized Attention Center items.
"""

from app.core.early_warning import detect_early_warning_signals, get_attention_center_items

def test_early_warning_detection():
    ew = detect_early_warning_signals()
    assert ew["status"] == "HEALTHY"
    assert "total_early_warnings" in ew
    assert isinstance(ew["early_warnings"], list)
    if ew["early_warnings"]:
        w = ew["early_warnings"][0]
        assert "supplier_id" in w
        assert "severity" in w
        assert "ai_pattern_explanation" in w
        assert w["active_signals_count"] >= 2

def test_attention_center_categories():
    attn = get_attention_center_items()
    assert attn["status"] == "ACTIVE"
    assert attn["total_attention_items"] > 0
    assert "critical_count" in attn
    assert "high_count" in attn
    
    for item in attn["items"]:
        assert item["priority"] in ["Critical", "High", "Medium", "Informational"]
        assert "actions" in item
        assert item["actions"]["investigate"] is True
