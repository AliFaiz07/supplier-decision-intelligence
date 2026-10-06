"""
Deterministic Synthetic Procurement Data Generator for SAP Supplier Decision Intelligence Platform.
Generates 22 interconnected datasets with referential integrity and fixed seed (42).
Covers 16 suppliers, 10 materials, 3 plants, contracts, POs, GRs, Invoices, Quality records,
Price histories, Delivery deviations, Risk signals, Scenarios, and Requirements.
"""

import json
import os
import random
from datetime import datetime, timedelta, date

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Fixed seed for complete determinism
RNG = random.Random(42)

def save_json(filename: str, data):
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Generated: {filename} ({len(data) if isinstance(data, list) else len(data.keys())} records)")

def run_generator():
    print("Starting deterministic mock data generation...")

    # 1. PLANTS
    plants = [
        {
            "plant_id": "P001",
            "name": "Munich High-Precision Assembly Plant",
            "company_code": "1000",
            "purchasing_org": "1000",
            "country": "DE",
            "city": "Munich",
            "postal_code": "80807",
            "storage_locations": ["SL01-Main Warehouse", "SL02-Assembly Buffer", "SL03-Incoming Inspection"],
            "currency": "EUR"
        },
        {
            "plant_id": "P002",
            "name": "Katowice Component Manufacturing Plant",
            "company_code": "2000",
            "purchasing_org": "2000",
            "country": "PL",
            "city": "Katowice",
            "postal_code": "40-001",
            "storage_locations": ["SL10-Raw Storage", "SL11-Buffer Stock"],
            "currency": "PLN"
        },
        {
            "plant_id": "P003",
            "name": "Linz Heavy Industrial Equipment Works",
            "company_code": "3000",
            "purchasing_org": "3000",
            "country": "AT",
            "city": "Linz",
            "postal_code": "4020",
            "storage_locations": ["SL20-Heavy Yard", "SL21-Subassembly"],
            "currency": "EUR"
        }
    ]
    save_json("plants.json", plants)

    # 2. CURRENCIES & EXCHANGE RATES
    currencies = [
        {"currency": "EUR", "rate_to_eur": 1.0000, "name": "Euro", "symbol": "€"},
        {"currency": "USD", "rate_to_eur": 0.9200, "name": "US Dollar", "symbol": "$"},
        {"currency": "PLN", "rate_to_eur": 0.2325, "name": "Polish Złoty", "symbol": "zł"},
        {"currency": "CHF", "rate_to_eur": 1.0550, "name": "Swiss Franc", "symbol": "CHF"},
        {"currency": "GBP", "rate_to_eur": 1.1700, "name": "British Pound", "symbol": "£"},
        {"currency": "TWD", "rate_to_eur": 0.0290, "name": "New Taiwan Dollar", "symbol": "NT$"}
    ]
    save_json("currency_information.json", currencies)

    # 3. COUNTRIES & TRADE ZONES (Synthetic logistics & customs benchmarks)
    countries = [
        {"country_code": "DE", "name": "Germany", "trade_zone": "EU", "freight_factor_pct": 2.0, "synthetic_customs_pct": 0.0, "risk_rating": "Low", "lead_time_buffer_days": 1},
        {"country_code": "PL", "name": "Poland", "trade_zone": "EU", "freight_factor_pct": 3.0, "synthetic_customs_pct": 0.0, "risk_rating": "Low", "lead_time_buffer_days": 2},
        {"country_code": "IT", "name": "Italy", "trade_zone": "EU", "freight_factor_pct": 3.5, "synthetic_customs_pct": 0.0, "risk_rating": "Low", "lead_time_buffer_days": 2},
        {"country_code": "SE", "name": "Sweden", "trade_zone": "EU", "freight_factor_pct": 4.0, "synthetic_customs_pct": 0.0, "risk_rating": "Low", "lead_time_buffer_days": 3},
        {"country_code": "HU", "name": "Hungary", "trade_zone": "EU", "freight_factor_pct": 3.2, "synthetic_customs_pct": 0.0, "risk_rating": "Low", "lead_time_buffer_days": 2},
        {"country_code": "NL", "name": "Netherlands", "trade_zone": "EU", "freight_factor_pct": 2.5, "synthetic_customs_pct": 0.0, "risk_rating": "Low", "lead_time_buffer_days": 1},
        {"country_code": "ES", "name": "Spain", "trade_zone": "EU", "freight_factor_pct": 4.5, "synthetic_customs_pct": 0.0, "risk_rating": "Low", "lead_time_buffer_days": 3},
        {"country_code": "AT", "name": "Austria", "trade_zone": "EU", "freight_factor_pct": 2.2, "synthetic_customs_pct": 0.0, "risk_rating": "Low", "lead_time_buffer_days": 1},
        {"country_code": "TW", "name": "Taiwan", "trade_zone": "Non-EU-APAC", "freight_factor_pct": 7.5, "synthetic_customs_pct": 4.8, "risk_rating": "Medium", "lead_time_buffer_days": 21},
        {"country_code": "CH", "name": "Switzerland", "trade_zone": "EFTA", "freight_factor_pct": 3.0, "synthetic_customs_pct": 1.2, "risk_rating": "Low", "lead_time_buffer_days": 2},
        {"country_code": "EE", "name": "Estonia", "trade_zone": "EU", "freight_factor_pct": 3.8, "synthetic_customs_pct": 0.0, "risk_rating": "Low", "lead_time_buffer_days": 3},
        {"country_code": "FR", "name": "France", "trade_zone": "EU", "freight_factor_pct": 3.0, "synthetic_customs_pct": 0.0, "risk_rating": "Low", "lead_time_buffer_days": 2}
    ]
    save_json("country_information.json", countries)

    # 4. MATERIALS (10 realistic materials across archetypes)
    materials = [
        {
            "material_id": "MAT-001",
            "description": "Hydraulic Directional Control Valve HSV-40",
            "material_group": "GRP-HYD",
            "base_uom": "EA",
            "procurement_type": "F (External)",
            "criticality": "Critical",
            "quality_sensitivity": "High",
            "price_behavior": "Moderate Stability",
            "standard_lead_time_days": 14,
            "benchmark_price_eur": 210.00,
            "plant_relevance": ["P001", "P002", "P003"],
            "sourcing_strategy": "Dual Sourcing Recommended",
            "defect_tolerance_ppm": 200,
            "min_order_qty": 50,
            "lot_size": "EX"
        },
        {
            "material_id": "MAT-002",
            "description": "High-Tensile Structural Fastener M16x80 Grade 10.9",
            "material_group": "GRP-FAS",
            "base_uom": "PC",
            "procurement_type": "F (External)",
            "criticality": "Standard",
            "quality_sensitivity": "Medium",
            "price_behavior": "Commodity Fluctuating",
            "standard_lead_time_days": 7,
            "benchmark_price_eur": 4.25,
            "plant_relevance": ["P001", "P002"],
            "sourcing_strategy": "Multi Sourcing / Cost Driven",
            "defect_tolerance_ppm": 800,
            "min_order_qty": 1000,
            "lot_size": "FX"
        },
        {
            "material_id": "MAT-003",
            "description": "Precision Ceramic Hybrid Ball Bearing 6205-2RS",
            "material_group": "GRP-BEA",
            "base_uom": "EA",
            "procurement_type": "F (External)",
            "criticality": "Critical",
            "quality_sensitivity": "Extremely High",
            "price_behavior": "Premium High Stability",
            "standard_lead_time_days": 21,
            "benchmark_price_eur": 85.50,
            "plant_relevance": ["P001", "P003"],
            "sourcing_strategy": "Preferred Certified Suppliers Only",
            "defect_tolerance_ppm": 50,
            "min_order_qty": 100,
            "lot_size": "EX"
        },
        {
            "material_id": "MAT-004",
            "description": "Synthetic High-Performance Hydraulic Fluid HLP-46",
            "material_group": "GRP-CHEM",
            "base_uom": "L",
            "procurement_type": "F (External)",
            "criticality": "Consumable",
            "quality_sensitivity": "Medium",
            "price_behavior": "Seasonal Oil Indexed",
            "standard_lead_time_days": 5,
            "benchmark_price_eur": 6.80,
            "plant_relevance": ["P001", "P002", "P003"],
            "sourcing_strategy": "Framework Contract Preferred",
            "defect_tolerance_ppm": 500,
            "min_order_qty": 500,
            "lot_size": "WB"
        },
        {
            "material_id": "MAT-005",
            "description": "Automotive Grade 32-Bit Microcontroller Unit MCU-88",
            "material_group": "GRP-ELEC",
            "base_uom": "PC",
            "procurement_type": "F (External)",
            "criticality": "Critical",
            "quality_sensitivity": "High",
            "price_behavior": "Global Semiconductor Volatile",
            "standard_lead_time_days": 45,
            "benchmark_price_eur": 38.00,
            "plant_relevance": ["P001", "P002"],
            "sourcing_strategy": "Global Sourcing with Buffer Stock",
            "defect_tolerance_ppm": 100,
            "min_order_qty": 500,
            "lot_size": "FX"
        },
        {
            "material_id": "MAT-006",
            "description": "Drop-Forged 6-Cylinder Crankshaft Blank FC-700",
            "material_group": "GRP-MET",
            "base_uom": "EA",
            "procurement_type": "F (External)",
            "criticality": "Production Critical",
            "quality_sensitivity": "High",
            "price_behavior": "Scrap Surcharge Indexed",
            "standard_lead_time_days": 30,
            "benchmark_price_eur": 450.00,
            "plant_relevance": ["P001", "P003"],
            "sourcing_strategy": "Capacity Constrained / Quota Allocation",
            "defect_tolerance_ppm": 150,
            "min_order_qty": 50,
            "lot_size": "EX"
        },
        {
            "material_id": "MAT-007",
            "description": "Fluorocarbon O-Ring Sealing Ring Viton V-90 45x3mm",
            "material_group": "GRP-SEAL",
            "base_uom": "PC",
            "procurement_type": "F (External)",
            "criticality": "Standard",
            "quality_sensitivity": "High",
            "price_behavior": "Stable",
            "standard_lead_time_days": 10,
            "benchmark_price_eur": 2.10,
            "plant_relevance": ["P001", "P002", "P003"],
            "sourcing_strategy": "Catalog / Multi-Source",
            "defect_tolerance_ppm": 300,
            "min_order_qty": 200,
            "lot_size": "FX"
        },
        {
            "material_id": "MAT-008",
            "description": "Seamless Precision Alloy Steel Tube 42CrMo4 60x5mm",
            "material_group": "GRP-MET",
            "base_uom": "M",
            "procurement_type": "F (External)",
            "criticality": "High",
            "quality_sensitivity": "Medium",
            "price_behavior": "Long-term Stability",
            "standard_lead_time_days": 18,
            "benchmark_price_eur": 32.50,
            "plant_relevance": ["P001", "P002", "P003"],
            "sourcing_strategy": "Long-Term Value Contract",
            "defect_tolerance_ppm": 400,
            "min_order_qty": 100,
            "lot_size": "EX"
        },
        {
            "material_id": "MAT-009",
            "description": "High-Conductivity Thermal Interface Compound TC-500",
            "material_group": "GRP-CHEM",
            "base_uom": "KG",
            "procurement_type": "F (External)",
            "criticality": "Quality-Critical",
            "quality_sensitivity": "Very High",
            "price_behavior": "Moderate Price Movements",
            "standard_lead_time_days": 12,
            "benchmark_price_eur": 95.00,
            "plant_relevance": ["P001"],
            "sourcing_strategy": "Strict Process Audit Required",
            "defect_tolerance_ppm": 80,
            "min_order_qty": 20,
            "lot_size": "EX"
        },
        {
            "material_id": "MAT-010",
            "description": "Ductile Cast Iron Planetary Housing CI-250",
            "material_group": "GRP-MET",
            "base_uom": "EA",
            "procurement_type": "F (External)",
            "criticality": "Standard",
            "quality_sensitivity": "Medium",
            "price_behavior": "Regional Freight Sensitive",
            "standard_lead_time_days": 15,
            "benchmark_price_eur": 175.00,
            "plant_relevance": ["P001", "P003"],
            "sourcing_strategy": "Regional Near-Plant Sourcing",
            "defect_tolerance_ppm": 350,
            "min_order_qty": 40,
            "lot_size": "EX"
        }
    ]
    save_json("materials.json", materials)

    # 5. SUPPLIERS (16 distinct archetypal profiles fulfilling prompt personas)
    suppliers = [
        {
            "supplier_id": "SUP-001",
            "name": "Rheinland Industrietechnik GmbH",
            "country": "DE",
            "city": "Duisburg",
            "street": "Industriestraße 45",
            "postal_code": "47051",
            "status": "Active",
            "strategic_tier": "Preferred",
            "business_partner_category": "Organization",
            "payment_terms": "NT30 (30 days net)",
            "incoterms": "FCA Duisburg",
            "annual_spend_eur": 1420000.0,
            "currency": "EUR",
            "risk_rating": "Low",
            "profile_summary": "Solid German industrial component producer. Competitive pricing, reliable quality, dependable average lead times.",
            "max_capacity_units_per_month": 45000,
            "established_year": 1984,
            "certifications": ["ISO 9001:2015", "ISO 14001:2015"],
            "supported_material_groups": ["GRP-HYD", "GRP-MET", "GRP-FAS"]
        },
        {
            "supplier_id": "SUP-002",
            "name": "Apex Component Logistics Sp. z o.o.",
            "country": "PL",
            "city": "Katowice",
            "street": "ul. Hutnicza 12",
            "postal_code": "40-241",
            "status": "Active",
            "strategic_tier": "Transactional",
            "business_partner_category": "Organization",
            "payment_terms": "NT60 (60 days net)",
            "incoterms": "DAP Munich",
            "annual_spend_eur": 890000.0,
            "currency": "PLN",
            "risk_rating": "High",
            "profile_summary": "Lowest headline unit price in the market. However, frequent delivery delays (76% OTD) and higher batch variance create operational friction.",
            "max_capacity_units_per_month": 50000,
            "established_year": 2011,
            "certifications": ["ISO 9001:2015"],
            "supported_material_groups": ["GRP-HYD", "GRP-FAS", "GRP-MET"]
        },
        {
            "supplier_id": "SUP-003",
            "name": "Valbruna Precision Metals S.p.A.",
            "country": "IT",
            "city": "Vicenza",
            "street": "Via dell'Industria 88",
            "postal_code": "36100",
            "status": "Active",
            "strategic_tier": "Strategic",
            "business_partner_category": "Organization",
            "payment_terms": "NT30 (30 days net)",
            "incoterms": "DAP Munich",
            "annual_spend_eur": 2150000.0,
            "currency": "EUR",
            "risk_rating": "Low",
            "profile_summary": "Top-tier precision engineering. High unit cost, but industry-leading 98.2% on-time delivery and near-zero defect rate (0.18%). Best for critical requirements.",
            "max_capacity_units_per_month": 30000,
            "established_year": 1968,
            "certifications": ["ISO 9001:2015", "IATF 16949", "ISO 45001"],
            "supported_material_groups": ["GRP-HYD", "GRP-BEA", "GRP-MET"]
        },
        {
            "supplier_id": "SUP-004",
            "name": "Nordisk Stål AB",
            "country": "SE",
            "city": "Västerås",
            "street": "Stålv缠gen 14",
            "postal_code": "721 30",
            "status": "Active",
            "strategic_tier": "Transactional",
            "business_partner_category": "Organization",
            "payment_terms": "NT30 (30 days net)",
            "incoterms": "CPT Munich",
            "annual_spend_eur": 650000.0,
            "currency": "EUR",
            "risk_rating": "High",
            "profile_summary": "Competitive price quotes, but persistent quality rejection rates (3.8% defect rate) cause rework and incoming inspection holds.",
            "max_capacity_units_per_month": 35000,
            "established_year": 1995,
            "certifications": ["ISO 9001:2015"],
            "supported_material_groups": ["GRP-HYD", "GRP-MET", "GRP-FAS"]
        },
        {
            "supplier_id": "SUP-005",
            "name": "Danubia Fluid Controls Kft",
            "country": "HU",
            "city": "Győr",
            "street": "Fehérvári út 22",
            "postal_code": "9023",
            "status": "Active",
            "strategic_tier": "Preferred",
            "business_partner_category": "Organization",
            "payment_terms": "NT30 (30 days net)",
            "incoterms": "DAP Munich",
            "annual_spend_eur": 720000.0,
            "currency": "EUR",
            "risk_rating": "Medium",
            "profile_summary": "Highly reliable on-time delivery (96.5%) with moderate pricing, but tightly constrained monthly manufacturing capacity (12,000 units max).",
            "max_capacity_units_per_month": 12000,
            "established_year": 2005,
            "certifications": ["ISO 9001:2015", "ISO 14001:2015"],
            "supported_material_groups": ["GRP-HYD", "GRP-SEAL"]
        },
        {
            "supplier_id": "SUP-006",
            "name": "Helios Werkzeuge & Antriebstechnik AG",
            "country": "DE",
            "city": "Stuttgart",
            "street": "Neckarstraße 102",
            "postal_code": "70190",
            "status": "Active",
            "strategic_tier": "Strategic",
            "business_partner_category": "Organization",
            "payment_terms": "2% 14, Net 30",
            "incoterms": "DAP Munich",
            "annual_spend_eur": 3400000.0,
            "currency": "EUR",
            "risk_rating": "Low",
            "profile_summary": "Active enterprise master contract (CTR-4600001001) in place with guaranteed volume discount, indexed price stability, and robust 94% OTD.",
            "max_capacity_units_per_month": 60000,
            "established_year": 1952,
            "certifications": ["ISO 9001:2015", "IATF 16949", "ISO 50001"],
            "supported_material_groups": ["GRP-HYD", "GRP-MET", "GRP-BEA", "GRP-FAS"]
        },
        {
            "supplier_id": "SUP-007",
            "name": "Brabant Mechatronics BV",
            "country": "NL",
            "city": "Eindhoven",
            "street": "High Tech Campus 31",
            "postal_code": "5656 AE",
            "status": "Active",
            "strategic_tier": "Preferred",
            "business_partner_category": "Organization",
            "payment_terms": "NT30 (30 days net)",
            "incoterms": "DAP Munich",
            "annual_spend_eur": 1200000.0,
            "currency": "EUR",
            "risk_rating": "Medium",
            "profile_summary": "Solid partner, but current purchasing outline contract (CTR-4600001002) expires in less than 30 days without scheduled renewal yet.",
            "max_capacity_units_per_month": 25000,
            "established_year": 2002,
            "certifications": ["ISO 9001:2015", "ISO 13485"],
            "supported_material_groups": ["GRP-HYD", "GRP-ELEC", "GRP-BEA"]
        },
        {
            "supplier_id": "SUP-008",
            "name": "Iberia Forgings & Casting S.A.",
            "country": "ES",
            "city": "Bilbao",
            "street": "Polígono Industrial Ugaldeguren 5",
            "postal_code": "48170",
            "status": "Active",
            "strategic_tier": "Strategic",
            "business_partner_category": "Organization",
            "payment_terms": "NT45 (45 days net)",
            "incoterms": "FCA Bilbao",
            "annual_spend_eur": 2800000.0,
            "currency": "EUR",
            "risk_rating": "Low",
            "profile_summary": "Highly balanced tier-1 supplier. Strong cost-to-performance ratio, 94.5% OTD, 0.4% rejection rate, and stable capacity.",
            "max_capacity_units_per_month": 70000,
            "established_year": 1974,
            "certifications": ["ISO 9001:2015", "IATF 16949"],
            "supported_material_groups": ["GRP-MET", "GRP-HYD", "GRP-FAS"]
        },
        {
            "supplier_id": "SUP-009",
            "name": "Silesia Fasteners & Precision Sp. z o.o.",
            "country": "PL",
            "city": "Wrocław",
            "street": "ul. Krakowska 84",
            "postal_code": "50-427",
            "status": "Active",
            "strategic_tier": "Transactional",
            "business_partner_category": "Organization",
            "payment_terms": "NT30 (30 days net)",
            "incoterms": "DAP Munich",
            "annual_spend_eur": 510000.0,
            "currency": "PLN",
            "risk_rating": "High",
            "profile_summary": "Recent marked deterioration in delivery performance: dropped from 94% OTD down to 74% over the last 90 days due to regional transport issues.",
            "max_capacity_units_per_month": 40000,
            "established_year": 2008,
            "certifications": ["ISO 9001:2015"],
            "supported_material_groups": ["GRP-FAS", "GRP-MET"]
        },
        {
            "supplier_id": "SUP-010",
            "name": "Voralpen Gusswerk GmbH",
            "country": "AT",
            "city": "Steyr",
            "street": "Werkstraße 19",
            "postal_code": "4400",
            "status": "Active",
            "strategic_tier": "Preferred",
            "business_partner_category": "Organization",
            "payment_terms": "NT30 (30 days net)",
            "incoterms": "DAP Linz",
            "annual_spend_eur": 1850000.0,
            "currency": "EUR",
            "risk_rating": "Medium",
            "profile_summary": "Historically reputable foundry with stellar delivery, but past 60 days show multiple quality notifications and micro-porosity defect spikes.",
            "max_capacity_units_per_month": 28000,
            "established_year": 1961,
            "certifications": ["ISO 9001:2015", "ISO 14001:2015"],
            "supported_material_groups": ["GRP-MET", "GRP-HYD"]
        },
        {
            "supplier_id": "SUP-011",
            "name": "Pacific Industrial Component Corp",
            "country": "TW",
            "city": "Hsinchu",
            "street": "Science Park Rd 18",
            "postal_code": "30076",
            "status": "Active",
            "strategic_tier": "Transactional",
            "business_partner_category": "Organization",
            "payment_terms": "Letter of Credit / NT60",
            "incoterms": "FOB Keelung",
            "annual_spend_eur": 1600000.0,
            "currency": "USD",
            "risk_rating": "Medium",
            "profile_summary": "International export manufacturer. Lowest unit quote on electronic/micro items, but requires 45-day maritime/air lead times and synthetic tariff/import friction.",
            "max_capacity_units_per_month": 150000,
            "established_year": 1999,
            "certifications": ["ISO 9001:2015", "ISO 14001:2015", "IATF 16949"],
            "supported_material_groups": ["GRP-ELEC", "GRP-HYD", "GRP-BEA"]
        },
        {
            "supplier_id": "SUP-012",
            "name": "Alpine Bearings AG",
            "country": "CH",
            "city": "Winterthur",
            "street": "Zürcherstrasse 55",
            "postal_code": "8400",
            "status": "Active",
            "strategic_tier": "Strategic",
            "business_partner_category": "Organization",
            "payment_terms": "NT30 (30 days net)",
            "incoterms": "DAP Munich",
            "annual_spend_eur": 2400000.0,
            "currency": "CHF",
            "risk_rating": "Low",
            "profile_summary": "Ultra-reliable Swiss precision supplier. 98.9% OTD, 0.08% defect rate, rapid emergency fulfillment, carrying a 12-15% price premium.",
            "max_capacity_units_per_month": 22000,
            "established_year": 1948,
            "certifications": ["ISO 9001:2015", "ISO 14001", "AS9100D"],
            "supported_material_groups": ["GRP-BEA", "GRP-HYD", "GRP-MET"]
        },
        {
            "supplier_id": "SUP-013",
            "name": "Ruhr Metallwaren & Schweißtechnik GmbH",
            "country": "DE",
            "city": "Essen",
            "street": "Krupp-Allee 7",
            "postal_code": "45127",
            "status": "Active",
            "strategic_tier": "Preferred",
            "business_partner_category": "Organization",
            "payment_terms": "NT30 (30 days net)",
            "incoterms": "DAP Munich",
            "annual_spend_eur": 5200000.0,
            "currency": "EUR",
            "risk_rating": "High",
            "profile_summary": "Extremely high supplier concentration: holds over 48% of total plant spend on metallic sub-assemblies. Heavy dependency exposes enterprise to operational risk.",
            "max_capacity_units_per_month": 90000,
            "established_year": 1971,
            "certifications": ["ISO 9001:2015", "ISO 3834-2"],
            "supported_material_groups": ["GRP-MET", "GRP-FAS", "GRP-HYD"]
        },
        {
            "supplier_id": "SUP-014",
            "name": "Baltic Assembly Solutions OÜ",
            "country": "EE",
            "city": "Tallinn",
            "street": "Mustamäe tee 16",
            "postal_code": "10617",
            "status": "Under Evaluation",
            "strategic_tier": "Transactional",
            "business_partner_category": "Organization",
            "payment_terms": "NT30 (30 days net)",
            "incoterms": "DAP Munich",
            "annual_spend_eur": 45000.0,
            "currency": "EUR",
            "risk_rating": "Medium",
            "profile_summary": "Newly qualified supplier onboarded 60 days ago. Highly competitive quotations, but sparse historical order trace (only 2 sample POs executed).",
            "max_capacity_units_per_month": 20000,
            "established_year": 2022,
            "certifications": ["ISO 9001:2015"],
            "supported_material_groups": ["GRP-HYD", "GRP-ELEC", "GRP-SEAL"]
        },
        {
            "supplier_id": "SUP-015",
            "name": "Rhone Polymeres SAS",
            "country": "FR",
            "city": "Lyon",
            "street": "Boulevard de la Chimie 4",
            "postal_code": "69007",
            "status": "Inactive",
            "strategic_tier": "Transactional",
            "business_partner_category": "Organization",
            "payment_terms": "NT30",
            "incoterms": "EXW Lyon",
            "annual_spend_eur": 0.0,
            "currency": "EUR",
            "risk_rating": "Critical",
            "profile_summary": "Blocked / Inactive vendor in SAP vendor master. Failed environmental and REACH compliance audit in Q1 2026. Ineligible for new PO placement.",
            "max_capacity_units_per_month": 15000,
            "established_year": 1989,
            "certifications": [],
            "supported_material_groups": ["GRP-CHEM", "GRP-SEAL"]
        },
        {
            "supplier_id": "SUP-016",
            "name": "Saxon Precision Turning GmbH",
            "country": "DE",
            "city": "Chemnitz",
            "street": "Zwickauer Str. 201",
            "postal_code": "09116",
            "status": "Active",
            "strategic_tier": "Preferred",
            "business_partner_category": "Organization",
            "payment_terms": "NT30 (30 days net)",
            "incoterms": "DAP Munich",
            "annual_spend_eur": 1150000.0,
            "currency": "EUR",
            "risk_rating": "Low",
            "profile_summary": "Agile medium-sized machine shop. Great second-source partner for split allocation (Quota arrangement) with high responsiveness and 93% OTD.",
            "max_capacity_units_per_month": 32000,
            "established_year": 1993,
            "certifications": ["ISO 9001:2015", "IATF 16949"],
            "supported_material_groups": ["GRP-HYD", "GRP-MET", "GRP-BEA"]
        }
    ]
    save_json("suppliers.json", suppliers)

    # 6. PURCHASING CONTRACTS (Outline agreements)
    contracts = [
        {
            "contract_id": "CTR-4600001001",
            "supplier_id": "SUP-006",
            "material_id": "MAT-001",
            "contract_type": "WK (Value Contract)",
            "agreement_type": "Quantity/Value",
            "target_value_eur": 1200000.0,
            "released_value_eur": 740000.0,
            "contract_price_eur": 198.00,
            "agreed_discount_pct": 5.7,
            "valid_from": "2025-01-01",
            "valid_to": "2027-12-31",
            "status": "Active",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "payment_terms": "2% 14, Net 30",
            "cancellation_notice_months": 3,
            "notes": "Long-term master procurement agreement with index price cap."
        },
        {
            "contract_id": "CTR-4600001002",
            "supplier_id": "SUP-007",
            "material_id": "MAT-001",
            "contract_type": "MK (Quantity Contract)",
            "agreement_type": "Quantity",
            "target_value_eur": 450000.0,
            "released_value_eur": 420000.0,
            "contract_price_eur": 204.00,
            "agreed_discount_pct": 3.0,
            "valid_from": "2024-10-01",
            "valid_to": "2026-10-25",  # Expiring soon (<30 days from reference date Sep 2026)
            "status": "Expiring Soon",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "payment_terms": "NT30",
            "cancellation_notice_months": 1,
            "notes": "Outline contract expiring within 30 days. Renewal negotiations pending."
        },
        {
            "contract_id": "CTR-4600001003",
            "supplier_id": "SUP-003",
            "material_id": "MAT-003",
            "contract_type": "WK (Value Contract)",
            "agreement_type": "Value",
            "target_value_eur": 950000.0,
            "released_value_eur": 610000.0,
            "contract_price_eur": 82.00,
            "agreed_discount_pct": 4.1,
            "valid_from": "2025-06-01",
            "valid_to": "2027-05-31",
            "status": "Active",
            "purchasing_org": "1000",
            "purchasing_group": "P02",
            "payment_terms": "NT30",
            "cancellation_notice_months": 3,
            "notes": "High precision hybrid ceramic bearing supply contract."
        },
        {
            "contract_id": "CTR-4600001004",
            "supplier_id": "SUP-008",
            "material_id": "MAT-008",
            "contract_type": "MK (Quantity Contract)",
            "agreement_type": "Quantity",
            "target_value_eur": 800000.0,
            "released_value_eur": 350000.0,
            "contract_price_eur": 30.50,
            "agreed_discount_pct": 6.2,
            "valid_from": "2025-01-01",
            "valid_to": "2026-12-31",
            "status": "Active",
            "purchasing_org": "1000",
            "purchasing_group": "P03",
            "payment_terms": "NT45",
            "cancellation_notice_months": 2,
            "notes": "Alloy steel tube framework contract."
        },
        {
            "contract_id": "CTR-4600001005",
            "supplier_id": "SUP-013",
            "material_id": "MAT-006",
            "contract_type": "WK (Value Contract)",
            "agreement_type": "Value",
            "target_value_eur": 2500000.0,
            "released_value_eur": 2100000.0,
            "contract_price_eur": 440.00,
            "agreed_discount_pct": 2.2,
            "valid_from": "2024-01-01",
            "valid_to": "2026-12-31",
            "status": "Active",
            "purchasing_org": "1000",
            "purchasing_group": "P03",
            "payment_terms": "NT30",
            "cancellation_notice_months": 6,
            "notes": "Heavy forging crankshaft master agreement."
        }
    ]
    save_json("contracts.json", contracts)

    # 7. PURCHASING INFO RECORDS (PIR)
    pirs = []
    pir_counter = 5300010001
    
    # Pre-configure supplier prices and lead times per material
    supplier_mat_profiles = [
        # MAT-001: Valves
        {"sup": "SUP-001", "mat": "MAT-001", "price": 208.0, "lt": 14, "planned_del": 12, "status": "Standard"},
        {"sup": "SUP-002", "mat": "MAT-001", "price": 182.0, "lt": 20, "planned_del": 14, "status": "Standard"}, # cheapest, poor delivery
        {"sup": "SUP-003", "mat": "MAT-001", "price": 235.0, "lt": 10, "planned_del": 9, "status": "Standard"},  # premium, best quality/delivery
        {"sup": "SUP-004", "mat": "MAT-001", "price": 192.0, "lt": 15, "planned_del": 14, "status": "Standard"}, # high quality defect
        {"sup": "SUP-005", "mat": "MAT-001", "price": 215.0, "lt": 11, "planned_del": 10, "status": "Standard"}, # strong delivery, limited capacity
        {"sup": "SUP-006", "mat": "MAT-001", "price": 198.0, "lt": 13, "planned_del": 12, "status": "Contract"}, # active contract
        {"sup": "SUP-007", "mat": "MAT-001", "price": 204.0, "lt": 14, "planned_del": 13, "status": "Contract"}, # expiring contract
        {"sup": "SUP-008", "mat": "MAT-001", "price": 210.0, "lt": 12, "planned_del": 11, "status": "Standard"}, # strategic balanced
        {"sup": "SUP-011", "mat": "MAT-001", "price": 168.0, "lt": 42, "planned_del": 38, "status": "Standard"}, # foreign import, long lead time
        {"sup": "SUP-012", "mat": "MAT-001", "price": 242.0, "lt": 7,  "planned_del": 7, "status": "Standard"},  # Swiss ultra-reliable fast
        {"sup": "SUP-014", "mat": "MAT-001", "price": 189.0, "lt": 16, "planned_del": 15, "status": "Standard"}, # new supplier limited history
        {"sup": "SUP-016", "mat": "MAT-001", "price": 212.0, "lt": 13, "planned_del": 12, "status": "Standard"}, # split allocation candidate

        # MAT-002: Fasteners
        {"sup": "SUP-001", "mat": "MAT-002", "price": 4.20, "lt": 7, "planned_del": 6, "status": "Standard"},
        {"sup": "SUP-002", "mat": "MAT-002", "price": 3.70, "lt": 12, "planned_del": 8, "status": "Standard"},
        {"sup": "SUP-008", "mat": "MAT-002", "price": 4.15, "lt": 8, "planned_del": 7, "status": "Standard"},
        {"sup": "SUP-009", "mat": "MAT-002", "price": 3.90, "lt": 14, "planned_del": 7, "status": "Standard"}, # deteriorating delivery

        # MAT-003: Bearings
        {"sup": "SUP-003", "mat": "MAT-003", "price": 82.0, "lt": 18, "planned_del": 16, "status": "Contract"},
        {"sup": "SUP-012", "mat": "MAT-003", "price": 88.0, "lt": 12, "planned_del": 10, "status": "Standard"},
        {"sup": "SUP-016", "mat": "MAT-003", "price": 84.5, "lt": 19, "planned_del": 17, "status": "Standard"},

        # MAT-005: Microcontrollers
        {"sup": "SUP-011", "mat": "MAT-005", "price": 32.50, "lt": 45, "planned_del": 40, "status": "Standard"}, # Imported
        {"sup": "SUP-007", "mat": "MAT-005", "price": 41.00, "lt": 18, "planned_del": 16, "status": "Standard"},

        # MAT-006: Crankshaft Blanks
        {"sup": "SUP-013", "mat": "MAT-006", "price": 440.0, "lt": 28, "planned_del": 25, "status": "Contract"}, # High concentration
        {"sup": "SUP-008", "mat": "MAT-006", "price": 465.0, "lt": 32, "planned_del": 30, "status": "Standard"},
        {"sup": "SUP-010", "mat": "MAT-006", "price": 435.0, "lt": 26, "planned_del": 25, "status": "Standard"}, # recent quality issues

        # MAT-008: Alloy Steel Tube
        {"sup": "SUP-008", "mat": "MAT-008", "price": 30.50, "lt": 16, "planned_del": 15, "status": "Contract"},
        {"sup": "SUP-001", "mat": "MAT-008", "price": 33.20, "lt": 18, "planned_del": 17, "status": "Standard"},
        {"sup": "SUP-013", "mat": "MAT-008", "price": 32.80, "lt": 20, "planned_del": 18, "status": "Standard"},

        # MAT-003 Price Anomaly Profile (Prompt Section 10: SUP-004 on MAT-003)
        {"sup": "SUP-004", "mat": "MAT-003", "price": 102.0, "lt": 16, "planned_del": 15, "status": "Standard"},

        # Single-source Materials (Prompt Section 14 & Section 40)
        {"sup": "SUP-005", "mat": "MAT-004", "price": 18.50, "lt": 10, "planned_del": 9,  "status": "Standard"},
        {"sup": "SUP-007", "mat": "MAT-007", "price": 2.80,  "lt": 12, "planned_del": 10, "status": "Standard"},
        {"sup": "SUP-010", "mat": "MAT-010", "price": 310.0, "lt": 25, "planned_del": 22, "status": "Standard"}
    ]

    for item in supplier_mat_profiles:
        pirs.append({
            "info_record_id": f"PIR-{pir_counter}",
            "supplier_id": item["sup"],
            "material_id": item["mat"],
            "purchasing_org": "1000",
            "plant_id": "P001",
            "net_price_eur": item["price"],
            "currency": "EUR",
            "planned_delivery_time_days": item["planned_del"],
            "standard_lead_time_days": item["lt"],
            "minimum_order_qty": 50,
            "order_unit": "EA" if "MAT-008" != item["mat"] and "MAT-002" != item["mat"] else ("PC" if item["mat"]=="MAT-002" else "M"),
            "valid_from": "2024-01-01",
            "valid_to": "2027-12-31",
            "created_on": "2024-01-01",
            "status": item["status"]
        })
        pir_counter += 1
    save_json("purchasing_info_records.json", pirs)

    # 8. SOURCE LIST (SAP Source List entries)
    source_list = []
    sl_counter = 1
    for p in pirs:
        source_list.append({
            "source_list_id": f"SL-{sl_counter:04d}",
            "material_id": p["material_id"],
            "plant_id": p["plant_id"],
            "supplier_id": p["supplier_id"],
            "purchasing_org": p["purchasing_org"],
            "valid_from": "2025-01-01",
            "valid_to": "2027-12-31",
            "fixed_supplier": True if p["supplier_id"] in ["SUP-006", "SUP-003", "SUP-008"] else False,
            "blocked_supplier": True if p["supplier_id"] == "SUP-015" else False
        })
        sl_counter += 1
    save_json("source_list.json", source_list)

    # 9. QUOTA ARRANGEMENTS (SAP Quota Arrangement for MAT-001 and MAT-006)
    quota_arrangements = [
        {
            "quota_id": "QA-MAT001-P001",
            "material_id": "MAT-001",
            "plant_id": "P001",
            "valid_from": "2026-01-01",
            "valid_to": "2026-12-31",
            "items": [
                {"supplier_id": "SUP-006", "quota": 50, "allocated_qty": 12500, "max_lot_size": 20000},
                {"supplier_id": "SUP-008", "quota": 30, "allocated_qty": 7500, "max_lot_size": 15000},
                {"supplier_id": "SUP-016", "quota": 20, "allocated_qty": 5000, "max_lot_size": 10000}
            ]
        },
        {
            "quota_id": "QA-MAT006-P001",
            "material_id": "MAT-006",
            "plant_id": "P001",
            "valid_from": "2026-01-01",
            "valid_to": "2026-12-31",
            "items": [
                {"supplier_id": "SUP-013", "quota": 60, "allocated_qty": 1800, "max_lot_size": 3000},
                {"supplier_id": "SUP-008", "quota": 40, "allocated_qty": 1200, "max_lot_size": 2000}
            ]
        }
    ]
    save_json("quota_arrangements.json", quota_arrangements)

    # 10. GENERATE 180+ REALISTIC PURCHASE ORDERS (POs), GOODS RECEIPTS (GRs), AND INVOICES
    # Over 24 months (Oct 2024 to Sep 2026) with distinct supplier traits
    purchase_orders = []
    goods_receipts = []
    invoices = []
    delivery_history = []
    quality_records = []
    
    start_date = date(2024, 10, 1)
    end_date = date(2026, 9, 25)
    total_days = (end_date - start_date).days

    # Targeted execution numbers per supplier to reflect realism
    supplier_po_targets = {
        "SUP-001": 24, "SUP-002": 20, "SUP-003": 22, "SUP-004": 18,
        "SUP-005": 16, "SUP-006": 28, "SUP-007": 15, "SUP-008": 26,
        "SUP-009": 16, "SUP-010": 15, "SUP-011": 12, "SUP-012": 14,
        "SUP-013": 25, "SUP-014": 2,  "SUP-015": 0,  "SUP-016": 12
    }

    po_id_counter = 4500010000
    gr_id_counter = 5000010000
    inv_id_counter = 5100010000
    qm_id_counter = 8000001
    del_id_counter = 9000001

    for sup_id, count in supplier_po_targets.items():
        # Get pir items for this supplier
        sup_pirs = [p for p in pirs if p["supplier_id"] == sup_id]
        if not sup_pirs:
            continue

        for i in range(count):
            po_id_counter += 1
            gr_id_counter += 1
            inv_id_counter += 1
            qm_id_counter += 1
            del_id_counter += 1

            pir_choice = RNG.choice(sup_pirs)
            mat_id = pir_choice["material_id"]
            
            # Spread POs across the 24-month horizon
            # If SUP-014 (new supplier), only in last 60 days
            if sup_id == "SUP-014":
                days_offset = total_days - RNG.randint(5, 50)
            else:
                days_offset = int((i / max(1, count - 1)) * total_days) + RNG.randint(-5, 5)
                days_offset = max(0, min(total_days - 10, days_offset))

            po_date = start_date + timedelta(days=days_offset)
            planned_lt = pir_choice["standard_lead_time_days"]
            promised_delivery_date = po_date + timedelta(days=planned_lt)

            # Order quantity
            base_qty = 200 if mat_id in ["MAT-001", "MAT-003", "MAT-006"] else 1500
            order_qty = base_qty + RNG.randint(-20, 50)
            unit_price = pir_choice["net_price_eur"]
            if sup_id == "SUP-004" and mat_id == "MAT-003" and po_date >= date(2026, 8, 1):
                unit_price = 118.0
            total_net_value = round(order_qty * unit_price, 2)

            # Performance behavior based on supplier personality
            # SUP-002: Frequent delays (76% OTD)
            # SUP-003: 98% OTD, 0.18% defect
            # SUP-004: Moderate delivery, high quality rejection
            # SUP-009: Deteriorates in last 90 days (after June 2026)
            # SUP-010: High quality defect in last 60 days (after July 2026)
            # SUP-011: Long lead time, ocean freight delay variation
            
            delay_days = 0
            defect_qty = 0
            defect_type = "None"
            
            if sup_id == "SUP-002":
                if RNG.random() < 0.28:
                    delay_days = RNG.randint(3, 14)
                elif RNG.random() < 0.10:
                    delay_days = -1 # early
            elif sup_id == "SUP-003":
                if RNG.random() < 0.02:
                    delay_days = RNG.randint(1, 2)
            elif sup_id == "SUP-004":
                if RNG.random() < 0.15:
                    delay_days = RNG.randint(2, 6)
                if RNG.random() < 0.35: # Quality problem
                    defect_qty = int(order_qty * RNG.uniform(0.02, 0.05))
                    defect_type = "Surface Roughness & Dimensional Out-of-Tolerance"
            elif sup_id == "SUP-009":
                # Deterioration in last 90 days
                if po_date > date(2026, 6, 1):
                    delay_days = RNG.randint(4, 18)
                else:
                    if RNG.random() < 0.06:
                        delay_days = RNG.randint(1, 3)
            elif sup_id == "SUP-010":
                # Quality spike in last 60 days
                if po_date > date(2026, 7, 1):
                    defect_qty = int(order_qty * RNG.uniform(0.03, 0.07))
                    defect_type = "Casting Micro-Porosity & Slag Inclusions"
                else:
                    if RNG.random() < 0.03:
                        defect_qty = 1
            elif sup_id == "SUP-011":
                # Maritime freight buffer
                if RNG.random() < 0.20:
                    delay_days = RNG.randint(4, 12)
            else:
                # Standard supplier distribution
                if RNG.random() < 0.07:
                    delay_days = RNG.randint(1, 4)

            actual_delivery_date = promised_delivery_date + timedelta(days=delay_days)
            on_time = (actual_delivery_date <= promised_delivery_date)
            delivered_qty = order_qty if RNG.random() > 0.04 else (order_qty - RNG.randint(1, 5))

            # Purchase Order Record
            po = {
                "po_number": f"PO-{po_id_counter}",
                "po_item": 10,
                "supplier_id": sup_id,
                "material_id": mat_id,
                "plant_id": "P001",
                "purchasing_org": "1000",
                "purchasing_group": "P01",
                "order_date": po_date.isoformat(),
                "promised_delivery_date": promised_delivery_date.isoformat(),
                "order_quantity": order_qty,
                "net_price_eur": unit_price,
                "total_net_value_eur": total_net_value,
                "currency": "EUR",
                "incoterms": "DAP Munich",
                "status": "Completed",
                "storage_location": "SL01-Main Warehouse"
            }
            purchase_orders.append(po)

            # Goods Receipt Record
            gr = {
                "gr_number": f"GR-{gr_id_counter}",
                "po_number": po["po_number"],
                "po_item": 10,
                "supplier_id": sup_id,
                "material_id": mat_id,
                "plant_id": "P001",
                "posting_date": actual_delivery_date.isoformat(),
                "actual_delivery_date": actual_delivery_date.isoformat(),
                "scheduled_date": promised_delivery_date.isoformat(),
                "quantity_received": delivered_qty,
                "quantity_ordered": order_qty,
                "quantity_variance": delivered_qty - order_qty,
                "days_deviation": delay_days,
                "on_time": on_time,
                "movement_type": "101 (GR for PO into warehouse)",
                "material_document_year": actual_delivery_date.year
            }
            goods_receipts.append(gr)

            # Delivery History Record
            delivery_history.append({
                "delivery_id": f"DEL-{del_id_counter}",
                "supplier_id": sup_id,
                "material_id": mat_id,
                "po_number": po["po_number"],
                "gr_number": gr["gr_number"],
                "scheduled_date": promised_delivery_date.isoformat(),
                "actual_date": actual_delivery_date.isoformat(),
                "delay_days": delay_days,
                "on_time": on_time,
                "root_cause": "Carrier Capacity Shortage" if delay_days > 5 else ("None - On Time" if on_time else "Slight Dispatch Delay")
            })

            # Quality Record
            sample_size = min(50, delivered_qty)
            rejection_rate_pct = round((defect_qty / delivered_qty) * 100, 2) if defect_qty > 0 else 0.0
            quality_records.append({
                "inspection_lot": f"QM-{qm_id_counter}",
                "gr_number": gr["gr_number"],
                "supplier_id": sup_id,
                "material_id": mat_id,
                "inspection_date": (actual_delivery_date + timedelta(days=1)).isoformat(),
                "inspected_quantity": delivered_qty,
                "sample_size": sample_size,
                "defective_quantity": defect_qty,
                "rejection_rate_pct": rejection_rate_pct,
                "ppm": int((defect_qty / delivered_qty) * 1_000_000) if delivered_qty > 0 else 0,
                "defect_type": defect_type,
                "quality_notification_raised": defect_qty > 0,
                "usage_decision": "A (Accepted)" if defect_qty == 0 else ("R (Rejected)" if rejection_rate_pct > 3.0 else "AC (Accepted with Condition)")
            })

            # Invoice Record (SAP 3-Way Match)
            # Slight price variance or freight variance occasionally
            price_variance_eur = 0.0
            if sup_id == "SUP-002" and RNG.random() < 0.15:
                price_variance_eur = round(order_qty * 1.50, 2) # unannounced surcharge

            invoices.append({
                "invoice_number": f"INV-{inv_id_counter}",
                "po_number": po["po_number"],
                "supplier_id": sup_id,
                "posting_date": (actual_delivery_date + timedelta(days=5)).isoformat(),
                "invoice_amount_eur": round(delivered_qty * unit_price + price_variance_eur, 2),
                "expected_amount_eur": round(delivered_qty * unit_price, 2),
                "price_variance_eur": price_variance_eur,
                "match_status": "Matched" if price_variance_eur == 0.0 else "Blocked (Price Variance)",
                "payment_due_date": (actual_delivery_date + timedelta(days=35)).isoformat()
            })

    save_json("purchase_orders.json", purchase_orders)
    save_json("goods_receipts.json", goods_receipts)
    save_json("delivery_history.json", delivery_history)
    save_json("quality_records.json", quality_records)
    save_json("invoices.json", invoices)

    # 11. PRICE HISTORY (24 months monthly price tracking per supplier/material)
    price_history = []
    months_series = [
        "2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03",
        "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09",
        "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03",
        "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"
    ]

    for p in pirs:
        base_p = p["net_price_eur"]
        sup_id = p["supplier_id"]
        mat_id = p["material_id"]

        for idx, m in enumerate(months_series):
            # simulate trend / volatility
            if sup_id == "SUP-004" and mat_id == "MAT-003":
                # Master Prompt Section 10: latest price €118, historical avg €102 (+15.7%)
                recorded_price = 118.0 if idx == len(months_series) - 1 else round(102.0 + RNG.uniform(-0.4, 0.4), 2)
            elif mat_id == "MAT-002": # volatile commodity
                noise = RNG.uniform(-0.35, 0.40)
                recorded_price = round(base_p + noise, 2)
            elif sup_id == "SUP-006": # contract fixed
                noise = 0.0
                recorded_price = round(base_p + noise, 2)
            elif sup_id == "SUP-009" and idx > 18: # recent price bump
                noise = base_p * 0.08
                recorded_price = round(base_p + noise, 2)
            else:
                noise = RNG.uniform(-0.02, 0.03) * base_p
                recorded_price = round(base_p + noise, 2)
            price_history.append({
                "period": m,
                "supplier_id": sup_id,
                "material_id": mat_id,
                "unit_price_eur": recorded_price,
                "benchmark_price_eur": 210.0 if mat_id == "MAT-001" else (4.25 if mat_id == "MAT-002" else 85.5)
            })

    save_json("price_history.json", price_history)

    # 12. RISK EVENTS
    risk_events = [
        {
            "event_id": "RSK-001",
            "supplier_id": "SUP-002",
            "event_type": "Logistics & Transport Disruption",
            "severity": "High",
            "date": "2026-08-15",
            "title": "Persistent Driver Shortage at Katowice Logistics Hub",
            "description": "Cross-border carrier capacity constrained. Average shipment lag increased by 4.2 days.",
            "impact_dimension": "Delivery",
            "active": True
        },
        {
            "event_id": "RSK-002",
            "supplier_id": "SUP-004",
            "event_type": "Quality Audit Non-Conformance",
            "severity": "High",
            "date": "2026-07-20",
            "title": "ISO Re-Certification Audit Minor Non-Conformities",
            "description": "Calibration drifts identified in CNC machining center 3. Elevated surface roughness defect rate.",
            "impact_dimension": "Quality",
            "active": True
        },
        {
            "event_id": "RSK-003",
            "supplier_id": "SUP-007",
            "event_type": "Contract Lifecycle Risk",
            "severity": "Medium",
            "date": "2026-09-01",
            "title": "Outline Agreement Expiration Approaching (<30 Days)",
            "description": "Contract CTR-4600001002 expires 2026-10-25. Lacks automatic renewal clause.",
            "impact_dimension": "Contract",
            "active": True
        },
        {
            "event_id": "RSK-004",
            "supplier_id": "SUP-009",
            "event_type": "Operational Performance Deterioration",
            "severity": "High",
            "date": "2026-08-30",
            "title": "Consecutive Delivery Delays in Q3 2026",
            "description": "On-time delivery performance dropped 20 percentage points over trailing 90 days.",
            "impact_dimension": "Delivery",
            "active": True
        },
        {
            "event_id": "RSK-005",
            "supplier_id": "SUP-010",
            "event_type": "Quality Notification Trend Alert",
            "severity": "High",
            "date": "2026-09-10",
            "title": "Spike in Foundry Micro-Porosity Notifications",
            "description": "Steyr facility reported refractory lining degradation. 3 consecutive batches flagged for inspection.",
            "impact_dimension": "Quality",
            "active": True
        },
        {
            "event_id": "RSK-006",
            "supplier_id": "SUP-011",
            "event_type": "Geopolitical / Maritime Shipping Buffer",
            "severity": "Medium",
            "date": "2026-06-12",
            "title": "Taiwan Strait Container Transit Congestion",
            "description": "Ocean freight dwell times increased. Illustrative customs tariff and freight buffer required.",
            "impact_dimension": "Lead Time / Cost",
            "active": True
        },
        {
            "event_id": "RSK-007",
            "supplier_id": "SUP-013",
            "event_type": "Supplier Concentration Over-Exposure",
            "severity": "Critical",
            "date": "2026-08-01",
            "title": "Spend Concentration Alert: >48% Sourcing Share in GRP-MET",
            "description": "Excessive enterprise reliance on Ruhr Metallwaren for critical blank forgings. Single point of failure.",
            "impact_dimension": "Supplier Concentration",
            "active": True
        },
        {
            "event_id": "RSK-008",
            "supplier_id": "SUP-014",
            "event_type": "Incomplete Historical Evidence",
            "severity": "Medium",
            "date": "2026-08-10",
            "title": "New Supplier Performance Insufficiency",
            "description": "Only 2 historical purchase orders completed. Limited statistical sample size for evaluation.",
            "impact_dimension": "Evidence / Reliability",
            "active": True
        },
        {
            "event_id": "RSK-009",
            "supplier_id": "SUP-015",
            "event_type": "Vendor Master Blocked Status",
            "severity": "Critical",
            "date": "2026-02-15",
            "title": "Vendor Blocked in SAP Master Data for REACH Non-Compliance",
            "description": "Regulatory audit failure. Purchasing block flag active on vendor master.",
            "impact_dimension": "Eligibility",
            "active": True
        }
    ]
    save_json("risk_events.json", risk_events)

    # 13. SUPPLIER PERFORMANCE EVALUATIONS (Periodic SAP-style scorecards)
    supplier_performance = []
    for sup in suppliers:
        s_id = sup["supplier_id"]
        # derive metrics
        sup_pos = [po for po in purchase_orders if po["supplier_id"] == s_id]
        sup_grs = [gr for gr in goods_receipts if gr["supplier_id"] == s_id]
        sup_qms = [qm for qm in quality_records if qm["supplier_id"] == s_id]

        if not sup_grs:
            # e.g. SUP-015
            otd_rate = 0.0
            avg_delay = 0.0
            rejection_rate = 0.0
            overall_score = 0.0
            del_score = 0.0
            q_score = 0.0
            p_score = 0.0
        else:
            on_time_count = sum(1 for g in sup_grs if g["on_time"])
            otd_rate = round((on_time_count / len(sup_grs)) * 100, 1)
            delays = [g["days_deviation"] for g in sup_grs if g["days_deviation"] > 0]
            avg_delay = round(sum(delays) / max(1, len(delays)), 1) if delays else 0.0
            
            total_inspected = sum(q["inspected_quantity"] for q in sup_qms)
            total_defective = sum(q["defective_quantity"] for q in sup_qms)
            rejection_rate = round((total_defective / max(1, total_inspected)) * 100, 2)
            
            # Scores (0 - 100)
            del_score = round(max(30.0, min(100.0, otd_rate * 0.95 + (5 if avg_delay < 2 else -avg_delay * 2))), 1)
            q_score = round(max(20.0, min(100.0, 100.0 - rejection_rate * 15)), 1)
            p_score = 85.0
            overall_score = round(del_score * 0.35 + q_score * 0.35 + p_score * 0.30, 1)

        supplier_performance.append({
            "supplier_id": s_id,
            "evaluation_period": "2025-Q4 to 2026-Q3 (Trailing 12M)",
            "on_time_delivery_rate_pct": otd_rate,
            "average_delay_days": avg_delay,
            "quality_rejection_rate_pct": rejection_rate,
            "total_orders_analyzed": len(sup_pos),
            "total_spend_eur": sum(p["total_net_value_eur"] for p in sup_pos),
            "delivery_score": del_score,
            "quality_score": q_score,
            "price_score": p_score,
            "overall_sap_evaluation_score": overall_score
        })
    save_json("supplier_performance.json", supplier_performance)

    # 14. PURCHASE REQUISITIONS (Open PRs in SAP)
    purchase_requisitions = [
        {
            "pr_number": "PR-100010",
            "pr_item": 10,
            "material_id": "MAT-001",
            "quantity": 10000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "required_date": "2026-10-15",
            "requested_by": "M. Weber (Production Line 2)",
            "status": "Approved / Open for Sourcing",
            "creation_date": "2026-09-15"
        },
        {
            "pr_number": "PR-100011",
            "pr_item": 10,
            "material_id": "MAT-002",
            "quantity": 50000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "required_date": "2026-10-10",
            "requested_by": "J. Becker (Structure Assembly)",
            "status": "Approved / Open for Sourcing",
            "creation_date": "2026-09-18"
        },
        {
            "pr_number": "PR-100012",
            "pr_item": 10,
            "material_id": "MAT-003",
            "quantity": 1200,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P02",
            "required_date": "2026-10-25",
            "requested_by": "Dr. K. Schmidt (Powertrain R&D)",
            "status": "Approved / Open for Sourcing",
            "creation_date": "2026-09-14"
        },
        {
            "pr_number": "PR-100013",
            "pr_item": 10,
            "material_id": "MAT-005",
            "quantity": 5000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P02",
            "required_date": "2026-11-20",
            "requested_by": "E. Braun (Electronics Integration)",
            "status": "Approved / Open for Sourcing",
            "creation_date": "2026-09-12"
        },
        {
            "pr_number": "PR-100014",
            "pr_item": 10,
            "material_id": "MAT-006",
            "quantity": 400,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P03",
            "required_date": "2026-10-30",
            "requested_by": "F. Hoffmann (Engine Block Shop)",
            "status": "Approved / Open for Sourcing",
            "creation_date": "2026-09-10"
        }
    ]
    save_json("purchase_requisitions.json", purchase_requisitions)

    # 15. RFQS (Requests for Quotation)
    rfqs = [
        {
            "rfq_number": "RFQ-600001",
            "pr_number": "PR-100010",
            "material_id": "MAT-001",
            "quantity": 10000,
            "target_plant": "P001",
            "deadline_date": "2026-09-24",
            "status": "Closed / Quotations Received",
            "invited_suppliers": ["SUP-001", "SUP-002", "SUP-003", "SUP-004", "SUP-005", "SUP-006", "SUP-007", "SUP-008", "SUP-011", "SUP-012", "SUP-014", "SUP-016"]
        },
        {
            "rfq_number": "RFQ-600002",
            "pr_number": "PR-100011",
            "material_id": "MAT-002",
            "quantity": 50000,
            "target_plant": "P001",
            "deadline_date": "2026-09-24",
            "status": "Closed / Quotations Received",
            "invited_suppliers": ["SUP-001", "SUP-002", "SUP-008", "SUP-009"]
        }
    ]
    save_json("rfqs.json", rfqs)

    # 16. SUPPLIER QUOTATIONS (Current active quotes received for RFQ-600001 and RFQ-600002)
    # Reflecting realistic synthetic logistics, packaging, and commercial terms
    supplier_quotations = [
        # Quotations for MAT-001 (10,000 units)
        {
            "quotation_id": "QT-70001",
            "rfq_number": "RFQ-600001",
            "supplier_id": "SUP-001",
            "material_id": "MAT-001",
            "quoted_unit_price_eur": 206.00,
            "offered_lead_time_days": 14,
            "synthetic_freight_eur": 4.12, # ~2.0%
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 210.12,
            "valid_until": "2026-11-30",
            "capacity_commitment_units": 20000,
            "notes": "Standard industrial packaging included. Ex-works Duisburg + regular road freight."
        },
        {
            "quotation_id": "QT-70002",
            "rfq_number": "RFQ-600001",
            "supplier_id": "SUP-002",
            "material_id": "MAT-001",
            "quoted_unit_price_eur": 182.00, # Cheapest headline
            "offered_lead_time_days": 18,
            "synthetic_freight_eur": 5.46, # ~3.0%
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 187.46,
            "valid_until": "2026-10-31",
            "capacity_commitment_units": 25000,
            "notes": "Lowest spot quote. Cross-border road transport from Katowice."
        },
        {
            "quotation_id": "QT-70003",
            "rfq_number": "RFQ-600001",
            "supplier_id": "SUP-003",
            "material_id": "MAT-001",
            "quoted_unit_price_eur": 234.00, # Premium price
            "offered_lead_time_days": 10,
            "synthetic_freight_eur": 8.19, # ~3.5%
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 242.19,
            "valid_until": "2026-12-15",
            "capacity_commitment_units": 15000,
            "notes": "Includes 100% CMM inspection certificate and nitrogen packaging."
        },
        {
            "quotation_id": "QT-70004",
            "rfq_number": "RFQ-600001",
            "supplier_id": "SUP-004",
            "material_id": "MAT-001",
            "quoted_unit_price_eur": 191.00,
            "offered_lead_time_days": 15,
            "synthetic_freight_eur": 7.64, # ~4.0%
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 198.64,
            "valid_until": "2026-10-31",
            "capacity_commitment_units": 18000,
            "notes": "FOB Gothenburg/Stockholm consolidated ferry transport."
        },
        {
            "quotation_id": "QT-70005",
            "rfq_number": "RFQ-600001",
            "supplier_id": "SUP-005",
            "material_id": "MAT-001",
            "quoted_unit_price_eur": 214.00,
            "offered_lead_time_days": 11,
            "synthetic_freight_eur": 6.85, # ~3.2%
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 220.85,
            "valid_until": "2026-11-15",
            "capacity_commitment_units": 11000, # capacity constraint!
            "notes": "High reliability, but max capacity strictly limited to 11k units this batch."
        },
        {
            "quotation_id": "QT-70006",
            "rfq_number": "RFQ-600001",
            "supplier_id": "SUP-006",
            "material_id": "MAT-001",
            "quoted_unit_price_eur": 198.00, # Contract agreed baseline
            "offered_lead_time_days": 12,
            "synthetic_freight_eur": 3.96, # ~2.0%
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": -11.29, # Contract discount (5.7%)
            "effective_unit_cost_eur": 190.67,
            "valid_until": "2027-12-31",
            "capacity_commitment_units": 35000,
            "notes": "Master Outline Contract CTR-4600001001 conditions applied automatically."
        },
        {
            "quotation_id": "QT-70007",
            "rfq_number": "RFQ-600001",
            "supplier_id": "SUP-007",
            "material_id": "MAT-001",
            "quoted_unit_price_eur": 204.00,
            "offered_lead_time_days": 14,
            "synthetic_freight_eur": 5.10, # ~2.5%
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": -6.12, # Contract discount (3.0%)
            "effective_unit_cost_eur": 202.98,
            "valid_until": "2026-10-25", # Contract expiry limit!
            "capacity_commitment_units": 15000,
            "notes": "Expiring contract CTR-4600001002 terms. Valid only until 2026-10-25."
        },
        {
            "quotation_id": "QT-70008",
            "rfq_number": "RFQ-600001",
            "supplier_id": "SUP-008",
            "material_id": "MAT-001",
            "quoted_unit_price_eur": 209.00,
            "offered_lead_time_days": 12,
            "synthetic_freight_eur": 9.40, # ~4.5%
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 218.40,
            "valid_until": "2026-12-31",
            "capacity_commitment_units": 40000,
            "notes": "Reliable tier-1 capacity from Bilbao foundry."
        },
        {
            "quotation_id": "QT-70009",
            "rfq_number": "RFQ-600001",
            "supplier_id": "SUP-011",
            "material_id": "MAT-001",
            "quoted_unit_price_eur": 168.00, # Foreign low quote
            "offered_lead_time_days": 42, # Long lead time
            "synthetic_freight_eur": 12.60, # 7.5% maritime logistics
            "synthetic_customs_eur": 8.06,  # 4.8% synthetic import duty
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 188.66,
            "valid_until": "2026-11-30",
            "capacity_commitment_units": 80000,
            "notes": "FOB Keelung. Demonstrates synthetic import tariff & ocean freight adjustment."
        },
        {
            "quotation_id": "QT-70010",
            "rfq_number": "RFQ-600001",
            "supplier_id": "SUP-012",
            "material_id": "MAT-001",
            "quoted_unit_price_eur": 240.00, # High Swiss quality
            "offered_lead_time_days": 7,  # Fast delivery
            "synthetic_freight_eur": 7.20, # 3.0%
            "synthetic_customs_eur": 2.88, # 1.2% customs clearance
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 250.08,
            "valid_until": "2026-12-31",
            "capacity_commitment_units": 12000,
            "notes": "Express road corridor from Winterthur. Guaranteed 7-day dock delivery."
        },
        {
            "quotation_id": "QT-70011",
            "rfq_number": "RFQ-600001",
            "supplier_id": "SUP-014",
            "material_id": "MAT-001",
            "quoted_unit_price_eur": 188.00, # New supplier
            "offered_lead_time_days": 16,
            "synthetic_freight_eur": 7.14,
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 195.14,
            "valid_until": "2026-10-31",
            "capacity_commitment_units": 10000,
            "notes": "Introductory quotation for new onboarding evaluation."
        },
        {
            "quotation_id": "QT-70012",
            "rfq_number": "RFQ-600001",
            "supplier_id": "SUP-016",
            "material_id": "MAT-001",
            "quoted_unit_price_eur": 211.00,
            "offered_lead_time_days": 13,
            "synthetic_freight_eur": 4.22,
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 215.22,
            "valid_until": "2026-12-15",
            "capacity_commitment_units": 16000,
            "notes": "Secondary source quote for quota allocation support."
        },
        # Fasteners quotes (RFQ-600002)
        {
            "quotation_id": "QT-70020",
            "rfq_number": "RFQ-600002",
            "supplier_id": "SUP-001",
            "material_id": "MAT-002",
            "quoted_unit_price_eur": 4.18,
            "offered_lead_time_days": 7,
            "synthetic_freight_eur": 0.08,
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 4.26,
            "valid_until": "2026-11-30",
            "capacity_commitment_units": 100000,
            "notes": "Euro pallets wrapped, immediate dispatch."
        },
        {
            "quotation_id": "QT-70021",
            "rfq_number": "RFQ-600002",
            "supplier_id": "SUP-002",
            "material_id": "MAT-002",
            "quoted_unit_price_eur": 3.65,
            "offered_lead_time_days": 12,
            "synthetic_freight_eur": 0.11,
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 3.76,
            "valid_until": "2026-10-31",
            "capacity_commitment_units": 120000,
            "notes": "Aggressive spot price for bulk fastener lot."
        },
        {
            "quotation_id": "QT-70022",
            "rfq_number": "RFQ-600002",
            "supplier_id": "SUP-009",
            "material_id": "MAT-002",
            "quoted_unit_price_eur": 3.88,
            "offered_lead_time_days": 15,
            "synthetic_freight_eur": 0.12,
            "synthetic_customs_eur": 0.0,
            "contractual_rebate_eur": 0.0,
            "effective_unit_cost_eur": 4.00,
            "valid_until": "2026-11-15",
            "capacity_commitment_units": 80000,
            "notes": "Lead time extended to 15 days due to logistics bottleneck."
        }
    ]
    save_json("supplier_quotations.json", supplier_quotations)

    # 17. PROCUREMENT REQUIREMENTS (14 realistic requirement profiles matching scenarios)
    procurement_requirements = [
        {
            "requirement_id": "REQ-001",
            "title": "Standard Sourcing: Hydraulic Valves 10k units",
            "material_id": "MAT-001",
            "quantity": 10000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "required_date": "2026-10-15",
            "currency": "EUR",
            "business_priority": "Balanced",
            "selection_mode": "Single Supplier",
            "quality_criticality": "Normal",
            "delivery_criticality": "Normal",
            "cost_sensitivity": "Medium",
            "max_acceptable_lead_time_days": 21,
            "preferred_trade_zone": "EU",
            "contract_preference": "Consider Active Contracts",
            "associated_scenario_id": "SCEN-01"
        },
        {
            "requirement_id": "REQ-002",
            "title": "Emergency Fast-Track Delivery: Hydraulic Valves",
            "material_id": "MAT-001",
            "quantity": 3000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "required_date": "2026-10-06", # 7 days away
            "currency": "EUR",
            "business_priority": "Delivery-Focused",
            "selection_mode": "Single Supplier",
            "quality_criticality": "High",
            "delivery_criticality": "Critical (Strict Deadline)",
            "cost_sensitivity": "Low",
            "max_acceptable_lead_time_days": 8,
            "preferred_trade_zone": "Any",
            "contract_preference": "Any",
            "associated_scenario_id": "SCEN-02"
        },
        {
            "requirement_id": "REQ-003",
            "title": "Ultra-High Reliability Assembly: Ceramic Bearings",
            "material_id": "MAT-003",
            "quantity": 1200,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P02",
            "required_date": "2026-10-25",
            "currency": "EUR",
            "business_priority": "Quality-Critical",
            "selection_mode": "Single Supplier",
            "quality_criticality": "Extreme (Zero Defect)",
            "delivery_criticality": "High",
            "cost_sensitivity": "Low",
            "max_acceptable_lead_time_days": 25,
            "preferred_trade_zone": "EU/EFTA",
            "contract_preference": "Active Preferred",
            "associated_scenario_id": "SCEN-03"
        },
        {
            "requirement_id": "REQ-004",
            "title": "Risk-Shielded Sourcing: High-Stress Components",
            "material_id": "MAT-001",
            "quantity": 8000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "required_date": "2026-10-20",
            "currency": "EUR",
            "business_priority": "Risk-Sensitive",
            "selection_mode": "Single Supplier",
            "quality_criticality": "High",
            "delivery_criticality": "High",
            "cost_sensitivity": "Medium",
            "max_acceptable_lead_time_days": 18,
            "preferred_trade_zone": "EU",
            "contract_preference": "Active Preferred",
            "associated_scenario_id": "SCEN-04"
        },
        {
            "requirement_id": "REQ-005",
            "title": "Contract Optimization: Framework Valve Sourcing",
            "material_id": "MAT-001",
            "quantity": 12000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "required_date": "2026-10-18",
            "currency": "EUR",
            "business_priority": "Contract-Focused",
            "selection_mode": "Single Supplier",
            "quality_criticality": "Normal",
            "delivery_criticality": "Normal",
            "cost_sensitivity": "High",
            "max_acceptable_lead_time_days": 20,
            "preferred_trade_zone": "EU",
            "contract_preference": "Require Active Outline Contract",
            "associated_scenario_id": "SCEN-05"
        },
        {
            "requirement_id": "REQ-006",
            "title": "Long-Term Supply Planning: Expiring Contract Risk",
            "material_id": "MAT-001",
            "quantity": 10000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "required_date": "2026-11-15",
            "currency": "EUR",
            "business_priority": "Balanced",
            "selection_mode": "Single Supplier",
            "quality_criticality": "Normal",
            "delivery_criticality": "Normal",
            "cost_sensitivity": "Medium",
            "max_acceptable_lead_time_days": 21,
            "preferred_trade_zone": "EU",
            "contract_preference": "Contract Valid Through Fulfillment Date",
            "associated_scenario_id": "SCEN-06"
        },
        {
            "requirement_id": "REQ-007",
            "title": "Commodity Fastener Replenishment: Price Volatility",
            "material_id": "MAT-002",
            "quantity": 50000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "required_date": "2026-10-10",
            "currency": "EUR",
            "business_priority": "Cost-Focused",
            "selection_mode": "Single Supplier",
            "quality_criticality": "Normal",
            "delivery_criticality": "Normal",
            "cost_sensitivity": "Extreme",
            "max_acceptable_lead_time_days": 14,
            "preferred_trade_zone": "EU",
            "contract_preference": "Any",
            "associated_scenario_id": "SCEN-07"
        },
        {
            "requirement_id": "REQ-008",
            "title": "Strict Plant Delivery Window: Engine Assembly",
            "material_id": "MAT-001",
            "quantity": 5000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "required_date": "2026-10-08",
            "currency": "EUR",
            "business_priority": "Delivery-Focused",
            "selection_mode": "Single Supplier",
            "quality_criticality": "Normal",
            "delivery_criticality": "Critical",
            "cost_sensitivity": "Medium",
            "max_acceptable_lead_time_days": 9,
            "preferred_trade_zone": "EU",
            "contract_preference": "Any",
            "associated_scenario_id": "SCEN-08"
        },
        {
            "requirement_id": "REQ-009",
            "title": "Foundry Quality Rigor: Cast Crankshaft Blank",
            "material_id": "MAT-006",
            "quantity": 400,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P03",
            "required_date": "2026-11-01",
            "currency": "EUR",
            "business_priority": "Quality-Critical",
            "selection_mode": "Single Supplier",
            "quality_criticality": "Critical",
            "delivery_criticality": "High",
            "cost_sensitivity": "Low",
            "max_acceptable_lead_time_days": 35,
            "preferred_trade_zone": "EU",
            "contract_preference": "Any",
            "associated_scenario_id": "SCEN-09"
        },
        {
            "requirement_id": "REQ-010",
            "title": "Global Semiconductor Sourcing: Microcontroller MCU-88",
            "material_id": "MAT-005",
            "quantity": 5000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P02",
            "required_date": "2026-11-20",
            "currency": "USD",
            "business_priority": "Balanced",
            "selection_mode": "Single Supplier",
            "quality_criticality": "High",
            "delivery_criticality": "Medium",
            "cost_sensitivity": "High",
            "max_acceptable_lead_time_days": 50,
            "preferred_trade_zone": "Global / Non-EU",
            "contract_preference": "Any",
            "associated_scenario_id": "SCEN-10"
        },
        {
            "requirement_id": "REQ-011",
            "title": "De-Risking Sourcing: Forged Components Diversity",
            "material_id": "MAT-006",
            "quantity": 600,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P03",
            "required_date": "2026-11-10",
            "currency": "EUR",
            "business_priority": "Risk-Sensitive",
            "selection_mode": "Single Supplier",
            "quality_criticality": "High",
            "delivery_criticality": "High",
            "cost_sensitivity": "Medium",
            "max_acceptable_lead_time_days": 35,
            "preferred_trade_zone": "EU",
            "contract_preference": "Any",
            "associated_scenario_id": "SCEN-11"
        },
        {
            "requirement_id": "REQ-012",
            "title": "Dual-Sourcing Quota Allocation: Hydraulic Control",
            "material_id": "MAT-001",
            "quantity": 20000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "required_date": "2026-10-20",
            "currency": "EUR",
            "business_priority": "Balanced",
            "selection_mode": "Multi-Supplier Allocation (Quota)",
            "quality_criticality": "High",
            "delivery_criticality": "High",
            "cost_sensitivity": "Medium",
            "max_acceptable_lead_time_days": 20,
            "preferred_trade_zone": "EU",
            "contract_preference": "Quota Arrangement Compliant",
            "associated_scenario_id": "SCEN-12"
        },
        {
            "requirement_id": "REQ-013",
            "title": "New Vendor Qualification: Baltic Valve Assessment",
            "material_id": "MAT-001",
            "quantity": 1000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "required_date": "2026-10-25",
            "currency": "EUR",
            "business_priority": "Balanced",
            "selection_mode": "Single Supplier",
            "quality_criticality": "Normal",
            "delivery_criticality": "Normal",
            "cost_sensitivity": "High",
            "max_acceptable_lead_time_days": 25,
            "preferred_trade_zone": "EU",
            "contract_preference": "Any",
            "associated_scenario_id": "SCEN-13"
        },
        {
            "requirement_id": "REQ-014",
            "title": "Supplier Deterioration Detection: Fastener Lot",
            "material_id": "MAT-002",
            "quantity": 30000,
            "plant_id": "P001",
            "purchasing_org": "1000",
            "purchasing_group": "P01",
            "required_date": "2026-10-15",
            "currency": "EUR",
            "business_priority": "Delivery-Focused",
            "selection_mode": "Single Supplier",
            "quality_criticality": "Normal",
            "delivery_criticality": "Critical",
            "cost_sensitivity": "Medium",
            "max_acceptable_lead_time_days": 10,
            "preferred_trade_zone": "EU",
            "contract_preference": "Any",
            "associated_scenario_id": "SCEN-14"
        }
    ]
    save_json("procurement_requirements.json", procurement_requirements)

    # 18. SCENARIO DEFINITIONS (All 14 Scenarios from Prompt Section 10)
    scenarios = [
        {
            "scenario_id": "SCEN-01",
            "scenario_number": 1,
            "title": "Cheapest Supplier vs Best Overall Value",
            "description": "Lowest headline price is offered by SUP-002, but historical delivery delays and risk signals make balanced options (SUP-006 / SUP-001) more prudent.",
            "recommended_priority": "Balanced",
            "weights": {
                "price": 0.25,
                "delivery": 0.25,
                "quality": 0.20,
                "lead_time": 0.15,
                "contract": 0.10,
                "risk": 0.05
            },
            "requirement_id": "REQ-001",
            "key_trade_off": "Unit price savings of €16 vs 24% historical delivery delay risk."
        },
        {
            "scenario_id": "SCEN-02",
            "scenario_number": 2,
            "title": "Best Delivery Reliability & Rapid Lead Time",
            "description": "Urgent timeline favors suppliers with high on-time delivery rates and low lead times (SUP-012, SUP-003, SUP-005) even at higher prices.",
            "recommended_priority": "Delivery-Focused",
            "weights": {
                "price": 0.10,
                "delivery": 0.40,
                "quality": 0.20,
                "lead_time": 0.20,
                "contract": 0.05,
                "risk": 0.05
            },
            "requirement_id": "REQ-002",
            "key_trade_off": "Premium unit cost accepted to secure 7-day delivery and 98.9% OTD guarantee."
        },
        {
            "scenario_id": "SCEN-03",
            "scenario_number": 3,
            "title": "Best Quality Record for Critical Production Component",
            "description": "Critical powertrain bearings require minimal defect tolerance. SUP-003 offers 0.18% historical defect rate compared to industry 1.5% average.",
            "recommended_priority": "Quality-Critical",
            "weights": {
                "price": 0.10,
                "delivery": 0.20,
                "quality": 0.45,
                "lead_time": 0.10,
                "contract": 0.10,
                "risk": 0.05
            },
            "requirement_id": "REQ-003",
            "key_trade_off": "Quality scoring heavily weighted to avoid downstream manufacturing downtime."
        },
        {
            "scenario_id": "SCEN-04",
            "scenario_number": 4,
            "title": "Cheapest but High Risk: Avoiding Flawed Sourcing",
            "description": "Engine detects operational and quality risk signals on SUP-002 and SUP-004, suppressing them in favor of certified stable partners.",
            "recommended_priority": "Risk-Sensitive",
            "weights": {
                "price": 0.15,
                "delivery": 0.20,
                "quality": 0.25,
                "lead_time": 0.10,
                "contract": 0.10,
                "risk": 0.20
            },
            "requirement_id": "REQ-004",
            "key_trade_off": "Risk penalties prevent recommendation of unreliable low-cost vendors."
        },
        {
            "scenario_id": "SCEN-05",
            "scenario_number": 5,
            "title": "Existing Contract Advantage (Outline Agreement Synergy)",
            "description": "SUP-006 holds active master agreement CTR-4600001001 with 5.7% volume rebate, making effective procurement cost lower than uncommitted spot quotes.",
            "recommended_priority": "Contract-Focused",
            "weights": {
                "price": 0.20,
                "delivery": 0.20,
                "quality": 0.15,
                "lead_time": 0.10,
                "contract": 0.30,
                "risk": 0.05
            },
            "requirement_id": "REQ-005",
            "key_trade_off": "Contractual framework utilization reduces maverick buying and lowers effective landed cost."
        },
        {
            "scenario_id": "SCEN-06",
            "scenario_number": 6,
            "title": "Contract Expiring (<30 Days Lifecycle Alert)",
            "description": "SUP-007 offers an attractive price, but contract CTR-4600001002 expires 2026-10-25. Engine surfaces contract lifecycle warning.",
            "recommended_priority": "Balanced",
            "weights": {
                "price": 0.25,
                "delivery": 0.25,
                "quality": 0.20,
                "lead_time": 0.15,
                "contract": 0.10,
                "risk": 0.05
            },
            "requirement_id": "REQ-006",
            "key_trade_off": "Immediate sourcing vs risk of unpriced delivery if shipment extends past contract cutoff."
        },
        {
            "scenario_id": "SCEN-07",
            "scenario_number": 7,
            "title": "Price Volatility & Historical Band Analysis",
            "description": "Fasteners subject to steel price movement. Compares current supplier quotes with 24-month historical price distributions.",
            "recommended_priority": "Cost-Focused",
            "weights": {
                "price": 0.45,
                "delivery": 0.20,
                "quality": 0.15,
                "lead_time": 0.10,
                "contract": 0.05,
                "risk": 0.05
            },
            "requirement_id": "REQ-007",
            "key_trade_off": "Maximizing commercial savings within acceptable delivery tolerance."
        },
        {
            "scenario_id": "SCEN-08",
            "scenario_number": 8,
            "title": "Delivery Deadline Critical (Strict Factory Milestone)",
            "description": "Strict required delivery date of Oct 8, 2026 eliminates suppliers with >9 day lead times regardless of price discounts.",
            "recommended_priority": "Delivery-Focused",
            "weights": {
                "price": 0.10,
                "delivery": 0.45,
                "quality": 0.15,
                "lead_time": 0.25,
                "contract": 0.02,
                "risk": 0.03
            },
            "requirement_id": "REQ-008",
            "key_trade_off": "Delivery speed and guaranteed on-dock compliance overrule unit pricing."
        },
        {
            "scenario_id": "SCEN-09",
            "scenario_number": 9,
            "title": "Quality-Critical Production Material (Foundry Blanks)",
            "description": "Material MAT-006 flagged as quality sensitive. High defect penalties disqualify SUP-010 due to recent foundry micro-porosity issues.",
            "recommended_priority": "Quality-Critical",
            "weights": {
                "price": 0.10,
                "delivery": 0.15,
                "quality": 0.50,
                "lead_time": 0.10,
                "contract": 0.05,
                "risk": 0.10
            },
            "requirement_id": "REQ-009",
            "key_trade_off": "Zero defect tolerance outweighs regional transport convenience."
        },
        {
            "scenario_id": "SCEN-10",
            "scenario_number": 10,
            "title": "Imported International Supplier (Synthetic Landed Cost)",
            "description": "SUP-011 (Taiwan) has lowest quote ($32.50), but engine adds synthetic ocean freight (7.5%) and synthetic import duty (4.8%) to calculate true effective landed cost.",
            "recommended_priority": "Balanced",
            "weights": {
                "price": 0.30,
                "delivery": 0.20,
                "quality": 0.20,
                "lead_time": 0.15,
                "contract": 0.05,
                "risk": 0.10
            },
            "requirement_id": "REQ-010",
            "key_trade_off": "Headline quote vs true landed cost including synthetic customs and maritime lead times."
        },
        {
            "scenario_id": "SCEN-11",
            "scenario_number": 11,
            "title": "Supplier Spend Concentration De-Risking",
            "description": "Ruhr Metallwaren (SUP-013) holds >48% of spend in material group. Engine applies concentration penalty to prevent single-supplier lock-in.",
            "recommended_priority": "Risk-Sensitive",
            "weights": {
                "price": 0.15,
                "delivery": 0.20,
                "quality": 0.20,
                "lead_time": 0.10,
                "contract": 0.10,
                "risk": 0.25
            },
            "requirement_id": "REQ-011",
            "key_trade_off": "Diversifying supplier base even if incumbent holds standard pricing."
        },
        {
            "scenario_id": "SCEN-12",
            "scenario_number": 12,
            "title": "Multi-Supplier Allocation (Quota Arrangement)",
            "description": "Large 20,000 unit batch exceeds single supplier capacity or concentration limits. Engine splits allocation (50% SUP-006, 30% SUP-008, 20% SUP-016).",
            "recommended_priority": "Balanced",
            "weights": {
                "price": 0.25,
                "delivery": 0.25,
                "quality": 0.20,
                "lead_time": 0.15,
                "contract": 0.10,
                "risk": 0.05
            },
            "requirement_id": "REQ-012",
            "key_trade_off": "Dual/triple sourcing safeguards supply continuity against individual line bottlenecks."
        },
        {
            "scenario_id": "SCEN-13",
            "scenario_number": 13,
            "title": "New Supplier with Limited Evidence (Sparse History)",
            "description": "SUP-014 offers attractive pricing, but system flags evidence insufficiency (only 2 historical orders), applying confidence discount.",
            "recommended_priority": "Balanced",
            "weights": {
                "price": 0.25,
                "delivery": 0.25,
                "quality": 0.20,
                "lead_time": 0.15,
                "contract": 0.10,
                "risk": 0.05
            },
            "requirement_id": "REQ-013",
            "key_trade_off": "Encouraging vendor diversification vs mitigating risk of unproven execution."
        },
        {
            "scenario_id": "SCEN-14",
            "scenario_number": 14,
            "title": "Recent Performance Deterioration Detection",
            "description": "SUP-009 had strong 2-year average OTD (92%), but trailing 90 days dropped to 74%. Dynamic trend detection down-ranks the supplier.",
            "recommended_priority": "Delivery-Focused",
            "weights": {
                "price": 0.15,
                "delivery": 0.40,
                "quality": 0.20,
                "lead_time": 0.15,
                "contract": 0.05,
                "risk": 0.05
            },
            "requirement_id": "REQ-014",
            "key_trade_off": "Weighting recent trailing 90-day trajectory over static multi-year averages."
        }
    ]
    save_json("scenario_definitions.json", scenarios)

    print("\nAll 22 mock procurement datasets successfully generated with referential integrity!")

if __name__ == "__main__":
    run_generator()
