"""
Mock Data Validation Script for SAP Supplier Decision Intelligence Platform.
Validates referential integrity, schema constraints, and data health across all 22 datasets.
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

REQUIRED_DATASETS = [
    "plants.json",
    "currency_information.json",
    "country_information.json",
    "materials.json",
    "suppliers.json",
    "contracts.json",
    "purchasing_info_records.json",
    "source_list.json",
    "quota_arrangements.json",
    "purchase_orders.json",
    "goods_receipts.json",
    "delivery_history.json",
    "quality_records.json",
    "invoices.json",
    "price_history.json",
    "risk_events.json",
    "supplier_performance.json",
    "purchase_requisitions.json",
    "rfqs.json",
    "supplier_quotations.json",
    "procurement_requirements.json",
    "scenario_definitions.json"
]

def load_dataset(filename: str):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def validate_all() -> Dict[str, Any]:
    report = {
        "status": "HEALTHY",
        "timestamp": datetime.now().isoformat(),
        "total_datasets": len(REQUIRED_DATASETS),
        "loaded_datasets": 0,
        "dataset_record_counts": {},
        "errors": [],
        "warnings": [],
        "checks_passed": 0
    }

    # 1. Existence Check
    data = {}
    for filename in REQUIRED_DATASETS:
        content = load_dataset(filename)
        if content is None:
            report["errors"].append(f"Missing mandatory dataset: {filename}")
        else:
            data[filename] = content
            report["loaded_datasets"] += 1
            report["dataset_record_counts"][filename] = len(content) if isinstance(content, list) else len(content.keys())
    
    if report["errors"]:
        report["status"] = "CRITICAL_MISSING_FILES"
        return report
    report["checks_passed"] += 1

    # 2. Extract Key Reference Sets
    supplier_ids = {s["supplier_id"] for s in data["suppliers.json"]}
    material_ids = {m["material_id"] for m in data["materials.json"]}
    plant_ids = {p["plant_id"] for p in data["plants.json"]}
    po_numbers = {po["po_number"] for po in data["purchase_orders.json"]}
    contract_ids = {c["contract_id"] for c in data["contracts.json"]}

    # Uniqueness checks
    def check_uniqueness(items: List[Dict], id_field: str, ds_name: str):
        seen = set()
        for idx, item in enumerate(items):
            val = item.get(id_field)
            if not val:
                report["errors"].append(f"{ds_name} item #{idx} missing ID field '{id_field}'")
            elif val in seen:
                report["errors"].append(f"Duplicate {id_field} '{val}' in {ds_name}")
            else:
                seen.add(val)

    check_uniqueness(data["suppliers.json"], "supplier_id", "suppliers.json")
    check_uniqueness(data["materials.json"], "material_id", "materials.json")
    check_uniqueness(data["plants.json"], "plant_id", "plants.json")
    check_uniqueness(data["contracts.json"], "contract_id", "contracts.json")
    check_uniqueness(data["purchase_orders.json"], "po_number", "purchase_orders.json")
    check_uniqueness(data["goods_receipts.json"], "gr_number", "goods_receipts.json")
    check_uniqueness(data["invoices.json"], "invoice_number", "invoices.json")
    report["checks_passed"] += 1

    # 3. Referential Integrity Checks
    # Purchase Orders
    for po in data["purchase_orders.json"]:
        if po["supplier_id"] not in supplier_ids:
            report["errors"].append(f"PO {po['po_number']} references non-existent supplier {po['supplier_id']}")
        if po["material_id"] not in material_ids:
            report["errors"].append(f"PO {po['po_number']} references non-existent material {po['material_id']}")
        if po["plant_id"] not in plant_ids:
            report["errors"].append(f"PO {po['po_number']} references non-existent plant {po['plant_id']}")
        if po["order_quantity"] <= 0:
            report["errors"].append(f"PO {po['po_number']} non-positive quantity: {po['order_quantity']}")
        if po["net_price_eur"] <= 0:
            report["errors"].append(f"PO {po['po_number']} non-positive price: {po['net_price_eur']}")
    report["checks_passed"] += 1

    # Goods Receipts
    for gr in data["goods_receipts.json"]:
        if gr["po_number"] not in po_numbers:
            report["errors"].append(f"GR {gr['gr_number']} references non-existent PO {gr['po_number']}")
        if gr["supplier_id"] not in supplier_ids:
            report["errors"].append(f"GR {gr['gr_number']} references non-existent supplier {gr['supplier_id']}")
        if gr["quantity_received"] < 0:
            report["errors"].append(f"GR {gr['gr_number']} negative quantity received")
    report["checks_passed"] += 1

    # Invoices
    for inv in data["invoices.json"]:
        if inv["po_number"] not in po_numbers:
            report["errors"].append(f"Invoice {inv['invoice_number']} references non-existent PO {inv['po_number']}")
        if inv["supplier_id"] not in supplier_ids:
            report["errors"].append(f"Invoice {inv['invoice_number']} references non-existent supplier {inv['supplier_id']}")
    report["checks_passed"] += 1

    # Contracts
    for ctr in data["contracts.json"]:
        if ctr["supplier_id"] not in supplier_ids:
            report["errors"].append(f"Contract {ctr['contract_id']} references non-existent supplier {ctr['supplier_id']}")
        if ctr["material_id"] not in material_ids:
            report["errors"].append(f"Contract {ctr['contract_id']} references non-existent material {ctr['material_id']}")
    report["checks_passed"] += 1

    # Purchasing Info Records
    for pir in data["purchasing_info_records.json"]:
        if pir["supplier_id"] not in supplier_ids:
            report["errors"].append(f"PIR {pir['info_record_id']} references non-existent supplier {pir['supplier_id']}")
        if pir["material_id"] not in material_ids:
            report["errors"].append(f"PIR {pir['info_record_id']} references non-existent material {pir['material_id']}")
        if pir["plant_id"] not in plant_ids:
            report["errors"].append(f"PIR {pir['info_record_id']} references non-existent plant {pir['plant_id']}")
    report["checks_passed"] += 1

    # Supplier Quotations
    for q in data["supplier_quotations.json"]:
        if q["supplier_id"] not in supplier_ids:
            report["errors"].append(f"Quotation {q['quotation_id']} references non-existent supplier {q['supplier_id']}")
        if q["material_id"] not in material_ids:
            report["errors"].append(f"Quotation {q['quotation_id']} references non-existent material {q['material_id']}")
        if q["quoted_unit_price_eur"] <= 0:
            report["errors"].append(f"Quotation {q['quotation_id']} non-positive unit price")
    report["checks_passed"] += 1

    # Requirements
    for req in data["procurement_requirements.json"]:
        if req["material_id"] not in material_ids:
            report["errors"].append(f"Requirement {req['requirement_id']} references non-existent material {req['material_id']}")
        if req["plant_id"] not in plant_ids:
            report["errors"].append(f"Requirement {req['requirement_id']} references non-existent plant {req['plant_id']}")
        if req["quantity"] <= 0:
            report["errors"].append(f"Requirement {req['requirement_id']} non-positive quantity")
    report["checks_passed"] += 1

    # Scenarios
    req_ids = {r["requirement_id"] for r in data["procurement_requirements.json"]}
    for scen in data["scenario_definitions.json"]:
        if scen["requirement_id"] not in req_ids:
            report["errors"].append(f"Scenario {scen['scenario_id']} references non-existent requirement {scen['requirement_id']}")
        # Weights check
        total_w = sum(scen["weights"].values())
        if abs(total_w - 1.0) > 0.01:
            report["warnings"].append(f"Scenario {scen['scenario_id']} weights sum to {total_w:.2f} instead of 1.0")
    report["checks_passed"] += 1

    if report["errors"]:
        report["status"] = "FAILED"
    elif report["warnings"]:
        report["status"] = "WARNINGS"
    else:
        report["status"] = "HEALTHY"

    return report

if __name__ == "__main__":
    rep = validate_all()
    print("=" * 60)
    print(f"MOCK DATA HEALTH STATUS: {rep['status']}")
    print(f"Checked Datasets: {rep['loaded_datasets']} / {rep['total_datasets']}")
    print(f"Validation Checks Passed: {rep['checks_passed']}")
    print(f"Errors Found: {len(rep['errors'])}")
    print(f"Warnings Found: {len(rep['warnings'])}")
    print("=" * 60)
    for k, v in rep["dataset_record_counts"].items():
        print(f"  • {k:<30}: {v:>5} records")
    print("-" * 60)
    if rep["errors"]:
        print("ERRORS:")
        for e in rep["errors"]:
            print(f"  [X] {e}")
        sys.exit(1)
    if rep["warnings"]:
        print("WARNINGS:")
        for w in rep["warnings"]:
            print(f"  [!] {w}")
    print("All referential integrity checks and schema constraints passed successfully!\n")
    sys.exit(0)
