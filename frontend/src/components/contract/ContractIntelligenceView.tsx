import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { FileTextIcon, AlertTriangleIcon, DollarSignIcon } from '../common/Icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const ContractIntelligenceView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContractData();
  }, []);

  const loadContractData = async () => {
    try {
      setLoading(true);
      const res = await api.getContractIntelligence();
      setData(res);
    } catch (err) {
      console.error('Failed to load contract intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <ProcessingIndicator operation="general" message="Evaluating purchasing outline agreements, rebates, and expiry timeline..." />;
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex items-center space-x-2">
          <FileTextIcon className="w-5 h-5 text-[#0a6ed1]" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Contract Intelligence & Commercial Agreement Cockpit
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Purchasing Outline Agreements (Contracts / Scheduling Agreements), target value utilization, expiry lifecycle monitoring, and price variances.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active Contracts</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-slate-900">{kpis?.active_contracts_count}</span>
            <span className="text-[10px] text-emerald-600 font-mono">In force</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Expiring (&lt;30d)</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-amber-700">{kpis?.expiring_contracts_count}</span>
            <span className="text-[10px] text-amber-700 font-mono">Urgent renewal</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Contracted Spend</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-emerald-700">€{(kpis?.contracted_spend_eur / 1_000_000)?.toFixed(2)}M</span>
            <span className="text-[10px] text-emerald-700 font-mono">{kpis?.contract_coverage_pct}%</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Non-Contract Spend</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-slate-900">€{(kpis?.non_contracted_spend_eur / 1_000_000)?.toFixed(2)}M</span>
            <span className="text-[10px] text-slate-400 font-mono">Maverick / Spot</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Contracted Suppliers</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-slate-900">{kpis?.suppliers_with_contracts_count}</span>
            <span className="text-[10px] text-slate-500 font-mono">Master vendors</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Materials Covered</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-slate-900">{kpis?.materials_covered_count}</span>
            <span className="text-[10px] text-slate-500 font-mono">Categories</span>
          </div>
        </div>
      </div>

      {/* Contract Expiry Timeline Buckets (Prompt Section 13) */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Contract Expiry Lifecycle Timeline (0-30d, 31-60d, 61-90d, 90+d)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Reference Date: 25 Sep 2026</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {data?.contract_expiry_timeline?.map((bucket: any, idx: number) => {
            const isUrgent = bucket.bucket === '0-30 days' && bucket.count > 0;
            return (
              <div
                key={idx}
                className={`p-4 border ${
                  isUrgent ? 'bg-[#fffbeb] border-[#fde68a]' : 'bg-[#f8fafc] border-[#d5dbe1]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    {bucket.bucket}
                  </span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-[2px] font-semibold ${
                      isUrgent ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {bucket.count} contracts
                  </span>
                </div>
                {bucket.contracts.length > 0 ? (
                  <div className="space-y-2 mt-3">
                    {bucket.contracts.map((c: any) => (
                      <div key={c.contract_id} className="bg-white border border-slate-200 p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{c.contract_id}</span>
                          <span className="font-mono text-slate-500 text-[10px]">{c.valid_to}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5 text-[11px] truncate">
                          {c.supplier_name} • {c.material_name}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>Price: €{c.contract_price_eur}</span>
                          <span>Rebate: {c.discount_pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-4 italic">No contracts in this bucket</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contract Coverage by Supplier Stacked Bar Chart */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Contract-Covered vs Non-Contract Spend by Supplier
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Top Suppliers by Volume</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data?.contract_coverage_by_supplier?.slice(0, 8) || []}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="supplier_name" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="€" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px' }}
                formatter={(val: any) => [`€${Number(val).toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="contracted_spend_eur" name="Contract-Covered Spend" fill="#059669" stackId="a" />
              <Bar dataKey="non_contracted_spend_eur" name="Non-Contract Spend" fill="#94a3b8" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contract Price vs Latest PO Price Comparison Table */}
      <div className="bg-white border border-[#d5dbe1]">
        <div className="px-5 py-3.5 border-b border-[#d5dbe1] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Contract Price vs Market & Latest PO Price Analysis
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Commercial Synergy Tracking</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-slate-600 border-b border-[#d5dbe1]">
                <th className="py-2.5 px-4 font-semibold">Contract ID</th>
                <th className="py-2.5 px-4 font-semibold">Supplier</th>
                <th className="py-2.5 px-3 font-semibold">Material</th>
                <th className="py-2.5 px-3 font-semibold text-right">Agreed Contract Price</th>
                <th className="py-2.5 px-3 font-semibold text-right">Contract Rebate</th>
                <th className="py-2.5 px-3 font-semibold text-right">Latest Spot PO Price</th>
                <th className="py-2.5 px-3 font-semibold text-right">Variance vs Spot</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data?.contract_price_comparison?.map((c: any) => {
                const varPct = c.variance_pct || 0;
                const isFavorable = varPct <= 0;
                return (
                  <tr key={c.contract_id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900">{c.contract_id}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">{c.supplier_name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{c.material_id}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                      €{c.contract_price_eur?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{c.discount_pct}%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                      €{c.latest_po_price_eur?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      <span className={isFavorable ? 'text-emerald-700' : 'text-amber-700'}>
                        {varPct > 0 ? `+${varPct}%` : `${varPct}%`}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-[2px] uppercase ${
                          c.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'Expiring Soon'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.status}
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
