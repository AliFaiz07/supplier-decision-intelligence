import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ConcentrationShockResult } from '../../types';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { BackNavigation } from '../common/BackNavigation';
import {
  ShieldAlertIcon,
  SlidersIcon,
  AlertTriangleIcon,
  BuildingIcon,
  ChevronRightIcon,
  ActivityIcon
} from '../common/Icons';

interface ConcentrationSimulatorViewProps {
  onOpenRequirementInWorkspace?: (reqId: string) => void;
  onNavigateToSupplier360?: (supplierId: string) => void;
}

export const ConcentrationSimulatorView: React.FC<ConcentrationSimulatorViewProps> = ({
  onOpenRequirementInWorkspace,
  onNavigateToSupplier360
}) => {
  const [materialId, setMaterialId] = useState<string>('MAT-001');
  const [plantId, setPlantId] = useState<string>('P001');
  const [capacityDropPct, setCapacityDropPct] = useState<number>(20);
  const [simResult, setSimResult] = useState<ConcentrationShockResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    runConcentrationSimulation();
  }, [materialId, plantId, capacityDropPct]);

  const runConcentrationSimulation = async () => {
    try {
      setLoading(true);
      const res = await api.simulateConcentrationShock(materialId, plantId, capacityDropPct);
      setSimResult(res);
    } catch (err) {
      console.error('Failed to run concentration shock simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <BackNavigation
        fallbackTab="decisions"
        fallbackSubtab="twin"
        fallbackLabel="Decisions Hub"
      />

      {/* Header Banner */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-[2px] font-semibold">
                Risk Simulation Engine
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Single-Source Contraction & Dynamic Quota Spillover
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-900 mt-1">
              Supplier Concentration & Capacity Shock Simulator
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Simulates the market and operational impacts when the primary vendor experiences machine outages, labor shortages, or capacity contractions.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div>
              <label className="text-slate-500 block text-[10px] uppercase font-semibold">Material:</label>
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                className="border border-slate-300 rounded-[2px] px-2 py-1 bg-white font-mono"
              >
                <option value="MAT-001">MAT-001 - Deep Groove Ball Bearing</option>
                <option value="MAT-002">MAT-002 - Stainless Steel Shaft</option>
                <option value="MAT-003">MAT-003 - Hydraulic Control Valve</option>
                <option value="MAT-004">MAT-004 - Industrial Filter Housing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Capacity Drop Slider */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-800">
              Primary Supplier Capacity Drop: <strong className="text-rose-700 font-mono text-sm">-{capacityDropPct}%</strong>
            </span>
            <div className="flex space-x-1.5">
              {[10, 20, 30, 40, 50].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setCapacityDropPct(pct)}
                  className={`text-[11px] px-2.5 py-1 rounded-[2px] font-mono font-medium border ${
                    capacityDropPct === pct
                      ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  -{pct}%
                </button>
              ))}
            </div>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={capacityDropPct}
            onChange={(e) => setCapacityDropPct(Number(e.target.value))}
            className="w-full accent-rose-600"
          />
        </div>
      </div>

      {loading && !simResult ? (
        <ProcessingIndicator operation="analyze" message="Calculating concentration shock re-allocations..." />
      ) : simResult ? (
        <div className="space-y-6">
          {/* Shock Outcome Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white border border-[#d5dbe1] p-3.5 rounded-[2px]">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Shocked Supplier</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5 truncate">{simResult.shocked_supplier_name}</p>
              <p className="text-[10px] text-slate-400 font-mono">
                Cap: {simResult.reduced_capacity_ea?.toLocaleString()} / {simResult.baseline_capacity_ea?.toLocaleString()} EA
              </p>
            </div>

            <div className="bg-white border border-[#d5dbe1] p-3.5 rounded-[2px]">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Spillover Volume</span>
              <p className="font-bold text-rose-700 font-mono text-sm mt-0.5">
                {simResult.spillover_quantity?.toLocaleString()} EA
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Demand exceeding capacity</p>
            </div>

            <div className="bg-white border border-[#d5dbe1] p-3.5 rounded-[2px]">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Unabsorbed Gap</span>
              <p className={`font-bold font-mono text-sm mt-0.5 ${simResult.capacity_gap > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {simResult.capacity_gap?.toLocaleString()} EA
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {simResult.capacity_gap === 0 ? 'Fully absorbed' : 'Production deficit'}
              </p>
            </div>

            <div className="bg-white border border-[#d5dbe1] p-3.5 rounded-[2px]">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Additional Cost</span>
              <p className="font-bold font-mono text-slate-900 text-sm mt-0.5">
                +€{simResult.additional_cost_eur?.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Secondary premium cost</p>
            </div>
          </div>

          {/* Diagnostic Banner */}
          <div className="bg-white border border-[#d5dbe1] p-4 text-xs space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldAlertIcon className="w-4 h-4 text-amber-600" />
              <strong className="text-slate-900">Concentration Risk Assessment:</strong>
            </div>
            <p className="text-slate-700">{simResult.risk_assessment}</p>
            <p className="text-slate-600 text-[11px]">{simResult.delivery_impact}</p>
          </div>

          {/* Re-Allocation Plan Table */}
          <div className="bg-white border border-[#d5dbe1] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Dynamic Spillover Re-allocation across Qualified Sources
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Automatic Secondary Sourcing Quotas
              </span>
            </div>

            {simResult.reallocation_plan && simResult.reallocation_plan.length > 0 ? (
              <table className="sap-table text-xs">
                <thead>
                  <tr>
                    <th>Supplier ID</th>
                    <th>Supplier Name</th>
                    <th>Absorbed Quantity</th>
                    <th>Effective Unit Cost</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {simResult.reallocation_plan.map((alt) => (
                    <tr key={alt.supplier_id}>
                      <td className="font-mono text-[#0a6ed1] font-semibold">{alt.supplier_id}</td>
                      <td className="font-medium text-slate-900">{alt.supplier_name}</td>
                      <td className="font-mono font-bold text-emerald-700">{alt.absorbed_quantity?.toLocaleString()} EA</td>
                      <td className="font-mono">€{alt.effective_unit_cost_eur?.toFixed(2)}</td>
                      <td>
                        {onNavigateToSupplier360 && (
                          <button
                            onClick={() => onNavigateToSupplier360(alt.supplier_id)}
                            className="text-[10px] text-[#0a6ed1] hover:underline"
                          >
                            Inspect 360
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500 font-mono p-4 text-center">
                No secondary vendors required; primary capacity sufficient for baseline allocation.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
