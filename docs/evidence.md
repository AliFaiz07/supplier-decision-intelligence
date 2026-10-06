# Decision Evidence Graph & Audit Trace Architecture

## 1. Overview & Regulatory Rationale

Enterprise procurement decisions must satisfy rigorous audit standards, SOX compliance, ISO 9001 quality audits, and internal procurement governance. Black-box AI recommendations that suggest awarding multi-million euro purchase orders without empirical proof are unviable in enterprise environments.

The **Decision Evidence Graph** provides full transparency:
- Every recommendation is decomposed into a hierarchical decision tree.
- Every node links directly to verifiable SAP S/4HANA database tables and CDS views.
- Clicking any node opens an **Audit Card** revealing:
  1. Primary metric value.
  2. Verified historical period analyzed.
  3. Total records analyzed.
  4. Exact deterministic calculation formula.
  5. Underlying SAP table and CDS view binding.
  6. Sample transactional records from the database.

---

## 2. Decision Tree Hierarchy

```
                            RECOMMENDATION NODE
                  [SUP-006: Precision Bearings GmbH]
                  Composite Decision Score: 84.2 / 100
                                    │
    ┌─────────────────┬─────────────┴───┬─────────────────┬─────────────────┐
    ▼                 ▼                 ▼                 ▼                 ▼
EFFECTIVE COST    DELIVERY OTD       QUALITY PPM      OUTLINE CONTRACT    SUPPLY RISK
 (€78.50/EA)      (92.5% OTD)        (80 PPM)         (Active CTR-1002)   (15% Exposure)
    │                 │                 │                 │                 │
 ┌──┴──┐           ┌──┴──┐           ┌──┴──┐           ┌──┴──┐           ┌──┴──┐
Quoted Freight    On-Time Dock      Inspected Defect   Agreed Valid      Active Single
Price  Surcharge   GRs    Delay     Lots      PPM      Price  Period     Flags  Source %
```

---

## 3. SAP Data Grounding & Table Mapping

| Decision Node | Primary Metric | Deterministic Formula | SAP Table / Source | Target CDS View |
| :--- | :--- | :--- | :--- | :--- |
| **Root Recommendation** | Composite Score (0-100) | `FinalScore = sum(Score_i * Weight_i) * ConfidenceFactor` | Multi-Source Synthesis | `C_ProcurementDecisionTraceCDS` |
| **Commercial / Cost** | Effective Unit Cost (€) | `BasePrice + Freight + Tariff - Rebates` | `EKKO`, `EKPO`, `KONP` | `I_PurOrdItemPricingElementAPI01` |
| **Quoted Base Price** | Quoted Net Price (€) | Base quotation in Purchasing Info Record | `EINA`, `EINE` | `I_PurchasingInfoRecordTP` |
| **Historical Spend** | Total Spend Outlay (€) | `Sum(PO Net Values for Material)` | `EKPO` | `C_PurchaseOrderItemDEX` |
| **Delivery Reliability** | On-Time Delivery Rate (%) | `(OnTimeGoodsReceipts / TotalReceipts) * 100` | `MSEG`, `EKET` | `C_GoodsReceiptDeliveryPerf` |
| **Dock Delay Variance** | Average Delay (Days) | `Sum(max(0, ActualDate - ScheduledDate)) / DelayedReceipts` | `MSEG`, `EKET` | `I_Poscheduleline` |
| **Quality Performance** | Rejection Defect PPM | `(DefectiveQuantity / InspectedQuantity) * 10,000` | `QALS`, `QAVE` | `C_InspLotUsageDecisionDEX` |
| **Quality Notifications** | Inspection Lot UD Count | Number of Type 01 inspection lots with Usage Decision 'R' | `QMEL`, `QALS` | `I_QualityNotificationAPI01` |
| **Outline Contract** | Contract Tenor & Pricing | Active outline agreement with validity > required date | `EKKO (BSTYP=K)` | `C_PurchaseContractDEX` |
| **Supply Chain Risk** | Active Signals Count | Multi-signal threat index (geopolitical, concentration) | Internal Risk Store | `C_SupplierRiskSignalCDS` |

---

## 4. POC Assumption Disclosures

To ensure transparency, synthetic attributes are explicitly marked with an audit badge:
- **Synthetic Freight**: Calculated via distance-weighted matrix between supplier country and receiving plant. Tagged: `POC Assumption`.
- **Synthetic Customs Tariffs**: Derived from the EU Common Customs Tariff schedule by country. Tagged: `POC Assumption`.
- **Scrap Defect Cost Multiplier**: Estimated at 15x base unit cost per defective piece. Tagged: `POC Assumption`.
