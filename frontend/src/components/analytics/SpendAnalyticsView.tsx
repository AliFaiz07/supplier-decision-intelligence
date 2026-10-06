import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import {
  DollarSignIcon,
  TrendingUpIcon,
  BuildingIcon,
  LayersIcon,
  CheckIcon
} from '../common/Icons';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface SpendAnalyticsViewProps {
  onNavigateToSupplier360?: (supplierId: string) => void;
}

export const SpendAnalyticsView: React.FC<SpendAnalyticsViewProps> = ({ onNavigateToSupplier360 }) => {
  const [spendData, setSpendData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<string>('ALL');

  useEffect(() => {
    loadSpend();
  }, []);

  const loadSpend = async () => {
    try {
      setLoading(true);
      const res = await api.getSpendAnalytics();
      setSpendData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load spend analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ProcessingIndicator operation="general" message="Aggregating 24-month procurement spend and contract coverage..." />;
  }

  if (error || !spendData) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs">
        {error || 'Unable to retrieve spend data'}
      </div>
    );
  }

  const filteredPlantData = selectedPlant === 'ALL'
    ? spendData.spend_by_plant
    : spendData.spend_by_plant.filter((p: any) => p.plant_id === selectedPlant);

  return (
    <div className="space-y-6">
      {/* Financial KPIs Banner */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Enterprise Procurement Spend Intelligence
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive financial breakdown across vendor portfolios, material commodity groups, and outline contracts.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-600">Filter Plant:</span>
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="border border-slate-300 rounded-[2px] px-2.5 py-1 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#0a6ed1]"
            >
              <option value="ALL">All Plants (P001, P002, P003)</option>
              <option value="P001">P001 - Munich Assembly</option>
              <option value="P002">P002 - Katowice Works</option>
              <option value="P003">P003 - Linz Works</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-[#f8fafc] border border-slate-200 p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Total Analyzed Spend</span>
            <p className="text-xl font-bold text-slate-900 mt-1">
              €{((spendData.summary?.total_spend_eur || 0) / 1_000_000).toFixed(2)}M
            </p>
            <p className="text-[10px] text-slate-400 font-mono">24 Months History</p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200 p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Contracted Spend</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">
              €{((spendData.summary?.contracted_spend_eur || 0) / 1_000_000).toFixed(2)}M
            </p>
            <p className="text-[10px] text-emerald-700 font-mono">
              {spendData.summary?.contract_coverage_pct}% Coverage
            </p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200 p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Non-Contracted Spend</span>
            <p className="text-xl font-bold text-slate-900 mt-1">
              €{((spendData.summary?.non_contracted_spend_eur || 0) / 1_000_000).toFixed(2)}M
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Off-Contract Spot Purchases</p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200 p-3">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Top 3 Supplier Share</span>
            <p className="text-xl font-bold text-amber-700 mt-1">
              {spendData.spend_by_supplier?.slice(0, 3).reduce((acc: number, curr: any) => acc + curr.share_pct, 0).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Concentration Exposure</p>
          </div>
        </div>
      </div>

      {/* Row 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Supplier */}
        <div className="bg-white border border-[#d5dbe1] p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Spend by Supplier (Top Volume)
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Desc by Net Value</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={spendData.spend_by_supplier?.slice(0, 8) || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 130, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tickFormatter={(val) => `€${(val / 1_000_000).toFixed(1)}M`}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  type="category"
                  dataKey="supplier_name"
                  tick={{ fontSize: 10, fill: '#334155' }}
                  width={120}
                />
                <Tooltip
                  formatter={(val: number) => [`€${val.toLocaleString()}`, 'Total Net Spend']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px' }}
                />
                <Bar dataKey="total_spend_eur" fill="#0a6ed1" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend by Material Group */}
        <div className="bg-white border border-[#d5dbe1] p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Spend by Material Commodity Group
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">SAP Material Group (MATKL)</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={spendData.spend_by_material_category || []}
                margin={{ top: 10, right: 20, left: 10, bottom: 35 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="category_name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  tickFormatter={(val) => `€${(val / 1_000_000).toFixed(1)}M`}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val: number) => [`€${val.toLocaleString()}`, 'Category Spend']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px' }}
                />
                <Bar dataKey="total_spend_eur" fill="#0854a0" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Trend & Plant Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white border border-[#d5dbe1] p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              24-Month Monthly Spend Trend
            </h4>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[2px] font-semibold">
              {spendData.summary?.contract_coverage_pct}% Contracted
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={spendData.spend_trend || []}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  interval={3}
                />
                <YAxis
                  tickFormatter={(val) => `€${(val / 1_000_000).toFixed(1)}M`}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val: number) => [`€${val.toLocaleString()}`, 'Spend']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="total_spend_eur"
                  stroke="#0a6ed1"
                  strokeWidth={2}
                  dot={false}
                  name="Monthly Spend"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend by Plant */}
        <div className="bg-white border border-[#d5dbe1] p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Procurement Spend by Manufacturing Plant
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Plants P001 - P003</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredPlantData || []}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="plant_name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  tickFormatter={(val) => `€${(val / 1_000_000).toFixed(1)}M`}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val: number) => [`€${val.toLocaleString()}`, 'Plant Spend']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px' }}
                />
                <Bar dataKey="total_spend_eur" fill="#2563eb" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
