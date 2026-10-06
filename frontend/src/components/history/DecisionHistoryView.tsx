import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DecisionAuditRecord } from '../../types';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { HistoryIcon, FileTextIcon, CheckIcon } from '../common/Icons';

export const DecisionHistoryView: React.FC = () => {
  const [history, setHistory] = useState<DecisionAuditRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDecision, setSelectedDecision] = useState<DecisionAuditRecord | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getDecisionHistory();
      setHistory(data);
      if (data.length > 0) {
        setSelectedDecision(data[0]);
      }
    } catch (err) {
      console.error('Failed to load decision history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ProcessingIndicator operation="general" message="Loading decision audit log..." />;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <h2 className="text-base font-semibold text-slate-900 tracking-tight">
          Procurement Decision Audit Trail & History
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Auditable archive of previous sourcing evaluations, applied multi-criteria weights, and human authorization decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of Decisions (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#d5dbe1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="sap-table">
              <thead>
                <tr>
                  <th>Decision ID</th>
                  <th>Timestamp</th>
                  <th>Material</th>
                  <th>Qty</th>
                  <th>Recommended Supplier</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((dec) => {
                  const isSelected = selectedDecision?.decision_id === dec.decision_id;
                  return (
                    <tr
                      key={dec.decision_id}
                      onClick={() => setSelectedDecision(dec)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="font-mono font-semibold text-[#0a6ed1]">{dec.decision_id}</td>
                      <td className="font-mono text-[11px]">{dec.timestamp?.replace('T', ' ').substring(0, 16)}</td>
                      <td>
                        <span className="font-medium text-slate-900">{dec.material_id}</span>
                      </td>
                      <td className="font-mono">{dec.quantity?.toLocaleString()}</td>
                      <td>{dec.recommended_supplier_name}</td>
                      <td className="font-mono font-bold">{dec.decision_score}</td>
                      <td>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[2px]">
                          {dec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Decision Detail Trace (4 cols) */}
        {selectedDecision && (
          <div className="lg:col-span-4 bg-white border border-[#d5dbe1] p-5 space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <span className="text-[10px] font-mono text-[#0a6ed1] uppercase font-bold">
                Decision Audit Record
              </span>
              <h3 className="text-base font-semibold text-slate-900 mt-1">
                {selectedDecision.decision_id}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Recorded: {selectedDecision.timestamp}
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Requirement</span>
                <p className="font-semibold text-slate-900">
                  {selectedDecision.material_id} ({selectedDecision.material_description})
                </p>
                <p className="font-mono text-slate-600">
                  {selectedDecision.quantity?.toLocaleString()} Units | Plant {selectedDecision.plant_id}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase">Selected Sourcing Option</span>
                <p className="font-bold text-slate-900">
                  {selectedDecision.recommended_supplier_name}
                </p>
                <p className="font-mono text-slate-500">
                  BP ID: {selectedDecision.recommended_supplier_id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Decision Score</span>
                  <p className="font-bold text-[#0a6ed1] text-base">{selectedDecision.decision_score} / 100</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Effective Unit Cost</span>
                  <p className="font-mono font-semibold text-slate-900">
                    €{selectedDecision.effective_unit_cost_eur?.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase">Future Integration Action</span>
                <p className="font-mono text-slate-700 bg-slate-50 p-2 border border-slate-200 mt-1">
                  {selectedDecision.action_taken}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase">User / Auditor Notes</span>
                <p className="text-slate-600 mt-0.5 italic">
                  "{selectedDecision.user_notes}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
