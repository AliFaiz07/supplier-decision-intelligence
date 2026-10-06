# Decision Engine Specification | SAP Supplier Decision Intelligence Platform

## 1. Overview & Principle

The Decision Engine implements **Multi-Criteria Decision Analysis (MCDA)**. Recommendations are never hardcoded. Scores are dynamically computed from underlying transactional data across 6 configurable dimensions on a normalized 0 to 100 scale:

$$\text{Final Decision Score} = \left( \sum_{i=1}^{6} \text{Dimension Score}_i \times \text{Weight}_i \right) \times \text{Confidence Factor}$$

---

## 2. Dimension Scoring Formulations

### A. Price / Effective Landed Cost (0 - 100)
Effective landed cost is computed per candidate:
$$\text{Effective Landed Cost} = \text{Base Price} - \text{Cash Discount} - \text{Outline Rebate} + \text{Freight Logistics} + \text{Customs Tariffs} + \text{Defect Cost Penalty}$$

The score scales inverted-linearly between the minimum and maximum effective costs across all eligible suppliers:
$$\text{Price Score} = 100 - \left( \frac{\text{Effective Cost} - \text{Min Cost}}{\text{Max Cost} - \text{Min Cost}} \right) \times 50$$

### B. Delivery Reliability (0 - 100)
Derived from historical Goods Receipts (MSEG):
$$\text{Base OTD} = \left( \frac{\text{On-Time Deliveries}}{\text{Total Deliveries}} \right) \times 100$$
- Penalty for average delay $> 2$ days: $-(\text{avg delay} - 2) \times 3.0$
- Penalty for recent trajectory deterioration (trailing 90d drop $\ge 15\%$): $-18.0$ points.

### C. Quality Performance (0 - 100)
Derived from SAP Quality Inspection Lots (QALS):
$$\text{Quality Score} = 100 - (\text{Rejection Rate \%} \times 16.0)$$
- Bonus for automotive/aerospace IATF 16949 certification: $+4.0$ points.
- Penalty for recent defect spike (trailing 60d jump $\ge 2\%$): $-22.0$ points.

### D. Lead Time Responsiveness (0 - 100)
Scales turnaround speed relative to requested plant dock deadline:
- $\le 7$ days: $98.0$
- $8 - 12$ days: $92.0$
- $13 - 16$ days: $84.0$
- $17 - 25$ days: $70.0$
- $26 - 35$ days: $55.0$
- $> 35$ days: $40.0$

### E. Contract Advantage (0 - 100)
Evaluates SAP Purchasing Outline Agreement context:
- Active master contract with valid volume rebate: $100.0$
- Active contract expiring in $<30$ days: $65.0$
- Spot sourcing / No active outline contract: $45.0$

### F. Risk Sensitivity (0 - 100)
Evaluates credit risk ratings and supply chain disruption events:
- Base score: Low ($95.0$), Medium ($75.0$), High ($45.0$), Critical ($15.0$).
- Single-Source Spend Concentration Penalty: $-20.0$ points if supplier handles $>40\%$ of plant spend on the material group.
- Deduction per active risk alert: $-8.0$ points.

### G. Evidence Sufficiency & Confidence Factor
If a candidate has sparse transaction history ($<5$ historical orders, e.g. newly onboarded supplier SUP-014), a confidence multiplier of $0.92$ is applied to discount empirical uncertainty.

---

## 3. Dynamic Sensitivity Thresholds ("What Would Change the Recommendation?")

The engine automatically calculates the exact mathematical weight shift required on each dimension to dethrone the top-ranked supplier:
- Minimum weight threshold on Price to flip recommendation to the lowest-cost rival.
- Minimum weight threshold on Delivery to flip recommendation to the fastest/most reliable rival.
- Clear natural-language insights explaining the trade-off boundaries.

---

## 4. Multi-Supplier Quota Allocation Solver (SAP Quota Arrangement)

When a requirement specifies `"Multi-Supplier Allocation (Quota)"` or batch volume exceeds any single supplier's monthly capacity ceiling:
1. Candidate suppliers are ranked by composite score.
2. The engine looks up SAP Quota Arrangement (`EQUK`/`EQUP`) definitions.
3. Quantities are partitioned (e.g. 50% / 30% / 20%) to safeguard plant continuity and avoid line downtime.
4. Total expenditure and weighted landed unit costs are computed.

---

## 5. Adversarial Stress Testing Engine (8 Supply Chain Shocks)

Evaluates the primary recommendation against 8 deterministic adverse shocks:
1. Moderate Price Escalation (+10%)
2. Severe Price Inflation (+20%)
3. Logistics Squeeze (+2 Days Delay)
4. Severe Transportation Delay (+5 Days Delay)
5. Quality Defect Spike (+1.5% Rejection Rate)
6. Vendor Capacity Contraction (-20% Capacity)
7. Immediate Contract Expiry (Rebate Loss)
8. Complete Vendor Disruption / Outage

Computes an overall **Decision Robustness Score Percentage** and identifies specific operational vulnerabilities.

---

## 6. Supplier Outage & Disruption Simulator

When an active supplier suffers an unexpected outage:
- Computes alternative supplier spare monthly capacity.
- Quantifies uncovered demand deficit.
- Automatically generates an emergency quota rebalancing plan.
