# Decision Stress Testing & Supplier Disruption Simulation

## 1. Overview & Strategic Purpose

A procurement award decision may look optimal under baseline operating assumptions, yet prove acutely vulnerable when subjected to supply chain volatility, commodity price inflation, transportation bottlenecks, or supplier insolvency.

The **Decision Stress Testing Engine** subjects any proposed sourcing allocation to deterministic adversarial shocks to quantify its robustness before procurement commitments are finalized in SAP S/4HANA.

---

## 2. The 8 Adverse Supply Chain Shocks

The engine applies 8 distinct adverse conditions to the candidate suppliers:

| Shock Code | Description | Parameter Deviation | Stress Mechanism |
| :--- | :--- | :--- | :--- |
| **SHOCK-01** | Moderate Price Escalation | +10% Unit Price | Recomputes effective landed cost and price score penalty. |
| **SHOCK-02** | Severe Price Inflation | +20% Unit Price | Stresses candidate margin buffer against category benchmarks. |
| **SHOCK-03** | Logistics Squeeze / Port Bottleneck | +2 Days Lead Time | Degrades lead time score and delivery reliability cushion. |
| **SHOCK-04** | Severe Transportation Delay | +5 Days Lead Time | Tests buffer against required dock arrival deadline. |
| **SHOCK-05** | Production Lot Rejection Spike | +1.5% Defect Rate | Increases empirical non-performance cost of defects. |
| **SHOCK-06** | Vendor Capacity Contraction | -20% Available Capacity | Evaluates capacity ceiling against order lot size. |
| **SHOCK-07** | Immediate Contract Expiry | Loss of Framework Rebate | Reverts candidate quote to standard spot purchasing rates. |
| **SHOCK-08** | Severe Vendor Disruption / Outage | 100% Inability to Supply | Tests emergency failover and alternative absorption. |

---

## 3. Decision Robustness Rating

After evaluating the recommendation across all shocks, the engine calculates the deterministic **Robustness Score Percentage**:

$$\text{Robustness Score} = \left( \frac{\sum_{j=1}^{8} \mathbb{I}(\text{Rank}_1(\text{Shock}_j) = \text{Rank}_1(\text{Baseline}))}{8} \right) \times 100\%$$

### Classification Thresholds
* **Very High Robustness (>= 85%)**: The recommended allocation maintains top ranking across virtually all adverse scenarios.
* **High Robustness (70% - 84%)**: The choice holds under moderate shocks but exhibits minor sensitivity to severe delay or capacity caps.
* **Moderate Robustness (50% - 69%)**: The choice flips under multiple cost or lead time escalations. Contingency dual-sourcing is recommended.
* **Vulnerable / Fragile (< 50%)**: The decision is acutely sensitive to baseline assumptions; single-supplier award entails substantial risk.

---

## 4. Supplier Failure & Outage Simulator

When a primary vendor experiences a sudden, complete operational shutdown (e.g. factory fire, insolvency, cyber incident), the Outage Simulator computes:

1. **Alternative Capacity Absorption**: Identifies all qualified secondary suppliers for the target material and assesses their available monthly production buffer.
2. **Uncovered Demand Deficit**: Calculates any shortfall if the remaining suppliers cannot absorb 100% of the required volume:
   $$\text{Deficit} = \max\left(0, Q_{\text{required}} - \sum_{k \in \text{Alternatives}} \text{Cap}_k\right)$$
3. **Emergency Quota Arrangement**: Formulates an optimized multi-supplier redistribution plan minimizing cost escalation and lead time slippage.
