# Closed-Loop Outcome Memory & Expected vs Actual Analysis

## 1. Overview & Closed-Loop Principle

Strategic procurement decisions are usually forgotten once the purchase order is issued. Most organizations never systematically measure whether the supplier delivered the promised performance.

The **Procurement Outcome Memory Engine** establishes a continuous feedback loop:

```
                      SOURCING DECISION
             Expected: OTIF 95%, Price €78.50, Lead Time 14d
                                │
                                ▼
                       SAP ERP EXECUTION
                   (PO Issuance, Goods Receipts)
                                │
                                ▼
                   POST-AWARD AUDIT TELEMETRY
             Actual: OTIF 82%, Price €84.00, Lead Time 18d
                                │
                                ▼
                    EXPECTED VS ACTUAL DELTA
            Variance: OTIF -13.0 pts, Cost Overrun +€5.50/EA
                                │
                                ▼
                   DERIVED PROCUREMENT LESSON
       "Vendor under-delivered on committed delivery reliability.
    Incorporate tighter SLA penalties and apply 15% confidence penalty
                to future quotations from this supplier."
                                │
                                ▼
                     FUTURE DECISION CONTEXT
       (Adjusts supplier confidence factor & informs new Decision Twins)
```

---

## 2. Telemetry Comparison Dimensions

Every recorded sourcing decision is audited against 4 empirical operational metrics:

1. **On-Time Delivery Rate (OTIF %)**:
   - Expected OTIF % vs Actual Goods Receipt OTIF % (MSEG).
   - Flagged as `Deteriorated` if actual OTIF falls $\ge 5\%$ below expectation.
2. **Effective Unit Price (€)**:
   - Quoted / Agreed Price vs Actual Invoiced Unit Price (RBKP/RSEG).
   - Identifies price escalation and unearned discounts.
3. **Delivery Lead Time (Days)**:
   - Quoted Lead Time vs Actual Turnaround Days.
   - Measures dock arrival variance and logistics buffers.
4. **Incoming Defect Rate (%)**:
   - Anticipated defect tolerance vs Actual inspection lot rejections (QALS).
   - Computes real rework and scrap expenses.

---

## 3. Structured 5-Point Procurement Lessons

The engine automatically constructs audit-grade post-award lessons containing:

1. **Award Context**: Material, Plant, Decision Date, Selected Supplier, Winning Score.
2. **Empirical Variance Summary**: Quantified numerical delta across Price, Delivery, Lead Time, and Quality.
3. **Primary Variance Driver**: Root cause identifying whether the gap stemmed from market inflation, vendor capacity crunch, or faulty baseline assumptions.
4. **Operational Assembly Impact**: Resulting delays, production reschedule instances, or inventory stockouts.
5. **Future Strategic Rule**: Concrete rule to be applied to future Decision Twins (e.g., mandate secondary dual-sourcing quota arrangement or discount vendor confidence factor by 0.85).

---

## 4. Closing the Loop: Feedforward into Future Decisions

Unlike static procurement archives, the Outcome Memory feeds forward into the decision pipeline:
- **Confidence Calibration**: Suppliers who consistently underperform their quotations receive lower `confidence_factor` multipliers in future MCDA rankings.
- **Twin Historical Context**: Future Decision Twins for the same material or supplier group retrieve past outcome evaluations to warn buyers before repeating past mistakes.
