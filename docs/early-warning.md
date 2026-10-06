# Procurement Early Warning & Attention Center Specification

## 1. Overview & Operational Problem

Manufacturing assembly lines are frequently shut down not by sudden catastrophes, but by **gradual, unmonitored supplier deterioration**:
- A vendor's delivery reliability slowly slips from 95% to 88% over four months.
- Lead-time deviations gradually expand from ±1 day to ±4 days.
- In-line quality rejections experience minor spikes that pass initial dock receiving but cause scrap in manufacturing.
- Unit spot prices quietly drift upwards on off-contract purchase orders.

In traditional ERP setups, these signals reside in separate modules (MM, QM, FI-AP) and trigger no alerts until a critical stockout occurs.

The **Procurement Early Warning Engine** correlates these weak signals into unified threat patterns before production downtime occurs.

---

## 2. Multi-Signal Weak Pattern Combiner

The engine continuously evaluates four concurrent dimensions:

```
+─────────────────────────────────────────────────────────────+
|               MULTI-SIGNAL WEAK PATTERN RULE                |
+─────────────────────────────────────────────────────────────+
| 1. Price Drift Signal:                                      |
|    Recent 90d avg PO price >= +4.0% vs trailing baseline    |
|                                                             |
| 2. Delivery Slippage Signal:                                |
|    Trailing 90d OTD drops by >= 5.0 pts or avg delay >= 2.0d|
|                                                             |
| 3. Lead Time Deviation Signal:                              |
|    Goods receipt dock arrival variance >= +1.5 days         |
|                                                             |
| 4. Quality Rejection Signal:                                |
|    Inspection lot defect rate rises by >= 0.5% (+50 PPM)    |
+─────────────────────────────────────────────────────────────+
                               │
                               ▼
        Active Signals >= 2 ──► EARLY WARNING TRIGGERED
```

When 2 or more signals co-occur for a supplier-material pair, the platform:
1. Calculates severity: **Critical** (3-4 signals), **High** (2 signals), or **Medium** (1 signal with high spend).
2. Generates an AI pattern explanation detailing the compound trajectory.
3. Proposes an immediate strategic hedge (e.g., dual-sourcing quota split, safety-stock expansion, or price renegotiation).

---

## 3. Categorized Attention Queue & Action Pathways

Every attention item in the queue is classified by priority and equipped with **5 standard action pathways**:

1. **Investigate**: Opens the AI Investigation Drawer with pre-populated root-cause queries.
2. **Compare**: Opens side-by-side benchmarking against approved peers.
3. **Simulate**: Directs the user to the Sourcing Workspace with pre-loaded material parameters.
4. **Stress Test**: Launches the 14-condition stress testing suite to measure impact on production.
5. **View Evidence**: Directs to Supplier 360 with underlying goods receipts and inspection lots.

### Priority Classifications:
- **Critical Priority**: Expiring outline agreements (<25 days remaining), vendor operational disruptions, or compound 4-signal deteriorations.
- **High Priority**: Single-source spend concentration exceeding 50%, price escalation spikes (>8%), or 2-3 signal deteriorations.
- **Medium Priority**: Contracts expiring within 45 days, moderate concentration (40-50%), or single-signal drift.
- **Informational**: Routine benchmark shifts and PIR updates.
