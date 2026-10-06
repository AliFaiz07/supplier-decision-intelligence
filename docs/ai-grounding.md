# AI Grounding & Anti-Hallucination Framework

## 1. Zero-Hallucination Mandate

In enterprise procurement decisions involving millions of euros in capital expenditure, hallucinations or fabricated performance statistics can lead to critical supply chain disruptions, audit failures, and commercial litigation.

The **Supplier Decision Intelligence** grounding architecture enforces strict programmatic barriers against generative drift and hallucination:

1. **No Numerical Generation**: All financial metrics (effective landed cost, contract rebates, unit purchase prices), operational metrics (OTIF percentage, average delay days, PPM defect rates), and decision scores (composite MCDA scores, dimension weightings) are pre-calculated by deterministic Python engines and passed into the synthesis context as immutable constants.
2. **Explicit Fact Citation**: Natural language explanations reference specific SAP document IDs, purchase order counts, Goods Receipt timestamps, outline agreement numbers, and inspection lot counts.
3. **Bounding Disclaimers**: Where predictive statistical forecasts are produced, they are explicitly designated as *Model Estimates* accompanied by 95% confidence intervals and underlying sample counts.

---

## 2. Telemetry Grounding Verifications

Every AI synthesis step validates against the following verifiable ERP records:

| Analytical Dimension | Source ERP Records | Grounded Metrics |
| :--- | :--- | :--- |
| **Commercial / Price** | Purchasing Info Records (PIR), PO Item history, Invoices | 24-month min/max/avg unit price, standard deviation, invoice price variance, payment terms cash discount. |
| **Delivery Reliability** | Goods Receipts (GR), Scheduling Agreements, Purchase Orders | OTIF rate percentage, standard deviation of delay, late delivery count, early delivery count, dock lead time. |
| **Quality Performance** | QM Inspection Lots, Defect notifications | Usage decision acceptance rate, defect PPM, scrap rate, rework rate, recurring root-cause defect categories. |
| **Contract Position** | Purchasing Outline Agreements (Contracts / Scheduling Agrmts) | Target quantity vs. released quantity, validity end date, agreed baseline price, volume tier rebate percentage. |
| **Risk & Solvency** | Vendor Master, Credit agency ratings, Single-source logs | Financial stability score, operational disruption history, geographic concentration, plant dependency index. |

---

## 3. Structural Enforcement Pipeline

```text
[ Raw Telemetry Data: PIRs, GRs, QM Lots, Contracts ]
                       │
                       ▼
        [ Deterministic Aggregators ]
                       │
                       ▼
         [ Grounded Fact Dictionary ]
   {
     "supplier_name": "Helios Werkzeuge AG",
     "effective_unit_cost_eur": 12.85,
     "verified_otif_pct": 96.5,
     "contract_ref": "CTR-4600001001",
     "inspection_lots_audited": 42
   }
                       │
                       ▼
         [ Template-Constrained Prompt / Engine ]
                       │
                       ▼
         [ Verification Linter / Output Validator ]
                       │
                       ▼
              [ Verified Narrative ]
```

If the synthesis engine produces a metric inconsistent with the Grounded Fact Dictionary, the verification linter rejects the output and triggers the deterministic rule-based generator.
