# Procurement Memory & Closed-Loop Learning

## 1. Overview & Problem Definition

Traditional enterprise procurement workflows end at purchase order creation. Once an award is finalized, the rationale and expected performance metrics fade into static meeting notes or buried email threads. When actual deliveries arrive late, off-spec, or with invoice variances, there is rarely a systematic mechanism feeding this empirical evidence back into future sourcing decisions.

**Procurement Memory** establishes a closed-loop feedback architecture:

```text
Sourcing Award
(Snapshot Expected Metrics)
        │
        ▼
SAP S/4HANA PO Execution & Invoicing
        │
        ▼
Observed Telemetry Capture
(Goods Receipts, QM Inspection Lots, Invoice Postings)
        │
        ▼
Variance Analysis Engine
(OTIF Delta, Effective Cost Delta, Defect PPM Delta)
        │
        ▼
Procurement Memory Ledger & Empirical Lessons Learned
        │
        ▼
Subsequent Sourcing Decisions
(Dynamic Score Adjustments & Grounded AI Explanations)
```

---

## 2. Expected vs. Actual Telemetry Tracking

When a sourcing decision is committed, the engine logs an immutable **Award Baseline**:
* `expected_unit_cost_eur`: Landed quote agreed at award time.
* `expected_otif_pct`: Expected on-time delivery percentage based on contract commitments.
* `expected_lead_time_days`: Quoted dock delivery lead time.
* `expected_defect_rate_pct`: Agreed acceptable quality threshold.

Upon post-award fulfillment, the system ingests verified SAP operational records to compute the **Observed Outcome**:
* `actual_unit_cost_eur`: Final invoiced price including logistics surcharges.
* `actual_otif_pct`: Percentage of actual goods receipts meeting scheduled dock dates.
* `actual_lead_time_days`: Mean elapsed days from PO issuance to physical warehouse receipt.
* `actual_defect_rate_pct`: Percentage of delivered goods rejected during QM inspection lot usage decisions.

---

## 3. Decision Accuracy Rate & Variance Computation

For each completed procurement decision $k$, the **Decision Accuracy Rate** quantifies whether the actual performance met or exceeded the award baseline:

$$\text{Decision Accuracy Rate} = \left( \frac{\sum_{k=1}^{N} \mathbb{I}(\text{Actual OTIF}_k \ge \text{Expected OTIF}_k - \epsilon_{\text{tol}})}{N} \right) \times 100\%$$

### Specific Variance Calculations:
* **OTIF Variance**: $\Delta \text{OTIF} = \text{Actual OTIF} - \text{Expected OTIF}$ (negative indicates delivery slippage).
* **Price Variance**: $\Delta P = \frac{\text{Actual Cost} - \text{Expected Cost}}{\text{Expected Cost}} \times 100\%$ (positive indicates cost overrun).
* **Quality Variance**: $\Delta Q = \text{Actual Defect Rate} - \text{Expected Defect Rate}$.

---

## 4. Synthesizing Empirical Lessons Learned

The Procurement Memory system automatically extracts grounded, verifiable lessons from recurring outcome variances:

1. **Vendor Lead Time Correction**: When a vendor consistently underperforms quoted lead times by 3+ days, the system recommends applying an empirical dock safety buffer during future MRP scheduling.
2. **Framework Rebate Realization Audit**: Confirms whether tiered volume discounts promised during contract negotiations were actually credited during invoice verification.
3. **Quality Degradation Flags**: Identifies vendors whose lot rejection rate increases after securing a long-term outline contract.
