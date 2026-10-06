import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LeakageReport, LeakageIncident } from '../../types';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import {
  DollarSignIcon,
  AlertTriangleIcon,
  ShieldAlertIcon,
  FileTextIcon,
  RefreshIcon,
  ChevronRightIcon
} from '../common/Icons';

interface ProcurementLeakageViewProps {
  onNavigateToSupplier360?: (supplierId: string) => void;
  onNavigateToSourcing?: (materialId: string) => void;
}

export const ProcurementLeakageView: React.FC<ProcurementLeakageViewProps> = ({
  onNavigateToSupplier360,
  onNavigateToSourcing
}) => {
  const [report, setReport] = useState<LeakageReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIncident, setSelectedIncident] = useState<LeakageIncident | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    loadLeakageReport();
  }, []);

  const loadLeakageReport = async () => {
    try {
      setLoading(true);
      const res = await api.getProcurementLeakage();
      setReport(res);
      if (res.leakage_incidents && res.leakage_incidents.length > 0) {
        setSelectedIncident(res.leakage_incidents[0]);
      }
    } catch (err) {
      console.error('Failed to load leakage report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !report) {
    return <ProcessingIndicator operation="price" message="Scanning procurement records for price and contract leakage..." />;
  }

  const incidents = report?.leakage_incidents || [];
  const filteredIncidents = categoryFilter === 'ALL'
    ? incidents
    : incidents.filter(i => i.category === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-[2px] font-semibold">
                Audit Diagnostic
              </span>
              <span className="text-xs text-slate-500 font-mono">
                SAP Purchase Orders, Contracts & Goods Receipts Scan
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-900 mt-1">
              Procurement Leakage & Hidden Cost Detector
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Identifies off-contract maverick purchasing, contract price variances, defect scrap losses, expedited delivery surcharges, and spot price escalations.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadLeakageReport}
              className="flex items-center space-x-1.5 border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-[2px] font-medium transition-colors"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              <span>Re-Scan Records</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200">
          <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Total Potential Leakage</span>
            <p className="text-xl font-bold font-mono text-rose-700 mt-0.5">
              €{report?.total_excess_spend_eur?.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Excess procurement outlay</p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Leakage Incidents</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {report?.total_leakage_incidents}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Discrepant PO / QM rows</p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Top Leaking Category</span>
            <p className="text-sm font-bold text-slate-900 mt-1 truncate">
              {report?.category_summary ? Object.keys(report.category_summary)[0] : 'Contract Discrepancy'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Primary loss driver</p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Methodology Grounding</span>
            <p className="text-xs font-semibold text-slate-800 mt-1">
              Grounded in PO Ledger
            </p>
            <p className="text-[9px] text-[#0a6ed1] font-mono">POC Assumption Multipliers</p>
          </div>
        </div>
      </div>

      {/* Material Leakage Rollup Row */}
      {report?.material_leakage_summary && report.material_leakage_summary.length > 0 && (
        <div className="bg-white border border-[#d5dbe1] p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Material-Level Leakage Rollup
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Ranked by Total Excess Spend</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {report.material_leakage_summary.map((m) => (
              <div key={m.material_id} className="p-3 bg-[#f8fafc] border border-slate-200 rounded-[2px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{m.material_id}</span>
                  <span className="font-mono font-bold text-rose-700">€{m.total_leakage_eur?.toLocaleString()}</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5 truncate">{m.material_name}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[10px]">
                  <span className="text-slate-500">{m.incidents_count} Incidents</span>
                  {onNavigateToSourcing && (
                    <button
                      onClick={() => onNavigateToSourcing(m.material_id)}
                      className="text-[#0a6ed1] hover:underline font-medium"
                    >
                      Source Alternatives →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Split: Incidents Table (7 cols) + Root Cause Inspector Card (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Incidents Table */}
        <div className="lg:col-span-7 bg-white border border-[#d5dbe1] p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Detected Leakage Incidents ({filteredIncidents.length})
            </h3>
            <div className="flex items-center space-x-2 text-xs">
              <label className="text-slate-500">Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-slate-300 rounded-[2px] px-2 py-1 text-xs text-slate-800 bg-white"
              >
                <option value="ALL">All Categories</option>
                {report?.category_summary &&
                  Object.keys(report.category_summary).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="sap-table text-xs">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Material</th>
                  <th>Supplier</th>
                  <th>PO Document</th>
                  <th>Excess Spend</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((item) => (
                  <tr
                    key={item.leakage_id}
                    onClick={() => setSelectedIncident(item)}
                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedIncident?.leakage_id === item.leakage_id ? 'bg-blue-50/60 font-medium' : ''
                    }`}
                  >
                    <td>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="font-mono text-slate-900">{item.material_id}</td>
                    <td className="truncate max-w-[140px]">{item.supplier_name}</td>
                    <td className="font-mono text-[11px] text-slate-600">#{item.affected_document}</td>
                    <td className="font-mono font-bold text-rose-700">
                      €{item.excess_spend_eur?.toLocaleString()}
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncident(item);
                        }}
                        className="text-[10px] text-[#0a6ed1] hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Incident Root Cause & Action Inspector */}
        <div className="lg:col-span-5 bg-white border border-[#d5dbe1] p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Leakage Incident Audit Card
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {selectedIncident?.leakage_id || 'N/A'}
            </span>
          </div>

          {selectedIncident ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500">Category & Target</span>
                <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                  {selectedIncident.category}
                </h4>
                <p className="text-slate-600 mt-0.5">
                  {selectedIncident.material_name} ({selectedIncident.material_id}) supplied by {selectedIncident.supplier_name} ({selectedIncident.supplier_id}).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#f8fafc] border border-slate-200 p-3">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Excess Outlay</span>
                  <p className="font-mono text-base font-bold text-rose-700 mt-0.5">
                    €{selectedIncident.excess_spend_eur?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Document / Date</span>
                  <p className="font-mono text-xs font-semibold text-slate-900 mt-0.5">
                    PO #{selectedIncident.affected_document}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedIncident.document_date}</p>
                </div>
              </div>

              <div className="border border-slate-200 p-3 bg-slate-50 rounded-[2px] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Root Cause Diagnostic:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {selectedIncident.root_cause}
                </p>
              </div>

              <div className="border border-blue-200 p-3 bg-blue-50/50 rounded-[2px] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a6ed1] block">
                  Recommended Procurement Recovery:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {selectedIncident.recommended_action}
                </p>
              </div>

              <div className="p-2.5 bg-slate-100 text-[10px] font-mono text-slate-600 rounded-[2px] border border-slate-200">
                {selectedIncident.assumption_tag}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                {onNavigateToSupplier360 && (
                  <button
                    onClick={() => onNavigateToSupplier360(selectedIncident.supplier_id)}
                    className="flex-1 text-center border border-slate-300 hover:border-slate-400 bg-white py-1.5 rounded-[2px] font-medium text-slate-800"
                  >
                    Open Supplier 360
                  </button>
                )}
                {onNavigateToSourcing && (
                  <button
                    onClick={() => onNavigateToSourcing(selectedIncident.material_id)}
                    className="flex-1 text-center bg-[#0a6ed1] hover:bg-[#0854a0] text-white py-1.5 rounded-[2px] font-medium"
                  >
                    Sourcing Workspace
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs font-mono">
              Select an incident from the table to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
