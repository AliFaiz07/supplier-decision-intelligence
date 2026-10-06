# Architecture Blueprint | SAP Supplier Decision Intelligence Platform

## 1. Executive Summary & Positioning

The **Supplier Decision Intelligence Platform** is an enterprise decision-support layer designed to operate alongside SAP S/4HANA and internal enterprise systems. Rather than functioning as a generic reporting dashboard or replacing standard SAP transactional capabilities, the platform aggregates operational signals across purchasing, logistics, quality management, contracts, and supplier risk to answer:

> *"Given this specific procurement requirement, which eligible supplier or supplier allocation should I consider, why, what are the trade-offs, how robust is the choice under stress, and what empirical evidence supports the recommendation?"*

---

## 2. High-Level Architecture & Closed Loop

The architecture enforces a continuous, closed-loop decision lifecycle across three logical layers:

```text
+-----------------------------------------------------------------------------------+
|                           PRESENTATION LAYER (React / Vite / TS)                  |
|   • Overview & KPI Cockpit        • Sourcing Workspace (Eligibility, TCO, MCDA)   |
|   • Supplier 360 Deep Profile     • Decisions Hub (What-If, Stress Test, Memory)  |
|   • Analytics Hub (8 Pillars)     • Procurement Anomaly Center & Forecasting      |
|   • Data Explorer (22 JSONs)      • Grounded Controlled Procurement AI Assistant  |
+-----------------------------------------+-----------------------------------------+
                                          │ REST / JSON APIs
+-----------------------------------------▼-----------------------------------------+
|                        BACKEND INTELLIGENCE LAYER (FastAPI)                       |
|   +---------------------------------------------------------------------------+   |
|   |                       DETERMINISTIC ENGINE CORE                           |   |
|   |   • Supplier Eligibility Engine (Active, Material, Plant, Capacity)       |   |
|   |   • Effective Landed Cost Engine (Price + Freight + Tariffs - Rebates)    |   |
|   |   • MCDA Scoring & Priority Engine (Balanced, Cost, Delivery, Quality)    |   |
|   |   • SAP Quota Arrangement Multi-Supplier Solver                           |   |
|   |   • Decision Sensitivity & "What Would Change the Recommendation?" Engine |   |
|   |   • Decision Stress Testing Engine (8 Supply Chain Adverse Shocks)        |   |
|   |   • Supplier Outage & Disruption Simulator (Deficit & Emergency Quota)    |   |
|   |   • Procurement Memory Engine (Expected vs Actual Telemetry & Learning)   |   |
|   |   • Procurement Anomaly Center (7 Category Automated Scanners)            |   |
|   |   • "What Changed?" Engine (MoM / QoQ Comparative Trajectory Shifts)      |   |
|   |   • Predictive Forecasting Engine (Price Bands, Reliability, Spend)       |   |
|   +-------------------------------------+-------------------------------------+   |
|                                         │                                         |
|   +-------------------------------------▼-------------------------------------+   |
|   |                         AI EXPLANATION LAYER                              |   |
|   |   • Deterministic Audit Synthesizer (Zero-Hallucination, 100% Grounded)   |   |
|   |   • Bidirectional Context Injector & Enterprise Dialog Router             |   |
|   +-------------------------------------+-------------------------------------+   |
+-----------------------------------------+-----------------------------------------+
                                          │ Data Provider Interface
+-----------------------------------------▼-----------------------------------------+
|                           CANONICAL DATA ABSTRACTION                              |
|   +---------------------------------------------------------------------------+   |
|   |                       DataProvider (Abstract Interface)                   |   |
|   +-------------------+-----------------------+-------------------------------+   |
|                       │                       │                                   |
|          +------------▼------------+ +--------▼--------+ +---------------------+  |
|          |    MockDataProvider     | | FutureSAP       | | FutureS21           |  |
|          |    (22 Local JSONs)     | | Provider (BTP)  | | Provider (Internal) |  |
|          |    [ACTIVE IN POC]      | | [Architectural] | | [Architectural]     |  |
|          +-------------------------+ +-----------------+ +---------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Separation of Concerns: Deterministic vs AI Layers

A foundational architectural requirement is that **no Large Language Model (LLM) or generative AI component calculates scores, evaluates eligibility, or selects winners**:

1. **Deterministic Core**:
   - Calculates all mathematical KPIs (On-Time Delivery %, defect rejection rate, price position, spend concentration).
   - Enforces business eligibility rules (e.g., blocking inactive vendors in SAP vendor master).
   - Executes Multi-Criteria Decision Analysis (MCDA) using normalized scales (0-100) and user-configured weights.
   - Solves multi-supplier split allocations under capacity constraints.
   - Evaluates decision sensitivity boundaries and 8-shock stress-testing.
   - Tracks post-award telemetry outcomes in the Procurement Memory ledger.

2. **AI Explanation Layer**:
   - Formulates consulting-grade, human-readable rationales grounded **strictly** in the calculated deterministic results and retrieved evidence packages.
   - Highlights quantitative trade-offs against runner-up candidates.
   - Employs a pluggable provider abstraction with instant fallback to a deterministic audit synthesizer, guaranteeing reliable offline and air-gapped execution.

---

## 4. Controlled Realism Latency

To simulate enterprise ERP query execution across large transactional tables (PO history, goods receipts, inspection lots) without frustrating users, the backend introduces controlled artificial processing latency (400ms to 1200ms) for operations such as:
- Sourcing Analysis
- Scenario & What-If Simulation
- Decision Stress Testing
- Supplier Outage Modeling
- Post-Award Outcome Logging
- AI Explanation Synthesis

Progressive step messages (`"Analyzing supplier history..."`, `"Evaluating delivery performance..."`, `"Checking contract context..."`, `"Running 8 adverse supply chain shocks..."`) reinforce that real multi-dimensional calculations are taking place.
