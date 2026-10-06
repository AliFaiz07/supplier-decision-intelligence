"""
Evidence Builder for SAP Supplier Decision Intelligence Platform.
Extracts factual records and audit logs supporting decision scores and recommendations.
"""

from typing import Dict, Any, List
from app.core.data_provider import get_data_provider

def build_supplier_evidence_package(supplier_id: str, material_id: str) -> Dict[str, Any]:
    provider = get_data_provider()
    
    pos = provider.get_pushed_pos(supplier_id=supplier_id, material_id=material_id)
    grs = provider.get_goods_receipts(supplier_id=supplier_id, material_id=material_id)
    qms = provider.get_quality_records(supplier_id=supplier_id, material_id=material_id)
    contracts = provider.get_contracts(supplier_id=supplier_id, material_id=material_id)
    quotes = provider.get_quotations(material_id=material_id)
    sup_quote = next((q for q in quotes if q.get("supplier_id") == supplier_id), None)
    risks = provider.get_risk_events(supplier_id=supplier_id)

    # 1. Purchase Orders Evidence
    po_evidence = {
        "source": "SAP Purchase Orders (EKKO/EKPO)",
        "period": "Oct 2024 to Sep 2026",
        "records_analyzed": len(pos),
        "total_spend_eur": sum(p.get("total_net_value_eur", 0.0) for p in pos),
        "sample_records": [
            {
                "po_number": p["po_number"],
                "order_date": p["order_date"],
                "quantity": p["order_quantity"],
                "net_price_eur": p["net_price_eur"],
                "status": p["status"]
            }
            for p in pos[-4:]
        ]
    }

    # 2. Goods Receipts Evidence
    on_time_grs = sum(1 for g in grs if g.get("on_time", False))
    delays = [g.get("days_deviation", 0) for g in grs if g.get("days_deviation", 0) > 0]
    gr_evidence = {
        "source": "SAP Goods Receipts (MSEG/MKPF)",
        "records_analyzed": len(grs),
        "on_time_deliveries": on_time_grs,
        "on_time_delivery_rate_pct": round((on_time_grs / max(1, len(grs))) * 100.0, 1),
        "average_delay_days": round(sum(delays) / max(1, len(delays)), 1) if delays else 0.0,
        "sample_deliveries": [
            {
                "gr_number": g["gr_number"],
                "po_number": g["po_number"],
                "actual_date": g["actual_delivery_date"],
                "deviation_days": g["days_deviation"],
                "on_time": g["on_time"]
            }
            for g in grs[-4:]
        ]
    }

    # 3. Quality Management Evidence
    total_inspected = sum(q.get("inspected_quantity", 0) for q in qms)
    total_defective = sum(q.get("defective_quantity", 0) for q in qms)
    qm_evidence = {
        "source": "SAP Quality Management (QALS/QMEL)",
        "inspection_lots_analyzed": len(qms),
        "total_inspected_quantity": total_inspected,
        "total_defective_quantity": total_defective,
        "rejection_rate_pct": round((total_defective / max(1, total_inspected)) * 100.0, 2),
        "ppm": int((total_defective / max(1, total_inspected)) * 1_000_000) if total_inspected > 0 else 0,
        "sample_inspection_lots": [
            {
                "lot": q["inspection_lot"],
                "date": q["inspection_date"],
                "inspected": q["inspected_quantity"],
                "defects": q["defective_quantity"],
                "decision": q["usage_decision"],
                "defect_type": q.get("defect_type", "None")
            }
            for q in qms[-4:]
        ]
    }

    # 4. Contracts Evidence
    contract_evidence = {
        "source": "SAP Purchasing Outline Agreements (EKKO Type MK/WK)",
        "active_contracts": [
            {
                "contract_id": c["contract_id"],
                "contract_type": c["contract_type"],
                "valid_from": c["valid_from"],
                "valid_to": c["valid_to"],
                "contract_price_eur": c["contract_price_eur"],
                "agreed_discount_pct": c["agreed_discount_pct"],
                "target_value_eur": c["target_value_eur"],
                "status": c["status"]
            }
            for c in contracts
        ]
    }

    # 5. Quotation Evidence
    quote_evidence = {
        "source": "SAP Supplier Quotations (VBAK/Quotation)",
        "quotation_id": sup_quote.get("quotation_id") if sup_quote else "N/A (PIR Benchmark Used)",
        "quoted_price_eur": sup_quote.get("quoted_unit_price_eur") if sup_quote else None,
        "offered_lead_time_days": sup_quote.get("offered_lead_time_days") if sup_quote else 14,
        "valid_until": sup_quote.get("valid_until") if sup_quote else "N/A",
        "notes": sup_quote.get("notes") if sup_quote else "Historical standard baseline"
    }

    # 6. Risk Events Evidence
    active_risks = [r for r in risks if r.get("active")]
    risk_evidence = {
        "source": "Supplier Risk Monitoring & Event Log",
        "active_events_count": len(active_risks),
        "events": [
            {
                "event_id": r["event_id"],
                "title": r["title"],
                "severity": r["severity"],
                "impact_dimension": r["impact_dimension"],
                "date": r["date"]
            }
            for r in active_risks
        ]
    }

    return {
        "supplier_id": supplier_id,
        "material_id": material_id,
        "purchase_orders": po_evidence,
        "goods_receipts": gr_evidence,
        "quality_records": qm_evidence,
        "contracts": contract_evidence,
        "quotation": quote_evidence,
        "risk_signals": risk_evidence
    }
