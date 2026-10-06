import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import {
  HistoryIcon,
  CheckIcon,
  AlertTriangleIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  FileTextIcon,
  AwardIcon,
  DollarSignIcon,
  TruckIcon
} from '../common/Icons';

export const ProcurementMemoryView: React.FC = () => {
  const [memoryData, setMemoryData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDecision, setSelectedDecision] = useState<any>(null);
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);

  // Outcome submission form
  const [formDecisionId, setFormDecisionId] = useState<string>('');
  const [formActualOtif, setFormActualOtif] = useState<number>(92.0);
  const [formActualPrice, setFormActualPrice] = useState<number>(100.0);
  const [formActualLt, setFormActualLt] = useState<number>(10);
  const [formActualDefect, setFormActualDefect] = useState<number>(0.5);
  const [formOutcomeStatus, setFormOutcomeStatus] = useState<string>('Met Expectations');
  const [formLesson, setFormLesson] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadMemoryData();
  }, []);

  const loadMemoryData = async () => {
    try {
      setLoading(true);
      const res = await api.getProcurementMemory();
      setMemoryData(res);
      if (res.recent_evaluations && res.recent_evaluations.length > 0) {
        setSelectedDecision(res.recent_evaluations[0]);
      }
    } catch (err) {
      console.error('Failed to load procurement memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDecisionId) return;

    try {
      setIsSubmitting(true);
      await api.recordDecisionOutcome(formDecisionId, {
        actual_otif_pct: formActualOtif,
        actual_avg_unit_price_eur: formActualPrice,
        actual_lead_time_days: formActualLt,
        actual_defect_rate_pct: formActualDefect,
        outcome_status: formOutcomeStatus,
        procurement_lesson: formLesson || `Outcome evaluated with actual OTIF of ${formActualOtif}% and price of €${formActualPrice}.`
      });
      setShowRecordModal(false);
      await loadMemoryData();
      alert('Procurement outcome recorded successfully in memory layer.');
    } catch (err: any) {
      alert(`Error recording outcome: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <ProcessingIndicator operation="memory" />;
  }

  if (!memoryData) {
    return (
      <div className="bg-white border border-[#d5dbe1] p-6 text-xs text-slate-500">
        No procurement memory records available.
      </div>
    );
  }

  const evaluations = memoryData.recent_evaluations || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#d5dbe1] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase bg-[#0a6ed1]/10 text-[#0a6ed1] px-2 py-0.5 rounded-[2px] font-semibold">
              Closed-Loop Procurement Intelligence
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Continuous Strategic Learning</span>
          </div>
          <h2 className="text-base font-semibold text-slate-900 mt-1">
            Procurement Memory: Decision vs Actual Outcome
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Compares original decision-time expectations with observed post-award telemetry (Goods Receipts, Invoices, Lot Inspections) to build empirical organizational memory.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRecordModal(true)}
            className="bg-[#0a6ed1] hover:bg-[#0854a0] text-white text-xs px-3.5 py-2 rounded-[2px] font-medium transition-colors"
          >
            + Record Post-Award Outcome
          </button>
        </div>
      </div>

      {/* KPI Performance Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#d5dbe1] p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Evaluated Sourcing Decisions
          </p>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {memoryData.evaluated_decisions_count}
            <span className="text-xs font-normal text-slate-500"> / {memoryData.total_decisions} total</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Closed-loop telemetry active</p>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Decision Expectation Accuracy
          </p>
          <div className="text-2xl font-bold text-[#0a6ed1] mt-1">
            {memoryData.decision_accuracy_pct}%
          </div>
          <p className="text-[10px] text-emerald-600 font-mono mt-1">Met or exceeded expectations</p>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Average Post-Award OTIF Variance
          </p>
          <div
            className={`text-2xl font-bold mt-1 ${
              memoryData.average_otif_variance_pct >= 0 ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {memoryData.average_otif_variance_pct > 0 ? '+' : ''}
            {memoryData.average_otif_variance_pct} pts
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Actual vs baseline expected</p>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Average Price Variance
          </p>
          <div
            className={`text-2xl font-bold mt-1 ${
              memoryData.average_price_variance_pct <= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            {memoryData.average_price_variance_pct > 0 ? '+' : ''}
            {memoryData.average_price_variance_pct}%
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Invoice vs award price</p>
        </div>
      </div>

      {/* Decision vs Actual Outcome Comparison Ledger */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <HistoryIcon className="w-3.5 h-3.5 text-[#0a6ed1]" />
            <span>Auditable Historical Decisions: Expected vs Observed Telemetry</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            {evaluations.length} Tracked Audit Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="sap-table">
            <thead>
              <tr>
                <th>Decision ID</th>
                <th>Material</th>
                <th>Recommended Supplier</th>
                <th>Expected OTIF</th>
                <th>Actual OTIF</th>
                <th>Expected Price</th>
                <th>Actual Price</th>
                <th>Variance Summary</th>
                <th>Outcome Status</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((d: any) => {
                const exp = d.expected_metrics || {};
                const act = d.actual_outcome || {};
                const otifVar = act.otif_variance_pct;
                const priceVar = act.price_variance_pct;
                const isSelected = selectedDecision?.decision_id === d.decision_id;

                return (
                  <tr
                    key={d.decision_id}
                    onClick={() => setSelectedDecision(d)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/60 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="font-mono text-xs text-[#0a6ed1] font-semibold">{d.decision_id}</td>
                    <td className="font-mono text-xs">{d.material_id}</td>
                    <td className="font-medium text-slate-900">{d.recommended_supplier_name}</td>
                    <td className="font-mono">{exp.expected_otif_pct ? `${exp.expected_otif_pct}%` : 'N/A'}</td>
                    <td className="font-mono font-semibold">
                      {act.actual_otif_pct ? `${act.actual_otif_pct}%` : 'Pending'}
                    </td>
                    <td className="font-mono">
                      {exp.expected_unit_price_eur ? `€${exp.expected_unit_price_eur.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="font-mono font-semibold">
                      {act.actual_avg_unit_price_eur ? `€${act.actual_avg_unit_price_eur.toFixed(2)}` : 'Pending'}
                    </td>
                    <td className="font-mono text-[11px]">
                      {otifVar !== undefined && otifVar !== null ? (
                        <span
                          className={otifVar >= 0 ? 'text-emerald-700' : 'text-amber-700 font-bold'}
                        >
                          OTIF: {otifVar > 0 ? '+' : ''}{otifVar}%
                        </span>
                      ) : null}
                      {priceVar !== undefined && priceVar !== null ? (
                        <span
                          className={`ml-2 ${priceVar <= 0 ? 'text-emerald-700' : 'text-red-700 font-bold'}`}
                        >
                          Price: {priceVar > 0 ? '+' : ''}{priceVar}%
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-[2px] font-semibold uppercase ${
                          act.outcome_status?.includes('Met') || act.outcome_status?.includes('Exceeded')
                            ? 'bg-emerald-100 text-emerald-800'
                            : act.outcome_status?.includes('Severe')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {act.outcome_status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Decision Detail: Empirical Learning Lesson */}
      {selectedDecision && selectedDecision.actual_outcome && (
        <div className="bg-white border border-[#d5dbe1] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-[2px]">
                Procurement Lesson & Empirical Evidence
              </span>
              <h3 className="text-sm font-semibold text-slate-900 mt-1">
                {selectedDecision.decision_id}: {selectedDecision.material_description || selectedDecision.material_id}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-500">Awarded: {selectedDecision.recommended_supplier_name}</span>
              <p className="text-[10px] text-slate-400 font-mono">Date: {selectedDecision.timestamp?.slice(0, 10)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#f8fafc] border border-slate-200 p-3.5 rounded-[2px]">
              <h4 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider mb-2">
                Expectations at Decision Time
              </h4>
              <div className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <p>Expected OTIF Delivery: <span className="font-bold text-slate-900">{selectedDecision.expected_metrics?.expected_otif_pct}%</span></p>
                <p>Expected Unit Price: <span className="font-bold text-slate-900">€{selectedDecision.expected_metrics?.expected_unit_price_eur?.toFixed(2)}</span></p>
                <p>Expected Lead Time: <span className="font-bold text-slate-900">{selectedDecision.expected_metrics?.expected_lead_time_days} Days</span></p>
                <p>Commercial Position: <span className="font-bold text-slate-900">{selectedDecision.expected_metrics?.expected_contract_status}</span></p>
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-slate-200 p-3.5 rounded-[2px]">
              <h4 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider mb-2">
                Observed Post-Award Telemetry
              </h4>
              <div className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <p>Actual OTIF Delivery: <span className="font-bold text-slate-900">{selectedDecision.actual_outcome?.actual_otif_pct}%</span></p>
                <p>Actual Unit Price (Invoiced): <span className="font-bold text-slate-900">€{selectedDecision.actual_outcome?.actual_avg_unit_price_eur?.toFixed(2)}</span></p>
                <p>Actual Lead Time: <span className="font-bold text-slate-900">{selectedDecision.actual_outcome?.actual_lead_time_days} Days</span></p>
                <p>Observation Date: <span className="font-bold text-slate-900">{selectedDecision.actual_outcome?.observation_date}</span></p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-200 p-3.5 rounded-[2px]">
            <h4 className="text-[11px] font-semibold text-[#0a6ed1] uppercase tracking-wider mb-1 flex items-center space-x-1.5">
              <AwardIcon className="w-3.5 h-3.5" />
              <span>Organizational Learning & Takeaway for Future Sourcing</span>
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {selectedDecision.actual_outcome?.procurement_lesson}
            </p>
          </div>
        </div>
      )}

      {/* Record Outcome Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#d5dbe1] w-full max-w-lg p-5 rounded-[2px] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Record Post-Award Procurement Outcome
              </h3>
              <button
                onClick={() => setShowRecordModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordOutcome} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Select Historical Decision ID
                </label>
                <select
                  value={formDecisionId}
                  onChange={(e) => {
                    setFormDecisionId(e.target.value);
                    const match = evaluations.find((ev: any) => ev.decision_id === e.target.value);
                    if (match && match.expected_metrics) {
                      setFormActualOtif(match.expected_metrics.expected_otif_pct || 90.0);
                      setFormActualPrice(match.expected_metrics.expected_unit_price_eur || 100.0);
                      setFormActualLt(match.expected_metrics.expected_lead_time_days || 10);
                    }
                  }}
                  required
                  className="w-full border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#0a6ed1]"
                >
                  <option value="">-- Choose Decision --</option>
                  {evaluations.map((ev: any) => (
                    <option key={ev.decision_id} value={ev.decision_id}>
                      {ev.decision_id} - {ev.recommended_supplier_name} ({ev.material_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Observed Actual OTIF (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formActualOtif}
                    onChange={(e) => setFormActualOtif(Number(e.target.value))}
                    required
                    className="w-full border border-slate-300 rounded-[2px] px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#0a6ed1]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Actual Average Price (€/EA)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formActualPrice}
                    onChange={(e) => setFormActualPrice(Number(e.target.value))}
                    required
                    className="w-full border border-slate-300 rounded-[2px] px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#0a6ed1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Actual Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    value={formActualLt}
                    onChange={(e) => setFormActualLt(Number(e.target.value))}
                    required
                    className="w-full border border-slate-300 rounded-[2px] px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#0a6ed1]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Outcome Classification
                  </label>
                  <select
                    value={formOutcomeStatus}
                    onChange={(e) => setFormOutcomeStatus(e.target.value)}
                    className="w-full border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0a6ed1]"
                  >
                    <option value="Met Expectations">Met Expectations</option>
                    <option value="Exceeded Expectations">Exceeded Expectations</option>
                    <option value="Underperformed (Delivery)">Underperformed (Delivery)</option>
                    <option value="Underperformed (Cost Escalation)">Underperformed (Cost Escalation)</option>
                    <option value="Severe Underperformance (Delivery & Price Escalation)">
                      Severe Underperformance
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Empirical Lesson Learned
                </label>
                <textarea
                  value={formLesson}
                  onChange={(e) => setFormLesson(e.target.value)}
                  placeholder="Summarize the takeaway for future sourcing evaluations..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0a6ed1]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="border border-slate-300 text-slate-700 px-3 py-1.5 rounded-[2px] text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formDecisionId}
                  className="bg-[#0a6ed1] hover:bg-[#0854a0] disabled:bg-slate-300 text-white px-4 py-1.5 rounded-[2px] text-xs font-medium"
                >
                  {isSubmitting ? 'Saving...' : 'Record Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
