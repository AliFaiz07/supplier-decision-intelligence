import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import {
  AlertTriangleIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  TruckIcon,
  AwardIcon,
  FileTextIcon,
  LayersIcon,
  SearchIcon,
  ExternalLinkIcon
} from '../common/Icons';

interface AnomalyCenterViewProps {
  onNavigateTab?: (tab: string, subtab?: string, targetId?: string) => void;
}

export const AnomalyCenterView: React.FC<AnomalyCenterViewProps> = ({ onNavigateTab }) => {
  const [anomalyData, setAnomalyData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadAnomalies();
  }, []);

  const loadAnomalies = async () => {
    try {
      setLoading(true);
      const res = await api.getProcurementAnomalies();
      setAnomalyData(res);
    } catch (err) {
      console.error('Failed to load anomalies:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ProcessingIndicator operation="anomalies" />;
  }

  if (!anomalyData) {
    return (
      <div className="bg-white border border-[#d5dbe1] p-6 text-xs text-slate-500">
        No active anomalies detected.
      </div>
    );
  }

  const allAnomalies = anomalyData.anomalies || [];
  const categories = ['ALL', 'Price Anomaly', 'Delivery Anomaly', 'Quality Anomaly', 'Contract Anomaly', 'Concentration Anomaly'];

  const filtered = allAnomalies.filter((a: any) => {
    const matchesCat = selectedCategory === 'ALL' || a.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.material_id && a.material_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.supplier_name && a.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#d5dbe1] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded-[2px] font-semibold">
              Live Exception Telemetry
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              SAP S/4HANA & 24-Month Telemetry Baseline
            </span>
          </div>
          <h2 className="text-base font-semibold text-slate-900 mt-1">
            Procurement Anomaly Center
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Continuous detection of empirical price escalation, consecutive delivery decline, inspection lot defects, contract expirations, and single-source exposure.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-mono text-slate-400">Ref Date: {anomalyData.reference_date}</span>
        </div>
      </div>

      {/* KPI Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#d5dbe1] p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Active Anomalies
          </p>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {anomalyData.total_anomalies_count}
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Across 22 mock datasets</p>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-4 border-l-4 border-l-red-600">
          <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider">
            High Severity Exceptions
          </p>
          <div className="text-2xl font-bold text-red-700 mt-1">
            {anomalyData.high_severity_count}
          </div>
          <p className="text-[10px] text-red-600 font-mono mt-1">Immediate action required</p>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-4 border-l-4 border-l-amber-500">
          <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
            Medium Severity Watchlist
          </p>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {anomalyData.medium_severity_count}
          </div>
          <p className="text-[10px] text-amber-600 font-mono mt-1">Requires periodic audit</p>
        </div>

        <div className="bg-white border border-[#d5dbe1] p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Category Coverage
          </p>
          <div className="text-2xl font-bold text-[#0a6ed1] mt-1">
            6 Dimensions
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Price, OTD, QM, CTR, Spend</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#d5dbe1] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-[2px] transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#0a6ed1] text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Signals' : cat.replace(' Anomaly', '')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search material, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-[2px] bg-white focus:outline-none focus:border-[#0a6ed1]"
          />
        </div>
      </div>

      {/* Anomaly Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((a: any) => {
          const isHigh = a.severity === 'HIGH';
          return (
            <div
              key={a.id}
              className={`bg-white border p-5 space-y-3.5 ${
                isHigh ? 'border-red-300 border-l-4 border-l-red-600' : 'border-amber-300 border-l-4 border-l-amber-500'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-[2px] font-semibold uppercase ${
                        isHigh ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {a.severity}
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-[2px]">
                      {a.category}
                    </span>
                    {a.material_id && (
                      <span className="text-[10px] font-mono text-[#0a6ed1] font-semibold">
                        {a.material_id}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mt-1">{a.title}</h3>
                  {a.supplier_name && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Partner: {a.supplier_name} ({a.supplier_id})
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Variance</span>
                  <div
                    className={`text-base font-bold font-mono ${
                      a.variance_pct > 0 && a.category === 'Price Anomaly'
                        ? 'text-red-700'
                        : a.variance_pct < 0 && a.category === 'Delivery Anomaly'
                        ? 'text-red-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {a.variance_pct > 0 ? '+' : ''}{a.variance_pct}%
                  </div>
                </div>
              </div>

              {/* Baseline vs Current Value */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#f8fafc] border border-slate-200 p-2.5 rounded-[2px]">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Calculated Baseline
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5 text-[11px]">{a.baseline}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Current Observed Telemetry
                  </span>
                  <p className="font-semibold text-slate-900 mt-0.5 text-[11px]">{a.current_value}</p>
                </div>
              </div>

              {/* Impact & Recommendation */}
              <div className="text-xs space-y-1 text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">Operational Impact: </span>
                  <span>{a.impact}</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Recommended Action: </span>
                  <span>{a.recommended_investigation}</span>
                </p>
              </div>

              {/* Drilldown Action */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    if (onNavigateTab) {
                      onNavigateTab(a.drilldown_tab, a.drilldown_subtab, a.target_id);
                    }
                  }}
                  className="text-xs text-[#0a6ed1] hover:text-[#0854a0] font-semibold flex items-center space-x-1"
                >
                  <span>Investigate Evidence</span>
                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
