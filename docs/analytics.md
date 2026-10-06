# Procurement Analytics & Intelligence Layer | SAP Supplier Decision Intelligence

## 1. Overview & Purpose

The **Procurement Analytics Engine** (`backend/app/core/analytics.py`) is the computational core of the platform. It calculates all metrics, Key Performance Indicators (KPIs), trends, variances, distributions, deterioration signals, anomalies, and forecasts deterministically from canonical procurement records.

Zero static or fake metrics are hardcoded into UI components. Every metric presented on the dashboards is derived through mathematical aggregation of Purchase Orders (`purchase_orders.json`), Goods Receipts (`goods_receipts.json`), Quality Inspection Lots (`quality_records.json`), Price History (`price_history.json`), Outline Contracts (`contracts.json`), and Risk Events (`risk_events.json`).

---

## 2. Intelligence Domains & Mathematical Formulations

### 2.1 Spend Analytics
Calculates capital deployment across vendors, material categories, time periods, and facilities:
- **Total Procurement Spend**: $\sum \text{PO Net Value EUR}$
- **Spend Trend**: Monthly aggregation over 24 continuous periods ($t \in [1, 24]$)
- **Contracted vs Non-Contract Spend**:
  $$\text{Contract Coverage Share} = \frac{\text{Spend on Active Outline Contracts}}{\text{Total Procurement Spend}} \times 100$$
- **Plant Spend Drill-Down**: Hierarchical aggregation by Plant $\to$ Purchasing Organization $\to$ Purchasing Group $\to$ Material Category.

### 2.2 Price Intelligence & Volatility
Evaluates historical purchase pricing and statistical variance:
- **Price Spread**:
  $$\text{Spread EUR} = P_{\max} - P_{\min}, \quad \text{Spread \%} = \frac{P_{\max} - P_{\min}}{P_{\min}} \times 100$$
- **Standard Deviation & Volatility**:
  $$\sigma = \sqrt{\frac{\sum (P_i - \bar{P})^2}{N - 1}}, \quad CV = \frac{\sigma}{\bar{P}} \times 100$$
  - Low Volatility: $CV \le 6.0\%$
  - Moderate Volatility: $6.0\% < CV \le 12.0\%$
  - High Volatility: $CV > 12.0\%$
- **Price Trend Anomaly Detection**:
  Dynamically flags when a supplier's latest PO price exceeds their historical average by $\ge 10.0\%$.

### 2.3 Delivery Intelligence & OTIF Reliability
Empirical fulfillment tracking based on SAP Goods Receipts:
- **On-Time In-Full (OTIF) Rate**:
  $$\text{OTIF \%} = \frac{\text{Deliveries with } \Delta_{\text{days}} \le 0 \text{ and } Q_{\text{received}} = Q_{\text{ordered}}}{\text{Total Goods Receipts}} \times 100$$
- **Average Delay Days**:
  $$\bar{\Delta}_{\text{delay}} = \frac{\sum_{\Delta > 0} \Delta_{\text{days}}}{\text{Count of Delayed Shipments}}$$
- **Lead Time Distribution**:
  Turnaround duration from PO creation date to actual GR posting date, categorized into discrete tiers: `0-5 days`, `6-10 days`, `11-20 days`, `21-30 days`, and `30+ days`.
- **Delivery vs Effective Cost Trade-Off**:
  Scatter matrix cross-referencing effective unit cost against verified OTIF % to highlight false economies where low headline prices produce expensive operational delays.

### 2.4 Quality Intelligence & Defect Analytics
Manufacturing and goods receipt inspection analytics based on SAP QM:
- **Rejection Rate**:
  $$\text{Rejection Rate \%} = \frac{Q_{\text{defective}}}{Q_{\text{inspected}}} \times 100$$
- **Defect PPM**:
  $$\text{PPM} = \frac{Q_{\text{defective}}}{Q_{\text{inspected}}} \times 1,000,000$$
- **Quality Score (0 - 100)**:
  $$\text{Quality Score} = \max(10, \min(100, 100 - (\text{Rejection Rate} \times 16.0)))$$
  *(Penalized by -22.0 if trailing 60-day quality deterioration is detected; credited +4.0 for IATF 16949 certification).*
- **Defect Category Analysis**:
  Classification of root causes across `Dimensional`, `Material`, `Packaging`, `Surface`, `Functional`, and `Documentation`.

### 2.5 Contract Intelligence & Commercial Agreements
Outline agreement lifecycle tracking based on SAP Contracts & Scheduling Agreements:
- **Contract Expiry Timeline**:
  Categorizes active agreements into `0-30 days`, `31-60 days`, `61-90 days`, and `90+ days` based on the difference between `valid_to` and the reference execution date.
- **Contract Price vs Spot PO Price Variance**:
  $$\text{Variance \%} = \frac{P_{\text{contract}} - P_{\text{latest PO}}}{P_{\text{latest PO}}} \times 100$$

### 2.6 Risk Intelligence & Sourcing Exposure
Assesses supplier continuity, concentration exposure, and vulnerability:
- **Spend Concentration**:
  $$\text{Supplier Share} = \frac{\text{Spend with Supplier}}{\text{Total Category Spend}} \times 100$$
  - Threshold alert flagged when projected allocation pushes concentration $\ge 40.0\%$.
- **Material Single-Source Exposure**:
  Identifies materials where approved source list count $\le 1$, classifying operational dependency as `Critical`, `High`, or `Medium`.
- **Supplier Risk Matrix**:
  Positions suppliers across Business Impact (spend volume) and Supplier Risk Score (base rating + active disruption alerts).

---

## 3. Dedicated Procurement Anomaly Center

The platform includes a dedicated anomaly detection engine scanning for 7 operational threat categories:

1. **Price Anomalies**: Unbudgeted purchase price variance $\ge 10.0\%$ above 12-month baseline.
2. **Delivery Degradation**: 3-month rolling OTIF deterioration $\ge 12.0$ points below 24-month baseline.
3. **Quality Rejection Spikes**: Lot defect rate $\ge 2.0\%$ above historical vendor average.
4. **Lead Time Slippage**: Verified dock receipt lead time $\ge 5$ days longer than Purchasing Info Record (PIR) commitment.
5. **Contract Expiry Cliff**: Active outline contract expiring within 30 days without replacement schedule.
6. **Spend Concentration Breach**: Single supplier capturing $>40.0\%$ of material category volume.
7. **Sudden Volume Volatility**: Monthly procurement demand surging $>50.0\%$ above plant planned capacity.

Every anomaly record provides:
* **Baseline Value**
* **Current Value**
* **Variance Percentage / Delta**
* **Quantified Operational Impact**
* **Recommended Concrete Investigation Step**
* **One-Click Drill-Down Routing**

---

## 4. "What Changed?" Engine (MoM & QoQ Telemetry Shift)

Continuously analyzes temporal shifts between adjacent operating periods:
* **Month-over-Month (MoM)**: August 2026 vs September 2026.
* **Quarter-over-Quarter (QoQ)**: Q2 2026 (Apr-Jun) vs Q3 2026 (Jul-Sep).

Surfaces concrete operational drift across OTIF points, unit price renegotiations, framework rebate tier utilization, and quality defect movements.

---

## 5. Predictive Analytics & Forecasting Engine

Combines statistical time-series extrapolation (Holt-Winters exponential smoothing and linear trend models) with deterministic error bounds:

1. **Material Price Trend Projection**: 6-month forward unit price forecasts accompanied by **95% statistical confidence upper and lower bounds**.
2. **Supplier Reliability Forecast**: Projected 3-month OTIF trajectory based on rolling momentum and seasonal dock receipt patterns.
3. **Quarterly Spend Projections**: Projected category spend commitments under active open requirements.

*All forecast visualizations are explicitly designated as Model Estimates with transparent underlying data sample citations.*
