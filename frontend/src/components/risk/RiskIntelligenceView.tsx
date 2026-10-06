import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { ShieldAlertIcon, AlertTriangleIcon } from '../common/Icons';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis
} from 'recharts';

export const RiskIntelligenceView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      const res = await api.getRiskIntelligence();
      setData(res);
    } catch (err) {
      console.error('Failed to load risk intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <ProcessingIndicator operation="general" message="Evaluating supplier risk ratings, single-source exposure, and concentration..." />;
  }

  const kpis = data?.kpis;
  const conc = data?.concentration_shares;

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex items-center space-x-2">
          <ShieldAlertIcon className="w-5 h-5 text-red-700" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Risk Intelligence & Sourcing Exposure Cockpit
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Multi-dimensional evaluation of supplier operational risk, material single-source vulnerability, spend concentration exposure, and geopolitical signals.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">High / Critical Risk Suppliers</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-red-700">{kpis?.high_risk_suppliers_count}</span>
            <span className="text-[10px] text-red-700 font-mono">Monitored</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Top 1 Concentration Share</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-slate-900">{kpis?.top_1_concentration_pct}%</span>
            <span className="text-[10px] text-slate-500 font-mono">Max Exposure</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Single-Source Materials</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-amber-700">{kpis?.single_source_materials_count}</span>
            <span className="text-[10px] text-amber-700 font-mono">1 approved vendor</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Critical Risk Events</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-red-700">{kpis?.critical_risk_events_count}</span>
            <span className="text-[10px] text-red-700 font-mono">Active Disruptions</span>
          </div>
        </div>
      </div>

      {/* Visualizations: Risk Matrix + Spend Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Chart: Supplier Risk Matrix (Prompt Section 14) */}
        <div className="bg-white border border-[#d5dbe1] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Supplier Risk vs Business Impact Matrix
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Positions suppliers by strategic spend volume (X: Business Impact 0-100) vs operational risk score (Y: Risk 0-100)
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="business_impact" name="Business Impact" tick={{ fontSize: 10, fill: '#64748b' }} unit=" pts" />
                <YAxis type="number" dataKey="supplier_risk" name="Risk Score" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit=" pts" />
                <ZAxis range={[60, 180]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#cbd5e1] p-2.5 text-xs shadow-none">
                          <p className="font-semibold text-slate-900">{d.supplier_name} ({d.supplier_id})</p>
                          <p className="text-slate-600">Risk Rating: <span className="font-semibold">{d.risk_rating}</span></p>
                          <p className="text-slate-600">Spend: €{d.spend_eur?.toLocaleString()}</p>
                          <p className="text-slate-500 text-[10px]">Active Risk Signals: {d.active_risk_events_count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Suppliers" data={data?.supplier_risk_matrix || []} fill="#dc2626" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend Concentration Breakdown */}
        <div className="bg-white border border-[#d5dbe1] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Procurement Spend Concentration Shares
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluates capital dependency across top commercial supplier relationships
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Top 1 Supplier Exposure</span>
                <span className="font-mono font-semibold">{conc?.top_1_share_pct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-[2px] overflow-hidden">
                <div className="bg-red-700 h-full" style={{ width: `${conc?.top_1_share_pct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Top 3 Suppliers Cumulative Share</span>
                <span className="font-mono font-semibold">{conc?.top_3_share_pct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-[2px] overflow-hidden">
                <div className="bg-amber-600 h-full" style={{ width: `${conc?.top_3_share_pct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Top 5 Suppliers Cumulative Share</span>
                <span className="font-mono font-semibold">{conc?.top_5_share_pct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-[2px] overflow-hidden">
                <div className="bg-[#0a6ed1] h-full" style={{ width: `${conc?.top_5_share_pct}%` }} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Top 3 Volume Suppliers
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                {conc?.top_suppliers?.slice(0, 3).map((s: any) => (
                  <div key={s.supplier_id} className="flex items-center justify-between">
                    <span>{s.supplier_name} ({s.supplier_id})</span>
                    <span className="font-mono font-medium text-slate-900">
                      €{s.spend_eur?.toLocaleString()} ({s.share_pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Material Single-Source Dependency Table (Prompt Section 14) */}
      <div className="bg-white border border-[#d5dbe1]">
        <div className="px-5 py-3.5 border-b border-[#d5dbe1] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Material Single-Source Exposure Register
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Source List Vulnerability Audit</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-slate-600 border-b border-[#d5dbe1]">
                <th className="py-2.5 px-4 font-semibold">Material</th>
                <th className="py-2.5 px-3 font-semibold">Plant</th>
                <th className="py-2.5 px-3 font-semibold text-center">Approved Suppliers</th>
                <th className="py-2.5 px-4 font-semibold">Primary Sourced Supplier</th>
                <th className="py-2.5 px-3 font-semibold text-right">Annual Spend</th>
                <th className="py-2.5 px-4 font-semibold text-center">Exposure Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data?.material_single_source_exposure?.map((m: any, idx: number) => {
                const isCrit = m.risk_level === 'Critical';
                const isHigh = m.risk_level === 'High';
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {m.material_name} <span className="text-[10px] text-slate-400 font-mono">({m.material_id})</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{m.plant_id}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold">
                      <span className={m.approved_suppliers_count <= 1 ? 'text-red-700' : 'text-slate-800'}>
                        {m.approved_suppliers_count}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-800">
                      {m.primary_supplier_name}{' '}
                      <span className="text-[10px] text-slate-400 font-mono">({m.primary_supplier_id})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900">
                      €{m.spend_eur?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-[2px] uppercase ${
                          isCrit
                            ? 'bg-red-100 text-red-800'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m.risk_level}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Procurement Risk Signals Register */}
      <div className="bg-white border border-[#d5dbe1]">
        <div className="px-5 py-3.5 border-b border-[#d5dbe1] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Active Procurement Risk Signals & Event Register
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Real-Time Risk Alerts</span>
        </div>
        <div className="divide-y divide-slate-200">
          {data?.active_risk_events?.map((ev: any) => {
            const isCrit = ev.severity === 'Critical';
            const isHigh = ev.severity === 'High';
            return (
              <div key={ev.event_id} className="p-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-[2px] ${
                          isCrit
                            ? 'bg-red-100 text-red-800'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ev.severity} • {ev.event_type}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">{ev.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({ev.event_id})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{ev.description}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Affected Supplier: <span className="font-medium text-slate-800">{ev.supplier_name}</span> ({ev.supplier_id}) • Impact: {ev.impact_dimension}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap ml-4">
                    {ev.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
