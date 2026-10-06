import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { AwardIcon, AlertTriangleIcon, ActivityIcon } from '../common/Icons';
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

export const QualityIntelligenceView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQualityData();
  }, []);

  const loadQualityData = async () => {
    try {
      setLoading(true);
      const res = await api.getQualityIntelligence();
      setData(res);
    } catch (err) {
      console.error('Failed to load quality intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <ProcessingIndicator operation="quality" message="Auditing QM inspection lots, rejection rates, and PPM..." />;
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex items-center space-x-2">
          <AwardIcon className="w-5 h-5 text-[#0a6ed1]" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Quality Intelligence & Defect Analytics Cockpit
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Inspection lot records (QALS), defect classifications (QMEL), usage decision compliance, and quality vs effective cost trade-offs.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Fleet Rejection Rate</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-emerald-700">{kpis?.rejection_rate_pct}%</span>
            <span className="text-[10px] text-slate-500 font-mono">Benchmark &lt;0.5%</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Fleet Defect PPM</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-slate-900">{kpis?.ppm}</span>
            <span className="text-[10px] text-slate-400 font-mono">Parts per Million</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Accepted Quantity</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-emerald-700">{kpis?.accepted_quantity?.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-700 font-mono">Passed QM</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Defective Units</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-amber-700">{kpis?.rejected_quantity}</span>
            <span className="text-[10px] text-amber-700 font-mono">Scrapped/Rework</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">QM Notifications</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-slate-900">{kpis?.quality_incidents_count}</span>
            <span className="text-[10px] text-slate-500 font-mono">Formal SAP QN</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Lot Rejections</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-red-700">{kpis?.inspection_failures_count}</span>
            <span className="text-[10px] text-red-700 font-mono">Failed UD</span>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Chart: Quality Score vs Landed Cost (Prompt Section 12) */}
        <div className="bg-white border border-[#d5dbe1] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Manufacturing Quality vs Landed Unit Cost
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Identifies low-cost/poor-quality traps vs premium-quality suppliers (X: Cost €, Y: Quality Score 0-100)
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="effective_cost" name="Unit Cost" unit="€" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis type="number" dataKey="quality_score" name="Quality Score" domain={[50, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
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
                          <p className="text-slate-600">Quality Score: {d.quality_score}/100</p>
                          <p className="text-slate-500 text-[10px]">Rejection Rate: {d.rejection_rate_pct}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Suppliers" data={data?.quality_vs_cost_scatter || []} fill="#7c3aed" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Defect Category Breakdown Bar Chart */}
        <div className="bg-white border border-[#d5dbe1] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Defect Category Root-Cause Classification
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Aggregated occurrences across Dimensional, Material, Packaging, and Functional inspection failures
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.defect_categories || []} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px' }}
                  formatter={(val: any, name: any, item: any) => [`${val} units (${item.payload.share_pct}%)`, 'Defects']}
                />
                <Bar dataKey="count" fill="#d97706" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Quality Trend */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            24-Month Monthly Rejection Rate % Trend
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">QM Tolerance: &lt;0.5%</span>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.quality_trend || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis unit="%" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px' }}
                formatter={(val: any) => [`${val}%`, 'Rejection Rate']}
              />
              <Line type="monotone" dataKey="rejection_rate_pct" stroke="#dc2626" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Quality Ranking Table */}
      <div className="bg-white border border-[#d5dbe1]">
        <div className="px-5 py-3.5 border-b border-[#d5dbe1] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Supplier Quality Inspection Scorecard
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Ranked by Lowest Defect Rate</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-slate-600 border-b border-[#d5dbe1]">
                <th className="py-2.5 px-4 font-semibold">Supplier</th>
                <th className="py-2.5 px-3 font-semibold text-right">Rejection %</th>
                <th className="py-2.5 px-3 font-semibold text-right">Defect PPM</th>
                <th className="py-2.5 px-3 font-semibold text-right">Inspected Qty</th>
                <th className="py-2.5 px-3 font-semibold text-right">Defective Units</th>
                <th className="py-2.5 px-3 font-semibold text-right">QM Notifications</th>
                <th className="py-2.5 px-4 font-semibold text-center">Quality Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data?.quality_by_supplier?.map((s: any) => {
                const isPristine = s.rejection_rate_pct === 0;
                const isAcceptable = s.rejection_rate_pct < 0.5;
                return (
                  <tr key={s.supplier_id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {s.supplier_name}{' '}
                      <span className="text-[10px] text-slate-400 font-mono">({s.supplier_id})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      <span className={isPristine ? 'text-emerald-700' : isAcceptable ? 'text-slate-800' : 'text-red-700'}>
                        {s.rejection_rate_pct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{s.ppm?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">{s.inspected_quantity?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-700">{s.defective_quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{s.notifications_count}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-[2px] uppercase ${
                          isPristine
                            ? 'bg-emerald-100 text-emerald-800'
                            : isAcceptable
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isPristine ? 'Zero Defects' : isAcceptable ? 'Standard' : 'Elevated'}
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
