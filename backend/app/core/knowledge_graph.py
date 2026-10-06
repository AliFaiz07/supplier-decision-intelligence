"""
Procurement Knowledge Graph Architecture for SAP Supplier Decision Intelligence Platform.
Constructs a canonical entity-relationship graph connecting:
Supplier, Material, Plant, PR, RFQ, Quotation, PO, GR, Invoice, Contract, Quality Record, Risk Event, Decision, Outcome.
Enables relationship-based procurement reasoning, deep contextual drill-downs, and audit tracing.
Designed as a provider-independent graph representation ready for future Neo4j/SAP Graph integration.
"""

from typing import Dict, Any, List, Optional
from app.core.data_provider import get_data_provider
from app.core.decision_history_manager import get_history_manager

def build_procurement_knowledge_graph(
    center_entity_type: Optional[str] = None,
    center_entity_id: Optional[str] = None,
    depth: int = 2
) -> Dict[str, Any]:
    """
    Extracts nodes and directed edges connecting procurement entities.
    If center_entity_id is supplied, focuses the subgraph around that entity.
    """
    provider = get_data_provider()
    history_mgr = get_history_manager()

    nodes: Dict[str, Dict[str, Any]] = {}
    edges: List[Dict[str, Any]] = []

    def add_node(node_id: str, label: str, entity_type: str, properties: Dict[str, Any]):
        if node_id not in nodes:
            nodes[node_id] = {
                "id": node_id,
                "label": label,
                "type": entity_type,
                "properties": properties
            }

    def add_edge(source_id: str, target_id: str, relationship: str, label: str):
        edges.append({
            "source": source_id,
            "target": target_id,
            "relationship": relationship,
            "label": label
        })

    # 1. Plants
    for p in provider.get_plants():
        p_id = p["plant_id"]
        add_node(p_id, f"Plant {p_id} ({p.get('plant_name', p_id)})", "Plant", {
            "location": p.get("location"),
            "company_code": p.get("company_code")
        })

    # 2. Materials
    for m in provider.get_materials():
        m_id = m["material_id"]
        add_node(m_id, f"{m_id}: {m.get('material_name', m_id)}", "Material", {
            "group": m.get("material_group"),
            "uom": m.get("base_uom")
        })

    # 3. Suppliers
    for s in provider.get_suppliers():
        s_id = s["supplier_id"]
        add_node(s_id, f"{s_id}: {s.get('name', s_id)}", "Supplier", {
            "country": s.get("country"),
            "risk_rating": s.get("risk_rating"),
            "tier": s.get("strategic_tier")
        })

    # 4. Contracts (PO references Contract, Contract relates to Supplier and Material)
    for c in provider.get_contracts():
        c_id = c["contract_id"]
        add_node(c_id, f"Contract {c_id}", "Contract", {
            "type": c.get("contract_type"),
            "price_eur": c.get("contract_price_eur"),
            "status": c.get("status"),
            "valid_to": c.get("valid_to")
        })
        if c.get("supplier_id") in nodes:
            add_edge(c["supplier_id"], c_id, "HOLDS_CONTRACT", "Holds Outline Agreement")
        if c.get("material_id") in nodes:
            add_edge(c_id, c["material_id"], "COVERS_MATERIAL", "Covers Material")

    # 5. Purchasing Info Records (Supplier supplies Material)
    for pir in provider.get_pirs():
        s_id = pir.get("supplier_id")
        m_id = pir.get("material_id")
        if s_id in nodes and m_id in nodes:
            add_edge(s_id, m_id, "SUPPLIES", f"Supplies (LT: {pir.get('planned_delivery_time_days', 14)}d)")

    # 6. Purchase Orders (Sample or recent subset to maintain graph responsiveness)
    pos = provider.get_pushed_pos()
    recent_pos = pos[-35:] # Most recent representative POs
    for po in recent_pos:
        po_id = po["po_number"]
        add_node(po_id, f"PO {po_id}", "PurchaseOrder", {
            "date": po.get("po_date"),
            "qty": po.get("order_quantity"),
            "net_price": po.get("net_price_eur"),
            "value_eur": po.get("total_net_value_eur")
        })
        s_id = po.get("supplier_id")
        m_id = po.get("material_id")
        p_id = po.get("plant_id")
        c_id = po.get("contract_number")

        if s_id in nodes:
            add_edge(s_id, po_id, "RECEIVES", "Receives PO")
        if m_id in nodes:
            add_edge(po_id, m_id, "ORDERS_MATERIAL", "Orders Material")
        if p_id in nodes:
            add_edge(po_id, p_id, "DESTINED_FOR", "Delivers to Plant")
        if c_id and c_id in nodes:
            add_edge(po_id, c_id, "REFERENCES_CONTRACT", "References Contract")

    # 7. Goods Receipts
    grs = provider.get_goods_receipts()
    po_set = set(nodes.keys())
    for gr in grs[-35:]:
        po_id = gr.get("po_number")
        if po_id in po_set:
            gr_id = gr["gr_number"]
            add_node(gr_id, f"GR {gr_id}", "GoodsReceipt", {
                "date": gr.get("actual_delivery_date"),
                "on_time": gr.get("on_time"),
                "deviation_days": gr.get("days_deviation")
            })
            add_edge(po_id, gr_id, "PRODUCES_RECEIPT", "Receipt Document")

    # 8. Invoices
    invoices = provider.get_invoices()
    for inv in invoices[-20:]:
        po_id = inv.get("po_number")
        if po_id in po_set:
            inv_id = inv["invoice_number"]
            add_node(inv_id, f"Invoice {inv_id}", "Invoice", {
                "amount_eur": inv.get("invoice_amount_eur"),
                "payment_status": inv.get("payment_status")
            })
            add_edge(po_id, inv_id, "INVOICED_BY", "Invoice Verification")

    # 9. Quality Inspection Lots
    qms = provider.get_quality_records()
    for qm in qms[-25:]:
        lot_id = qm["inspection_lot"]
        s_id = qm.get("supplier_id")
        m_id = qm.get("material_id")
        add_node(lot_id, f"Lot {lot_id} ({qm.get('usage_decision')})", "QualityRecord", {
            "defects": qm.get("defective_quantity"),
            "decision": qm.get("usage_decision"),
            "defect_type": qm.get("defect_type")
        })
        if s_id in nodes:
            add_edge(s_id, lot_id, "HAS_QUALITY_RECORD", "Inspected Lot")
        if m_id in nodes:
            add_edge(lot_id, m_id, "INSPECTION_OF", "Inspected Material")

    # 10. Risk Events
    for r in provider.get_risk_events():
        r_id = r["event_id"]
        s_id = r.get("supplier_id")
        add_node(r_id, f"Risk: {r.get('title')}", "RiskEvent", {
            "severity": r.get("severity"),
            "active": r.get("active")
        })
        if s_id in nodes:
            add_edge(s_id, r_id, "EXPOSED_TO_RISK", "Logged Risk Event")

    # 11. Decisions & Outcomes from Decision History
    decisions = history_mgr.get_all_decisions()
    for d in decisions[-10:]:
        d_id = d["decision_id"]
        rec_sup = d.get("recommended_supplier_id")
        m_id = d.get("material_id")
        add_node(d_id, f"Decision {d_id} ({d.get('scenario')})", "Decision", {
            "date": d.get("decision_date"),
            "score": d.get("decision_score"),
            "recommended_supplier": rec_sup
        })
        if rec_sup in nodes:
            add_edge(d_id, rec_sup, "RECOMMENDED", "Recommended Supplier")
        if m_id in nodes:
            add_edge(d_id, m_id, "FOR_MATERIAL", "Sourcing Decision")

        # Outcome link if evaluated
        if d.get("outcome"):
            out = d["outcome"]
            out_id = f"OUT-{d_id}"
            add_node(out_id, f"Outcome {d_id} ({out.get('outcome_status')})", "Outcome", {
                "actual_otif": out.get("actual_otif_pct"),
                "status": out.get("outcome_status"),
                "lesson": out.get("procurement_lesson")
            })
            add_edge(d_id, out_id, "PRODUCED_OUTCOME", "Post-Award Outcome")

    # If center entity specified, filter nodes to neighborhood
    if center_entity_id and center_entity_id in nodes:
        connected_ids = {center_entity_id}
        for edge in edges:
            if edge["source"] == center_entity_id:
                connected_ids.add(edge["target"])
            elif edge["target"] == center_entity_id:
                connected_ids.add(edge["source"])
        filtered_nodes = [n for n in nodes.values() if n["id"] in connected_ids]
        filtered_edges = [e for e in edges if e["source"] in connected_ids and e["target"] in connected_ids]
    else:
        filtered_nodes = list(nodes.values())
        filtered_edges = edges

    return {
        "status": "LOADED",
        "entity_types_catalog": [
            "Supplier", "Material", "Plant", "PurchaseOrder",
            "GoodsReceipt", "Invoice", "Contract", "QualityRecord",
            "RiskEvent", "Decision", "Outcome"
        ],
        "total_nodes": len(filtered_nodes),
        "total_edges": len(filtered_edges),
        "nodes": filtered_nodes,
        "edges": filtered_edges
    }
