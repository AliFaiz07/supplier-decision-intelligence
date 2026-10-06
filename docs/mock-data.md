# Mock Data Architecture & Persona Specifications | SAP Supplier Decision Intelligence Platform

## 1. Overview & Deterministic Generation

All 22 mock datasets are generated deterministically using `scripts/generate_mock_data.py` initialized with a fixed random seed (`42`). This ensures 100% reproducibility across environments.

---

## 2. Supplier Portfolio Personas (16 Archetypes)

The supplier universe models 16 distinct procurement personas designed to test edge cases, trade-offs, and risk models:

1. **SUP-001 (Rheinland Industrietechnik GmbH, Germany)**:
   - *Persona*: Balanced solid German mid-tier producer. Competitive pricing, reliable quality, dependable average lead times.
2. **SUP-002 (Apex Component Logistics Sp. z o.o., Poland)**:
   - *Persona*: Lowest headline price in market (€182.00 vs benchmark €210.00). However, frequent delivery delays (76% OTD) and higher batch variance create operational friction.
3. **SUP-003 (Valbruna Precision Metals S.p.A., Italy)**:
   - *Persona*: Premium precision engineering. High unit cost (€235.00), but industry-leading 98.2% on-time delivery and near-zero defect rate (0.18%).
4. **SUP-004 (Nordisk Stål AB, Sweden)**:
   - *Persona*: Low/moderate price, but persistent quality rejection rates (3.8% defect rate) cause rework and incoming inspection holds.
5. **SUP-005 (Danubia Fluid Controls Kft, Hungary)**:
   - *Persona*: Highly reliable on-time delivery (96.5%) with moderate pricing, but tightly constrained monthly manufacturing capacity (12,000 units max).
6. **SUP-006 (Helios Werkzeuge & Antriebstechnik AG, Germany)**:
   - *Persona*: Strategic partner with active enterprise master contract (`CTR-4600001001`), guaranteed 5.7% volume rebate, indexed price stability, and robust 94% OTD.
7. **SUP-007 (Brabant Mechatronics BV, Netherlands)**:
   - *Persona*: Active purchasing outline contract (`CTR-4600001002`) expiring in less than 30 days without scheduled renewal.
8. **SUP-008 (Iberia Forgings & Casting S.A., Spain)**:
   - *Persona*: Highly balanced tier-1 supplier. Strong cost-to-performance ratio, 94.5% OTD, 0.4% rejection rate, and stable capacity.
9. **SUP-009 (Silesia Fasteners & Precision Sp. z o.o., Poland)**:
   - *Persona*: Performance deterioration archetype. 2-year average OTD was 92%, but dropped to 74% over trailing 90 days.
10. **SUP-010 (Voralpen Gusswerk GmbH, Austria)**:
    - *Persona*: Reputable foundry with stellar delivery, but past 60 days show multiple quality notifications and micro-porosity defect spikes (4.2% defect rate).
11. **SUP-011 (Pacific Industrial Component Corp, Taiwan)**:
    - *Persona*: International export manufacturer. Lowest unit quote, but requires 42-day maritime lead time, synthetic freight (7.5%), and synthetic customs tariff (4.8%).
12. **SUP-012 (Alpine Bearings AG, Switzerland)**:
    - *Persona*: Ultra-reliable Swiss precision supplier. 98.9% OTD, 0.08% defect rate, rapid emergency fulfillment, carrying a 12-15% price premium.
13. **SUP-013 (Ruhr Metallwaren & Schweißtechnik GmbH, Germany)**:
    - *Persona*: High supplier concentration. Holds over 48% of total plant spend on metallic sub-assemblies. Heavy dependency exposes enterprise to operational risk.
14. **SUP-014 (Baltic Assembly Solutions OÜ, Estonia)**:
    - *Persona*: Newly qualified supplier onboarded 60 days ago. Attractive quotations, but sparse historical order trace (only 2 sample POs executed).
15. **SUP-015 (Rhone Polymeres SAS, France)**:
    - *Persona*: Blocked / Inactive vendor in SAP vendor master. Failed environmental and REACH compliance audit. Strictly ineligible for new PO placement.
16. **SUP-016 (Saxon Precision Turning GmbH, Germany)**:
    - *Persona*: Agile machine shop. Ideal second-source partner for split quota allocation with high responsiveness and 93% OTD.

---

## 3. Material Portfolio Specifications (10 Archetypes)

- **MAT-001**: Hydraulic Directional Control Valve HSV-40 (Critical production material, dual sourcing recommended).
- **MAT-002**: High-Tensile Structural Fastener M16x80 Grade 10.9 (Commodity fluctuating, cost driven).
- **MAT-003**: Precision Ceramic Hybrid Ball Bearing 6205-2RS (Powertrain critical, ultra-low defect tolerance).
- **MAT-004**: Synthetic High-Performance Hydraulic Fluid HLP-46 (Bulk consumable, framework contract preferred).
- **MAT-005**: Automotive Grade 32-Bit Microcontroller Unit MCU-88 (Global semiconductor, long lead time).
- **MAT-006**: Drop-Forged 6-Cylinder Crankshaft Blank FC-700 (High-volume expensive component, quota split).
- **MAT-007**: Fluorocarbon O-Ring Sealing Ring Viton V-90 45x3mm (Standard industrial consumable).
- **MAT-008**: Seamless Precision Alloy Steel Tube 42CrMo4 60x5mm (Long-term value contract favored).
- **MAT-009**: High-Conductivity Thermal Interface Compound TC-500 (Quality-critical chemical component).
- **MAT-010**: Ductile Cast Iron Planetary Housing CI-250 (Heavy casting, regional plant logistics sensitive).
