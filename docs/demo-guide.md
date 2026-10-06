# Demonstration Guide | SAP Supplier Decision Intelligence Platform

## Executive Presentation Walkthrough

Follow this step-by-step presentation script to demonstrate the platform to procurement leadership, solution architects, and engineering stakeholders.

---

### Step 1: Open the Application & Cockpit
- Access the web interface at `http://localhost:5173`.
- Point out the clean, restrained SAP Horizon-inspired enterprise shell, neutral background, IBM Plex typography, and absence of promotional fluff or fake dashboards.
- Review high-level operational intelligence: Active Suppliers, Open Requisitions, Outline Contracts, and Critical Anomalies.

### Step 2: Sourcing Workspace & Parameter Configuration
- Click **"Sourcing Workspace"** in the top navigation.
- Select **REQ-001**: `Standard Sourcing: Hydraulic Directional Control Valves HSV-40`.
  - Material: `MAT-001`
  - Quantity: `10,000 units`
  - Plant: `P001` (Munich Main Assembly Plant)
  - Priority: `Balanced Sourcing`
- Click **"Analyze Sourcing Options"**.
- Note the deterministic processing indicator displaying realistic verification steps (`"Validating SAP vendor master..."`, `"Analyzing 24-month purchase order & goods receipt history..."`, `"Evaluating delivery deviation and OTD..."`).

### Step 3: Review Top Recommendation & Grounded AI Rationale
- The engine calculates and displays the top recommendation:
  - **Supplier SUP-006 (Helios Werkzeuge & Antriebstechnik AG)**.
  - Composite Decision Score: ~`93.4 / 100`.
  - Effective Landed Cost: `€190.67 / unit` (accounting for cash discount, outline rebate, synthetic freight, and zero defect penalty).
  - Track record: `94% OTD`, `0.28% defect rate`, active master agreement.
- Inspect the AI explanation section: note the highlighted empirical strengths, operational trade-offs vs runner-up, and zero-hallucination architectural disclosure.

### Step 4: Decision Sensitivity ("What Would Change the Recommendation?")
- In the Recommended Option overview card, show the dynamic sensitivity analysis:
  - Threshold on Price weight to flip recommendation to the lowest-cost rival.
  - Threshold on Delivery weight to flip recommendation to the fastest/most reliable rival.

### Step 5: Decision Stress Testing & Supplier Outage Simulation
- Switch to the **"Decision Stress Testing & Outage"** tab in the Sourcing Workspace (or via the Decisions Hub).
- Click **"Run 8-Shock Stress Test"**:
  - The engine subjects the decision to 8 adverse supply chain shocks (Price +10%, +20%, Delay +2d, +5d, Lot Rejection spike, Capacity -20%, Contract Expiry, Outage).
  - Displays the deterministic **Robustness Score Percentage** (e.g. 75% - High Robustness) and specific vulnerability factors.
- Switch to the **"Supplier Outage Simulator"**:
  - Simulate a complete outage of primary vendor **SUP-004**.
  - The engine computes alternative supplier capacity absorption, shows uncovered demand deficit, and generates an emergency quota rebalancing plan.

### Step 6: What-If MCDA Simulation
- Switch to the **"What-If Analysis"** tab.
- Demonstrate shifting the priority from **Balanced** to **Delivery-Focused**:
  - Lower Price weight to `10%`.
  - Increase Delivery Reliability weight to `45%`.
- Click **"Recalculate Scores"**.
- Watch the top recommendation dynamically shift with an automated differential trade-off explanation.

### Step 7: Supplier 360 & "What Changed?" Trajectory
- Navigate to **Suppliers $\to$ Supplier 360**.
- Select **SUP-007** or **SUP-004**.
- Point out the **"What Changed? (MoM & QoQ Performance Drift)"** panel:
  - Explicitly highlights the -15.0 pt OTIF delivery degradation on SUP-007 and the +15.7% unhedged unit price spike on SUP-004 between August and September 2026.

### Step 8: Procurement Anomaly Center
- Navigate to **Analytics Hub $\to$ Anomaly Center**.
- Showcase the 7 categories of active anomalies:
  - Price jumps, delivery slippages, defect spikes, and approaching contract expiries.
  - Note the baseline value, current value, variance, operational impact, and recommended investigation step for each anomaly.
  - Demonstrate clicking the **"Investigate"** drill-down button to navigate directly to the affected supplier or material profile.

### Step 9: Predictive Forecasting with 95% Confidence Bounds
- Navigate to **Analytics Hub $\to$ Predictive Forecasts**.
- Showcase the 6-month material price projection:
  - Note the smooth transition from actual historical prices to projected points with **95% statistical confidence error bands**.
  - Show the 3-month supplier reliability forecast and quarterly spend outlay.
  - Note the explicit Model Estimate disclaimers.

### Step 10: Procurement Memory (Closed-Loop Learning)
- Navigate to **Decisions $\to$ Procurement Memory**.
- Review the closed-loop learning dashboard:
  - **Decision Accuracy Rate**: Quantifies how often actual outcomes met or exceeded award expectations.
  - **Average OTIF Variance** & **Average Price Variance**.
  - **Expected vs Actual Post-Award Ledger**: Detailed table comparing agreed award metrics vs actual observed Goods Receipts and invoices.
  - **Empirical Lessons Learned**: Concrete operational insights extracted from variance patterns (e.g. lead time safety buffer adjustments and framework rebate audits).
  - Demonstrate clicking **"Record Post-Award Outcome"** to submit observed telemetry for any recent decision.

### Step 11: Controlled AI Assistant Dialog
- Open the AI Assistant side drawer by clicking **"Procurement AI Assistant"** in the top navigation.
- Demonstrate clicking context-aware prompt chips:
  - *"How robust is this decision?"*
  - *"What if SUP-004 fails?"*
  - *"What did we learn from previous decisions?"*
  - *"Show active anomalies"*
  - *"Forecast price for MAT-001"*
- Show that all answers cite verified underlying records and adhere to the zero-hallucination mandate.
