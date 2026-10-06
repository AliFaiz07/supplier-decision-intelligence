import React, { useState } from 'react';
import { EvidencePackage, RecommendedOption } from '../../types';
import {
  DollarSignIcon,
  TruckIcon,
  AwardIcon,
  FileTextIcon,
  ShieldAlertIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  LayersIcon,
  DatabaseIcon
} from '../common/Icons';

interface DecisionEvidenceGraphViewProps {
  evidencePackage: EvidencePackage;
  recommendedOption: RecommendedOption;
  onNavigateToSupplier360?: (supplierId: string) => void;
}

interface NodeAuditDetail {
  id: string;
  title: string;
  category: string;
  metricValue: string;
  period: string;
  recordCount: number;
  formula: string;
  sapSourceTable: string;
  sapCdsView: string;
  sampleRecords: any[];
  notes?: string;
}

export const DecisionEvidenceGraphView: React.FC<DecisionEvidenceGraphViewProps> = ({
  evidencePackage,
  recommendedOption,
  onNavigateToSupplier360
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('root');
  const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({
    cost: true,
    delivery: true,
    quality: true,
    contract: true,
    risk: true
  });

  const togglePillar = (pillarId: string) => {
    setExpandedPillars(prev => ({ ...prev, [pillarId]: !prev[pillarId] }));
  };

  // Node details dictionary mapped deterministically from evidencePackage and recommendedOption
  const nodeAuditMap: Record<string, NodeAuditDetail> = {
    root: {
      id: 'root',
      title: `Final Recommendation: ${recommendedOption.primary_supplier_name}`,
      category: 'MCDA Composite Decision',
      metricValue: `${recommendedOption.decision_score} / 100`,
      period: 'Trailing 24 Months Continuous Telemetry',
      recordCount:
        evidencePackage.purchase_orders.records_analyzed +
        evidencePackage.goods_receipts.records_analyzed +
        evidencePackage.quality_records.inspection_lots_analyzed,
      formula:
        'FinalScore = sum(NormalizedDimensionScore_i * Weight_i) * ConfidenceFactor (Deterministic MCDA Linear Additive Synthesis)',
      sapSourceTable: 'Aggregated SAP S/4HANA CDS Views',
      sapCdsView: 'C_ProcurementDecisionTraceCDS',
      sampleRecords: [
        { key: 'Supplier ID', value: recommendedOption.primary_supplier_id },
        { key: 'Selection Mode', value: recommendedOption.mode },
        { key: 'Effective Unit Cost', value: `€${recommendedOption.effective_unit_cost_eur?.toFixed(2)}` },
        { key: 'Total Cost', value: `€${recommendedOption.total_estimated_cost_eur?.toLocaleString()}` },
        { key: 'Delivery Reliability', value: `${recommendedOption.delivery_reliability_pct}% OTD` },
        { key: 'Quality Rejection Rate', value: `${recommendedOption.quality_rejection_rate_pct}%` },
        { key: 'Offered Lead Time', value: `${recommendedOption.offered_lead_time_days} Days` },
        { key: 'Contract Status', value: recommendedOption.contract_status }
      ],
      notes: 'All weights normalized to 100%. Confidence factor penalizes insufficient historical record depth.'
    },
    // Pillar 1: Cost
    cost: {
      id: 'cost',
      title: 'Commercial & Effective Cost Pillar',
      category: 'Effective Procurement Cost',
      metricValue: `€${recommendedOption.effective_unit_cost_eur?.toFixed(2)} / EA`,
      period: evidencePackage.purchase_orders.period || 'Trailing 12 Months',
      recordCount: evidencePackage.purchase_orders.records_analyzed,
      formula:
        'EffectiveUnitCost = QuotedBasePrice + SyntheticFreight + SyntheticTariff - ContractualRebates (All non-base items marked as POC Assumption)',
      sapSourceTable: 'EKKO, EKPO, KONP, A018 (Purchasing Info Records & Conditions)',
      sapCdsView: 'I_PurOrdItemPricingElementAPI01',
      sampleRecords: evidencePackage.purchase_orders.sample_records || [],
      notes: 'Synthetic transport cost derived from plant distance matrix. Disclosed as POC Assumption.'
    },
    cost_base: {
      id: 'cost_base',
      title: 'Quoted Base Net Price',
      category: 'Quotation / Purchasing Info Record',
      metricValue: `€${evidencePackage.quotation?.quoted_price_eur?.toFixed(2) || '78.50'} / EA`,
      period: 'Valid until ' + (evidencePackage.quotation?.valid_until || '2026-12-31'),
      recordCount: 1,
      formula: 'Base Net Price quoted in RFQ Response / SAP Purchasing Info Record (EINA/EINE)',
      sapSourceTable: 'EINE (Purchasing Info Record: Purchase Organization Data)',
      sapCdsView: 'I_PurchasingInfoRecordTP',
      sampleRecords: evidencePackage.quotation ? [
        { Field: 'Quotation ID', Value: evidencePackage.quotation.quotation_id },
        { Field: 'Quoted Unit Price', Value: `€${evidencePackage.quotation.quoted_price_eur}` },
        { Field: 'Offered Lead Time', Value: `${evidencePackage.quotation.offered_lead_time_days} Days` },
        { Field: 'Validity Date', Value: evidencePackage.quotation.valid_until }
      ] : []
    },
    cost_spend: {
      id: 'cost_spend',
      title: 'Historical Spend & PO Transactions',
      category: 'Purchasing Ledger',
      metricValue: `€${evidencePackage.purchase_orders.total_spend_eur?.toLocaleString() || '185,000'}`,
      period: evidencePackage.purchase_orders.period || '2025 - 2026 YTD',
      recordCount: evidencePackage.purchase_orders.records_analyzed,
      formula: 'Sum of PO net values across confirmed orders for material',
      sapSourceTable: 'EKPO (Purchasing Document Item)',
      sapCdsView: 'C_PurchaseOrderItemDEX',
      sampleRecords: evidencePackage.purchase_orders.sample_records || []
    },
    // Pillar 2: Delivery
    delivery: {
      id: 'delivery',
      title: 'Delivery Performance & Reliability Pillar',
      category: 'Goods Receipt Telemetry',
      metricValue: `${evidencePackage.goods_receipts.on_time_delivery_rate_pct}% OTD`,
      period: 'Trailing 180 Days Goods Receipt History',
      recordCount: evidencePackage.goods_receipts.records_analyzed,
      formula: 'OTD_Rate = (OnTimeGoodsReceipts / TotalGoodsReceipts) * 100',
      sapSourceTable: 'MSEG (Material Document Segment: Movement 101/105), EKET (Scheduling Lines)',
      sapCdsView: 'C_GoodsReceiptDeliveryPerf',
      sampleRecords: evidencePackage.goods_receipts.sample_deliveries || [],
      notes: 'Receipts within ±2 calendar days of scheduled date are considered on-time.'
    },
    delivery_delay: {
      id: 'delivery_delay',
      title: 'Average Dock Arrival Delay',
      category: 'Dock Scheduling Variance',
      metricValue: `${evidencePackage.goods_receipts.average_delay_days} Days Avg`,
      period: 'Trailing 180 Days',
      recordCount: evidencePackage.goods_receipts.records_analyzed,
      formula: 'AvgDelay = Sum(max(0, ActualReceiptDate - ScheduledDate)) / TotalDelayedReceipts',
      sapSourceTable: 'EKET (PO Delivery Schedules) & MSEG (Material Documents)',
      sapCdsView: 'I_Poscheduleline',
      sampleRecords: evidencePackage.goods_receipts.sample_deliveries?.filter((d: any) => !d.on_time) || []
    },
    // Pillar 3: Quality
    quality: {
      id: 'quality',
      title: 'Quality Performance & Defect PPM Pillar',
      category: 'SAP QM Inspection Lots',
      metricValue: `${evidencePackage.quality_records.rejection_rate_pct}% (${evidencePackage.quality_records.ppm} PPM)`,
      period: 'Trailing 12 Months QA Usage Decisions',
      recordCount: evidencePackage.quality_records.inspection_lots_analyzed,
      formula: 'RejectionRate = (DefectiveQuantity / TotalInspectedQuantity) * 100; PPM = RejectionRate * 10,000',
      sapSourceTable: 'QALS (Inspection Lot Record), QAVE (Inspection Lot Usage Decision)',
      sapCdsView: 'C_InspLotUsageDecisionDEX',
      sampleRecords: evidencePackage.quality_records.sample_inspection_lots || [],
      notes: 'Usage decisions with code A (Accepted) vs R (Rejected). Scrap costs tracked in QM.'
    },
    quality_ud: {
      id: 'quality_ud',
      title: 'Inspection Lot Usage Decisions (UD)',
      category: 'QM Quality Notifications',
      metricValue: `${evidencePackage.quality_records.total_defective_quantity} Defective Units`,
      period: 'Trailing 12 Months',
      recordCount: evidencePackage.quality_records.inspection_lots_analyzed,
      formula: 'Defective units identified during goods receipt inspection type 01',
      sapSourceTable: 'QALS, QMEL (Quality Notifications)',
      sapCdsView: 'I_QualityNotificationAPI01',
      sampleRecords: evidencePackage.quality_records.sample_inspection_lots || []
    },
    // Pillar 4: Contracts
    contract: {
      id: 'contract',
      title: 'Outline Agreement & Legal Protection Pillar',
      category: 'SAP Purchasing Contracts',
      metricValue: recommendedOption.contract_status,
      period: 'Active Agreement Period',
      recordCount: evidencePackage.contracts.active_contracts?.length || 1,
      formula: 'ContractScore = ActiveContractWeight * RebateIndex * ValidityTenorScore',
      sapSourceTable: 'EKKO (Purchasing Document Header: BSTYP = K)',
      sapCdsView: 'C_PurchaseContractDEX',
      sampleRecords: evidencePackage.contracts.active_contracts || [],
      notes: 'Outline agreement guarantees price ceiling and committed capacity allocation.'
    },
    // Pillar 5: Risk & Capacity
    risk: {
      id: 'risk',
      title: 'Supply Chain Risk & Capacity Headroom Pillar',
      category: 'Supplier Exposure Telemetry',
      metricValue: `${evidencePackage.risk_signals.active_events_count} Active Risk Signals`,
      period: 'Real-time Continuous Monitoring',
      recordCount: evidencePackage.risk_signals.active_events_count,
      formula: 'RiskScore = 100 - sum(SeverityWeight_i * EventProbability_i)',
      sapSourceTable: 'Custom Telemetry / SAP Risk Signals Store',
      sapCdsView: 'C_SupplierRiskSignalCDS',
      sampleRecords: evidencePackage.risk_signals.events || [],
      notes: 'Monitors geopolitical, delivery concentration, financial, and single-source exposure.'
    }
  };

  const activeAudit = nodeAuditMap[selectedNodeId] || nodeAuditMap.root;

  return (
    <div className="space-y-6">
      {/* Evidence Graph Header Bar */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase bg-[#0a6ed1] text-white px-2 py-0.5 rounded-[2px] font-semibold">
                Interactive Decision Trace
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Grounding: SAP S/4HANA Relational Ledger
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mt-1">
              Deterministic Evidence Tree & Audit Provenance
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Click any node in the decision trace below to inspect the mathematical formula, SAP source tables, record count, and underlying transactional records.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={() => setSelectedNodeId('root')}
              className={`px-3 py-1.5 rounded-[2px] font-medium transition-colors ${
                selectedNodeId === 'root'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Reset to Root Decision
            </button>
            {onNavigateToSupplier360 && (
              <button
                onClick={() => onNavigateToSupplier360(recommendedOption.primary_supplier_id)}
                className="border border-[#0a6ed1] text-[#0a6ed1] hover:bg-blue-50 px-3 py-1.5 rounded-[2px] font-medium"
              >
                Open Supplier 360
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Tree on Left (5 cols), Audit Inspector Card on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Clickable Evidence Tree */}
        <div className="lg:col-span-5 bg-white border border-[#d5dbe1] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Decision Hierarchy Tree
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Click node to audit
            </span>
          </div>

          {/* Root Node */}
          <div
            onClick={() => setSelectedNodeId('root')}
            className={`p-3 border rounded-[2px] cursor-pointer transition-all ${
              selectedNodeId === 'root'
                ? 'border-[#0a6ed1] bg-blue-50 shadow-sm'
                : 'border-slate-300 hover:border-slate-400 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#0a6ed1] text-white flex items-center justify-center text-xs font-bold">
                  ★
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {recommendedOption.primary_supplier_name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    MCDA Composite Decision: {recommendedOption.decision_score} / 100
                  </p>
                </div>
              </div>
              <ChevronRightIcon className={`w-4 h-4 ${selectedNodeId === 'root' ? 'text-[#0a6ed1]' : 'text-slate-400'}`} />
            </div>
          </div>

          {/* Vertical Connecting Stem */}
          <div className="pl-4 space-y-2 border-l-2 border-slate-200 ml-3">
            {/* Pillar 1: Cost */}
            <div className="space-y-1">
              <div
                onClick={() => setSelectedNodeId('cost')}
                className={`p-2.5 border rounded-[2px] cursor-pointer transition-all ${
                  selectedNodeId === 'cost'
                    ? 'border-[#0a6ed1] bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSignIcon className="w-3.5 h-3.5 text-slate-600" />
                    <div>
                      <span className="text-xs font-medium text-slate-800">Effective Cost</span>
                      <span className="ml-2 font-mono text-[11px] font-semibold text-slate-900">
                        €{recommendedOption.effective_unit_cost_eur?.toFixed(2)}/EA
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePillar('cost');
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400"
                  >
                    <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${expandedPillars.cost ? '' : '-rotate-90'}`} />
                  </button>
                </div>
              </div>
              {expandedPillars.cost && (
                <div className="pl-4 space-y-1 border-l border-slate-200 ml-2">
                  <div
                    onClick={() => setSelectedNodeId('cost_base')}
                    className={`p-2 border rounded-[2px] text-[11px] cursor-pointer ${
                      selectedNodeId === 'cost_base' ? 'border-[#0a6ed1] bg-blue-50 font-semibold' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    Quoted Unit Price: €{evidencePackage.quotation?.quoted_price_eur?.toFixed(2) || '78.50'}
                  </div>
                  <div
                    onClick={() => setSelectedNodeId('cost_spend')}
                    className={`p-2 border rounded-[2px] text-[11px] cursor-pointer ${
                      selectedNodeId === 'cost_spend' ? 'border-[#0a6ed1] bg-blue-50 font-semibold' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    Historical Spend: €{evidencePackage.purchase_orders.total_spend_eur?.toLocaleString()} ({evidencePackage.purchase_orders.records_analyzed} POs)
                  </div>
                </div>
              )}
            </div>

            {/* Pillar 2: Delivery */}
            <div className="space-y-1">
              <div
                onClick={() => setSelectedNodeId('delivery')}
                className={`p-2.5 border rounded-[2px] cursor-pointer transition-all ${
                  selectedNodeId === 'delivery'
                    ? 'border-[#0a6ed1] bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TruckIcon className="w-3.5 h-3.5 text-slate-600" />
                    <div>
                      <span className="text-xs font-medium text-slate-800">Delivery Reliability</span>
                      <span className="ml-2 font-mono text-[11px] font-semibold text-emerald-700">
                        {evidencePackage.goods_receipts.on_time_delivery_rate_pct}% OTD
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePillar('delivery');
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400"
                  >
                    <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${expandedPillars.delivery ? '' : '-rotate-90'}`} />
                  </button>
                </div>
              </div>
              {expandedPillars.delivery && (
                <div className="pl-4 space-y-1 border-l border-slate-200 ml-2">
                  <div
                    onClick={() => setSelectedNodeId('delivery_delay')}
                    className={`p-2 border rounded-[2px] text-[11px] cursor-pointer ${
                      selectedNodeId === 'delivery_delay' ? 'border-[#0a6ed1] bg-blue-50 font-semibold' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    Average Dock Delay: {evidencePackage.goods_receipts.average_delay_days} Days ({evidencePackage.goods_receipts.records_analyzed} Receipts)
                  </div>
                </div>
              )}
            </div>

            {/* Pillar 3: Quality */}
            <div className="space-y-1">
              <div
                onClick={() => setSelectedNodeId('quality')}
                className={`p-2.5 border rounded-[2px] cursor-pointer transition-all ${
                  selectedNodeId === 'quality'
                    ? 'border-[#0a6ed1] bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AwardIcon className="w-3.5 h-3.5 text-slate-600" />
                    <div>
                      <span className="text-xs font-medium text-slate-800">Quality Performance</span>
                      <span className="ml-2 font-mono text-[11px] font-semibold text-slate-900">
                        {evidencePackage.quality_records.rejection_rate_pct}% Rejects
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePillar('quality');
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400"
                  >
                    <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${expandedPillars.quality ? '' : '-rotate-90'}`} />
                  </button>
                </div>
              </div>
              {expandedPillars.quality && (
                <div className="pl-4 space-y-1 border-l border-slate-200 ml-2">
                  <div
                    onClick={() => setSelectedNodeId('quality_ud')}
                    className={`p-2 border rounded-[2px] text-[11px] cursor-pointer ${
                      selectedNodeId === 'quality_ud' ? 'border-[#0a6ed1] bg-blue-50 font-semibold' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    Defect PPM: {evidencePackage.quality_records.ppm} PPM ({evidencePackage.quality_records.inspection_lots_analyzed} Lots)
                  </div>
                </div>
              )}
            </div>

            {/* Pillar 4: Contract */}
            <div className="space-y-1">
              <div
                onClick={() => setSelectedNodeId('contract')}
                className={`p-2.5 border rounded-[2px] cursor-pointer transition-all ${
                  selectedNodeId === 'contract'
                    ? 'border-[#0a6ed1] bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileTextIcon className="w-3.5 h-3.5 text-slate-600" />
                    <div>
                      <span className="text-xs font-medium text-slate-800">Outline Contract</span>
                      <span className="ml-2 font-mono text-[11px] font-semibold text-slate-900">
                        {recommendedOption.contract_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 5: Risk & Capacity */}
            <div className="space-y-1">
              <div
                onClick={() => setSelectedNodeId('risk')}
                className={`p-2.5 border rounded-[2px] cursor-pointer transition-all ${
                  selectedNodeId === 'risk'
                    ? 'border-[#0a6ed1] bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldAlertIcon className="w-3.5 h-3.5 text-slate-600" />
                    <div>
                      <span className="text-xs font-medium text-slate-800">Risk & Capacity</span>
                      <span className="ml-2 font-mono text-[11px] font-semibold text-slate-900">
                        {evidencePackage.risk_signals.active_events_count} Active Signals
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Audit Card for Selected Node */}
        <div className="lg:col-span-7 bg-white border border-[#d5dbe1] p-5 space-y-4">
          <div className="flex items-start justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
                {activeAudit.category}
              </span>
              <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                {activeAudit.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Mathematical formula, SAP ERP source grounding, and verified sample records.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Metric Value</span>
              <p className="text-base font-bold font-mono text-[#0a6ed1]">
                {activeAudit.metricValue}
              </p>
            </div>
          </div>

          {/* Audit Metadata Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f8fafc] border border-slate-200 p-3 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Verified Period</span>
              <p className="font-medium text-slate-800 mt-0.5 truncate">{activeAudit.period}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Records Analyzed</span>
              <p className="font-mono font-semibold text-slate-900 mt-0.5">{activeAudit.recordCount} Verified Rows</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold">SAP Table / Entity</span>
              <p className="font-mono text-[11px] text-slate-800 mt-0.5 truncate">{activeAudit.sapSourceTable}</p>
            </div>
          </div>

          {/* Calculation Formula Box */}
          <div className="border border-slate-200 p-3 bg-slate-50 rounded-[2px]">
            <div className="flex items-center space-x-2 mb-1">
              <DatabaseIcon className="w-3.5 h-3.5 text-[#0a6ed1]" />
              <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Deterministic Calculation Formula
              </span>
            </div>
            <pre className="text-[11px] font-mono text-slate-800 bg-white p-2.5 border border-slate-200 overflow-x-auto whitespace-pre-wrap">
              {activeAudit.formula}
            </pre>
            {activeAudit.notes && (
              <p className="text-[10px] text-slate-500 mt-1.5 italic">
                Note: {activeAudit.notes}
              </p>
            )}
          </div>

          {/* SAP Source Table / CDS View Badge */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-semibold">SAP CDS View Binding:</span>
            <code className="bg-slate-100 text-[#0a6ed1] px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">
              {activeAudit.sapCdsView}
            </code>
          </div>

          {/* Underlying Transactional Sample Records */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Underlying Transactional Records ({activeAudit.sampleRecords.length} Displayed)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Audited from Mock Relational DB</span>
            </div>

            {activeAudit.sampleRecords.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 max-h-56 overflow-y-auto">
                <table className="sap-table text-xs">
                  <thead>
                    <tr>
                      {Object.keys(activeAudit.sampleRecords[0]).map((key) => (
                        <th key={key}>{key.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeAudit.sampleRecords.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="font-mono text-[11px]">
                            {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center font-mono">
                No individual transactional line items for this aggregate node.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
