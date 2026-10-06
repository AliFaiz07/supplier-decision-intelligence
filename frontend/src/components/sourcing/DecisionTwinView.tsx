import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DecisionTwin, ProcurementRequirement } from '../../types';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { BackNavigation } from '../common/BackNavigation';
import {
  LayersIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  ActivityIcon,
  TruckIcon,
  AwardIcon,
  DollarSignIcon,
  RefreshIcon,
  CheckIcon,
  SlidersIcon,
  ChevronRightIcon
} from '../common/Icons';

interface DecisionTwinViewProps {
  initialRequirement?: ProcurementRequirement;
  onNavigateToSupplier360: (supplierId: string) => void;
  onNavigateToStressTest: () => void;
  onOpenAssistantWithQuery?: (query: string, context?: any) => void;
}

export const DecisionTwinView: React.FC<DecisionTwinViewProps> = ({
  initialRequirement,
  onNavigateToSupplier360,
  onNavigateToStressTest,
  onOpenAssistantWithQuery
}) => {
  const [twin, setTwin] = useState<DecisionTwin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Live editable twin simulation parameters
  const [simQuantity, setSimQuantity] = useState<number>(initialRequirement?.quantity || 10000);
  const [simPlant, setSimPlant] = useState<string>(initialRequirement?.plant_id || 'P001');
  const [simDate, setSimDate] = useState<string>(initialRequirement?.required_date || '2026-10-15');
  const [simPriority, setSimPriority] = useState<string>(initialRequirement?.business_priority || 'Balanced');

  // Interactive weights in Twin
  const [weights, setWeights] = useState<Record<string, number>>({
    price: 25,
    delivery: 25,
    quality: 20,
    lead_time: 15,
    contract: 10,
    risk: 5
  });

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  useEffect(() => {
    loadDecisionTwin();
  }, [simQuantity, simPlant, simDate, simPriority]);

  const loadDecisionTwin = async () => {
    try {
      setLoading(true);
      const reqPayload = {
        requirement_id: initialRequirement?.requirement_id || 'REQ-001',
        material_id: initialRequirement?.material_id || 'MAT-001',
        quantity: simQuantity,
        plant_id: simPlant,
        required_date: simDate,
        business_priority: simPriority,
        selection_mode: initialRequirement?.selection_mode || 'Single Supplier'
      };

      const normalizedWeights: Record<string, number> = {
        price: weights.price / 100,
        delivery: weights.delivery / 100,
        quality: weights.quality / 100,
        lead_time: weights.lead_time / 100,
        contract: weights.contract / 100,
        risk: weights.risk / 100
      };

      const res = await api.getDecisionTwin(reqPayload, normalizedWeights, {
        override_quantity: simQuantity,
        override_plant: simPlant,
        override_required_date: simDate
      });
      setTwin(res);
      if (res.active_recommendation) {
        setSelectedCandidateId(res.active_recommendation.primary_supplier_id);
      }
    } catch (err) {
      console.error('Failed to load Decision Twin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyWeightPreset = (presetName: string) => {
    let newWeights = { ...weights };
    if (presetName === 'Cost') {
      newWeights = { price: 50, delivery: 15, quality: 15, lead_time: 10, contract: 5, risk: 5 };
    } else if (presetName === 'Delivery') {
      newWeights = { price: 15, delivery: 45, quality: 15, lead_time: 15, contract: 5, risk: 5 };
    } else if (presetName === 'Quality') {
      newWeights = { price: 15, delivery: 15, quality: 45, lead_time: 10, contract: 5, risk: 10 };
    } else if (presetName === 'Balanced') {
      newWeights = { price: 25, delivery: 25, quality: 20, lead_time: 15, contract: 10, risk: 5 };
    }
    setWeights(newWeights);
    // trigger reload with new weights
    setTimeout(() => loadDecisionTwin(), 50);
  };

  return (
    <div className="space-y-4">
      <BackNavigation
        fallbackTab="decisions"
        fallbackLabel="Decisions Hub"
      />

      {/* Cockpit Status Header */}
      <div className="sap-card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="sap-badge sap-badge-success text-[10px] font-mono uppercase flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#107e3e] animate-pulse"></span>
                <span>{twin?.status || 'LIVE_SYNCHRONIZED'}</span>
              </span>
              <span className="text-xs text-[#556b82] font-mono">
                Twin ID: {twin?.twin_id || 'TWIN-REQ-001'}
              </span>
              <span className="text-[11px] text-[#556b82] font-mono">
                Updated: {twin?.timestamp ? new Date(twin.timestamp).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
            <h2 className="text-sm font-bold text-[#1d2d3e] mt-1 tracking-tight">
              Procurement Decision Twin Cockpit
            </h2>
            <p className="text-xs text-[#556b82] mt-0.5">
              Primary Focus: Will this sourcing decision remain optimal if market conditions, lead times, or volume requirements drift?
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadDecisionTwin}
              disabled={loading}
              className="sap-btn sap-btn-secondary text-xs flex items-center space-x-1.5"
            >
              <RefreshIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Twin</span>
            </button>
            <button
              onClick={onNavigateToStressTest}
              className="sap-btn sap-btn-primary text-xs flex items-center space-x-1.5"
            >
              <ActivityIcon className="w-3.5 h-3.5" />
              <span>Run Stress Tests</span>
            </button>
          </div>
        </div>

        {/* Live Assumption Overrides Bar */}
        <div className="mt-3 pt-3 border-t border-[#edf0f3] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#556b82] mb-1">
              Quantity Parameter (EA)
            </label>
            <input
              type="number"
              value={simQuantity}
              onChange={(e) => setSimQuantity(Number(e.target.value))}
              className="sap-input w-full font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#556b82] mb-1">
              Receiving Plant
            </label>
            <select
              value={simPlant}
              onChange={(e) => setSimPlant(e.target.value)}
              className="sap-select w-full text-xs"
            >
              <option value="P001">P001 - Munich Assembly</option>
              <option value="P002">P002 - Katowice Works</option>
              <option value="P003">P003 - Linz Works</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#556b82] mb-1">
              Required Delivery Date
            </label>
            <input
              type="date"
              value={simDate}
              onChange={(e) => setSimDate(e.target.value)}
              className="sap-input w-full font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#556b82] mb-1">
              Weighting Strategy Preset
            </label>
            <div className="flex space-x-1.5">
              {['Balanced', 'Cost', 'Delivery', 'Quality'].map((p) => (
                <button
                  key={p}
                  onClick={() => handleApplyWeightPreset(p)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    simPriority === p
                      ? 'border-[#0066cc] bg-[#0066cc] text-white shadow-xs'
                      : 'border-[#e2e8f0] hover:bg-[#f1f5f9] text-[#475569]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && !twin ? (
        <ProcessingIndicator operation="analyze" message="Synchronizing Decision Twin telemetry..." />
      ) : twin ? (
        <div className="space-y-6">
          {/* Top Context Row: Material Historical Price Corridor + Active Twin Recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Historical Price Corridor Card */}
            <div className="lg:col-span-5 sap-card p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#edf0f3]">
                <span className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider flex items-center space-x-1.5">
                  <TrendingUpIcon className="w-3.5 h-3.5 text-[#0070f2]" />
                  <span>Market & Historical Price Corridor</span>
                </span>
                <span className="text-[10px] font-mono text-[#556b82]">
                  {twin.context_requirement.material_id}
                </span>
              </div>

              <p className="text-xs text-[#556b82]">
                Continuous 24-month pricing band from verified SAP purchase orders and Purchasing Info Records (PIRs).
              </p>

              <div className="grid grid-cols-3 gap-2 bg-[#f5f6f8] border border-[#d9dcdf] rounded p-3 text-center">
                <div>
                  <span className="text-[10px] text-[#556b82] uppercase">Historical Min</span>
                  <p className="font-mono text-xs font-bold text-[#107e3e] mt-0.5">
                    €{twin.market_and_history_corridor.historical_min_price_eur?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#556b82] uppercase">Historical Avg</span>
                  <p className="font-mono text-xs font-bold text-[#1d2d3e] mt-0.5">
                    €{twin.market_and_history_corridor.historical_avg_price_eur?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#556b82] uppercase">Historical Max</span>
                  <p className="font-mono text-xs font-bold text-[#bb0000] mt-0.5">
                    €{twin.market_and_history_corridor.historical_max_price_eur?.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#556b82]">Price Volatility Index:</span>
                <span className="font-mono font-medium text-[#1d2d3e]">
                  {twin.market_and_history_corridor.volatility_score} (EUR Corridor)
                </span>
              </div>
            </div>

            {/* Top Recommended Option Summary Card */}
            <div className="lg:col-span-7 sap-card p-4 space-y-3">
              <div className="flex items-start justify-between pb-2 border-b border-[#edf0f3]">
                <div>
                  <span className="sap-badge sap-badge-info text-[10px] font-mono uppercase">
                    Twin Optimal Sourcing Award
                  </span>
                  <h3 className="text-base font-bold text-[#1d2d3e] mt-1">
                    {twin.active_recommendation.primary_supplier_name}
                  </h3>
                  <p className="text-xs text-[#556b82] font-mono">
                    Vendor ID: {twin.active_recommendation.primary_supplier_id} | Plant: {twin.context_requirement.plant_name}
                  </p>
                </div>
                <div className="text-right bg-[#edf5ff] px-3.5 py-1.5 rounded border border-[#c4dcfc]">
                  <span className="text-[10px] uppercase text-[#0070f2] font-bold">Decision Score</span>
                  <div className="text-2xl font-bold font-mono text-[#0070f2]">
                    {twin.active_recommendation.decision_score}
                    <span className="text-xs font-normal text-[#556b82]"> / 100</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl shadow-xs">
                  <span className="text-[11px] text-[#64748b] uppercase font-semibold">Effective Unit Cost</span>
                  <p className="font-mono font-bold text-[#0f172a] text-sm mt-0.5">
                    €{twin.active_recommendation.effective_unit_cost_eur?.toFixed(2)}
                  </p>
                  <span className="text-[10px] text-[#64748b]">POC Assumption</span>
                </div>
                <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl shadow-xs">
                  <span className="text-[11px] text-[#64748b] uppercase font-semibold">Delivery Reliability</span>
                  <p className="font-mono font-bold text-[#0066cc] text-sm mt-0.5">
                    {twin.active_recommendation.delivery_reliability_pct}% OTD
                  </p>
                  <span className="text-[10px] text-[#16a34a] font-medium">Verified GRs</span>
                </div>
                <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl shadow-xs">
                  <span className="text-[11px] text-[#64748b] uppercase font-semibold">Quality Rejection</span>
                  <p className="font-mono font-bold text-[#0f172a] text-sm mt-0.5">
                    {twin.active_recommendation.quality_rejection_rate_pct}%
                  </p>
                  <span className="text-[10px] text-[#64748b]">QM Lots</span>
                </div>
                <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl shadow-xs">
                  <span className="text-[11px] text-[#64748b] uppercase font-semibold">Committed Lead Time</span>
                  <p className="font-mono font-bold text-[#0f172a] text-sm mt-0.5">
                    {twin.active_recommendation.offered_lead_time_days} Days
                  </p>
                  <span className="text-[10px] text-[#64748b]">Dock Arrival</span>
                </div>
              </div>

              {twin.trade_off_vs_runner_up && (
                <div className="pt-2 text-xs text-[#556b82] border-t border-[#edf0f3] flex items-center justify-between">
                  <span>
                    <strong className="text-[#1d2d3e]">Runner-Up Differential:</strong> vs {twin.trade_off_vs_runner_up.runner_up_name} (+{twin.trade_off_vs_runner_up.score_differential} pts lead).
                  </span>
                  <button
                    onClick={() => onNavigateToSupplier360(twin.active_recommendation.primary_supplier_id)}
                    className="text-[11px] text-[#0070f2] hover:underline font-semibold"
                  >
                    View Supplier 360 →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Eligible Suppliers Comparison Table in Decision Twin */}
          <div className="sap-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#edf0f3]">
              <div>
                <h3 className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider">
                  Twin Candidate Roster ({twin.eligible_suppliers.length} Eligible Suppliers Evaluated)
                </h3>
                <p className="text-xs text-[#556b82]">
                  Multidimensional scores, commercial details, and verified operational telemetry.
                </p>
              </div>
              <span className="text-[11px] text-[#556b82] font-mono">
                Sorted by Composite Score Descending
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="sap-table text-xs">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Quoted Price</th>
                    <th>Effective Cost</th>
                    <th>Delivery OTD</th>
                    <th>Defect PPM</th>
                    <th>Capacity Util.</th>
                    <th>Concentration</th>
                    <th>Contract</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {twin.eligible_suppliers.map((cand) => (
                    <tr
                      key={cand.supplier_id}
                      className={cand.supplier_id === twin.active_recommendation.primary_supplier_id ? 'bg-[#edf5ff]/40' : ''}
                    >
                      <td className="font-mono font-bold text-center">#{cand.rank}</td>
                      <td>
                        <div className="font-semibold text-[#1d2d3e]">{cand.supplier_name}</div>
                        <div className="text-[10px] text-[#556b82] font-mono">{cand.supplier_id} ({cand.country})</div>
                      </td>
                      <td>
                        <span className={`sap-badge ${
                          cand.eligibility_status === 'ELIGIBLE'
                            ? 'sap-badge-success'
                            : 'sap-badge-warning'
                        } text-[10px] font-semibold`}>
                          {cand.eligibility_status}
                        </span>
                      </td>
                      <td className="font-mono font-bold text-[#0070f2]">{cand.composite_score}</td>
                      <td className="font-mono">€{cand.commercial.quoted_unit_price_eur.toFixed(2)}</td>
                      <td className="font-mono font-semibold">
                        €{cand.commercial.effective_unit_cost_eur.toFixed(2)}
                      </td>
                      <td className="font-mono">
                        <span className={cand.delivery.otd_rate_pct >= 90 ? 'text-[#107e3e]' : 'text-[#e9730c]'}>
                          {cand.delivery.otd_rate_pct}%
                        </span>
                        <span className="block text-[9px] text-[#556b82] font-normal">{cand.delivery.delivery_trajectory}</span>
                      </td>
                      <td className="font-mono">
                        {cand.quality.ppm} PPM
                        <span className="block text-[9px] text-[#556b82] font-normal">{cand.quality.quality_trajectory}</span>
                      </td>
                      <td className="font-mono">
                        <span className={cand.risk_and_capacity.is_capacity_constrained ? 'text-[#bb0000] font-bold' : 'text-[#1d2d3e]'}>
                          {cand.risk_and_capacity.capacity_utilization_pct}%
                        </span>
                        <span className="block text-[9px] text-[#556b82] font-normal">of {cand.risk_and_capacity.practical_capacity_ea?.toLocaleString()} EA</span>
                      </td>
                      <td className="font-mono">
                        {cand.risk_and_capacity.current_concentration_pct}%
                      </td>
                      <td>
                        {cand.commercial.has_active_contract ? (
                          <span className="sap-badge sap-badge-success text-[10px]">Active Outline</span>
                        ) : (
                          <span className="sap-badge sap-badge-neutral text-[10px]">Spot Pricing</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => onNavigateToSupplier360(cand.supplier_id)}
                          className="text-[11px] text-[#0070f2] hover:underline font-medium"
                        >
                          360 View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Grid: Stress Telemetry & Practical Thresholds */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Stress Test Telemetry */}
            <div className="lg:col-span-6 sap-card p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#edf0f3]">
                <span className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlertIcon className="w-3.5 h-3.5 text-[#e9730c]" />
                  <span>Decision Robustness & Stress Telemetry</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#1d2d3e]">
                  {twin.stress_test_telemetry.robustness_score_pct}% Robust
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-[#f5f6f8] border border-[#d9dcdf] rounded p-3">
                <div>
                  <span className="text-[#556b82] text-[10px] uppercase font-semibold">Conditions Tested</span>
                  <p className="font-mono text-sm font-bold text-[#1d2d3e] mt-0.5">
                    {twin.stress_test_telemetry.total_tests_count} Macro Shocks
                  </p>
                </div>
                <div>
                  <span className="text-[#556b82] text-[10px] uppercase font-semibold">Stable Outcomes</span>
                  <p className="font-mono text-sm font-bold text-[#107e3e] mt-0.5">
                    {twin.stress_test_telemetry.stable_tests_count} / {twin.stress_test_telemetry.total_tests_count} Scenarios
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-[#556b82] uppercase tracking-wider block mb-1">
                  Identified Critical Vulnerabilities:
                </span>
                <ul className="text-xs text-[#1d2d3e] space-y-1">
                  {twin.stress_test_telemetry.top_vulnerabilities.map((v, i) => (
                    <li key={i} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e9730c]"></span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <button
                  onClick={onNavigateToStressTest}
                  className="sap-btn sap-btn-secondary w-full text-center text-xs"
                >
                  View Full 14-Shock Stress Test Matrix →
                </button>
              </div>
            </div>

            {/* Practical Sensitivity Thresholds */}
            <div className="lg:col-span-6 sap-card p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#edf0f3]">
                <span className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider flex items-center space-x-1.5">
                  <ActivityIcon className="w-3.5 h-3.5 text-[#0070f2]" />
                  <span>"What Would Change This Decision?"</span>
                </span>
                <span className="text-[10px] font-mono text-[#556b82]">Dynamic Thresholds</span>
              </div>

              <p className="text-xs text-[#556b82]">
                Calculated crossover thresholds where weighting changes would overturn the primary recommendation:
              </p>

              <div className="space-y-2">
                {twin.what_would_change_thresholds.map((th, idx) => (
                  <div key={idx} className="p-2.5 bg-[#f5f6f8] border border-[#d9dcdf] rounded text-xs">
                    <div className="flex items-center justify-between font-semibold text-[#1d2d3e]">
                      <span>Shift {th.dimension_label} Weight</span>
                      <span className="font-mono text-[#0070f2]">Threshold: {th.threshold_weight_pct}%</span>
                    </div>
                    <p className="text-[#556b82] text-[11px] mt-0.5">
                      {th.insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
