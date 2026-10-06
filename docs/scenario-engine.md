# Scenario Simulation Engine: What-If & MCDA Analysis

## 1. Multi-Criteria Decision Analysis (MCDA) Foundation

The decision scoring engine employs a mathematically rigorous, deterministic Multi-Criteria Decision Analysis framework.

Each potential supplier candidate is evaluated across six standardized dimensions:
1. **Commercial Score ($S_{\text{price}}$)**: Evaluates effective landed unit cost relative to benchmark and candidate price spread.
2. **Delivery Reliability Score ($S_{\text{delivery}}$)**: Evaluates verified historical on-time in-full delivery percentage and delay predictability.
3. **Quality Performance Score ($S_{\text{quality}}$)**: Evaluates inspection lot acceptance rate and defect PPM.
4. **Lead Time Score ($S_{\text{lead\_time}}$)**: Evaluates offered dock delivery timeline relative to requirement urgency.
5. **Contract Position Score ($S_{\text{contract}}$)**: Evaluates presence of active SAP outline agreements and volume discount tiers.
6. **Risk & Dependency Score ($S_{\text{risk}}$)**: Evaluates financial health, geo-political risk, and spend concentration impact.

---

## 2. Dynamic Weight Vector Formulation

Each dimension is assigned a normalized percentage weight $w_i \in [0, 100]$ such that:
$$\sum_{i=1}^{6} w_i = 100\%$$

The composite score $C_s$ for supplier $s$ is computed as:
$$C_s = \left( \sum_{i=1}^{6} w_i \cdot S_{i, s} \right) \cdot F_{\text{confidence}, s}$$

Where $F_{\text{confidence}, s} \in [0.85, 1.05]$ is an empirical data confidence multiplier based on the statistical depth of verified historical purchase orders and goods receipts.

---

## 3. Predefined Business Priority Scenarios

The simulator provides pre-calibrated weight profiles designed for standard enterprise procurement scenarios:

| Priority Profile | Price ($w_p$) | Delivery ($w_d$) | Quality ($w_q$) | Lead Time ($w_{lt}$) | Contract ($w_c$) | Risk ($w_r$) | Strategic Focus |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Balanced** | 25% | 25% | 20% | 15% | 10% | 5% | Standard enterprise sourcing baseline |
| **Cost Driven** | 50% | 15% | 10% | 10% | 10% | 5% | Maximum TCO minimization |
| **Delivery Critical** | 10% | 45% | 15% | 20% | 5% | 5% | Zero-tolerance for line-stoppage or delays |
| **Quality Focused** | 15% | 20% | 45% | 10% | 5% | 5% | Critical aerospace/medical component sourcing |
| **Risk Averse** | 15% | 20% | 15% | 10% | 10% | 30% | Dual-sourcing and concentration mitigation |

---

## 4. Dynamic Sensitivity Thresholds ("What Would Change the Recommendation?")

The Scenario Engine computes sensitivity boundaries by determining the minimum weight shift $\Delta w_i$ on any dimension required to alter the top-ranked candidate:

$$\min \Delta w_i \quad \text{s.t.} \quad \text{Rank}_1(\vec{w} + \Delta \vec{w}_i) \neq \text{Rank}_1(\vec{w})$$

This provides procurement buyers with transparent awareness of decision fragility (e.g., *"If delivery weight increases from 25% to 32%, Supplier SUP-006 overtakes SUP-004"*).
