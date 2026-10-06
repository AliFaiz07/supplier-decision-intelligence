# Procurement Decision Twin Specification

## 1. Concept & Architectural Purpose

A **Procurement Decision Twin** is a live digital representation of an active strategic sourcing decision context. 

Traditional procurement treats requirements (PRs), quotations (RFQs), supplier master data, delivery receipts, and quality scores as disconnected database records. When a buyer awards a contract, they evaluate static snapshots. If the required delivery date advances, or if plant capacity shrinks, the evaluation must be completely re-run from scratch.

The **Procurement Decision Twin** unifies all relevant parameters into a reactive object that updates deterministically whenever assumptions shift:

```
                      PROCUREMENT REQUIREMENT
                (Material, Quantity, Plant, Date)
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
   HISTORICAL MARKET        ELIGIBLE SUPPLIER      MULTI-CRITERIA
     PRICE CORRIDORS             ROSTER               WEIGHTS
(Min, Avg, Max, Volatility) (PIRs, Contracts, OTD) (Price, Delivery, QM)
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 ▼
                     DECISION TWIN ENGINE
          (Deterministic MCDA Scoring & Optimization)
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
   LIVE RECOMMENDATION    WHAT-IF SCENARIOS     14-SHOCK STRESS
   & TRADE-OFF TRACE      & SENSITIVITY GRID       TELEMETRY
```

---

## 2. Decision Twin Schema

A complete Decision Twin instance is exposed via `POST /api/decision/twin` and contains:

1. **Context Requirement**:
   - `requirement_id`: SAP Purchase Requisition reference.
   - `material_id`, `material_name`, `material_group`, `base_unit`.
   - `plant_id`, `plant_name`, `plant_location`.
   - `order_quantity`, `required_date`, `business_priority`, `selection_mode`.
2. **Market & History Corridor**:
   - `historical_min_price_eur`, `historical_avg_price_eur`, `historical_max_price_eur`.
   - `volatility_score` (Low, Moderate, High).
   - Reference currency (`EUR`).
3. **Eligible Supplier Roster (Per Candidate)**:
   - `supplier_id`, `supplier_name`, `country`, `strategic_tier`.
   - `composite_score`, `rank`, `eligibility_status`, `eligibility_conditions`.
   - `commercial`: Quoted net price, synthetic freight (POC Assumption), synthetic tariff (POC Assumption), active contract ID, contract price protection.
   - `delivery`: On-time delivery rate (OTD %), average delay days, planned lead time days, delivery trajectory.
   - `quality`: Defect rejection rate %, defect PPM, usage decisions (UD).
   - `risk_and_capacity`: Capacity utilization %, practical monthly capacity ceiling, single-source spend concentration %.
4. **Active Recommendation & Runner-Up Trade-Off**:
   - Top supplier / Quota allocation plan.
   - Differential vs runner-up (score gap, price variance, delivery delta).
5. **Interactive Evidence Package**:
   - Trace citations to SAP `EKKO/EKPO`, `MSEG`, `QALS/QAVE`, `EINA/EINE`.
6. **Stress Test Telemetry**:
   - Robustness score % across 14 macro conditions.
   - Top critical vulnerabilities.
7. **Practical Sensitivity Thresholds ("What Would Change This Decision?")**:
   - Dynamic crossover weight percentages calculated on demand.
8. **Assumptions Metadata**:
   - Clear disclosure of distance-weighted freight formulas, tariff basis, and defect multipliers with "POC Assumption" tags.

---

## 3. Real-Time Synchronization Triggers

The Decision Twin automatically recalculates when:
- **Quantity Changes**: Volume increases may exceed vendor practical capacity limits, triggering quota arrangement warnings.
- **Receiving Plant Shifts**: Freight distances and applicable tariffs change, shifting the effective procurement cost.
- **Priority Weights Adjust**: Shifts between Cost-Focused, Delivery-Focused, and Quality-Critical rebalance the scoring hierarchy.
- **Supplier Shocks Occur**: Outages or capacity drops dynamically re-allocate volume to qualified alternative sources.
