# SAP Supplier Decision Intelligence Platform

### Complete AI-Native Procurement Decision Intelligence Platform | Differentiation Layer for SAP S/4HANA & SAP Ariba

---

## 1. Product Overview & Strategic Positioning

The **Supplier Decision Intelligence Platform** is an enterprise-grade AI-native decision intelligence layer that sits above **SAP S/4HANA**, **SAP Ariba**, and **S21** procurement data.

```text
SAP S/4HANA / SAP Ariba  ──►  System of Record + System of Execution
Decision Intelligence   ──►  Decision Intelligence Layer
```

The platform unifies disparate transactional signals across purchase orders, goods receipts, inspection lots, contracts, and supplier risk into an interconnected decision workflow:

```text
UNDERSTAND ──► INVESTIGATE ──► EVALUATE ──► DECIDE ──► SIMULATE ──► STRESS TEST ──► EXPLAIN ──► MONITOR ──► LEARN FROM OUTCOMES
```

The platform answers the core strategic sourcing question:
> *"Given this procurement requirement, supplier history, pricing corridors, delivery performance, quality PPM, contracts, risk, and business priorities: which sourcing option should the procurement team award, why, how robust is that choice under adverse stress, and what did we learn from past procurement decisions?"*

---

## 2. The Complete Closed-Loop Procurement Lifecycle

```text
PROCUREMENT REQUIREMENT (PR)
        ↓
CONTEXT UNDERSTANDING & TWIN CREATION
        ↓
SUPPLIER ELIGIBILITY SCREENING
        ↓
MULTI-DIMENSIONAL ANALYSIS
        ↓
EFFECTIVE PROCUREMENT COST (TCO)
        ↓
DETERMINISTIC MCDA DECISION ENGINE
        ↓
RECOMMENDATION & TRADE-OFF TRACE
        ↓
INTERACTIVE EVIDENCE GRAPH
        ↓
PROCUREMENT DECISION TWIN
        ↓
WHAT-IF SCENARIO SIMULATION
        ↓
2D SENSITIVITY MAPPING
        ↓
DECISION STRESS TESTING (14 ADVERSE SHOCKS)
        ↓
SUPPLIER FAILURE SIMULATION (4 MITIGATION STRATEGIES)
        ↓
HUMAN PROCUREMENT DECISION & SAP AWARD
        ↓
POST-AWARD PERFORMANCE TELEMETRY (GR / QM)
        ↓
OUTCOME MEMORY (EXPECTED VS ACTUAL)
        ↓
CLOSED-LOOP LEARNING FOR FUTURE INTELLIGENCE
```

---

## 3. Core Differentiation & Platform Capabilities

### Priority 1: Decision Intelligence & Stress Testing
1. **Procurement Decision Twin**: Live digital context model synchronizing material specifications, plant parameters, historical price corridors, candidate rosters, effective cost breakdowns, MCDA weights, live recommendations, and stress telemetry.
2. **Decision Stress Testing (14 Macro Shocks)**: Deterministic evaluation against Price inflation (+5%, +10%, +20%), Delivery delays (+1d, +3d, +5d), Capacity crunches (-10%, -20%, -30%), Quality deterioration (+3%), Supplier Force Majeure Outages, Contract Expirations, Freight Surcharges (+25%), and Lead Time expansions (+7d). Calculates deterministic **Decision Robustness %**.
3. **Supplier Failure Simulator**: Evaluates catastrophic primary vendor disruptions and models **4 distinct recovery strategies**:
   - Single Alternative Supplier
   - Multi-Supplier Allocation (Quota Arrangement)
   - Emergency Sourcing Pipeline (RFQ Broadcast)
   - Safety Stock Buffer Consumption
   - Generates structured **Single vs. Multi-Supplier Comparison Matrix** (Cost, Delivery OTD, Quality Defect %, Concentration %, Uncovered Deficits).
4. **Interactive Decision Evidence Graph**: Clickable hierarchical tree connecting Recommendation $\to$ 5 Dimension Pillars $\to$ Leaf sub-nodes. Clicking any node opens an Audit Card revealing Metric Value, Historical Period, Record Count, Mathematical Formula, SAP Source Table (`EKKO`, `MSEG`, `QALS`, etc.), and underlying transactional line items.
5. **Procurement Early Warning & Attention Center**: Weak-signal pattern combiner correlating minor Price Drift, Delivery Slippage, Lead-Time Variance, and Quality Spikes to flag supplier deterioration before assembly line stoppage. Provides 5 explicit action pathways: *Investigate, Compare, Simulate, Stress Test, View Evidence*.
6. **Decision Outcome Memory**: Closed-loop post-award tracking comparing Expected vs Actual metrics (OTIF, Unit Price, Lead Time, Defect Rate) and deriving structured 5-point procurement lessons to inform future awards.

### Priority 2: Leakage, Sensitivity & Concentration
7. **Procurement Leakage & Hidden Cost Detector**: Continuously audits purchase orders, goods receipts, and invoices for Contract Price Discrepancies, Maverick Off-Contract Buying, Scrap Losses, Expedited Freight Surcharges, and Expired Contract Spend. Clearly badges synthetic multipliers as `POC Assumption`.
8. **Supplier Concentration & Capacity Shock Simulator**: Interactive slider modeling the impact of primary supplier capacity contractions (-10% to -50%), calculating spillover volumes, unabsorbed gaps, and dynamic re-allocations across qualified alternatives.
9. **2D Decision Sensitivity Map**: 16-cell interactive matrix mapping preferred vendor shifts across Cost Priority vs Delivery Priority trade-off spectrums.
10. **Structured AI Investigation Mode**: In-depth diagnostic assistant generating structured investigation reports (*Finding, Primary Driver, Secondary Driver, Supporting Evidence Citations, Operational Impact, Risk Exposure, Suggested Next Analysis*).

### Priority 3: Enterprise Ontology & Forecasting
11. **Procurement Knowledge Graph Explorer**: Traverses 162 nodes and 268 directed edges across 10 canonical procurement classes (*Supplier, Material, Plant, PO, GR, Invoice, Contract, Quality, Decision, Outcome*).
12. **Predictive Analytics & Forecasting**: 6-month material price trends with 95% confidence corridors, supplier reliability trajectory forecasts, and quarterly budget allocations.
13. **"What Changed?" Engine**: Month-over-Month and Quarter-over-Quarter comparative drift analysis.

---

## 4. Documentation Suite (`docs/`)

| Document | Purpose & Scope |
| :--- | :--- |
| [`docs/product-overview.md`](docs/product-overview.md) | Platform mission, core lifecycle, and high-level enterprise capabilities |
| [`docs/architecture.md`](docs/architecture.md) | System architecture, data flow, component boundaries, and API contracts |
| [`docs/differentiation.md`](docs/differentiation.md) | Comprehensive differentiation: SAP S/4HANA vs Decision Intelligence Layer, deterministic vs AI, mock vs future SAP/S21 |
| [`docs/decision-twin.md`](docs/decision-twin.md) | Decision Twin architecture, schema, live context synchronization triggers |
| [`docs/stress-testing.md`](docs/stress-testing.md) | 14 macro shock formulations, robustness metrics, and 4 failover strategies |
| [`docs/evidence.md`](docs/evidence.md) | Decision Evidence Graph, audit provenance, SAP table mappings, and POC assumptions |
| [`docs/early-warning.md`](docs/early-warning.md) | Weak-signal pattern combiner, attention center queue, and action pathways |
| [`docs/procurement-leakage.md`](docs/procurement-leakage.md) | 8 leakage vectors, financial quantification formulas, and remediation workflows |
| [`docs/procurement-memory.md`](docs/procurement-memory.md) | Closed-loop learning, Expected vs Actual telemetry, and variance analytics |
| [`docs/outcome-analysis.md`](docs/outcome-analysis.md) | Post-award audit telemetry, 5-point lessons learned, and confidence feedforward |
| [`docs/decision-engine.md`](docs/decision-engine.md) | Deterministic MCDA mathematical formulation, quota optimizer, and sensitivity thresholds |
| [`docs/data-model.md`](docs/data-model.md) | Canonical procurement data model, dataset catalog, and SAP mappings |
| [`docs/analytics.md`](docs/analytics.md) | Formulas for all operational, financial, quality, and delivery metrics |
| [`docs/ai-architecture.md`](docs/ai-architecture.md) | Grounded AI pipeline, structured investigation mode, and synthesis engine |
| [`docs/ai-grounding.md`](docs/ai-grounding.md) | Zero-hallucination mandate, fact dictionary, and database citation rules |
| [`docs/mock-data.md`](docs/mock-data.md) | Deterministic generation (seed 42), 22 datasets, referential integrity rules |
| [`docs/demo-guide.md`](docs/demo-guide.md) | Step-by-step walkthrough script for executive decision intelligence demos |
| [`docs/future-sap-integration.md`](docs/future-sap-integration.md) | Integration roadmap for SAP S/4HANA, BTP Destinations, and CDS views |
| [`docs/future-s21-integration.md`](docs/future-s21-integration.md) | Integration roadmap for S21 legacy procurement adapters |

---

## 5. Technology Stack & Verification

- **Backend**: Python 3.14+, FastAPI, NumPy (Deterministic MCDA Decision Engine), Pydantic.
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite (Calm enterprise SAP Fiori styling, IBM Plex Sans typography).
- **Mock Data**: 22 relational datasets (Seed 42), 100% referential integrity verified.
- **Test Suite**: 59 automated test suites passing in under 1 second (`python -m pytest backend/tests`).
- **Frontend Build**: Clean TypeScript compilation (`cmd /c npm run build`).

---

## 6. Getting Started

### Backend Execution:
```bash
# Start backend on port 8000
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Execution:
```bash
# In frontend/ directory:
npm.cmd install
npm.cmd run dev
```

### Automated Testing:
```bash
# Run complete test suite (59 tests)
python -m pytest backend/tests
```
