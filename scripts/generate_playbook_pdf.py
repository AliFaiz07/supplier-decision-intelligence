"""
Generate the Complete Product Walkthrough & Demo Playbook PDF for Supplier Decision Intelligence.
Uses Playwright to render high-fidelity enterprise styled PDF to C:\\Users\\ali\\Downloads.
"""

import os
import asyncio
from playwright.async_api import async_playwright

OUTPUT_DIR = r"C:\Users\ali\Downloads"
OUTPUT_PDF = os.path.join(OUTPUT_DIR, "Supplier_Decision_Intelligence_Walkthrough_Playbook.pdf")

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Supplier Decision Intelligence — Complete Product Walkthrough & Demo Playbook</title>
<style>
  @page {
    size: A4;
    margin: 20mm 16mm 20mm 16mm;
  }
  
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.5;
    font-size: 10pt;
    margin: 0;
    padding: 0;
  }

  .cover-page {
    page-break-after: always;
    padding-top: 40px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cover-header {
    border-bottom: 3px solid #0066cc;
    padding-bottom: 24px;
  }

  .cover-badge {
    display: inline-block;
    background-color: #e0f2fe;
    color: #0369a1;
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 4px 12px;
    border-radius: 9999px;
    margin-bottom: 16px;
    border: 1px solid #bae6fd;
  }

  .cover-title {
    font-size: 26pt;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.15;
    margin: 0 0 12px 0;
  }

  .cover-subtitle {
    font-size: 13pt;
    color: #475569;
    margin: 0;
    font-weight: 400;
    line-height: 1.4;
  }

  .cover-meta {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 18px 24px;
    margin-top: 36px;
  }

  .cover-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    font-size: 9.5pt;
  }

  .cover-meta-label {
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    font-size: 8pt;
    letter-spacing: 0.03em;
  }

  .cover-meta-val {
    color: #0f172a;
    font-weight: 600;
  }

  .cover-toc {
    margin-top: 32px;
    border-left: 3px solid #cbd5e1;
    padding-left: 18px;
  }

  .cover-toc h3 {
    margin: 0 0 10px 0;
    font-size: 11pt;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cover-toc ul {
    margin: 0;
    padding-left: 16px;
    font-size: 9pt;
    color: #475569;
    line-height: 1.6;
  }

  .cover-footer {
    border-top: 1px solid #e2e8f0;
    padding-top: 16px;
    font-size: 8.5pt;
    color: #64748b;
    display: flex;
    justify-content: space-between;
  }

  h1 {
    font-size: 18pt;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 2px solid #0066cc;
    padding-bottom: 6px;
    margin-top: 32px;
    margin-bottom: 16px;
    page-break-after: avoid;
  }

  h2 {
    font-size: 13pt;
    font-weight: 700;
    color: #1e3a8a;
    margin-top: 24px;
    margin-bottom: 12px;
    page-break-after: avoid;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
  }

  h3 {
    font-size: 11pt;
    font-weight: 700;
    color: #0f172a;
    margin-top: 16px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }

  p {
    margin: 0 0 10px 0;
  }

  .chapter-box {
    margin-bottom: 28px;
    page-break-inside: avoid;
  }

  .step-header {
    background-color: #f1f5f9;
    border-left: 4px solid #0066cc;
    padding: 8px 14px;
    margin-bottom: 12px;
    border-radius: 0 6px 6px 0;
  }

  .step-title {
    font-size: 11.5pt;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .step-subtitle {
    font-size: 9pt;
    color: #64748b;
    margin: 2px 0 0 0;
  }

  /* 5-PART STRUCTURE STYLING */
  .section-action {
    background-color: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 10px;
  }

  .section-label {
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .label-action { color: #0284c7; }
  .label-sees { color: #475569; }
  .label-system { color: #0d9488; }
  .label-ai { color: #7c3aed; }
  .label-pitch { color: #b45309; }

  .action-list {
    margin: 4px 0 0 0;
    padding-left: 20px;
  }

  .action-list li {
    margin-bottom: 3px;
    font-size: 9.5pt;
  }

  .callout-sees {
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 10px;
    font-size: 9.5pt;
  }

  .callout-system {
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 10px;
    font-size: 9.5pt;
  }

  .callout-ai {
    background-color: #faf5ff;
    border: 1px solid #e9d5ff;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 10px;
    font-size: 9.5pt;
  }

  .callout-pitch {
    background-color: #fffbeb;
    border: 1px solid #fde68a;
    border-left: 4px solid #d97706;
    border-radius: 0 6px 6px 0;
    padding: 10px 14px;
    margin-bottom: 16px;
    font-size: 9.5pt;
    font-style: italic;
    color: #78350f;
  }

  /* TABLES */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 20px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
  }

  th {
    background-color: #0f172a;
    color: #ffffff;
    font-weight: 600;
    text-align: left;
    padding: 6px 8px;
    border: 1px solid #334155;
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  td {
    padding: 6px 8px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  .badge {
    display: inline-block;
    padding: 2px 6px;
    font-size: 7.5pt;
    font-weight: 700;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .badge-success { background-color: #dcfce7; color: #15803d; }
  .badge-warning { background-color: #fef3c7; color: #b45309; }
  .badge-danger { background-color: #fee2e2; color: #b91c1c; }
  .badge-info { background-color: #e0f2fe; color: #0369a1; }
  .badge-purple { background-color: #f3e8ff; color: #7e22ce; }

  .qa-box {
    margin-bottom: 12px;
    page-break-inside: avoid;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 10px;
  }

  .qa-q {
    font-weight: 700;
    color: #0f172a;
    font-size: 9.5pt;
    margin-bottom: 3px;
  }

  .qa-a {
    color: #334155;
    font-size: 9pt;
    margin: 0;
    line-height: 1.45;
  }

  .formula-box {
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 14px;
    font-family: "Courier New", Courier, monospace;
    font-size: 8.5pt;
    margin: 8px 0;
    color: #0f172a;
  }

  .page-break {
    page-break-after: always;
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
  <div class="cover-header">
    <div class="cover-badge">Enterprise Executive Playbook · Light Enterprise UX</div>
    <h1 class="cover-title">Supplier Decision Intelligence</h1>
    <p class="cover-subtitle">Complete End-to-End Product Walkthrough, Architectural Deep-Dive & Manager Demo Playbook</p>
  </div>

  <div class="cover-meta">
    <div class="cover-meta-grid">
      <div>
        <div class="cover-meta-label">System of Record</div>
        <div class="cover-meta-val">SAP S/4HANA / Enterprise ERP Coexistence</div>
      </div>
      <div>
        <div class="cover-meta-label">Target Plant & Scope</div>
        <div class="cover-meta-val">Plant P001 · Munich Assembly Works</div>
      </div>
      <div>
        <div class="cover-meta-label">Benchmark Material</div>
        <div class="cover-meta-val">MAT-001 (Hydraulic Directional Valve HSV-40)</div>
      </div>
      <div>
        <div class="cover-meta-label">Execution Baseline</div>
        <div class="cover-meta-val">Zero CLI / Server Already Active (Local Port 5173 / 8000)</div>
      </div>
    </div>
  </div>

  <div class="cover-toc">
    <h3>Executive Table of Contents</h3>
    <ul>
      <li><strong>Part I: Master End-to-End User Journey (Chapters 1 – 27)</strong> — Every user action, system internal process, deterministic vs. AI boundary, and 20–40s manager explanation.</li>
      <li><strong>Part II: 20-Minute Executive Manager Demo Script</strong> — Minute-by-minute live presentation guide with exact clicks and narrative pitches.</li>
      <li><strong>Part III: End-to-End Architecture & Data Flow</strong> — Complete technical lineage from demand intake to closed-loop memory.</li>
      <li><strong>Part IV: Deterministic vs. AI Separation Table</strong> — Unambiguous division of mathematical calculations vs. natural language synthesis.</li>
      <li><strong>Part V: Canonical Data Architecture (22 Datasets)</strong> — Mapping of ERP tables and data files powering the intelligence suite.</li>
      <li><strong>Part VI: Fully Worked Sourcing Benchmark Example</strong> — Empirical 4-candidate comparison for MAT-001 with true landed costs.</li>
      <li><strong>Part VII: Executive Manager Q&A (25 Questions & Answers)</strong> — Defending value, AI grounding, auditability, and ROI.</li>
      <li><strong>Part VIII: Executive Summaries & SAP Positioning</strong> — 30-second and 2-minute elevator pitches for leadership.</li>
      <li><strong>Part IX: Complete Procurement Lifecycle Summary</strong> — 15-stage end-to-end operational continuum.</li>
    </ul>
  </div>

  <div class="cover-footer">
    <span>Supplier Decision Intelligence Platform · Release v1.0.0</span>
    <span>Confidential · Strategic Procurement Operations</span>
  </div>
</div>

<!-- PART I: MASTER JOURNEY -->
<h1>Part I: Master End-to-End User Journey (Chapters 1 – 27)</h1>
<p style="font-size: 9.5pt; color: #475569;">
This user journey demonstrates the complete procurement decision lifecycle for a strategic sourcing requirement: 
<strong>10,000 units of Material MAT-001 (Hydraulic Directional Control Valve HSV-40)</strong> for <strong>Plant P001 (Munich Assembly)</strong> needed by <strong>15 October 2026</strong> under a <strong>Balanced Sourcing Strategy</strong>.
Every step adheres strictly to a 5-part structure: (A) User Action, (B) What User Sees, (C) Behind the Scenes, (D) Deterministic vs AI, and (E) Manager Script.
</p>

<!-- CHAPTER 1 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapter 1 — Application Entry</div>
    <div class="step-subtitle">Accessing the Enterprise Workspace Shell</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>Open your desktop web browser to the application workspace URL (<code>http://localhost:5173</code>).</li>
      <li>Observe the top application header: universal search field (<code>Ctrl K</code>), AI Insights button, reload button, and active user profile <em>"Amit Sharma · Lead Strategic Buyer · Plant P001"</em>.</li>
      <li>Ensure the Left Sidebar is expanded and the default view <strong>Procurement Overview</strong> is active.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>A bright, professional SAP Morning Horizon Light enterprise canvas with zero dark-mode clutter. Top navigation bar with quick global search, active notifications, and a Left Sidebar displaying 7 core operational hubs: <em>Procurement Overview, Sourcing Workspace, Decisions Hub, Supplier Intelligence, Intelligence Hub, Data Explorer, and System Configuration</em>.</p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p>The frontend concurrently queries <code>/api/overview</code>, <code>/api/suppliers</code>, <code>/api/requirements</code>, and <code>/api/analytics/early-warning</code>. The backend in-memory cache resolves 22 canonical procurement tables, performing cross-table relational validations (PO items, GR documents, QM lots, and outline contracts) in &lt;60ms without database roundtrip latency.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> Master data loading, user profile scope, navigation routing, and KPI card summations are 100% deterministic arithmetic. <strong>AI:</strong> None at entry point.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "What you are looking at is an AI-augmented decision workspace that sits directly above SAP S/4HANA. Rather than forcing buyers to toggle between 15 disparate SAP transaction codes, this workspace unifies ERP transactional ledgers into a single, intuitive cockpit for strategic category managers."
  </div>
</div>

<!-- CHAPTER 2 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapter 2 — Procurement Overview</div>
    <div class="step-subtitle">The 30-Second Executive Status Glance</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>Scan the top 4 executive KPI summary cards across the canvas.</li>
      <li>Review the <strong>Attention Required</strong> priority carousel.</li>
      <li>Review the <strong>Latest Decision Spotlight</strong> card highlighting Material <code>MAT-001</code>.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>Top KPIs: <strong>6 Active Decisions</strong>, <strong>16 Qualified Business Partners</strong>, <strong>8 Monitored Strategic Materials</strong>, and <strong>10 Active Framework Contracts (84.2% spend coverage)</strong>. Below, an Attention Required banner highlights: <em>"Supplier Capacity & Delivery Drift: Apex Component Logistics (SUP-002) experiencing 76% OTD degradation on Material MAT-001."</em></p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p>The system computes rolling 180-day delivery variances from Goods Receipt documents (<code>MSEG</code>), scans contract expiration tables (flagging agreements expiring within &lt;60 days), and cross-references active disruption alerts from the risk event ledger.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> Spend aggregations, variance percentages, and expiration countdowns are mathematical rules. <strong>AI:</strong> Natural language generation synthesizes the Decision Spotlight executive summary card.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "Within 30 seconds, leadership understands our complete operational posture. We immediately spot that our low-cost valve supplier is suffering delivery degradation, while verifying that 84% of our category spend remains protected under negotiated outline contracts."
  </div>
</div>

<!-- CHAPTER 3 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapter 3 — Attention Center</div>
    <div class="step-subtitle">Proactive Anomaly & Disruption Discovery</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>Click <strong>Intelligence Hub</strong> in the Left Sidebar, then select <strong>Early Warning Center</strong> (or click the Attention item on Overview).</li>
      <li>Locate the card: <strong>"Capacity Contraction & OTD Drift — SUP-002 (Apex Component Logistics)"</strong>.</li>
      <li>Click the action button: <strong>"Investigate Supplier 360"</strong>.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>A ranked feed of operational anomalies. The Apex Logistics dossier reveals On-Time Delivery slipped from 91.2% to 76.0% over trailing 90 days, with an average dock delay of 4.8 days and €890,000 spend at risk. An explicit Back button appears at the top: <code>← Back to Procurement Overview</code>.</p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p><code>/api/analytics/early-warning</code> analyzes PO delivery schedules (<code>EKET</code>) against actual warehouse gate receipt timestamps. Statistical deviation exceeds the allowable 2-day tolerance, triggering a deterministic severity alert.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> Anomaly detection math and 76.0% OTD calculation. <strong>AI:</strong> The contextual mitigation recommendation ("Initiate dual-sourcing quota reallocation") generated via prompt grounding.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "Instead of finding out about delivery failures when assembly lines halt, the Early Warning Center flags operational drift weeks in advance. Here, we catch Apex Logistics' delivery collapse before we commit our next 10,000-unit hydraulic valve order."
  </div>
</div>

<!-- CHAPTER 4 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapter 4 — Supplier Intelligence (Supplier 360)</div>
    <div class="step-subtitle">Deep Dossier & Operational Trust Profile</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>Review the Supplier 360 dossier for <strong>Apex Component Logistics (SUP-002)</strong>.</li>
      <li>In the top right dropdown, switch the active supplier to <strong>Helios Werkzeuge & Antriebstechnik AG (SUP-006)</strong>.</li>
      <li>Click through the 4 dossier tabs: <em>Pricing & PIR, Contracts, Risk Signals, and Company Master Data</em>.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>Helios displays a green badge: <strong>"High Operational Trust • Verified Partner"</strong>. Level 1 telemetry: 24-Month Spend €3,400,000, 94.0% OTD, 0.38% Quality Defect Rate (vs. 1.0% tolerance ceiling), and Active Master Contract <code>CTR-4600001001</code> granting a 5.7% volume rebate.</p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p><code>/api/suppliers/SUP-006/360?material_id=MAT-001</code> aggregates records from 7 underlying tables: Purchasing Info Records (<code>EINA/EINE</code>), Purchase Orders (<code>EKPO</code>), Goods Receipts (<code>MSEG</code>), Quality Notifications (<code>QMEL</code>), and Outline Contracts (<code>EKKO</code>).</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> All metrics, spend totals, payment terms (<code>2% 14, Net 30</code>), and defect percentages are exact transactional facts. <strong>AI:</strong> Synthesizes the natural language trust verdict banner.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "Supplier 360 gives our buyers an exhaustive 360-degree dossier on any vendor in our supply base. We immediately verify why Helios Werkzeuge is our strategic benchmark: zero quality spikes, 94% on-time delivery, and an active volume outline agreement."
  </div>
</div>

<div class="page-break"></div>

<!-- CHAPTER 5 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapter 5 — Create / Select a Procurement Requirement</div>
    <div class="step-subtitle">Demand Intake & Sourcing Workspace Setup</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>In the Left Navigation Sidebar, click <strong>Sourcing Workspace</strong>.</li>
      <li>In the top dropdown <strong>"Select Pre-Configured Sourcing Requirement"</strong>, choose <strong>"REQ-001: Standard Sourcing: Hydraulic Valves 10k units"</strong>.</li>
      <li>Verify parameters: Material <code>MAT-001</code>, Quantity <code>10,000</code>, Plant <code>P001</code>, Date <code>2026-10-15</code>, Priority <code>Balanced</code>.</li>
      <li>Click the primary blue button: <strong>"Run Decision Intelligence Analysis"</strong>.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>A brief processing indicator appears, followed by the complete Multi-Pillar Decision Cockpit: A Hero Recommendation Card, Multi-Criteria Candidate Scorecard, and sub-navigation pills (<em>Recommendation, Decision Twin, Evidence Graph, What-If, Eligibility, Stress Testing, and Trace</em>).</p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p>POST to <code>/api/decision/evaluate</code>. The backend executes a 5-stage pipeline: (1) Eligibility gating, (2) Effective landed cost calculation, (3) Quality/delivery telemetry extraction, (4) MCDA normalized dimension scoring, and (5) AI executive rationale synthesis.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> Entire mathematical sourcing evaluation executes in &lt;45ms. <strong>AI:</strong> None during computational evaluation.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "Here we enter the core of the engine. We configure our demand: 10,000 valves needed at Plant P001 by mid-October. Instead of opening 5 different SAP transactions—ME11 for info records, ME33K for contracts, and MC.9 for inventory—the buyer clicks 'Analyze' and evaluates the entire decision in one place."
  </div>
</div>

<!-- CHAPTER 6 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapter 6 — Supplier Eligibility</div>
    <div class="step-subtitle">Deterministic Qualification Gating</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>In Sourcing Workspace sub-navigation pills, click <strong>Eligibility Matrix</strong>.</li>
      <li>Notice the top Back link: <code>← Back to Sourcing Recommendation</code>.</li>
      <li>Review the summary: <strong>4 Total Candidates (3 Fully Eligible, 1 Conditionally Eligible, 0 Ineligible)</strong>.</li>
      <li>Expand the row for <strong>SUP-002 (Apex Logistics)</strong> to inspect conditions.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>A qualification matrix: Helios (`SUP-006`), Rheinland (`SUP-001`), and Nordisk Stål (`SUP-004`) are Fully Qualified. Apex Logistics (`SUP-002`) is marked <strong>Conditionally Eligible</strong> with warning: <em>"Delivery reliability (76%) below 80% threshold; requires expedited buffer or freight audit."</em></p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p><code>eligibility_engine.py</code> executes 6 deterministic Boolean checks: Material Group matching (<code>GRP-HYD</code>), Plant relevance (<code>plant_relevance</code> includes <code>P001</code>), monthly capacity ceiling (&gt;10k units), active status, compliance sanctions, and lead time viability.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> 100% rule-based Boolean gating. A supplier either satisfies the plant master data constraints or fails. <strong>AI:</strong> Zero AI involvement.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "Before scoring any vendor, the platform applies deterministic eligibility gating. It checks whether the vendor can physically produce this valve, whether they are approved for Plant P001, and whether their monthly capacity can handle 10,000 units. A vendor must qualify on operational facts before they can compete."
  </div>
</div>

<!-- CHAPTER 7 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapter 7 — Supplier Comparison</div>
    <div class="step-subtitle">Multi-Dimensional Candidate Benchmarking</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>Click the sub-tab pill <strong>Recommendation & AI Explanation</strong> to return to the scorecard.</li>
      <li>Scroll to the <strong>"Multi-Criteria Decision Scorecard & Candidate Matrix"</strong> table.</li>
      <li>Compare the 4 evaluated candidates: Helios (`SUP-006`), Rheinland (`SUP-001`), Apex (`SUP-002`), and Nordisk (`SUP-004`).</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>A side-by-side benchmark table comparing Quoted Headline Price, True Effective Landed Cost, On-Time Delivery, Defect Rate, Lead Time, Contract Status, and Composite Score. Helios ranks #1 with <strong>93.4 pts</strong>, Rheinland #2 with <strong>86.1 pts</strong>, Apex #3 with <strong>74.5 pts</strong>, and Nordisk #4 with <strong>62.8 pts</strong>.</p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p>Raw transactional metrics are min-max normalized across candidates to a standardized 0–100 scale, weighted across the 6 strategic pillars, and sorted in descending order.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> All matrix calculations, score weightings, and rankings are pure linear algebra. <strong>AI:</strong> None.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "Notice that Apex Logistics offers the lowest quoted headline price at €178 per unit, but they rank third. Helios ranks first at €185 quoted price. The platform shows why: when we factor in delivery reliability, quality rejection, and contract coverage, the cheapest quote is rarely the most cost-effective option."
  </div>
</div>

<!-- CHAPTER 8 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapter 8 — Effective Procurement Cost</div>
    <div class="step-subtitle">The True Landed Cost Equation vs. Headline Quotes</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>In the scorecard table, click on the **Effective Landed Cost** column for Apex (`SUP-002`) and Helios (`SUP-006`).</li>
      <li>Review the expanded Landed Cost calculation breakdown modal.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <div class="formula-box">
      Effective Landed Cost = Quoted Price + Freight + Tariff + Contract Rebate + Cost of Delay/Quality Risk
    </div>
    <p><strong>Apex Logistics (SUP-002):</strong> Quoted €178.00 + Freight €7.12 + Delay Buffer €11.12 = <strong>€196.24 Landed</strong>.<br>
    <strong>Helios Werkzeuge (SUP-006):</strong> Quoted €185.00 + Freight €3.70 - Contract Rebate €10.55 (-5.7%) + Defect Buffer €2.52 = <strong>€190.67 Landed</strong>.<br>
    <em>Helios is €5.57 cheaper per unit (€55,700 total order savings)!</em></p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p><code>effective_cost.py</code> pulls quote or PIR pricing, calculates distance-based logistics freight from country master data (<code>country_information.json</code>), extracts volume rebate terms from <code>contracts.json</code>, and computes defect scrap risk buffers.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> 100% financial arithmetic. <strong>AI:</strong> None. Notice explicit banner: <em>"POC Assumption: Freight percentages, customs tariffs, and quality buffers are calibrated synthetic POC values."</em></p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "Headline price in ERP is dangerous when used in isolation. Apex looks 7 euros cheaper on paper. But when our effective cost engine incorporates cross-border freight, the absence of an outline contract, and the historical cost of arrival delays, Helios is actually 5 euros and 57 cents cheaper per unit. On 10,000 units, that saves our plant over 55,000 euros."
  </div>
</div>

<div class="page-break"></div>

<!-- CHAPTER 9 - 12 (INTELLIGENCE PILLARS) -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapters 9 – 12 — The Intelligence Pillars (Delivery, Quality, Contract, Risk)</div>
    <div class="step-subtitle">Evaluating Operational Telemetry from ERP Transaction History</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>In the Left Navigation Sidebar, expand <strong>Intelligence Hub</strong>.</li>
      <li>Review <strong>Delivery Reliability</strong> (Chapter 9): View dock schedule adherence.</li>
      <li>Review <strong>Quality Performance</strong> (Chapter 10): Inspect scrap and defect rates.</li>
      <li>Review <strong>Outline Contracts</strong> (Chapter 11): Verify agreement <code>CTR-4600001001</code>.</li>
      <li>Review <strong>Risk Intelligence</strong> (Chapter 12): Inspect supply base risk heatmap.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p><strong>Delivery:</strong> Helios at 94.0% OTD (0.4d avg delay) vs. Apex at 76.0% OTD (4.8d avg delay).<br>
    <strong>Quality:</strong> Nordisk Stål has an unacceptable 3.8% defect rate (nearly 400 defective valves per 10k batch), whereas Helios maintains 0.38%.<br>
    <strong>Contracts:</strong> Contract <code>CTR-4600001001</code> is active through 2027 with 62% volume consumed.<br>
    <strong>Risk:</strong> Apex flagged for sub-tier logistics congestion; Danubia (`SUP-005`) flagged for 92% capacity saturation.</p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p>Backend parses 1,200+ Goods Receipts (<code>MSEG</code>), 38 QM inspection lots (<code>QALS/QMEL</code>), active purchasing contracts (<code>EKKO</code>), and regional risk event feeds, translating raw transactional documents into normalized 0–100 pillar scores.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> All pillar calculations, OTD ratios, defect percentages, and contract discount calculations are rule-based arithmetic. <strong>AI:</strong> None.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "A sourcing decision touches every part of manufacturing. Delivery intelligence prevents factory line shutdowns, quality intelligence eliminates scrap and warranty claims, contract intelligence stops spot-buy leakage, and risk intelligence avoids supplier bottlenecks. We unify all four pillars before awarding a single euro."
  </div>
</div>

<!-- CHAPTER 13 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapter 13 — Decision Engine</div>
    <div class="step-subtitle">Multi-Criteria Decision Analysis (MCDA) Scoring Mechanics</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>Return to <strong>Sourcing Workspace</strong>.</li>
      <li>Scroll to the <strong>"Strategic Weights & Criteria Configuration"</strong> panel.</li>
      <li>Review the active Balanced profile weights: <em>Cost 25%, Delivery 25%, Quality 20%, Lead Time 15%, Contract 10%, Risk 5%</em>.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>Visual criteria configuration bars. Explicit disclaimer banner: <em>"POC Business Configuration Weights — Fully customizable per category strategy, not SAP standard fixed weights."</em></p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <div class="formula-box">
      Composite Score = (Price_Score * 0.25) + (Delivery_Score * 0.25) + (Quality_Score * 0.20) + (LeadTime_Score * 0.15) + (Contract_Score * 0.10) + (Risk_Score * 0.05)
    </div>
    <p>Helios: (91.4 * 0.25) + (94.0 * 0.25) + (94.0 * 0.20) + (92.0 * 0.15) + (100.0 * 0.10) + (95.0 * 0.05) = <strong>93.4 / 100</strong>.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> 100% deterministic multi-attribute utility theory. Completely transparent and auditable. <strong>AI:</strong> None.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "Our decision engine is completely transparent and mathematically auditable. Every score is derived from multi-criteria decision analysis using configurable category weights. We never rely on an AI model to calculate scores—the math is 100% deterministic."
  </div>
</div>

<!-- CHAPTER 14 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapter 14 — AI Recommendation</div>
    <div class="step-subtitle">Grounded Executive Synthesis & Comparative Rationale</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>In Sourcing Workspace, look at the top <strong>Hero Recommendation Card</strong>.</li>
      <li>Read the headline: <strong>"Recommended Supplier: Helios Werkzeuge & Antriebstechnik AG (SUP-006)"</strong>.</li>
      <li>Click the button: <strong>"Show AI Decision Explanation & Trade-Offs"</strong>.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>An executive synthesis card detailing why Helios is recommended (Score 93.4, Landed Cost €190.67, 94.0% OTD, 10-day lead time, and active agreement <code>CTR-4600001001</code>). A comparative section explains that Helios outperforms runner-up Rheinland (`SUP-001`, 86.1 pts) due to contract price protections and superior quality ppm.</p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p><code>ai_explainer.py</code> passes the deterministic score dictionary, runner-up differential (+7.3 pts), and verified document metrics to the LLM layer using strict zero-temperature constraints preventing factual deviation.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> All numerical facts, scores, costs, and percentages. <strong>AI:</strong> The natural language phrasing, executive summarization, and contextual trade-off articulation.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "Here is where AI creates real value: it translates complex multi-dimensional mathematics into clear executive prose. Notice that the AI does not calculate the decision; it explains the verified data produced by the deterministic engine. It is 100% grounded in ERP facts."
  </div>
</div>

<div class="page-break"></div>

<!-- CHAPTER 15 & 16 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapters 15 & 16 — Evidence & Decision Trace</div>
    <div class="step-subtitle">Audit Provenance & End-to-End Lineage</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>In Sourcing Workspace, click the sub-tab: <strong>Decision Evidence Graph</strong>.</li>
      <li>Click on the <strong>Cost Pillar</strong>, <strong>Delivery Pillar</strong>, and <strong>Quality Pillar</strong> tree nodes.</li>
      <li>Click the sub-tab: <strong>Decision Trace</strong> to view the sequential execution chain.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>An interactive evidence tree. Clicking any node opens the right-hand <strong>Audit Inspector</strong> showing exact SAP tables, CDS views (e.g., <code>C_PurchaseOrderItemDEX</code>, <code>MSEG</code>, <code>QALS</code>), record counts, and actual historical document IDs. Decision Trace shows the step-by-step lineage from demand intake to recommendation.</p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p><code>evidence_builder.py</code> extracts verified historical document numbers (e.g. <code>PO-4500008812</code>, <code>GR-5000003411</code>) and packages them into a tamper-evident audit structure.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> 100% factual document retrieval and execution logging. <strong>AI:</strong> None.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "In enterprise procurement, auditability is non-negotiable. If internal audit asks why we selected Helios, we don't point to an opaque AI black box. We click 'Evidence' and display the exact SAP purchase orders, goods receipts, and inspection lots that justify the score."
  </div>
</div>

<!-- CHAPTER 17 & 18 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapters 17 & 18 — Decision Twin & What-If Analysis</div>
    <div class="step-subtitle">Real-Time Simulation & Strategic Priority Re-weighting</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>In Sourcing Workspace, click the sub-tab: <strong>What-If Analysis</strong>.</li>
      <li>In weight sliders, increase <strong>Cost Weight</strong> to <strong>60%</strong>, and reduce Delivery to 10% and Quality to 10%.</li>
      <li>Click the button: <strong>"Run What-If Simulation"</strong>.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>Live re-ranking animation! A red banner flashes: <strong>"RANKING SHIFT DETECTED!"</strong>. Apex Logistics (`SUP-002`) jumps to Rank #1 with <strong>91.8 pts</strong>, while Helios drops to Rank #2 with <strong>84.2 pts</strong>. A trade-off explanation explains why Apex's headline price overcomes its delivery penalty under extreme cost bias.</p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p><code>decision_twin.py</code> recalculates the MCDA scoring matrix using normalized custom weights in a sandboxed runtime without touching the ERP production ledger.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> Real-time score recalculation. <strong>AI:</strong> Contextual trade-off narrative explaining the business consequence of the ranking shift.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "What-If analysis gives buyers immediate visibility into trade-offs. If leadership mandates an aggressive cost-cutting initiative and we shift price weight to 60%, Apex Logistics becomes #1. The tool shows us the exact trade-off: saving €12,000 on purchase price in exchange for a 20% drop in delivery reliability."
  </div>
</div>

<!-- CHAPTER 19 & 20 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapters 19 & 20 — Sensitivity Analysis & Stress Testing</div>
    <div class="step-subtitle">Subjecting Sourcing Decisions to 14 Adverse Macro Shocks</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>In Left Sidebar, navigate to <strong>Decisions Hub</strong> → <strong>Decision Stress Testing</strong>.</li>
      <li>Click the primary button: <strong>"Run Complete 14-Shock Stress Suite"</strong>.</li>
      <li>Review the shock results table and parameter sensitivity matrix.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>Stress test results matrix: Helios absorbs 12 of 14 shocks (passing Freight +25%, Currency +15%, Energy +30%, Volume +50%). The Sensitivity chart indicates Helios remains #1 unless their price increases by &gt;8.4% or lead time slips by &gt;4 days. Summary badge: <strong>"Decision Robustness Index: 85.7% (STABLE Grade A)"</strong>.</p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p><code>stress_test_service.py</code> modifies cost, freight, and capacity parameters across 14 discrete macroeconomic shock vectors, evaluating partial derivatives to pinpoint mathematical tipping points.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> 100% deterministic scenario simulation and calculus. <strong>AI:</strong> None.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "We don't just pick a supplier for sunny-day conditions. Our stress testing suite bombards the decision with 14 adverse supply chain shocks—freight surges, energy crises, volume spikes. Helios absorbs 12 out of 14 shocks without losing its #1 rank, proving this is a highly robust decision."
  </div>
</div>

<div class="page-break"></div>

<!-- CHAPTER 21 - 23 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapters 21 – 23 — Robustness, Outage Failover & Quota Allocation</div>
    <div class="step-subtitle">Catastrophic Disruption Simulation & Dual-Sourcing</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>Inside Decision Stress Testing, select sub-tab: <strong>Outage Failover</strong>.</li>
      <li>Set dropdown to simulate total outage for <strong>SUP-006 (Helios Werkzeuge)</strong> and click <strong>Simulate</strong>.</li>
      <li>Return to Sourcing Workspace, toggle Selection Mode to <strong>"Dual Sourcing (Quota Split)"</strong>, and re-run.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p><strong>Outage:</strong> Instant automated failover to Rheinland (`SUP-001`, 86.1 pts) with an exact budget impact of +€4.22/unit (+€42,200 total) and zero factory line stoppage.<br>
    <strong>Dual Sourcing:</strong> Recommends a <strong>70% / 30% quota split</strong> (7,000 units to Helios / 3,000 units to Rheinland), achieving a blended landed cost of €191.94/unit and cutting single-source risk exposure by 30%.</p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p>Outage engine removes the primary vendor in memory and re-evaluates remaining qualified candidates. Dual sourcing applies SAP Quota Arrangement calculation rules (<code>quota_arrangements.json</code>).</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> Failover re-ranking, quota allocation math, and blended landed costs are arithmetic. <strong>AI:</strong> Operational risk explanation.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "What happens if a fire or cyberattack takes Helios offline? One click simulates the outage. The platform instantly identifies Rheinland as failover, computes the exact €42,000 budget delta, and proves plant operations can continue. With dual sourcing, we eliminate single-source risk for a tiny €1.27/unit insurance premium."
  </div>
</div>

<!-- CHAPTER 24 - 27 -->
<div class="chapter-box">
  <div class="step-header">
    <div class="step-title">Chapters 24 – 27 — Human Approval, Decision Memory & Closed-Loop Learning</div>
    <div class="step-subtitle">From Award Approval to Post-Award Empirical Learning</div>
  </div>

  <div class="section-action">
    <div class="section-label label-action">A. User Action</div>
    <ol class="action-list">
      <li>In Sourcing Workspace, select <strong>Single Source — Helios (`SUP-006`)</strong>.</li>
      <li>Enter buyer approval notes and click green button: <strong>"Approve & Record Procurement Decision"</strong>.</li>
      <li>In Left Sidebar, navigate to <strong>Decisions Hub</strong> → <strong>Procurement Memory (Expected vs Actual)</strong>.</li>
      <li>Review historical record <code>DEC-2026-0091</code> and the <strong>Automated Procurement Lesson</strong> callout.</li>
    </ol>
  </div>

  <div class="callout-sees">
    <div class="section-label label-sees">B. What the User Sees</div>
    <p>Confirmation: <em>"Decision successfully recorded in Decision Audit History."</em> In Procurement Memory, a side-by-side reconciliation card compares award-time expectations against actuals: Landed Cost Expected €190.67 vs Actual €190.67 (0.0% variance), OTIF Expected 96.0% vs Actual 95.2% (-0.8% variance). Below, the derived procurement lesson advises maintaining Helios while initiating early contract renewal.</p>
  </div>

  <div class="callout-system">
    <div class="section-label label-system">C. What Happens Behind the Scenes</div>
    <p>Appends immutable decision record to <code>decision_audit_history.json</code>. Reconciles award-time baseline metrics against subsequent warehouse goods receipts (<code>MSEG</code>) and paid invoices (<code>BKPF</code>), updating vendor trust factors.</p>
  </div>

  <div class="callout-ai">
    <div class="section-label label-ai">D. AI vs. Deterministic Logic</div>
    <p><strong>Deterministic:</strong> Immutable snapshot archiving and empirical variance calculations. <strong>AI:</strong> Generates the strategic procurement lesson derived from empirical variance patterns.</p>
  </div>

  <div class="callout-pitch">
    <div class="section-label label-pitch">E. What I Should Say to My Manager</div>
    "The system recommends; the human decides. We preserve human commercial judgment. Once approved, our closed-loop memory automatically reconciles award expectations against actual dock receipts and paid invoices. The system learns continuously from real-world outcomes, making our procurement organization smarter with every contract."
  </div>
</div>

<div class="page-break"></div>

<!-- PART II: DEMO SCRIPT -->
<h1>Part II: 20-Minute Executive Manager Demo Script</h1>
<p style="font-size: 9.5pt; color: #475569;">
Follow this exact minute-by-minute presentation plan when demonstrating the live application to leadership, business stakeholders, or external auditors.
</p>

<table>
  <thead>
    <tr>
      <th style="width: 15%;">Timestamp</th>
      <th style="width: 25%;">Screen & Navigation</th>
      <th style="width: 25%;">Exact User Action</th>
      <th style="width: 35%;">Executive Pitch ("What to Say")</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>00:00 – 01:30</strong></td>
      <td><strong>Procurement Overview</strong></td>
      <td>Open home screen. Point to KPI cards and header.</td>
      <td>"Good morning. Today I'm demonstrating Supplier Decision Intelligence—an AI-augmented decision workspace designed to sit directly above SAP S/4HANA. Rather than forcing buyers to toggle between 15 separate SAP screens, this cockpit unifies master data, purchase orders, dock receipts, quality inspection lots, and outline agreements to evaluate strategic sourcing decisions in seconds."</td>
    </tr>
    <tr>
      <td><strong>01:30 – 03:30</strong></td>
      <td><strong>Overview & Early Warning</strong></td>
      <td>Scroll to Attention Required card showing Apex (`SUP-002`) delivery drift.</td>
      <td>"Within 30 seconds, a procurement executive sees our operational exposure. Here the system alerts us that Apex Component Logistics—our lowest-cost hydraulic valve supplier—has suffered a severe delivery collapse down to 76% OTD. It flags this risk before we commit our next production run."</td>
    </tr>
    <tr>
      <td><strong>03:30 – 05:00</strong></td>
      <td><strong>Supplier 360 Dossier</strong></td>
      <td>Click into Supplier 360 for `SUP-006` (Helios Werkzeuge).</td>
      <td>"Here is our Supplier 360 dossier. We have a unified audit view: 24-month spend, delivery reliability, quality rejection rates, and active outline contracts. Notice Helios Werkzeuge maintains 94% on-time delivery and an active framework agreement."</td>
    </tr>
    <tr>
      <td><strong>05:00 – 07:30</strong></td>
      <td><strong>Sourcing Workspace</strong></td>
      <td>Select `REQ-001` (10k valves, Plant P001, Balanced). Click <em>Run Analysis</em>.</td>
      <td>"Now let's execute a real sourcing requirement. Plant P001 needs 10,000 hydraulic valves by mid-October. We select our balanced business priority and run the analysis. The engine instantly evaluates eligibility, calculates true landed costs, and runs multi-criteria scoring."</td>
    </tr>
    <tr>
      <td><strong>07:30 – 09:30</strong></td>
      <td><strong>Scorecard & Effective Cost</strong></td>
      <td>Expand Landed Cost for Apex vs. Helios.</td>
      <td>"Notice this critical insight: Apex offers the lowest headline quote at €178. But when our effective cost engine incorporates freight, lack of contract rebate, and delay risk, their landed cost rises to €196. Helios, quoting €185, actually lands at €190 thanks to an active 5.7% contract discount. The cheapest quote is not the lowest cost."</td>
    </tr>
    <tr>
      <td><strong>09:30 – 11:30</strong></td>
      <td><strong>Recommendation & AI Rationale</strong></td>
      <td>Expand Hero Recommendation Card. Read AI explanation.</td>
      <td>"Helios ranks #1 with 93.4 points. Notice how AI is utilized: It does not calculate the scores—the math is 100% deterministic and auditable. AI synthesizes the verified ERP data into clear executive prose, explaining why Helios won and detailing the trade-offs vs the runner-up."</td>
    </tr>
    <tr>
      <td><strong>11:30 – 13:30</strong></td>
      <td><strong>Evidence & Decision Trace</strong></td>
      <td>Open Decision Evidence Graph. Click Cost and Quality nodes.</td>
      <td>"Auditability is essential. Internal audit can inspect the exact evidence tree: 18 historical purchase orders in EKPO, 42 goods receipts in MSEG, and 38 inspection lots in QALS. There is zero hallucination; every score is backed by SAP document IDs."</td>
    </tr>
    <tr>
      <td><strong>13:30 – 15:30</strong></td>
      <td><strong>Decision Twin & What-If</strong></td>
      <td>Open What-If. Drag Cost Weight to 60%. Click <em>Run What-If</em>.</td>
      <td>"In the Decision Twin, we can stress-test priorities. If leadership demands an aggressive cost-cutting strategy and we increase cost weight to 60%, the ranking flips to Apex Logistics. The platform shows the exact trade-off: saving €12,000 on purchase price in exchange for a 20% drop in delivery reliability."</td>
    </tr>
    <tr>
      <td><strong>15:30 – 17:30</strong></td>
      <td><strong>Stress Testing & Outage</strong></td>
      <td>Open Stress Testing. Run 14-Shock Suite. Simulate Helios outage.</td>
      <td>"We also test decision robustness. The engine runs 14 adverse macro shocks—freight surges, currency shifts, demand spikes. Helios absorbs 12 out of 14 shocks. If Helios suffers a catastrophic outage, the system immediately identifies Rheinland as our qualified failover with an exact €42,000 budget delta."</td>
    </tr>
    <tr>
      <td><strong>17:30 – 19:00</strong></td>
      <td><strong>Human Approval & Memory</strong></td>
      <td>Approve decision. Open Procurement Memory (Expected vs Actual).</td>
      <td>"The system recommends; the human decides. Once approved, the decision is logged in Decision Memory. Weeks later, the system automatically compares our award-time expectations against actual invoices and dock receipts, achieving true closed-loop learning."</td>
    </tr>
    <tr>
      <td><strong>19:00 – 20:00</strong></td>
      <td><strong>Executive Summary & ROI</strong></td>
      <td>Return to Overview. Conclude presentation.</td>
      <td>"To summarize: Supplier Decision Intelligence bridges the gap between raw ERP transactions and strategic buyer decisions. It prevents costly spot-buy leakage, mitigates supply chain disruptions, ensures complete audit compliance, and delivers measurable landed cost savings."</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PART III & IV -->
<h1>Part III: End-to-End Architecture & Behind the Screen Flow</h1>
<div class="formula-box" style="line-height: 1.45; font-size: 8pt;">
[STRATEGIC BUYER] 
       │ (Selects Demand: MAT-001, 10k EA, P001, Date: 2026-10-15)
       ▼
[FRONTEND COCKPIT (React / TypeScript / Vite)]
       │ (REST POST /api/decision/evaluate)
       ▼
[API GATEWAY & ORCHESTRATION (FastAPI)]
       │
       ▼
[DATA PROVIDER ABSTRACTION LAYER (DataProvider Interface)]
       ├── Current: In-Memory Cached MockDataProvider (22 Validated JSON Tables)
       └── Future: SAP S/4HANA OData / CDS Views (C_PurchaseOrderItemDEX, MSEG, EKKO)
       │
       ▼
[ELIGIBILITY GATING ENGINE (Deterministic)]
       │ (Checks: Plant relevance, Material Group matching, Capacity ceilings)
       ▼
[PROCUREMENT ANALYTICS ENGINE (Deterministic)]
       │ (Calculates: 180d OTD rate, QM defect rate, Trailing delivery drift)
       ▼
[EFFECTIVE LANDED COST ENGINE (Deterministic)]
       │ (Computes: Quoted Price + Logistics Freight + Tariff - Contract Rebate + Risk Buffer)
       ▼
[MCDA DECISION ENGINE (Deterministic)]
       │ (Normalized Dimension Scoring 0-100 across 6 Strategic Priority Weights)
       ▼
[STRUCTURED RECOMMENDATION & SCORECARD]
       ├── [EVIDENCE BUILDER] ──> Structures verified SAP PO, GR, and QM document IDs
       ├── [DECISION TWIN & WHAT-IF] ──> Sandboxed runtime for parameter re-weighting
       ├── [STRESS TESTING SUITE] ──> Simulates 14 macro shocks & catastrophic outage
       └── [AI AUDIT EXPLAINER] ──> Zero-temperature LLM translates data into executive rationale
       │
       ▼
[STRATEGIC HUMAN BUYER] ──> Reviews trade-offs, adds notes, and executes commercial approval
       │
       ▼
[DECISION AUDIT HISTORY & CLOSED-LOOP MEMORY]
       │ (Records baseline expectations at award time)
       ▼
[POST-AWARD RECONCILIATION] ──> Compares expected metrics vs. actual invoices & dock receipts
       │
       ▼
[AUTOMATED PROCUREMENT LESSON] ──> Updates supplier trust profile for future sourcing cycles
</div>

<h1>Part IV: Deterministic vs. AI Division of Responsibility</h1>
<table>
  <thead>
    <tr>
      <th style="width: 30%;">Procurement Function</th>
      <th style="width: 20%;">Execution Model</th>
      <th style="width: 50%;">Grounding & Technical Reason</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Supplier Eligibility Gating</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Boolean qualification rules based on plant relevance, material groups, and capacity ceilings. AI must never decide operational eligibility.</td>
    </tr>
    <tr>
      <td><strong>Headline Price Evaluation</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Direct retrieval from Purchasing Info Records (<code>EINE</code>) and supplier quotation bids.</td>
    </tr>
    <tr>
      <td><strong>Effective Landed Cost Calculation</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Pure arithmetic summation: Quoted Price + Freight + Tariff + Contract Rebate + Risk Buffers.</td>
    </tr>
    <tr>
      <td><strong>On-Time Delivery (OTD) Rate</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Exact date arithmetic on verified warehouse Goods Receipts (<code>MSEG/MKPF</code>).</td>
    </tr>
    <tr>
      <td><strong>Quality Defect & Rejection Rate</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Exact mathematical ratio of rejected vs inspected lots in SAP QM records (<code>QALS/QMEL</code>).</td>
    </tr>
    <tr>
      <td><strong>Contract Status & Volume Rebates</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Direct evaluation of outline contract validity dates and tier schedules (<code>EKKO/EKPO</code>).</td>
    </tr>
    <tr>
      <td><strong>Operational Risk Scoring</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Rule-based deduction matrix based on active severity events and capacity usage.</td>
    </tr>
    <tr>
      <td><strong>MCDA Composite Scoring</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Weighted sum of normalized dimensional scores (0–100). Completely auditable linear algebra.</td>
    </tr>
    <tr>
      <td><strong>Candidate Ranking (1 to N)</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Strict descending mathematical sort on composite decision score.</td>
    </tr>
    <tr>
      <td><strong>Recommendation Executive Narrative</strong></td>
      <td><span class="badge badge-purple">AI Synthesized</span></td>
      <td>Translates structured decision scores and trade-offs into natural language executive prose.</td>
    </tr>
    <tr>
      <td><strong>Natural Language Assistant Queries</strong></td>
      <td><span class="badge badge-purple">AI Synthesized</span></td>
      <td>Interprets buyer conversational questions and routes them to structured platform APIs.</td>
    </tr>
    <tr>
      <td><strong>Evidence Audit Package Extraction</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Queries and structures factual SAP document numbers (<code>PO</code>, <code>GR</code>, <code>QM</code>).</td>
    </tr>
    <tr>
      <td><strong>What-If Simulation Recalculation</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Real-time mathematical re-scoring using modified dimensional weights.</td>
    </tr>
    <tr>
      <td><strong>What-If Trade-Off Explanation</strong></td>
      <td><span class="badge badge-purple">AI Synthesized</span></td>
      <td>Explains the operational meaning of score inversions when weights change.</td>
    </tr>
    <tr>
      <td><strong>14-Shock Stress Testing</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Quantitative evaluation of 14 discrete macro shock parameter modifications.</td>
    </tr>
    <tr>
      <td><strong>Expected vs Actual Reconciliation</strong></td>
      <td><span class="badge badge-success">Deterministic</span></td>
      <td>Mathematical variance calculation: Actual Metric minus Expected Metric.</td>
    </tr>
    <tr>
      <td><strong>Procurement Lesson Formulation</strong></td>
      <td><span class="badge badge-purple">AI Synthesized</span></td>
      <td>Synthesizes actionable strategic lessons from empirical variance patterns.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PART V & VI -->
<h1>Part V: Canonical Procurement Data Architecture (22 Datasets)</h1>
<table>
  <thead>
    <tr>
      <th style="width: 5%;">#</th>
      <th style="width: 25%;">Dataset File</th>
      <th style="width: 20%;">SAP Source Table</th>
      <th style="width: 50%;">Business Purpose & Core Features Utilizing It</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td><code>suppliers.json</code></td><td><code>LFA1</code> / <code>BUT000</code></td><td>Master supplier profiles, tiers, addresses, certifications, baseline risk ratings. Used by Supplier 360 and Eligibility.</td></tr>
    <tr><td>2</td><td><code>materials.json</code></td><td><code>MARA</code> / <code>MARC</code></td><td>Material specifications, base UoM, plant assignments, defect tolerances, benchmark prices. Used across Sourcing Workspace.</td></tr>
    <tr><td>3</td><td><code>plants.json</code></td><td><code>T001W</code></td><td>Plant locations, assembly capabilities, storage constraints. Used for plant-level eligibility gating.</td></tr>
    <tr><td>4</td><td><code>contracts.json</code></td><td><code>EKKO</code> / <code>EKPO</code></td><td>Framework contracts, agreed volume rebate tiers, target spend, validity periods. Used by Effective Cost and Contract Intelligence.</td></tr>
    <tr><td>5</td><td><code>purchasing_info_records.json</code></td><td><code>EINA</code> / <code>EINE</code></td><td>Vendor-material specific pricing, standard lead times, price break scales. Used for baseline price retrieval.</td></tr>
    <tr><td>6</td><td><code>source_list.json</code></td><td><code>EORD</code></td><td>Approved vendor relationships and plant validity ranges. Used for supplier qualification.</td></tr>
    <tr><td>7</td><td><code>quota_arrangements.json</code></td><td><code>EQUK</code> / <code>EQUP</code></td><td>Split allocations and dual-sourcing ratios. Used by Multi-Supplier Allocation.</td></tr>
    <tr><td>8</td><td><code>purchase_orders.json</code></td><td><code>EKKO</code> / <code>EKPO</code></td><td>Historical transactional spend, order volumes, promised delivery dates. Used by Evidence Builder and Spend Analytics.</td></tr>
    <tr><td>9</td><td><code>goods_receipts.json</code></td><td><code>MKPF</code> / <code>MSEG</code></td><td>Actual dock receipt dates, quantities accepted, schedule deviations. Used by Delivery Intelligence.</td></tr>
    <tr><td>10</td><td><code>delivery_history.json</code></td><td><code>EKET</code></td><td>Long-term schedule line adherence and delay variance logs. Used for delivery trend modeling.</td></tr>
    <tr><td>11</td><td><code>quality_records.json</code></td><td><code>QALS</code> / <code>QMEL</code></td><td>Inspection lot outcomes, defect counts, scrap quantities. Used by Quality Intelligence.</td></tr>
    <tr><td>12</td><td><code>invoices.json</code></td><td><code>RBKP</code> / <code>RSEG</code></td><td>Invoiced prices, cash discount terms, 3-way match variances. Used for price variance and leakage detection.</td></tr>
    <tr><td>13</td><td><code>price_history.json</code></td><td><code>A017</code> / <code>KONP</code></td><td>Historical price fluctuations and index trends over 24 months. Used by Price Intelligence.</td></tr>
    <tr><td>14</td><td><code>risk_events.json</code></td><td>External Telemetry</td><td>Disruption alerts, financial health flags, ESG incidents. Used by Risk Intelligence and Scoring.</td></tr>
    <tr><td>15</td><td><code>supplier_performance.json</code></td><td>Vendor Eval Ledger</td><td>Consolidated vendor KPIs across quality, delivery, and service. Used for Supplier Benchmarking.</td></tr>
    <tr><td>16</td><td><code>purchase_requisitions.json</code></td><td><code>EBAN</code></td><td>Internal demand notifications, requested quantities, dates. Used for sourcing demand intake.</td></tr>
    <tr><td>17</td><td><code>rfqs.json</code></td><td><code>EKKO (Type AN)</code></td><td>Formal requests for quotation sent to vendor candidates. Used in bidding workflows.</td></tr>
    <tr><td>18</td><td><code>supplier_quotations.json</code></td><td><code>EKPO (Type QU)</code></td><td>Supplier bids, offered lead times, headline price quotes. Used by Sourcing Workspace.</td></tr>
    <tr><td>19</td><td><code>procurement_requirements.json</code></td><td>Custom Objects</td><td>Structured multi-pillar sourcing requirements (`REQ-001` through `REQ-006`). Core Sourcing Workspace input.</td></tr>
    <tr><td>20</td><td><code>scenario_definitions.json</code></td><td>Simulation Config</td><td>Predefined scenario definitions (`SCEN-01` through `SCEN-14`). Used by What-If and Stress Test engines.</td></tr>
    <tr><td>21</td><td><code>country_information.json</code></td><td><code>T005</code></td><td>Country codes, synthetic freight percentages, logistics distance factors. Used by Effective Cost.</td></tr>
    <tr><td>22</td><td><code>currency_information.json</code></td><td><code>TCURR</code></td><td>Currency exchange rates and conversion factors. Used for multi-currency landed cost normalization.</td></tr>
  </tbody>
</table>

<h1>Part VI: Fully Worked Sourcing Benchmark Example</h1>
<p style="font-size: 9pt; color: #475569;">
<strong>Requirement REQ-001:</strong> Material MAT-001 (Hydraulic Valve HSV-40) | 10,000 Units | Plant P001 | Priority: Balanced Sourcing
</p>

<table>
  <thead>
    <tr>
      <th>Sourcing Dimension</th>
      <th>Rheinland (SUP-001)</th>
      <th>Apex Logistics (SUP-002)</th>
      <th>Nordisk Stål (SUP-004)</th>
      <th>Helios Werkzeuge (SUP-006)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>Country & Strategic Tier</strong></td><td>DE · Preferred</td><td>PL · Transactional</td><td>SE · Transactional</td><td><strong>DE · Strategic</strong></td></tr>
    <tr><td><strong>Qualification Status</strong></td><td>Fully Qualified</td><td>Conditionally Qualified</td><td>Fully Qualified</td><td><strong>Fully Qualified</strong></td></tr>
    <tr><td><strong>Quoted Headline Price</strong></td><td>€192.00</td><td>€178.00 <em>(Lowest Quote)</em></td><td>€184.00</td><td><strong>€185.00</strong></td></tr>
    <tr><td><strong>Synthetic Freight Factor</strong></td><td>+€3.84 (2.0%)</td><td>+€7.12 (4.0%)</td><td>+€9.20 (5.0%)</td><td><strong>+€3.70 (2.0%)</strong></td></tr>
    <tr><td><strong>Contract Volume Rebate</strong></td><td>€0.00 (No Contract)</td><td>€0.00 (No Contract)</td><td>€0.00 (No Contract)</td><td><strong>-€10.55 (-5.7% CTR-4600001001)</strong></td></tr>
    <tr><td><strong>Delay / Scrap Risk Buffer</strong></td><td>+€1.79</td><td>+€11.12</td><td>+€6.99</td><td><strong>+€2.52</strong></td></tr>
    <tr><td><strong>True Effective Landed Cost</strong></td><td>€197.63 / unit</td><td>€196.24 / unit</td><td>€200.19 / unit</td><td><strong>€190.67 / unit (Lowest Cost!)</strong></td></tr>
    <tr><td><strong>Total Order Expenditure</strong></td><td>€1,976,300</td><td>€1,962,400</td><td>€2,001,900</td><td><strong>€1,906,700 (€55.7k Savings)</strong></td></tr>
    <tr><td><strong>On-Time Delivery (OTD)</strong></td><td>91.2%</td><td>76.0% (Severe Drift)</td><td>88.4%</td><td><strong>94.0% (Highly Reliable)</strong></td></tr>
    <tr><td><strong>Defect Rejection Rate</strong></td><td>0.85%</td><td>1.15%</td><td>3.80% (Inspection Hold)</td><td><strong>0.38% (High Precision)</strong></td></tr>
    <tr><td><strong>Offered Lead Time</strong></td><td>14 Days</td><td>18 Days</td><td>21 Days</td><td><strong>10 Days</strong></td></tr>
    <tr><td><strong>Outline Contract Status</strong></td><td>None</td><td>None</td><td>None</td><td><strong>Active (CTR-4600001001)</strong></td></tr>
    <tr><td><strong>Operational Risk Score</strong></td><td>Low (95.0 pts)</td><td>High (45.0 pts)</td><td>High (45.0 pts)</td><td><strong>Low (95.0 pts)</strong></td></tr>
    <tr><td><strong>Composite Score (MCDA)</strong></td><td><strong>86.1 / 100</strong></td><td><strong>74.5 / 100</strong></td><td><strong>62.8 / 100</strong></td><td><strong>93.4 / 100</strong></td></tr>
    <tr><td><strong>Sourcing Verdict</strong></td><td>Runner-Up (Dual Source 30%)</td><td>Unfavorable (Hidden Costs)</td><td>Disqualified on Quality</td><td><strong>WINNER (#1 Recommended)</strong></td></tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PART VII: MANAGER Q&A -->
<h1>Part VII: Executive Manager Q&A (25 Grounded Questions & Answers)</h1>

<div class="qa-box">
  <div class="qa-q">Q1: Why do we need this platform if SAP already has vendor evaluation (ME61N)?</div>
  <p class="qa-a">SAP ME61N calculates historical vendor scores retrospectively based on past purchase orders. It cannot evaluate a forward-looking requirement with specific constraints (e.g., 10,000 units needed by October 15th at Plant P001 under tight quality tolerances). Our platform evaluates demand prospectively, factors in landed cost and active contracts, and simulates decision robustness before the PO is placed.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q2: What exactly is the AI doing in this system?</div>
  <p class="qa-a">AI does not calculate rankings or scores. It acts as an audit synthesizer: translating multi-dimensional mathematical outputs, trade-off differentials, and underlying SAP document evidence into clear executive explanations. It also powers natural language assistant interactions.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q3: Is the recommendation generated by an AI model?</div>
  <p class="qa-a">No. The recommendation is 100% generated by a deterministic Multi-Criteria Decision Analysis (MCDA) engine using normalized dimension scoring and configurable weights. An AI model cannot hallucinate or skew the winner.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q4: How is the decision score calculated?</div>
  <p class="qa-a">The score is a weighted linear combination of 6 normalized dimensions: Effective Landed Cost (25%), Delivery Reliability (25%), Quality Performance (20%), Lead Time (15%), Contract Advantage (10%), and Operational Risk (5%). Scores range from 0 to 100.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q5: Are these standard SAP weights?</div>
  <p class="qa-a">No. These are POC business configuration weights calibrated to represent strategic procurement priorities. In production, weights are fully customizable per material group or category strategy.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q6: What is Effective Procurement Cost?</div>
  <p class="qa-a">Quoted headline price is misleading. Effective Procurement Cost calculates true landed cost: Quoted Price + Logistics Freight + Customs/Tariffs - Contractual Rebates + Quality Scrap/Delay Risk Buffers.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q7: Why not simply choose the cheapest supplier?</div>
  <p class="qa-a">In our HSV-40 valve example, Apex Logistics quoted €178 vs Helios's €185. But Apex has a 76% OTD rate and no contract, generating €18+ in freight and delay risk. Helios has an active outline agreement granting a 5.7% discount, resulting in a true landed cost of €190.67—making Helios €5.57 cheaper per unit.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q8: How is operational risk calculated?</div>
  <p class="qa-a">Risk combines baseline vendor risk ratings (Low/Medium/High), spend concentration penalties (>40% single-source exposure), active disruption incidents, and capacity utilization ceilings.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q9: How is the recommendation explainable to internal audit?</div>
  <p class="qa-a">Every score maps directly to verified data. In Decision Trace, an auditor can inspect the mathematical formula, weights applied, and the underlying SAP documents (PO numbers, GR documents, and QM inspection lots).</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q10: Where does the underlying evidence come from?</div>
  <p class="qa-a">All evidence is extracted directly from enterprise ERP transaction records—specifically purchase order lines (<code>EKPO</code>), goods receipt postings (<code>MSEG</code>), and quality notification logs (<code>QMEL</code>).</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q11: What happens if supplier data changes tomorrow?</div>
  <p class="qa-a">The platform evaluates real-time data. If a supplier's delivery drops or a contract expires, the Decision Twin immediately reflects the degradation and recalculates rankings.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q12: Can this connect to SAP S/4HANA on-premise?</div>
  <p class="qa-a">Yes. The backend is built on a clean Data Provider Abstraction interface (<code>DataProvider</code>). Migrating from the current local mock provider to live S/4HANA requires swapping in standard OData v2/v4 client adapters connecting to SAP CDS views.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q13: Can this connect to S/4HANA Public Cloud?</div>
  <p class="qa-a">Yes, via SAP Business Technology Platform (BTP) using standard communication scenarios and authenticated REST/OData APIs (<code>API_PURCHASEORDER_PROCESS_SRV</code>, <code>API_BUSINESS_PARTNER</code>).</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q14: Can this connect to SAP Ariba or S21?</div>
  <p class="qa-a">Yes. Sourcing requisitions and contracts can be ingested via Ariba Network APIs or SAP Integration Suite.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q15: What happens if SAP is temporarily unavailable?</div>
  <p class="qa-a">The platform can operate with cached analytical snapshots, queuing decisions and synchronizing with SAP once connectivity is restored.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q16: Does this solution replace SAP ERP?</div>
  <p class="qa-a">Absolutely not. SAP remains the single source of truth and transactional system of record. This platform is an analytical decision-intelligence layer that sits above SAP to help buyers evaluate complex sourcing trade-offs.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q17: Can this automatically create a Purchase Order in SAP?</div>
  <p class="qa-a">The architecture supports automated PO creation via SAP BAPI (<code>BAPI_PO_CREATE1</code>) or OData. However, in enterprise procurement, we recommend a human-in-the-loop workflow where the system recommends and the buyer approves.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q18: Is this an autonomous procurement agent?</div>
  <p class="qa-a">No. It is an augmented decision intelligence platform. It automates data consolidation and mathematical analysis, but leaves the final commercial approval with the strategic buyer.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q19: How do we prevent AI hallucination?</div>
  <p class="qa-a">By design, the AI is decoupled from data calculation. The AI never accesses raw databases directly; it only receives pre-calculated, verified deterministic score structures and is constrained by zero-temperature prompting.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q20: How do we audit historical decisions?</div>
  <p class="qa-a">Through the Decision Memory module. Every approved decision stores an immutable snapshot of input parameters, candidate scores, weights, timestamps, and user notes.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q21: How does the system learn over time?</div>
  <p class="qa-a">Through Closed-Loop Procurement Memory. When goods receipts and invoices are posted months after an award, the system automatically compares actual cost, delivery, and quality against baseline expectations, updating vendor trust metrics.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q22: What is the Decision Twin?</div>
  <p class="qa-a">The Decision Twin is a digital sandbox of the sourcing requirement that simulates how rankings behave under changing market conditions, volume fluctuations, and priority weight shifts.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q23: What makes this different from a standard Power BI dashboard?</div>
  <p class="qa-a">A BI dashboard is backward-looking and passive—it charts historical spend. Supplier Decision Intelligence is forward-looking and active: it takes specific future demand, tests feasibility, simulates trade-offs, and recommends optimal sourcing strategies.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q24: What makes this different from a generic AI chatbot?</div>
  <p class="qa-a">A chatbot offers conversational text without computational grounding. Our platform integrates deterministic eligibility gating, multi-criteria mathematical scoring, and transactional ERP audit trees.</p>
</div>

<div class="qa-box">
  <div class="qa-q">Q25: What is the business ROI of this platform?</div>
  <p class="qa-a">ROI is delivered across 4 pillars: (1) 3–7% landed cost reduction by eliminating headline price fallacies and enforcing outline contracts, (2) disruption avoidance by catching delivery drift early, (3) reducing sourcing analysis time from days to seconds, and (4) complete audit compliance.</p>
</div>

<div class="page-break"></div>

<!-- PART VIII & IX -->
<h1>Part VIII: Executive Summaries & Strategic Positioning</h1>

<h3>30-Second Elevator Pitch</h3>
<div class="callout-pitch" style="font-style: normal;">
"Headline prices in ERP are misleading, and manual sourcing analysis across SAP tables takes days. Supplier Decision Intelligence is an AI-augmented decision workspace that sits above SAP S/4HANA. It evaluates specific procurement requirements against true landed cost, delivery reliability, quality, and contract coverage. The math is 100% deterministic and auditable; the AI provides executive explanations. Buyers make faster, highly defensible sourcing decisions that save money and protect production lines."
</div>

<h3>2-Minute Executive Summary</h3>
<p style="font-size: 9.5pt; color: #334155; line-height: 1.55;">
In enterprise manufacturing, procurement teams manage millions of euros in direct material spend across thousands of parts. Today, buyers face a major dilemma: the lowest quoted price in SAP often leads to late deliveries, quality rejections, and factory shutdowns. Consolidated intelligence exists, but it is scattered across dozens of SAP screens—ME11, ME33K, MC.9, and QM reports.
<br><br>
Supplier Decision Intelligence bridges this gap. It acts as an intelligent decision layer above SAP S/4HANA. When demand arrives for 10,000 valves, the platform automatically validates supplier eligibility, calculates true landed cost including logistics and contract rebates, and executes transparent multi-criteria decision scoring.
<br><br>
Crucially, we separate deterministic computation from AI. Our decision engine, what-if simulations, and 14-shock stress tests are 100% mathematical and auditable. AI is utilized solely to explain the decision, summarize trade-offs, and accelerate buyer workflows. Every recommendation is backed by actual SAP purchase orders and inspection lots.
<br><br>
Finally, our Closed-Loop Procurement Memory tracks post-award performance, comparing expectations against actual invoices and dock receipts to ensure continuous organizational learning. SAP remains the system of record; our platform provides the intelligence.
</p>

<h3>Architecture Positioning: Strategic Coexistence with SAP</h3>
<div class="formula-box" style="font-size: 8pt; line-height: 1.4;">
+------------------------------------------------------------------------+
|                   DECISION INTELLIGENCE LAYER                          |
|  Supplier Decision Intelligence Workspace (React / FastAPI / MCDA)    |
|  • Forward-Looking Sourcing Optimization   • What-If & Stress Testing   |
|  • True Effective Landed Cost Engine       • Closed-Loop Memory        |
+----------------------------------^-------------------------------------+
                                   | OData v2/v4 / REST APIs / BTP
+----------------------------------v-------------------------------------+
|                 ENTERPRISE TRANSACTIONAL PLATFORM                      |
|  SAP S/4HANA / SAP ERP (System of Record)                              |
|  • Master Data (MARA, LFA1)               • Purchasing Contracts (EKKO)|
|  • Purchase Orders (EKPO)                  • Goods Receipts (MSEG)      |
|  • QM Inspection Lots (QALS)               • Financial Ledgers (BKPF)   |
+------------------------------------------------------------------------+
</div>

<h1>Part IX: Complete Procurement Lifecycle Summary</h1>
<div class="formula-box" style="line-height: 1.6; font-size: 8.5pt;">
<strong>Requirement</strong>  --> Structured demand intake specifying material, volume, target plant, and needed date.
<strong>Understand</strong>   --> System identifies material criticality, defect tolerances, and benchmark pricing.
<strong>Discover</strong>     --> Scans total supplier directory across domestic and international vendor pools.
<strong>Qualify</strong>      --> Deterministic eligibility gating validates plant authorization and capacity limits.
<strong>Analyze</strong>      --> Extracts historical dock schedule variance, QM inspection lots, and spend history.
<strong>Compare</strong>      --> Multi-candidate matrix evaluates candidates across cost, delivery, quality, and risk.
<strong>Calculate</strong>    --> Computes true landed cost: Quoted Price + Freight + Tariffs - Contract Rebates.
<strong>Recommend</strong>    --> Deterministic MCDA engine generates mathematical ranking and optimal strategy.
<strong>Explain</strong>      --> AI synthesizes grounded, auditable business explanation and trade-off rationales.
<strong>Validate</strong>     --> Evidence graph links decision scores directly to underlying SAP document IDs.
<strong>Stress Test</strong>  --> Subject decision to 14 macro shocks to quantitatively verify stability.
<strong>Decide</strong>       --> Strategic human buyer reviews trade-offs, inputs notes, and approves award.
<strong>Record</strong>       --> Immutable snapshot archived in Decision History with point-in-time parameters.
<strong>Measure</strong>      --> Reconciles award-time baseline expectations against actual invoices and dock receipts.
<strong>Learn</strong>        --> Converts empirical performance variance into automated lessons for future sourcing.
</div>

</body>
</html>
"""

async def generate_pdf():
    print(f"Generating PDF playbook to {OUTPUT_PDF}...")
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(HTML_CONTENT, wait_until="networkidle")
        
        header_template = '''
        <div style="font-size: 8px; color: #64748b; width: 100%; display: flex; justify-content: space-between; padding: 0 16mm; font-family: -apple-system, sans-serif;">
          <span>Supplier Decision Intelligence</span>
          <span>Enterprise Product Walkthrough & Demo Playbook</span>
        </div>
        '''
        
        footer_template = '''
        <div style="font-size: 8px; color: #64748b; width: 100%; display: flex; justify-content: space-between; padding: 0 16mm; font-family: -apple-system, sans-serif;">
          <span>Confidential · Strategic Procurement Operations</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
        '''
        
        await page.pdf(
            path=OUTPUT_PDF,
            format="A4",
            print_background=True,
            display_header_footer=True,
            header_template=header_template,
            footer_template=footer_template,
            margin={
                "top": "18mm",
                "bottom": "18mm",
                "left": "16mm",
                "right": "16mm"
            }
        )
        await browser.close()
    
    file_size_kb = os.path.getsize(OUTPUT_PDF) / 1024
    print(f"SUCCESS: PDF generated successfully at {OUTPUT_PDF} ({file_size_kb:.1f} KB)")

if __name__ == "__main__":
    asyncio.run(generate_pdf())
