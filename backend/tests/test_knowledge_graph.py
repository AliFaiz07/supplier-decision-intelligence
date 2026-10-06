"""
Tests for Procurement Knowledge Graph Engine.
Verifies canonical entity-relationship mapping across Suppliers, Materials, Contracts, POs, Decisions, and Outcomes.
"""

from app.core.knowledge_graph import build_procurement_knowledge_graph

def test_full_knowledge_graph():
    kg = build_procurement_knowledge_graph()
    assert kg["status"] == "LOADED"
    assert kg["total_nodes"] > 50
    assert kg["total_edges"] > 50
    assert "Supplier" in kg["entity_types_catalog"]
    assert "Material" in kg["entity_types_catalog"]
    assert "Decision" in kg["entity_types_catalog"]
    assert "Outcome" in kg["entity_types_catalog"]

def test_focused_knowledge_graph():
    kg = build_procurement_knowledge_graph(center_entity_id="SUP-006")
    assert kg["status"] == "LOADED"
    assert kg["total_nodes"] < 100
    node_ids = {n["id"] for n in kg["nodes"]}
    assert "SUP-006" in node_ids
