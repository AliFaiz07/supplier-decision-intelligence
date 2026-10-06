import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { TrendingUpIcon, AlertTriangleIcon, DollarSignIcon, FilterIcon } from '../common/Icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const PriceIntelligenceView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('MAT-001');

  useEffect(() => {
    loadPriceData(selectedMaterial);
  }, [selectedMaterial]);

  const loadPriceData = async (matId: string) => {
    try {
      setLoading(true);
      const res = await api.getPriceIntelligence(matId);
      setData(res);
    } catch (err) {
      console.error('Failed to load price intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <ProcessingIndicator operation="price" message="Evaluating historical price trends and volatility..." />;
  }

  const spread = data?.price_spread;
  const activeSummary = data?.materials_summary?.find((m: any) => m.material_id === selectedMaterial);

  return (
    <div className="space-y-6">
      {/* Header and Material Selector */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="w-5 h-5 text-[#0a6ed1]" />
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                Price Intelligence & Volatility Cockpit
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Historical purchase price trends, supplier price spreads, statistical volatility indicators, and contract variances.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium text-slate-600 flex items-center space-x-1">
              <FilterIcon className="w-3.5 h-3.5" />
              <span>Material Focus:</span>
            </span>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="bg-[#f8fafc] border border-[#d5dbe1] text-xs font-medium text-slate-800 py-1.5 px-3 rounded-[2px] focus:outline-none focus:border-[#0a6ed1]"
            >
              {data?.materials_summary?.map((m: any) => (
                <option key={m.material_id} value={m.material_id}>
                  {m.material_id} - {m.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards: Price Spread & Volatility */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Lowest Price</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-emerald-700">€{spread?.min_price_eur?.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 font-mono">Floor</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Median Price</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-slate-900">€{spread?.median_price_eur?.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500 font-mono">Benchmark</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Highest Price</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-slate-900">€{spread?.max_price_eur?.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 font-mono">Ceiling</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Price Spread</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-amber-700">€{spread?.spread_eur?.toFixed(2)}</span>
            <span className="text-[10px] text-amber-700 font-mono">+{spread?.spread_pct}%</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Volatility Indicator</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-base font-semibold ${
              activeSummary?.volatility_indicator === 'High' ? 'text-red-700' :
              activeSummary?.volatility_indicator === 'Moderate' ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {activeSummary?.volatility_indicator || 'Low'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">CV: {activeSummary?.cv_pct}%</span>
          </div>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">MoM Change</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl font-semibold ${
              (activeSummary?.mom_change_pct || 0) > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {activeSummary?.mom_change_pct > 0 ? `+${activeSummary.mom_change_pct}` : activeSummary?.mom_change_pct || 0}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Trailing Mo</span>
          </div>
        </div>
      </div>

      {/* Price Anomalies Alert Banner */}
      {data?.price_anomalies && data.price_anomalies.length > 0 && (
        <div className="bg-[#fffbeb] border border-[#fde68a] p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangleIcon className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Detected Price Anomalies (Latest PO vs Historical Average)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.price_anomalies.map((anom: any, idx: number) => (
              <div key={idx} className="bg-white border border-[#fde68a] p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{anom.material_name} ({anom.material_id})</span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-[2px] bg-red-100 text-red-800">
                    +{anom.variance_pct}% Spike
                  </span>
                </div>
                <p className="text-slate-600 mt-1">
                  Supplier <span className="font-medium text-slate-800">{anom.supplier_name}</span> ({anom.supplier_id}):
                  Latest price is <span className="font-mono font-medium text-red-700">€{anom.latest_price_eur}</span> vs historical average of <span className="font-mono">€{anom.historical_avg_eur}</span>.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Price Trend Line Chart */}
        <div className="bg-white border border-[#d5dbe1] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              24-Month Historical Price Trend vs SAP Benchmark
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">{selectedMaterial}</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.historical_trend_chart || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} unit="€" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px' }}
                  formatter={(val: any) => [`€${Number(val).toFixed(2)}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="Benchmark" stroke="#000000" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                {Object.keys(data?.historical_trend_chart?.[0] || {})
                  .filter((k) => k !== 'period' && k !== 'Benchmark')
                  .map((k, i) => {
                    const colors = ['#0a6ed1', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0284c7'];
                    return (
                      <Line
                        key={k}
                        type="monotone"
                        dataKey={k}
                        stroke={colors[i % colors.length]}
                        dot={{ r: 2 }}
                        strokeWidth={1.5}
                      />
                    );
                  })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Supplier Price Comparison Bar Chart */}
        <div className="bg-white border border-[#d5dbe1] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Supplier Price Comparison (Latest Quoted / Net PO Price)
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Sorted by Cost Ascending</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.supplier_comparison_chart || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} unit="€" />
                <YAxis dataKey="supplier_name" type="category" tick={{ fontSize: 10, fill: '#475569' }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px' }}
                  formatter={(val: any) => [`€${Number(val).toFixed(2)}/unit`, 'Latest Price']}
                />
                <Bar dataKey="latest_price_eur" fill="#0a6ed1" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Price Variance Table: Quoted vs Contract vs Historical vs Latest PO */}
      <div className="bg-white border border-[#d5dbe1]">
        <div className="px-5 py-3.5 border-b border-[#d5dbe1] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Price Variance Analysis Matrix
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Material: {selectedMaterial}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-slate-600 border-b border-[#d5dbe1]">
                <th className="py-2.5 px-4 font-semibold">Supplier</th>
                <th className="py-2.5 px-3 font-semibold text-right">Quoted Price</th>
                <th className="py-2.5 px-3 font-semibold text-right">Contract Price</th>
                <th className="py-2.5 px-3 font-semibold text-right">Latest PO Price</th>
                <th className="py-2.5 px-3 font-semibold text-right">Historical Avg</th>
                <th className="py-2.5 px-3 font-semibold text-right">Variance vs Hist</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data?.price_variances?.map((row: any) => {
                const varPct = row.variance_vs_hist_pct || 0;
                const isSpike = varPct > 10;
                const isFavorable = varPct < -5;
                return (
                  <tr key={row.supplier_id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {row.supplier_name}{' '}
                      <span className="text-[10px] text-slate-400 font-mono">({row.supplier_id})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                      €{row.quoted_price_eur?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {row.contract_price_eur ? (
                        <span className="text-emerald-700 font-medium">€{row.contract_price_eur.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400 font-sans text-[11px]">No Contract</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900">
                      €{row.latest_po_price_eur?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      €{row.historical_avg_price_eur?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      <span className={isSpike ? 'text-red-700' : isFavorable ? 'text-emerald-700' : 'text-slate-700'}>
                        {varPct > 0 ? `+${varPct}%` : `${varPct}%`}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-[2px] uppercase ${
                          isSpike
                            ? 'bg-red-100 text-red-800'
                            : isFavorable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isSpike ? 'Spike / Alert' : isFavorable ? 'Favorable' : 'Normal'}
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
