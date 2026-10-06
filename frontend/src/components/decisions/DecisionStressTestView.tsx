import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { BackNavigation } from '../common/BackNavigation';
import { DEFAULT_REQUIREMENTS } from '../../data/defaultRequirements';
import {
  ShieldAlertIcon,
  AlertTriangleIcon,
  CheckIcon,
  SlidersIcon,
  LayersIcon,
  ActivityIcon,
  BuildingIcon,
  ScaleIcon,
  AlertOctagonIcon
} from '../common/Icons';

interface DecisionStressTestViewProps {
  initialRequirement?: any;
  onOpenRequirementInWorkspace?: (reqId: string) => void;
}

export const DecisionStressTestView: React.FC<DecisionStressTestViewProps> = ({
  initialRequirement,
  onOpenRequirementInWorkspace
}) => {
  const defaultReq = initialRequirement || DEFAULT_REQUIREMENTS[0];
  const [requirements, setRequirements] = useState<any[]>(DEFAULT_REQUIREMENTS);
  const [selectedReqId, setSelectedReqId] = useState<string>(
    initialRequirement?.requirement_id || 'REQ-001'
  );
  const [activeReq, setActiveReq] = useState<any>(defaultReq);
  const [stressResult, setStressResult] = useState<any>(null);
  const [failureResult, setFailureResult] = useState<any>(null);
  const [sensitivityMatrix, setSensitivityMatrix] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [failedSupId, setFailedSupId] = useState<string>('SUP-004');
  const [activeTab, setActiveTab] = useState<'shocks' | 'outage' | 'sensitivity'>('shocks');

  useEffect(() => {
    loadRequirements();
  }, []);

  useEffect(() => {
    if (activeReq) {
      runAllStressAnalyses(activeReq);
    }
  }, [activeReq]);

  const loadRequirements = async () => {
    try {
      const reqs = await api.getRequirements();
      if (reqs && reqs.length > 0) {
        setRequirements(reqs);
        if (!activeReq) {
          const found = reqs.find((r) => r.requirement_id === selectedReqId) || reqs[0];
          setActiveReq(found);
        }
      }
    } catch (err) {
      console.warn('Failed to load live requirements, using default list:', err);
    }
  };

  const handleSelectReq = (reqId: string) => {
    setSelectedReqId(reqId);
    const targetList = requirements.length > 0 ? requirements : DEFAULT_REQUIREMENTS;
    const found = targetList.find((r) => r.requirement_id === reqId);
    if (found) {
      setActiveReq(found);
    }
  };

  const runAllStressAnalyses = async (req: any) => {
    try {
      setLoading(true);
      const [stressRes, sensMatrix] = await Promise.all([
        api.stressTestDecision(req),
        api.getDecisionSensitivityMatrix(req)
      ]);
      setStressResult(stressRes);
      setSensitivityMatrix(sensMatrix);

      const targetFailSup = stressRes.baseline_top_supplier_id || 'SUP-004';
      setFailedSupId(targetFailSup);
      const failRes = await api.simulateSupplierFailure(req, targetFailSup);
      setFailureResult(failRes);
    } catch (err) {
      console.error('Failed to run stress analysis suite:', err);
    } finally {
      setLoading(false);
    }
  };

  const runFailureSimulation = async (req: any, supId: string) => {
    try {
      const res = await api.simulateSupplierFailure(req, supId);
      setFailureResult(res);
    } catch (err) {
      console.error('Failed to run failure simulation:', err);
    }
  };

  if (loading && !stressResult) {
    return <ProcessingIndicator operation="stress_test" message="Executing 14-shock stress tests and failover simulation..." />;
  }

  return (
    <div className="space-y-4">
      <BackNavigation
        fallbackTab="decisions"
        fallbackSubtab="twin"
        fallbackLabel="Decisions Hub"
      />

      {/* Header Banner */}
      <div className="sap-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="sap-badge sap-badge-error text-[10px] font-mono uppercase font-semibold">
              Deterministic Robustness Engine
            </span>
            <span className="text-[11px] text-[#556b82] font-mono">
              Adverse Supply Chain Shocks (14 Stress Vectors)
            </span>
          </div>
          <h2 className="text-sm font-bold text-[#1d2d3e] mt-1">
            Decision Stress Testing & Outage Failover
          </h2>
          <p className="text-xs text-[#556b82] mt-0.5">
            Primary Focus: What could disrupt this sourcing decision, and what is the automated failover strategy?
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-[#556b82]">Requirement:</label>
          <select
            value={selectedReqId}
            onChange={(e) => handleSelectReq(e.target.value)}
            className="sap-select text-xs py-1"
          >
            {requirements.length === 0 ? (
              <option value={selectedReqId}>{selectedReqId}: Loading...</option>
            ) : (
              requirements.map((r) => (
                <option key={r.requirement_id} value={r.requirement_id}>
                  {r.requirement_id}: {r.title}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Robustness Indicator Card (Prompt Section 9) */}
      {stressResult && (
        <div className="sap-card p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#edf0f3]">
            <div>
              <div className="flex items-center space-x-2">
                <span className="sap-badge sap-badge-neutral text-[10px] font-mono uppercase">
                  Tested Recommendation
                </span>
                <span className="text-[11px] font-mono text-[#556b82]">
                  {stressResult.requirement?.material_id} • {stressResult.requirement?.quantity?.toLocaleString()} Units
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1d2d3e] mt-1">
                {stressResult.baseline_top_supplier_name}
              </h3>
              <p className="text-xs text-[#556b82] font-mono">
                Baseline Decision Score: {stressResult.baseline_decision_score} / 100
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right bg-[#edf5ff] px-3.5 py-2 rounded border border-[#c4dcfc]">
                <span className="text-[10px] uppercase font-bold text-[#0070f2] tracking-wider block">
                  Deterministic Robustness
                </span>
                <div
                  className={`text-2xl font-bold font-mono ${
                    stressResult.robustness_score_pct >= 75.0
                      ? 'text-[#107e3e]'
                      : stressResult.robustness_score_pct >= 50.0
                      ? 'text-[#e9730c]'
                      : 'text-[#bb0000]'
                  }`}
                >
                  {stressResult.robustness_score_pct}%
                  <span className="text-xs font-normal text-[#556b82]">
                    {' '}({stressResult.stable_tests_count ?? stressResult.unchanged_outcomes_count} / {stressResult.total_tests_count ?? stressResult.tested_conditions_count} Stable)
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#1d2d3e] mt-0.5">
                  {stressResult.robustness_rating}
                </p>
              </div>

              {onOpenRequirementInWorkspace && (
                <button
                  onClick={() => onOpenRequirementInWorkspace(stressResult.requirement?.requirement_id)}
                  className="sap-btn sap-btn-secondary text-xs"
                >
                  Open in Sourcing
                </button>
              )}
            </div>
          </div>

          {/* Robustness Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 shadow-xs">
            <div>
              <span className="text-[11px] text-[#64748b] uppercase font-semibold">Conditions Tested</span>
              <p className="font-mono text-base font-bold text-[#0f172a] mt-0.5">
                {stressResult.total_tests_count ?? stressResult.tested_conditions_count ?? 14}
              </p>
              <p className="text-[11px] text-[#64748b]">Independent Macro Shocks</p>
            </div>
            <div>
              <span className="text-[11px] text-[#64748b] uppercase font-semibold">Unchanged Outcomes</span>
              <p className="font-mono text-base font-bold text-[#16a34a] mt-0.5">
                {stressResult.stable_tests_count ?? stressResult.unchanged_outcomes_count}
              </p>
              <p className="text-[11px] text-[#64748b]">Award remains with primary</p>
            </div>
            <div>
              <span className="text-[11px] text-[#64748b] uppercase font-semibold">Changed Outcomes</span>
              <p className="font-mono text-base font-bold text-[#dc2626] mt-0.5">
                {stressResult.changed_outcomes_count ?? (stressResult.total_tests_count - stressResult.stable_tests_count)}
              </p>
              <p className="text-[11px] text-[#64748b]">Triggers re-allocation</p>
            </div>
            <div>
              <span className="text-[11px] text-[#64748b] uppercase font-semibold">Sensitive Factors</span>
              <p className="font-medium text-[#0f172a] mt-0.5 truncate">
                {stressResult.sensitive_factors?.join(', ') || 'Delivery, Capacity'}
              </p>
              <p className="text-[11px] text-[#64748b]">Critical vulnerability</p>
            </div>
          </div>

          {/* AI Deterministic Robustness Summary */}
          <div className="p-3.5 bg-[#f0f9ff] border border-[#bae6fd] rounded-xl text-xs text-[#0f172a] leading-relaxed shadow-xs">
            <strong className="text-[#0066cc]">Automated Robustness Diagnostic: </strong>
            {stressResult.ai_robustness_summary}
          </div>
        </div>
      )}

      {/* Sub-Tabs: 14 Shocks vs Supplier Outage vs 2D Sensitivity Matrix */}
      <div className="bg-white border border-[#e2e8f0] px-4 py-2 flex items-center space-x-1.5 text-xs rounded-xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('shocks')}
          className={`px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'shocks'
              ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
              : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
          }`}
        >
          14 Supply Chain Stress Shocks ({stressResult?.stable_tests_count ?? stressResult?.unchanged_outcomes_count}/14 Stable)
        </button>
        <button
          onClick={() => setActiveTab('outage')}
          className={`px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'outage'
              ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
              : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
          }`}
        >
          Supplier Failure & Failover Strategies
        </button>
        <button
          onClick={() => setActiveTab('sensitivity')}
          className={`px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'sensitivity'
              ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
              : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
          }`}
        >
          2D Sensitivity Map (Cost vs Delivery)
        </button>
      </div>

      {/* Tab 1: 14 Stress Shocks Table */}
      {activeTab === 'shocks' && stressResult && (
        <div className="sap-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#edf0f3]">
            <h3 className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider">
              14 Deterministic Supply Chain Shock Evaluations
            </h3>
            <span className="text-[11px] text-[#556b82] font-mono">
              Calculated dynamically via MCDA model
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="sap-table text-xs">
              <thead>
                <tr>
                  <th>Shock Vector</th>
                  <th>Category</th>
                  <th>Parameter Shift</th>
                  <th>New Winner</th>
                  <th>Stress Score</th>
                  <th>Delta</th>
                  <th>Cost Impact</th>
                  <th>Status</th>
                  <th>Strategic Hedging Action</th>
                </tr>
              </thead>
              <tbody>
                {stressResult.stress_tests?.map((t: any, idx: number) => (
                  <tr key={idx}>
                    <td className="font-semibold text-slate-900 whitespace-nowrap">{t.shock_name}</td>
                    <td>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-[2px]">
                        {t.category || 'Macro'}
                      </span>
                    </td>
                    <td className="text-slate-600 font-mono text-[11px]">{t.shock_parameter}</td>
                    <td className="font-medium text-slate-800">
                      <span className={t.is_stable ? 'text-slate-900' : 'text-[#0a6ed1] font-bold'}>
                        {t.stress_top_supplier || t.new_recommendation_name}
                      </span>
                    </td>
                    <td className="font-mono">{t.stress_decision_score ?? t.new_score}</td>
                    <td className={`font-mono font-semibold ${t.score_delta < -10.0 ? 'text-red-700' : 'text-slate-700'}`}>
                      {t.score_delta > 0 ? '+' : ''}{t.score_delta}
                    </td>
                    <td className="font-mono text-[11px]">
                      {t.effective_cost_delta_eur ? `+€${t.effective_cost_delta_eur.toFixed(2)}/EA` : '€0.00'}
                    </td>
                    <td>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-[2px] font-semibold uppercase ${
                          t.is_stable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {t.is_stable ? 'Stable' : 'Changed'}
                      </span>
                    </td>
                    <td className="text-slate-600 text-[11px] max-w-xs">{t.hedging_mitigation || t.hedging_str}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Supplier Failure Simulation & 4 Failover Strategies */}
      {activeTab === 'outage' && failureResult && (
        <div className="bg-white border border-[#d5dbe1] p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Supplier Failure Simulation & Multi-Strategy Failover
              </h3>
              <p className="text-[11px] text-slate-500">
                Simulate catastrophic outage of primary supplier and analyze 4 distinct hedging strategies plus Single vs Multi-Supplier comparison.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <label className="font-semibold text-slate-600">Simulate Outage Of:</label>
              <select
                value={failedSupId}
                onChange={(e) => {
                  setFailedSupId(e.target.value);
                  runFailureSimulation(activeReq, e.target.value);
                }}
                className="border border-slate-300 rounded-[2px] px-2.5 py-1 text-xs text-slate-900 bg-white"
              >
                {failureResult.alternative_candidates?.map((c: any) => (
                  <option key={c.supplier_id} value={c.supplier_id}>
                    {c.supplier_name} ({c.supplier_id})
                  </option>
                ))}
                <option value={failureResult.failed_supplier_id}>
                  {failureResult.failed_supplier_name} ({failureResult.failed_supplier_id})
                </option>
              </select>
            </div>
          </div>

          {/* Outage High-Level Impact Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Required Demand</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{failureResult.required_quantity?.toLocaleString()} EA</p>
              <p className="text-[10px] text-slate-400 font-mono">Plant assembly demand</p>
            </div>

            <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Volume Coverage</span>
              <p
                className={`text-base font-bold mt-0.5 ${
                  failureResult.coverage_pct === 100.0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {failureResult.coverage_pct}%
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {failureResult.uncovered_quantity > 0
                  ? `Deficit: ${failureResult.uncovered_quantity.toLocaleString()} EA`
                  : '100% Demand Covered'}
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Total Alt Capacity</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{failureResult.total_alternative_capacity?.toLocaleString()} EA</p>
              <p className="text-[10px] text-slate-400 font-mono">Across approved source list</p>
            </div>

            <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Cost Variance</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {failureResult.cost_variance_eur >= 0 ? '+' : ''}€{failureResult.cost_variance_eur?.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Total order variance</p>
            </div>
          </div>

          {/* AI Assessment */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-[2px]">
            <strong className="uppercase tracking-wider text-[10px] font-bold block mb-1">
              Failover Strategic Diagnostic:
            </strong>
            <p>{failureResult.ai_failure_assessment}</p>
          </div>

          {/* 4 Mitigation Strategies Grid (Prompt Section 12) */}
          {failureResult.strategies && (
            <div>
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-3">
                4 Evaluated Recovery & Hedging Strategies
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Strategy 1: Single Alternative */}
                <div className="p-4 border border-slate-200 bg-white rounded-[2px] space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-900">1. Single Alternative Supplier</span>
                    <span className="text-[10px] font-mono bg-blue-100 text-[#0a6ed1] px-1.5 py-0.5 rounded">
                      {failureResult.strategies.single_alternative.feasibility}
                    </span>
                  </div>
                  <p className="text-slate-700">
                    Award entire volume to <strong>{failureResult.strategies.single_alternative.supplier_name}</strong>.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 border border-slate-200">
                    <div>
                      <span className="text-slate-500">Effective Unit Cost:</span>
                      <p className="font-mono font-semibold">€{failureResult.strategies.single_alternative.effective_unit_cost_eur?.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Cost Delta:</span>
                      <p className="font-mono font-semibold text-rose-700">
                        {failureResult.strategies.single_alternative.cost_variance_eur >= 0 ? '+' : ''}€{failureResult.strategies.single_alternative.cost_variance_eur?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Strategy 2: Multi-Supplier Allocation */}
                <div className="p-4 border border-slate-200 bg-white rounded-[2px] space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-900">2. Multi-Supplier Quota Allocation</span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      {failureResult.strategies.multi_supplier_allocation.feasibility}
                    </span>
                  </div>
                  <p className="text-slate-700">
                    Distribute demand across {failureResult.strategies.multi_supplier_allocation.allocation_plan?.length} pre-qualified suppliers according to practical capacity ceilings.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 border border-slate-200">
                    <div>
                      <span className="text-slate-500">Total Outlay:</span>
                      <p className="font-mono font-semibold">€{failureResult.strategies.multi_supplier_allocation.total_cost_eur?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Coverage:</span>
                      <p className="font-mono font-semibold text-emerald-700">{failureResult.strategies.multi_supplier_allocation.coverage_pct}%</p>
                    </div>
                  </div>
                </div>

                {/* Strategy 3: New Sourcing Pipeline */}
                <div className="p-4 border border-slate-200 bg-white rounded-[2px] space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-900">3. Emergency Sourcing Qualification</span>
                    <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                      RFQ Broadcast
                    </span>
                  </div>
                  <p className="text-slate-700">
                    {failureResult.strategies.new_sourcing.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 border border-slate-200">
                    <div>
                      <span className="text-slate-500">Estimated Lead Time:</span>
                      <p className="font-mono font-semibold">{failureResult.strategies.new_sourcing.estimated_lead_time_days} Days</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Target Cost Corridor:</span>
                      <p className="font-mono font-semibold">{failureResult.strategies.new_sourcing.target_cost_corridor_eur}</p>
                    </div>
                  </div>
                </div>

                {/* Strategy 4: Safety Stock Buffer */}
                <div className="p-4 border border-slate-200 bg-white rounded-[2px] space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-900">4. Plant Safety Stock Buffer</span>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      Buffer Consumption
                    </span>
                  </div>
                  <p className="text-slate-700">
                    {failureResult.strategies.safety_stock_strategy.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 border border-slate-200">
                    <div>
                      <span className="text-slate-500">Required Safety Buffer:</span>
                      <p className="font-mono font-semibold">{failureResult.strategies.safety_stock_strategy.recommended_buffer_units?.toLocaleString()} EA</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Buffer Days:</span>
                      <p className="font-mono font-semibold">{failureResult.strategies.safety_stock_strategy.buffer_days} Days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Single vs Multi-Supplier Comparison Matrix (Prompt Section 13) */}
          {failureResult.single_vs_multi_comparison && (
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                Single vs Multi-Supplier Allocation Comparison Matrix
              </h4>
              <table className="sap-table text-xs">
                <thead>
                  <tr>
                    <th>Dimension</th>
                    <th>Single Alternative Strategy</th>
                    <th>Multi-Supplier Quota Strategy</th>
                    <th>Delta / Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold text-slate-900">Total Effective Cost</td>
                    <td className="font-mono">€{failureResult.single_vs_multi_comparison.single_supplier.total_cost_eur?.toLocaleString()}</td>
                    <td className="font-mono">€{failureResult.single_vs_multi_comparison.multi_supplier.total_cost_eur?.toLocaleString()}</td>
                    <td className="font-mono font-semibold text-slate-800">
                      {failureResult.single_vs_multi_comparison.deltas.cost_variance_eur >= 0 ? '+' : ''}€{failureResult.single_vs_multi_comparison.deltas.cost_variance_eur?.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-900">Delivery Reliability</td>
                    <td className="font-mono">{failureResult.single_vs_multi_comparison.single_supplier.delivery_reliability_pct}% OTD</td>
                    <td className="font-mono">{failureResult.single_vs_multi_comparison.multi_supplier.delivery_reliability_pct}% OTD (Weighted)</td>
                    <td className="font-mono font-semibold text-emerald-700">
                      {failureResult.single_vs_multi_comparison.deltas.delivery_delta_pts > 0 ? '+' : ''}{failureResult.single_vs_multi_comparison.deltas.delivery_delta_pts} pts
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-900">Quality Defect Rate</td>
                    <td className="font-mono">{failureResult.single_vs_multi_comparison.single_supplier.quality_rejection_rate_pct}%</td>
                    <td className="font-mono">{failureResult.single_vs_multi_comparison.multi_supplier.quality_rejection_rate_pct}% (Weighted)</td>
                    <td className="font-mono font-semibold text-slate-700">
                      {failureResult.single_vs_multi_comparison.deltas.quality_delta_pts} pts
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-900">Max Spend Concentration</td>
                    <td className="font-mono text-rose-700 font-bold">100.0% (Single Source)</td>
                    <td className="font-mono text-emerald-700 font-bold">{failureResult.single_vs_multi_comparison.multi_supplier.concentration_pct}%</td>
                    <td className="font-mono font-semibold text-emerald-700">
                      -{failureResult.single_vs_multi_comparison.deltas.concentration_reduction_pts}% Risk Reduction
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-900">Uncovered Units Deficit</td>
                    <td className="font-mono">{failureResult.single_vs_multi_comparison.single_supplier.uncovered_units?.toLocaleString()} EA</td>
                    <td className="font-mono">{failureResult.single_vs_multi_comparison.multi_supplier.uncovered_units?.toLocaleString()} EA</td>
                    <td className="font-mono font-semibold text-slate-800">
                      {failureResult.single_vs_multi_comparison.multi_supplier.uncovered_units === 0 ? 'Full Coverage' : 'Deficit Managed'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: 2D Decision Sensitivity Matrix (Prompt Section 10) */}
      {activeTab === 'sensitivity' && sensitivityMatrix && (
        <div className="bg-white border border-[#d5dbe1] p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                2D Decision Sensitivity Map: Cost Priority vs Delivery Priority
              </h3>
              <p className="text-xs text-slate-600">
                Interactive trade-off matrix mapping how the optimal supplier shifts across different priority balances.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Evaluated across 16 weighting spectrums
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="sap-table text-xs">
              <thead>
                <tr>
                  <th className="bg-slate-100">Cost Priority ↓ / Delivery Priority →</th>
                  {sensitivityMatrix.delivery_levels.map((d: string) => (
                    <th key={d} className="text-center">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sensitivityMatrix.grid.map((row: any[], rIdx: number) => (
                  <tr key={rIdx}>
                    <td className="font-semibold text-slate-900 bg-slate-50">
                      {sensitivityMatrix.cost_levels[rIdx]}
                    </td>
                    {row.map((cell: any, cIdx: number) => (
                      <td
                        key={cIdx}
                        className={`text-center p-3 border border-slate-200 transition-colors ${
                          cell.preferred_supplier_id === stressResult?.baseline_top_supplier_id
                            ? 'bg-blue-50/70 border-[#0a6ed1]'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-slate-900">{cell.preferred_supplier_name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{cell.preferred_supplier_id}</div>
                        <div className="text-[11px] font-mono font-semibold text-[#0a6ed1] mt-1">
                          Score: {cell.score}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-100 border border-[#0a6ed1] rounded-sm"></span>
              <span>Highlighted cells indicate baseline recommendation. Shaded shifts indicate crossover tipping points.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
