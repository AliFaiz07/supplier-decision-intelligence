import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ScenarioDefinition } from '../../types';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { BackNavigation } from '../common/BackNavigation';
import { SlidersIcon, CheckIcon, AlertTriangleIcon, LayersIcon } from '../common/Icons';

interface ScenariosViewProps {
  onOpenRequirementInWorkspace: (reqId: string) => void;
}

export const ScenariosView: React.FC<ScenariosViewProps> = ({ onOpenRequirementInWorkspace }) => {
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDefinition | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const data = await api.getScenarios();
      setScenarios(data);
      if (data.length > 0) {
        handleRunScenario(data[0]);
      }
    } catch (err) {
      console.error('Failed to load scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScenario = async (scen: ScenarioDefinition) => {
    setSelectedScenario(scen);
    setIsExecuting(true);
    try {
      const res = await api.runScenario(scen.scenario_id);
      setExecutionResult(res);
    } catch (err: any) {
      alert(`Scenario execution failed: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) {
    return <ProcessingIndicator operation="general" message="Loading predefined decision scenarios..." />;
  }

  return (
    <div className="space-y-5">
      <BackNavigation
        fallbackTab="decisions"
        fallbackSubtab="twin"
        fallbackLabel="Decisions Hub"
      />

      {/* Title */}
      <div className="sap-card p-5">
        <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
          Predefined Procurement Decision Scenarios (14 Scenarios)
        </h2>
        <p className="text-xs text-[#64748b] mt-1">
          Demonstrates how the real decision engine dynamically adjusts supplier rankings and trade-offs
          based on business priorities, risk signals, contract lifecycle, and quality requirements.
        </p>
      </div>

      {/* Main Grid: Scenario Selector list (Left) + Live Execution Result (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: 14 Scenarios List (5 cols) */}
        <div className="lg:col-span-5 sap-card divide-y divide-[#e2e8f0] overflow-y-auto max-h-[750px]">
          {scenarios.map((scen) => {
            const isSelected = selectedScenario?.scenario_id === scen.scenario_id;
            return (
              <div
                key={scen.scenario_id}
                onClick={() => handleRunScenario(scen)}
                className={`p-3.5 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#f0f7ff] border-l-4 border-l-[#0066cc]' : 'hover:bg-[#f8fafc]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#64748b] uppercase">
                    Scenario {scen.scenario_number}
                  </span>
                  <span className="sap-badge sap-badge-info text-[10px]">
                    {scen.recommended_priority}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[#0f172a] mt-1">
                  {scen.title}
                </h4>
                <p className="text-[11px] text-[#64748b] line-clamp-2 mt-1">
                  {scen.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Execution Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {isExecuting ? (
            <ProcessingIndicator operation="analyze" message={`Running ${selectedScenario?.title} through engine...`} />
          ) : executionResult && selectedScenario ? (
            <div className="sap-card p-5 space-y-5">
              {/* Header */}
              <div className="pb-3 border-b border-[#e2e8f0]">
                <div className="flex items-center justify-between">
                  <span className="sap-badge sap-badge-info text-[10px] font-mono uppercase font-semibold">
                    {selectedScenario.scenario_id} Execution Result
                  </span>
                  <button
                    onClick={() => onOpenRequirementInWorkspace(selectedScenario.requirement_id)}
                    className="text-xs text-[#0066cc] font-semibold hover:underline flex items-center space-x-1"
                  >
                    <LayersIcon className="w-3.5 h-3.5" />
                    <span>Open Requirement in Sourcing Workspace</span>
                  </button>
                </div>
                <h3 className="text-sm font-bold text-[#0f172a] mt-2">
                  {selectedScenario.title}
                </h3>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  {selectedScenario.description}
                </p>
                <p className="text-[11px] text-[#0066cc] font-medium mt-1">
                  Key Strategic Trade-off: {selectedScenario.key_trade_off}
                </p>
              </div>

              {/* Priority Weights applied in this scenario */}
              <div className="bg-[#f8fafc] border border-slate-200 p-3 text-xs">
                <p className="text-[10px] font-semibold uppercase text-slate-500 mb-2">
                  Scenario MCDA Weights Applied:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                  <div className="bg-white p-1.5 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Price</span>
                    <span className="font-mono font-bold text-slate-800">{Math.round(selectedScenario.weights.price * 100)}%</span>
                  </div>
                  <div className="bg-white p-1.5 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Delivery</span>
                    <span className="font-mono font-bold text-slate-800">{Math.round(selectedScenario.weights.delivery * 100)}%</span>
                  </div>
                  <div className="bg-white p-1.5 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Quality</span>
                    <span className="font-mono font-bold text-slate-800">{Math.round(selectedScenario.weights.quality * 100)}%</span>
                  </div>
                  <div className="bg-white p-1.5 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Lead Time</span>
                    <span className="font-mono font-bold text-slate-800">{Math.round(selectedScenario.weights.lead_time * 100)}%</span>
                  </div>
                  <div className="bg-white p-1.5 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Contract</span>
                    <span className="font-mono font-bold text-slate-800">{Math.round(selectedScenario.weights.contract * 100)}%</span>
                  </div>
                  <div className="bg-white p-1.5 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Risk</span>
                    <span className="font-mono font-bold text-slate-800">{Math.round(selectedScenario.weights.risk * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Recommended Outcome from Real Engine */}
              {executionResult.decision_results?.recommended_option && (
                <div className="border border-slate-200 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-[2px] font-semibold">
                        Engine Recommendation
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {executionResult.decision_results.recommended_option.primary_supplier_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        BP ID: {executionResult.decision_results.recommended_option.primary_supplier_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block">Score</span>
                      <span className="text-xl font-bold text-[#0a6ed1]">
                        {executionResult.decision_results.recommended_option.decision_score}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-500">Effective Unit Cost:</span>
                      <p className="font-mono font-semibold">€{executionResult.decision_results.recommended_option.effective_unit_cost_eur?.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Delivery Reliability:</span>
                      <p className="font-mono font-semibold">{executionResult.decision_results.recommended_option.delivery_reliability_pct}% OTD</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Quality Defect:</span>
                      <p className="font-mono font-semibold">{executionResult.decision_results.recommended_option.quality_rejection_rate_pct}%</p>
                    </div>
                  </div>

                  {/* AI Explanation text */}
                  {executionResult.ai_explanation?.decision_summary && (
                    <div className="p-3 bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-900 block mb-1">Decision Engine Explanation:</span>
                      {executionResult.ai_explanation.decision_summary}
                    </div>
                  )}
                </div>
              )}

              {/* Ranked Top 4 Table */}
              <div>
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  Top Evaluated Candidates
                </h4>
                <table className="sap-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Supplier</th>
                      <th>Score</th>
                      <th>Effective Cost</th>
                      <th>OTD %</th>
                      <th>Quality %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executionResult.decision_results?.ranked_suppliers?.slice(0, 4).map((sup: any, i: number) => (
                      <tr key={sup.supplier_id} className={i === 0 ? 'bg-blue-50/50 font-medium' : ''}>
                        <td className="font-mono">#{i + 1}</td>
                        <td>{sup.supplier_name}</td>
                        <td className="font-mono font-semibold text-[#0a6ed1]">{sup.final_score}</td>
                        <td className="font-mono">€{sup.cost_breakdown?.effective_unit_cost_eur?.toFixed(2)}</td>
                        <td className="font-mono">{sup.metrics?.on_time_delivery_rate_pct}%</td>
                        <td className="font-mono">{sup.metrics?.quality_rejection_rate_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
