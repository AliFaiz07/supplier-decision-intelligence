import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { TruckIcon, AlertTriangleIcon, ActivityIcon } from '../common/Icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis
} from 'recharts';

export const DeliveryIntelligenceView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveryData();
  }, []);

  const loadDeliveryData = async () => {
    try {
      setLoading(true);
      const res = await api.getDeliveryIntelligence();
      setData(res);
    } catch (err) {
      console.error('Failed to load delivery intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <ProcessingIndicator operation="delivery" message="Analyzing Goods Receipts, delays, and lead time variance..." />;
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex items-center space-x-2">
          <TruckIcon className="w-5 h-5 text-[#0a6ed1]" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Delivery Intelligence & OTIF Performance Cockpit
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Empirical analysis of Goods Receipts (MSEG/MKPF), delay distributions, lead time variance, and delivery reliability vs landed cost.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Fleet OTIF %</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-emerald-700">{kpis?.otif_pct}%</span>
            <span className="text-[10px] text-slate-500 font-mono">Benchmark &gt;90%</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Average Delay</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-slate-900">{kpis?.avg_delay_days} days</span>
            <span className="text-[10px] text-slate-400 font-mono">When late</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Late PO Count</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-amber-700">{kpis?.late_po_count}</span>
            <span className="text-[10px] text-amber-700 font-mono">Deviations</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg Lead Time</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-slate-900">{kpis?.avg_lead_time_days} days</span>
            <span className="text-[10px] text-slate-400 font-mono">PO to GR</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Lead Time Variance</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-slate-900">±{kpis?.lead_time_variance_days} d</span>
            <span className="text-[10px] text-slate-500 font-mono">Std Dev</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Open Overdue POs</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-red-700">{kpis?.open_overdue_po_count}</span>
            <span className="text-[10px] text-red-700 font-mono">Action req</span>
          </div>
        </div>
      </div>

      {/* Primary Analytical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Chart: Delivery Reliability vs Price (Prompt Section 11) */}
        <div className="bg-white border border-[#d5dbe1] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Delivery Reliability vs Unit Cost Trade-Off
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluates whether lowest nominal price incurs delivery risk (X: Effective Cost €, Y: OTIF %)
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="effective_cost" name="Unit Cost" unit="€" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis type="number" dataKey="otif_pct" name="OTIF" unit="%" domain={[60, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <ZAxis range={[60, 180]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#cbd5e1] p-2.5 text-xs shadow-none">
                          <p className="font-semibold text-slate-900">{d.supplier_name} ({d.supplier_id})</p>
                          <p className="text-slate-600">Unit Cost: €{d.effective_cost}</p>
                          <p className="text-slate-600">Verified OTD: {d.otif_pct}%</p>
                          <p className="text-slate-500 text-[10px]">Shipments: {d.deliveries}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Suppliers" data={data?.reliability_vs_price_scatter || []} fill="#0a6ed1" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Time Distribution Bar Chart */}
        <div className="bg-white border border-[#d5dbe1] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Lead Time Distribution Across All Goods Receipts
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Distribution of order turnaround cycle across 5 discrete duration tiers
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.lead_time_distribution || []} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px' }}
                  formatter={(val: any, name: any, item: any) => [`${val} orders (${item.payload.share_pct}%)`, 'Volume']}
                />
                <Bar dataKey="count" fill="#059669" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Delivery Trend (OTIF % over 24 months) */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            24-Month Monthly Fleet OTIF % Trend
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Target: 95.0%</span>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.delivery_trend || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[70, 100]} unit="%" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px' }}
                formatter={(val: any) => [`${val}%`, 'OTIF Rate']}
              />
              <Line type="monotone" dataKey="otif_pct" stroke="#0a6ed1" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Delivery Performance Table */}
      <div className="bg-white border border-[#d5dbe1]">
        <div className="px-5 py-3.5 border-b border-[#d5dbe1] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Supplier Delivery Reliability Scorecard
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Ranked by On-Time %</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-slate-600 border-b border-[#d5dbe1]">
                <th className="py-2.5 px-4 font-semibold">Supplier</th>
                <th className="py-2.5 px-3 font-semibold text-right">OTIF Rate</th>
                <th className="py-2.5 px-3 font-semibold text-right">Avg Delay</th>
                <th className="py-2.5 px-3 font-semibold text-right">Shipments</th>
                <th className="py-2.5 px-3 font-semibold text-right">On-Time</th>
                <th className="py-2.5 px-3 font-semibold text-right">Late</th>
                <th className="py-2.5 px-4 font-semibold text-center">Reliability Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data?.delivery_by_supplier?.map((s: any) => {
                const isExcellent = s.otd_pct >= 95;
                const isAcceptable = s.otd_pct >= 85;
                return (
                  <tr key={s.supplier_id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {s.supplier_name}{' '}
                      <span className="text-[10px] text-slate-400 font-mono">({s.supplier_id})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      <span className={isExcellent ? 'text-emerald-700' : isAcceptable ? 'text-slate-800' : 'text-red-700'}>
                        {s.otd_pct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {s.avg_delay_days > 0 ? `${s.avg_delay_days} days` : '0 days'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">{s.total_deliveries}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">{s.on_time_count}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-700">{s.late_count}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-[2px] uppercase ${
                          isExcellent
                            ? 'bg-emerald-100 text-emerald-800'
                            : isAcceptable
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isExcellent ? 'Preferred' : isAcceptable ? 'Standard' : 'At Risk'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
