"""
Tests for AI Assistant Service.
Verifies deterministic grounding across all 12 prompt query archetypes,
context-aware reasoning, "what changed" analysis, and natural-language to filter parsing.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import pytest
from app.core.assistant_service import answer_procurement_question

def test_assistant_compare_suppliers():
    res = answer_procurement_question("Compare SUP-002 and SUP-007")
    assert "Analytical Comparison between" in res["answer"]
    assert "SUP-002" in res["answer"]
    assert "SUP-007" in res["answer"]
    assert len(res["evidence_sources"]) > 0

def test_assistant_best_delivery():
    res = answer_procurement_question("Which supplier has the best delivery performance?")
    assert "Top suppliers ranked by verified Goods Receipt" in res["answer"]
    assert "OTD" in res["answer"]

def test_assistant_single_source_risk():
    res = answer_procurement_question("Which materials have single-source risk?")
    assert "single-source dependency" in res["answer"].lower()
    assert "plant" in res["answer"].lower()

def test_assistant_price_increases():
    res = answer_procurement_question("Where has procurement price increased significantly?")
    assert "price" in res["answer"].lower()
    assert "historical" in res["answer"].lower() or "spike" in res["answer"].lower()

def test_assistant_contracts_expiring():
    res = answer_procurement_question("Which contracts are expiring soon?")
    assert "expir" in res["answer"].lower()
    assert "contract" in res["answer"].lower()

def test_assistant_performance_deteriorated():
    res = answer_procurement_question("Show me suppliers whose performance deteriorated recently.")
    assert "performance" in res["answer"].lower()
    assert "deteriorat" in res["answer"].lower()

def test_assistant_high_spend_declining():
    res = answer_procurement_question("Which suppliers have high spend but declining performance?")
    assert "spend" in res["answer"].lower()
    assert "performance" in res["answer"].lower()

def test_assistant_active_contract_for_material():
    res = answer_procurement_question("Which suppliers have an active contract for M-003?")
    assert "contract" in res["answer"].lower()

def test_assistant_why_preferred():
    res = answer_procurement_question("Why is SUP-004 preferred?")
    assert "SUP-004" in res["answer"]
    assert "Effective Landed Cost" in res["answer"]

def test_assistant_why_not_preferred():
    res = answer_procurement_question("Why is SUP-002 not preferred?")
    assert "SUP-002" in res["answer"]
    assert "penalized" in res["answer"].lower() or "substandard" in res["answer"].lower()

def test_assistant_delivery_weight_shift():
    res = answer_procurement_question("What happens if delivery becomes more important than price?")
    assert "Impact of shifting business priority" in res["answer"]
    assert "Delivery-Focused" in res["answer"]

def test_assistant_material_recommendation():
    res = answer_procurement_question("Which supplier should I consider for M-001?")
    assert "MAT-001" in res["answer"]
    assert "Effective Landed Cost" in res["answer"]

def test_assistant_what_changed():
    res = answer_procurement_question("What changed in procurement this month?")
    assert "Empirical Procurement Changes Detected" in res["answer"]
    assert "MAT-003" in res["answer"]
    assert "SUP-002" in res["answer"]

def test_assistant_split_allocation():
    res = answer_procurement_question("Can we split the requirement across multiple suppliers?")
    assert "Quota Share" in res["answer"] or "Quota Arrangement" in res["answer"]

def test_assistant_natural_language_to_filters():
    res = answer_procurement_question("Show suppliers for M-001 with OTIF above 90% and active contracts")
    assert "structured_filters" in res
    assert res["structured_filters"]["material_id"] == "MAT-001"
    assert res["structured_filters"]["min_otif_pct"] == 90.0
    assert len(res["matching_suppliers"]) > 0

def test_assistant_context_awareness():
    # Context-injected query without mentioning supplier explicitly
    ctx = {"supplier_id": "SUP-004", "material_id": "MAT-001"}
    res = answer_procurement_question("What are the main risks?", context=ctx)
    assert "SUP-004" in res["answer"] or "Nordisk Stål" in res["answer"]
