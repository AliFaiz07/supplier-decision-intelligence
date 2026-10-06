"""
Effective Procurement Cost Engine for SAP Supplier Decision Intelligence Platform.
Computes true landed costs incorporating synthetic logistics, customs/tariffs,
and contractual rebate structures. Clearly discloses all synthetic POC assumptions.
"""

from typing import Dict, Any, Optional
from app.core.data_provider import get_data_provider

def calculate_effective_procurement_cost(
    supplier_id: str,
    material_id: str,
    order_quantity: int = 1000
) -> Dict[str, Any]:
    provider = get_data_provider()
    supplier = provider.get_supplier_by_id(supplier_id)
    if not supplier:
        return {"effective_unit_cost_eur": 0.0, "total_cost_eur": 0.0}

    # 1. Fetch Quotation or Info Record Price
    quotes = provider.get_quotations(material_id=material_id)
    sup_quote = next((q for q in quotes if q.get("supplier_id") == supplier_id), None)
    
    if sup_quote:
        quoted_unit_price = sup_quote.get("quoted_unit_price_eur", 0.0)
        offered_lead_time = sup_quote.get("offered_lead_time_days", 14)
        synth_freight = sup_quote.get("synthetic_freight_eur", 0.0)
        synth_customs = sup_quote.get("synthetic_customs_eur", 0.0)
        contract_rebate = sup_quote.get("contractual_rebate_eur", 0.0)
    else:
        # Fallback to Purchasing Info Record (PIR)
        pirs = provider.get_puchase_info_records(material_id=material_id)
        sup_pir = next((p for p in pirs if p.get("supplier_id") == supplier_id), None)
        if sup_pir:
            quoted_unit_price = sup_pir.get("net_price_eur", 0.0)
            offered_lead_time = sup_pir.get("standard_lead_time_days", 14)
        else:
            quoted_unit_price = 210.0 # Benchmark fallback
            offered_lead_time = 14

        # Compute synthetic logistics and customs from country profile
        c_code = supplier.get("country", "DE")
        countries = provider.get_countries()
        country_info = next((c for c in countries if c.get("country_code") == c_code), {})
        freight_pct = country_info.get("freight_factor_pct", 2.0)
        customs_pct = country_info.get("synthetic_customs_pct", 0.0)

        synth_freight = round(quoted_unit_price * (freight_pct / 100.0), 2)
        synth_customs = round(quoted_unit_price * (customs_pct / 100.0), 2)

        # Check for active contract discount
        contracts = provider.get_contracts(supplier_id=supplier_id, material_id=material_id)
        active_ctr = next((c for c in contracts if c.get("status") in ["Active", "Expiring Soon"]), None)
        if active_ctr:
            discount_pct = active_ctr.get("agreed_discount_pct", 0.0)
            contract_rebate = -round(quoted_unit_price * (discount_pct / 100.0), 2)
        else:
            contract_rebate = 0.0

    effective_unit_cost = round(quoted_unit_price + synth_freight + synth_customs + contract_rebate, 2)
    total_effective_cost = round(effective_unit_cost * order_quantity, 2)

    return {
        "supplier_id": supplier_id,
        "material_id": material_id,
        "order_quantity": order_quantity,
        "quoted_unit_price_eur": quoted_unit_price,
        "synthetic_freight_eur": synth_freight,
        "synthetic_customs_tariff_eur": synth_customs,
        "contractual_rebate_eur": contract_rebate,
        "effective_unit_cost_eur": effective_unit_cost,
        "total_effective_cost_eur": total_effective_cost,
        "offered_lead_time_days": offered_lead_time,
        "disclosure_notes": "All freight, customs tariff, and contractual adjustments are illustrative synthetic POC values."
    }
