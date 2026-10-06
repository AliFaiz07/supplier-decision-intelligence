# Data Model & SAP Canonical Mapping | SAP Supplier Decision Intelligence Platform

## 1. Overview & Referential Integrity

The platform operates on **22 interconnected datasets** containing 1,800+ relational records spanning a 24-month horizon (October 2024 to September 2026). All records are deterministically generated with a fixed seed (42) and enforce complete foreign-key referential integrity:

```
+----------------+          +----------------+          +----------------+
|   Suppliers    |          |   Materials    |          |     Plants     |
| (16 Profiles)  |          | (10 Materials) |          |   (3 Plants)   |
+--------+-------+          +--------+-------+          +--------+-------+
         |                           |                           |
         +-------------+-------------+---------------------------+
                       |
         +-------------v-------------+
         | Purchasing Info Records   |
         | (27 PIR records)          |
         +-------------+-------------+
                       |
         +-------------v-------------+
         |      Purchase Orders      |
         | (265 Records, 24M History)|
         +-------------+-------------+
                       |
         +-------------+-------------+
         |                           |
+--------v-------+          +--------v-------+          +----------------+
| Goods Receipts |          | Quality Lots   |          |  Vendor Inv.   |
| (265 Records)  |          | (265 Records)  |          | (265 Records)  |
+----------------+          +----------------+          +----------------+
```

---

## 2. Dataset Catalog & SAP Canonical Mappings

| # | Dataset File | Records | Primary ID | SAP S/4HANA Equivalent Table / API | Purpose in Intelligence Engine |
|---|---|---|---|---|---|
| 1 | `plants.json` | 3 | `plant_id` | `T001W` / `API_PLANT` | Plant locations, currencies, storage locs |
| 2 | `currency_information.json` | 6 | `currency` | `TCURR` / Exchange Rates | Multi-currency conversions to EUR base |
| 3 | `country_information.json` | 12 | `country_code` | `T005` / Country Master | Synthetic freight and customs duty factors |
| 4 | `materials.json` | 10 | `material_id` | `MARA` / `MARC` / `API_PRODUCT` | Material master, criticality, PPM tolerance |
| 5 | `suppliers.json` | 16 | `supplier_id` | `BUT000` / `LFA1` / `API_BUSINESS_PARTNER` | Vendor master, risk ratings, capacities |
| 6 | `contracts.json` | 5 | `contract_id` | `EKKO` (Type WK/MK) / `API_PURCHASING_CONTRACT` | Outline agreements, volume discounts |
| 7 | `purchasing_info_records.json` | 27 | `info_record_id` | `EINA` / `EINE` / `API_PURCHASING_INFORECORD` | Planned delivery time, standard price |
| 8 | `source_list.json` | 27 | `source_list_id` | `EORD` / `API_SOURCELIST` | Fixed source and blocked vendor flags |
| 9 | `quota_arrangements.json` | 2 | `quota_id` | `EQUK` / `EQUP` | Multi-sourcing allocation quotas |
| 10 | `purchase_orders.json` | 265 | `po_number` | `EKKO` / `EKPO` / `API_PURCHASEORDER_PROCESS` | Historical spend, quantity, order dates |
| 11 | `goods_receipts.json` | 265 | `gr_number` | `MSEG` / `MKPF` (Mvt 101) | Delivery deviations, actual OTD % |
| 12 | `delivery_history.json` | 265 | `delivery_id` | Delivery Log / LE-SHP | Logistics delay logs and root causes |
| 13 | `quality_records.json` | 265 | `inspection_lot` | `QALS` / `QMEL` / QM APIs | Inspection lots, defects, PPM, usage |
| 14 | `invoices.json` | 265 | `invoice_number` | `RBKP` / `RSEG` / `API_SUPPLIERINVOICE_PROCESS` | 3-way matching and price variances |
| 15 | `price_history.json` | 648 | Compound | Monthly Pricing Log | 24-month price distribution and volatility |
| 16 | `risk_events.json` | 9 | `event_id` | Supplier Risk Signal Repository | Geopolitical, credit, and ESG risk events |
| 17 | `supplier_performance.json` | 16 | `supplier_id` | SAP Supplier Evaluation Scorecard | Trailing 12-month composite scorecards |
| 18 | `purchase_requisitions.json` | 5 | `pr_number` | `EBAN` / `API_PURCHASEREQUISITION_PROCESS` | Open procurement requirements |
| 19 | `rfqs.json` | 2 | `rfq_number` | `EKKO` (Type AN) | Formal request for quotations |
| 20 | `supplier_quotations.json` | 15 | `quotation_id` | `VBAK` (Supplier Quotes) | Active quotes with lead time & freight |
| 21 | `procurement_requirements.json`| 14 | `requirement_id`| Sourcing Requirement Model | 14 requirement profiles matching scenarios |
| 22 | `scenario_definitions.json` | 14 | `scenario_id` | Scenario Engine Configuration | Multi-criteria weights and trade-offs |
| 23 | `decision_audit_history.json` | Dynamic | `decision_id` | S/4HANA Sourcing Audit Log & PO Memory | Expected vs actual post-award telemetry |


---

## 3. Data Integrity Guarantees

Startup validation (`validate_mock_data.py`) validates:
1. Complete existence of all 22 JSON files.
2. Unique identifier keys across suppliers, materials, contracts, POs, GRs, invoices, and PIRs.
3. Foreign key referential integrity (no PO references an unlisted supplier or material).
4. Physical constraints (positive quantities, non-negative prices, valid ISO-8601 timestamps).
