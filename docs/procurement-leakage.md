# Procurement Leakage & Hidden Cost Detector

## 1. Executive Summary

Procurement spend leakage represents unbudgeted capital loss occurring between contractual negotiation and transactional fulfillment. In large manufacturing enterprises running SAP ERP, leakage typically ranges between 3% and 8% of total direct procurement spend.

The **Procurement Leakage Detector** continuously audits transactional records across the purchase-to-pay lifecycle to quantify and recover hidden costs.

---

## 2. Leakage Incident Typology

The engine scans the procurement data lake across 8 distinct leakage vectors:

```
+───────────────────────────────────┬───────────────────────────────────────────+
| Leakage Category                  | Detection Logic & Empirical Source        |
+───────────────────────────────────┼───────────────────────────────────────────+
| 1. Contract Price Discrepancy     | PO net price exceeds active Outline       |
|    (Price Leakage)                | Agreement price (EKKO vs KONP/A018).      |
+───────────────────────────────────┼───────────────────────────────────────────+
| 2. Maverick Purchasing            | PO issued to non-contract vendor when an  |
|    (Off-Contract Buying)          | active contract exists for that material. |
+───────────────────────────────────┼───────────────────────────────────────────+
| 3. Quotation Price Escalation     | Actual PO net price exceeds approved      |
|    (Unindexed Cost Inflation)     | RFQ Quotation price without change order. |
+───────────────────────────────────┼───────────────────────────────────────────+
| 4. Quantity Deviations            | Significant gap between PO quantity and   |
|    (Under/Over-Receipt Invoicing) | confirmed Goods Receipt quantity (MSEG).  |
+───────────────────────────────────┼───────────────────────────────────────────+
| 5. Expedited Delivery Surcharges  | Repeated express/air transit premiums     |
|    (Rush Freight Costs)           | incurred to prevent assembly starvation.  |
+───────────────────────────────────┼───────────────────────────────────────────+
| 6. Quality Defect Scrap Losses    | Scrap and rework costs incurred from      |
|    (Unrecovered Quality Costs)    | rejected QM inspection lots (QALS/QAVE).  |
+───────────────────────────────────┼───────────────────────────────────────────+
| 7. Unscheduled Spot Spikes        | Spot purchases >5% above 12-month rolling |
|    (Unbudgeted Spot Purchasing)   | material baseline without PIR indexing.   |
+───────────────────────────────────┼───────────────────────────────────────────+
| 8. Expired Contract Spend         | Orders placed against outline agreements  |
|    (Lapsed Validity Period)       | after contractual expiration date.        |
+───────────────────────────────────┼───────────────────────────────────────────+
```

---

## 3. Financial Quantification Formula

Total potential excess spend is calculated deterministically per incident:

$$\text{ExcessSpend} = (\text{ActualUnitPrice} - \text{EntitledPrice}) \times \text{POQuantity}$$

Where:
- $\text{EntitledPrice}$ is the lowest applicable agreed contract price, valid PIR price, or quotation price.
- In instances of quality scrap loss, $\text{ExcessSpend} = \text{DefectiveUnits} \times \text{UnitCost} \times \text{ScrapMultiplier}$ (Multiplier tagged as `POC Assumption`).
- In instances of expedited delivery, $\text{ExcessSpend} = \text{ExpeditedRatePremium} \times \text{POQuantity}$ (Tagged as `POC Assumption`).

---

## 4. Remediation Workflow

Every identified leakage incident generates:
1. **Root Cause Diagnostic**: Identifies why the variance occurred (e.g., buyer neglected outline agreement reference, or vendor updated price without notification).
2. **Recommended Action**: Provides explicit ERP correction steps (e.g., amend PO pricing condition, request vendor credit note, adjust MRP safety buffers).
3. **Direct Navigation**: Links directly into Supplier 360 and the Sourcing Workspace to evaluate alternate contract suppliers.
