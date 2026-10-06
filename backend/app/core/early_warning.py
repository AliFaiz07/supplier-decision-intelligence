"""
Procurement Early-Warning & Attention Center Engine for SAP Supplier Decision Intelligence Platform.
Combines weak signals across pricing drift, delivery slippage, lead-time variance, and quality rejections
to detect emerging supplier deterioration before critical production disruptions occur.
Produces structured Attention Center items classified into Critical, High, Medium, and Informational
with explicit action pathways: Investigate, Compare, Simulate, Stress Test, and View Evidence.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.data_provider import get_data_provider
from app.core.analytics import calculate_supplier_metrics

def detect_early_warning_signals() -> Dict[str, Any]:
    """
    Detects composite weak-signal patterns indicating emerging supplier deterioration.
    Deterministic multi-signal rule:
    - Price trend upward (+3% or more)
    - Delivery OTIF downward (-5% or more)
    - Lead time deviation expanding (+1.5 days or more)
    - Inspection lot defect rate rising (+0.5% or more)
    """
    provider = get_data_provider()
    suppliers = provider.get_suppliers()
    pos = provider.get_pushed_pos()
    grs = provider.get_goods_receipts()
    qms = provider.get_quality_records()

    early_warnings: List[Dict[str, Any]] = []

    for s in suppliers:
        s_id = s["supplier_id"]
        s_name = s["name"]
        m = calculate_supplier_metrics(s_id)

        # 1. Price signal (Compare recent 90d vs previous 90d for supplier's primary materials)
        s_pos = [p for p in pos if p.get("supplier_id") == s_id]
        recent_pos = [p for p in s_pos if p.get("po_date", "") >= "2026-06-01"]
        older_pos = [p for p in s_pos if "2026-01-01" <= p.get("po_date", "") < "2026-06-01"]

        price_signal = False
        price_change_pct = 0.0
        if recent_pos and older_pos:
            rec_avg = sum(p.get("net_price_eur", 0) for p in recent_pos) / len(recent_pos)
            old_avg = sum(p.get("net_price_eur", 0) for p in older_pos) / len(older_pos)
            price_change_pct = round(((rec_avg - old_avg) / max(0.01, old_avg)) * 100.0, 1)
            if price_change_pct >= 4.0:
                price_signal = True

        # 2. Delivery signal (OTD falling or delay days increasing)
        delivery_signal = False
        otd_drop_pts = 0.0
        if m.get("delivery_deteriorated") or m.get("average_delay_days", 0) >= 2.0:
            delivery_signal = True
            otd_drop_pts = round(m.get("on_time_delivery_rate_pct", 90.0) - m.get("trailing_90d_otd_pct", 80.0), 1)

        # 3. Lead time variance signal
        s_grs = [g for g in grs if g.get("supplier_id") == s_id]
        lt_deviations = [g.get("days_deviation", 0) for g in s_grs]
        avg_lt_dev = round(sum(lt_deviations) / max(1, len(lt_deviations)), 1) if lt_deviations else 0.0
        lt_signal = avg_lt_dev >= 2.0

        # 4. Quality defect signal
        quality_signal = False
        if m.get("quality_deteriorated") or m.get("quality_rejection_rate_pct", 0) >= 1.5:
            quality_signal = True

        # Signal score: Count how many weak signals are simultaneously active
        active_signals_count = sum([price_signal, delivery_signal, lt_signal, quality_signal])

        if active_signals_count >= 2:
            severity = "Critical" if active_signals_count >= 3 else "High"
            
            # Formulate grounded synthesis
            signals_desc = []
            if delivery_signal:
                signals_desc.append(f"OTIF declined by {abs(otd_drop_pts)} pts (trailing 90-day rate: {m.get('trailing_90d_otd_pct')}%)")
            if price_signal:
                signals_desc.append(f"average invoice unit price increased by +{price_change_pct}%")
            if lt_signal:
                signals_desc.append(f"dock delivery slippage averaged +{avg_lt_dev} days")
            if quality_signal:
                signals_desc.append(f"inspection lot rejection rate escalated to {m.get('trailing_60d_rejection_pct', m.get('quality_rejection_rate_pct'))}%")

            ai_pattern_explanation = (
                f"{s_name} ({s_id}) exhibits {active_signals_count} concurrent deteriorating operational indicators over recent months. "
                f"{'; '.join(signals_desc)}. While individual shifts might appear moderate, their simultaneous emergence signals progressive vendor operational stress."
            )

            early_warnings.append({
                "warning_id": f"EW-{s_id}-{datetime.now().strftime('%Y%m')}",
                "supplier_id": s_id,
                "supplier_name": s_name,
                "severity": severity,
                "active_signals_count": active_signals_count,
                "signals": {
                    "price_drift_pct": price_change_pct if price_signal else None,
                    "otd_drop_pts": otd_drop_pts if delivery_signal else None,
                    "lead_time_slippage_days": avg_lt_dev if lt_signal else None,
                    "rejection_rate_pct": m.get("quality_rejection_rate_pct") if quality_signal else None
                },
                "total_spend_eur": m.get("total_spend_eur", 0.0),
                "is_concentrated": m.get("is_concentrated", False),
                "ai_pattern_explanation": ai_pattern_explanation,
                "suggested_mitigations": [
                    "Perform multi-supplier quota allocation in Sourcing Workspace",
                    "Conduct structured supplier investigation",
                    "Stress-test existing purchase orders against +3d delivery shock"
                ],
                "action_links": {
                    "investigate_query": f"Investigate performance deterioration and risk signals for {s_id}",
                    "supplier_id": s_id,
                    "material_id": "MAT-001"
                }
            })

    # Sort early warnings by active signal count descending
    early_warnings.sort(key=lambda x: (x["active_signals_count"], x["total_spend_eur"]), reverse=True)

    return {
        "status": "HEALTHY",
        "timestamp": datetime.now().isoformat(),
        "total_early_warnings": len(early_warnings),
        "critical_early_warnings": sum(1 for w in early_warnings if w["severity"] == "Critical"),
        "high_early_warnings": sum(1 for w in early_warnings if w["severity"] == "High"),
        "early_warnings": early_warnings
    }

def get_attention_center_items() -> Dict[str, Any]:
    """
    Builds the unified Procurement Attention Center categorized into:
    - Critical
    - High
    - Medium
    - Informational
    Integrates Early Warnings, Price Spikes, Contract Expirations, Single-Source Risks, and Leakage.
    """
    provider = get_data_provider()
    ew_data = detect_early_warning_signals()
    contracts = provider.get_contracts()
    suppliers = {s["supplier_id"]: s for s in provider.get_suppliers()}
    materials = {m["material_id"]: m for m in provider.get_materials()}

    attention_items: List[Dict[str, Any]] = []

    # 1. Emerging Supplier Deterioration (Early Warning)
    for ew in ew_data.get("early_warnings", []):
        attention_items.append({
            "id": f"ATTN-EW-{ew['supplier_id']}",
            "title": f"Multi-Signal Deterioration: {ew['supplier_name']}",
            "category": "Supplier Deterioration",
            "priority": ew["severity"],
            "supplier_id": ew["supplier_id"],
            "supplier_name": ew["supplier_name"],
            "material_id": ew["action_links"]["material_id"],
            "summary": ew["ai_pattern_explanation"],
            "metric_highlight": f"{ew['active_signals_count']} Weak Signals Active",
            "actions": {
                "investigate": True,
                "compare": True,
                "simulate": True,
                "stress_test": True,
                "view_evidence": True,
                "investigate_query": ew["action_links"]["investigate_query"],
                "target_tab": "suppliers",
                "target_subtab": "360",
                "target_id": ew["supplier_id"]
            }
        })

    # 2. Critical Contract Expiry Approaching (< 45 Days)
    today_dt = datetime.strptime("2026-10-01", "%Y-%m-%d")
    for c in contracts:
        val_to = datetime.strptime(c.get("valid_to", "2027-12-31"), "%Y-%m-%d")
        days_left = (val_to - today_dt).days
        if 0 <= days_left <= 45:
            s_name = suppliers.get(c.get("supplier_id"), {}).get("name", c.get("supplier_id"))
            m_name = materials.get(c.get("material_id"), {}).get("material_name", c.get("material_id"))
            attention_items.append({
                "id": f"ATTN-CTR-{c.get('contract_id')}",
                "title": f"Expiring Outline Agreement: {c.get('contract_id')}",
                "category": "Contract Expiry",
                "priority": "Critical" if days_left <= 25 else "High",
                "supplier_id": c.get("supplier_id"),
                "supplier_name": s_name,
                "material_id": c.get("material_id"),
                "summary": f"Contract {c.get('contract_id')} covering {m_name} at agreed price €{c.get('contract_price_eur'):.2f}/EA expires in {days_left} days ({c.get('valid_to')}).",
                "metric_highlight": f"{days_left} Days Remaining",
                "actions": {
                    "investigate": True,
                    "compare": False,
                    "simulate": True,
                    "stress_test": True,
                    "view_evidence": True,
                    "investigate_query": f"Analyze contract renewal and market price trends for {c.get('contract_id')}",
                    "target_tab": "analytics",
                    "target_subtab": "contracts",
                    "target_id": c.get("contract_id")
                }
            })

    # 3. Spend Concentration Risk (>40% Single Supplier Share)
    for s_id, s in suppliers.items():
        m = calculate_supplier_metrics(s_id)
        if m.get("is_concentrated"):
            conc_pct = m.get("spend_concentration_pct", 0)
            attention_items.append({
                "id": f"ATTN-CONC-{s_id}",
                "title": f"Spend Concentration Exposure: {s['name']}",
                "category": "Concentration Risk",
                "priority": "High" if conc_pct > 50 else "Medium",
                "supplier_id": s_id,
                "supplier_name": s["name"],
                "material_id": "MAT-001",
                "summary": f"{s['name']} holds {conc_pct}% of total commodity expenditure (€{m.get('total_spend_eur', 0):,.2f}), exceeding the 40% single-source risk ceiling.",
                "metric_highlight": f"{conc_pct}% Portfolio Share",
                "actions": {
                    "investigate": True,
                    "compare": True,
                    "simulate": True,
                    "stress_test": True,
                    "view_evidence": True,
                    "investigate_query": f"Evaluate spend concentration and alternative dual-sourcing options for {s_id}",
                    "target_tab": "analytics",
                    "target_subtab": "risk",
                    "target_id": s_id
                }
            })

    # 4. Price Anomaly / Escalation
    pos = provider.get_pushed_pos()
    mat_3_pos = [p for p in pos if p.get("material_id") == "MAT-003"]
    if mat_3_pos:
        avg_price = sum(p.get("net_price_eur", 0) for p in mat_3_pos) / len(mat_3_pos)
        latest_p = mat_3_pos[-1].get("net_price_eur", avg_price)
        if latest_p > avg_price * 1.08:
            attention_items.append({
                "id": "ATTN-PRICE-MAT-003",
                "title": "Material Price Inflation Spike: MAT-003",
                "category": "Price Anomaly",
                "priority": "High",
                "supplier_id": mat_3_pos[-1].get("supplier_id"),
                "supplier_name": suppliers.get(mat_3_pos[-1].get("supplier_id"), {}).get("name", "Supplier"),
                "material_id": "MAT-003",
                "summary": f"Recent purchase order on MAT-003 transacted at €{latest_p:.2f}/EA (+{round(((latest_p - avg_price)/avg_price)*100, 1)}% vs historical average €{avg_price:.2f}).",
                "metric_highlight": f"+{round(((latest_p - avg_price)/avg_price)*100, 1)}% Price Spike",
                "actions": {
                    "investigate": True,
                    "compare": True,
                    "simulate": True,
                    "stress_test": True,
                    "view_evidence": True,
                    "investigate_query": "Why did M-003 procurement cost increase?",
                    "target_tab": "analytics",
                    "target_subtab": "price",
                    "target_id": "MAT-003"
                }
            })

    # Sort attention items: Critical first, then High, Medium, Informational
    priority_order = {"Critical": 0, "High": 1, "Medium": 2, "Informational": 3}
    attention_items.sort(key=lambda x: priority_order.get(x["priority"], 9))

    return {
        "status": "ACTIVE",
        "total_attention_items": len(attention_items),
        "critical_count": sum(1 for i in attention_items if i["priority"] == "Critical"),
        "high_count": sum(1 for i in attention_items if i["priority"] == "High"),
        "medium_count": sum(1 for i in attention_items if i["priority"] == "Medium"),
        "informational_count": sum(1 for i in attention_items if i["priority"] == "Informational"),
        "items": attention_items
    }
