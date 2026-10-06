# AI Architecture: SAP Supplier Decision Intelligence

## 1. Architectural Philosophy

The AI subsystem in Supplier Decision Intelligence is designed around **controlled, grounded decision support**. 

In high-stakes enterprise procurement, artificial intelligence must never function as a black-box decision maker or an ungrounded text generator. 

### Core Architectural Axioms
1. **Mathematical Invariance**: Scoring, ranking, effective cost calculations, quota allocations, and stress-test evaluations are executed exclusively by deterministic algorithms in Python. The AI model never computes scores or invents numbers.
2. **Deterministic Context Injection**: When the AI explains or audits a decision, it receives structured JSON telemetry from the data provider and decision engine. Every claim made in the natural-language response is grounded in underlying ERP facts.
3. **Dual Model Modes**:
   - **Grounded Assistant Pipeline**: Handles intent classification, entity extraction, context enrichment, and grounded template/LLM synthesis.
   - **Fallback Rule-Based Generator**: If an external LLM endpoint is unavailable or disabled, a deterministic domain synthesis engine generates complete, grammatically rigorous, and professional enterprise explanations using verified mathematical metrics.

---

## 2. Component Pipeline

```text
User Question / Sourcing Event
        ↓
+------------------------------------+
| Intent & Parameter Extractor       |
| (Entity resolution: Material, BP)  |
+------------------------------------+
        ↓
+------------------------------------+
| Data Provider Telemetry Retrieval  |
| (PO history, PIRs, GRs, Lots, Risk)|
+------------------------------------+
        ↓
+------------------------------------+
| Deterministic Decision Context     |
| (MCDA Scores, TCO, Sensitivity)    |
+------------------------------------+
        ↓
+------------------------------------+
| Grounded Context Assembler         |
| (Grounding constraints & facts)    |
+------------------------------------+
        ↓
+------------------------------------+
| Synthesis Engine                   |
| (Enterprise Rationale Formulation) |
+------------------------------------+
        ↓
Structured, Evidence-Backed Response to Buyer
```

---

## 3. Supported Analytical Dialog Intents

1. **Recommendation Explanation**: Detailed breakdown of why a particular vendor was awarded the primary or split allocation over rivals.
2. **Supplier Comparison**: Head-to-head evaluation of two vendors across price volatility, OTIF, defect PPM, and outline contract coverage.
3. **What-If Exploration**: Explaining how priority weight shifts (e.g. prioritizing delivery over cost) affect the recommended allocation.
4. **Decision Robustness & Stress Test Audit**: Summarizing the 8-shock stress test results and detailing specific vulnerability factors.
5. **Supplier Outage & Disruption**: Advising on emergency quota shifts and alternate qualified capacity when a primary vendor fails.
6. **Procurement Memory & Post-Award Telemetry**: Explaining historical variance between expected metrics at contract award and actual observed delivery/pricing.
7. **Anomaly Investigation**: Root-cause analysis of price increases, quality defect clusters, or contract expiration risks.
8. **Predictive Forecasting**: Interpreting statistical price trends and reliability projections within 95% confidence bands.
